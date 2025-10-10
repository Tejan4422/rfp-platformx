import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Upload, FileText, AlertCircle, CheckCircle2, File, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const API_BASE_URL = "http://localhost:8001";

export const DocumentUpload = () => {
  const { sessionId, setSessionId, setCurrentStep, setRequirements } = useSession();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [requirementCount, setRequirementCount] = useState<number>(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Metadata fields
  const [deadline, setDeadline] = useState<Date>();
  const [clientName, setClientName] = useState("");
  const [priority, setPriority] = useState("");
  const [internalOwner, setInternalOwner] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; metadata: any }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("metadata", JSON.stringify(data.metadata));
      
      const response = await fetch(`${API_BASE_URL}/api/upload-rfp`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      const sessionIdValue = data.session_id;
      setSessionId(sessionIdValue);
      setCurrentSessionId(sessionIdValue);
      
      toast({
        title: "Upload successful",
        description: `File uploaded successfully. Ready to extract requirements.`,
      });
      
      // If requirements were included in the upload response, process them
      if (data.requirements && data.requirements.length > 0) {
        const formattedRequirements = data.requirements.map((req: string, index: number) => ({
          id: `req-${index}`,
          text: req,
          original_text: req
        }));
        
        setRequirements(formattedRequirements);
        setRequirementCount(data.requirements.length);
        setCurrentStep("requirements");
      }
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setUploadedFile(null);
    },
  });

  const extractMutation = useMutation({
    mutationFn: async () => {
      if (!currentSessionId) throw new Error("No session ID available");
      
      const response = await fetch(`${API_BASE_URL}/api/requirements/${currentSessionId}`, {
        method: "GET",
      });
      
      if (!response.ok) throw new Error("Failed to extract requirements");
      return response.json();
    },
    onSuccess: (data) => {
      // Convert requirements array to the expected format
      const formattedRequirements = data.data.requirements?.map((req: string, index: number) => ({
        id: `req-${index}`,
        text: req,
        original_text: req
      })) || [];
      
      setRequirements(formattedRequirements);
      setRequirementCount(formattedRequirements.length);
      
      toast({
        title: "Requirements extracted",
        description: `Found ${formattedRequirements.length} requirements`,
      });
      
      setCurrentStep("requirements");
    },
    onError: (error) => {
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Failed to extract requirements",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleProcessRFP = () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a file first",
        variant: "destructive",
      });
      return;
    }

    const metadata = {
      deadline: deadline ? format(deadline, "yyyy-MM-dd") : null,
      client_name: clientName,
      priority: priority,
      internal_owner: internalOwner || null,
    };

    uploadMutation.mutate({ file: uploadedFile, metadata });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Upload RFP Document</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Supported formats: PDF, DOCX, Excel (XLSX/XLS)
        </p>
        <p className="text-sm text-muted-foreground">
          Upload your RFP document containing requirements
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer bg-card/50"
          style={{ 
            borderColor: isDragging ? "hsl(var(--primary))" : "hsl(var(--border))",
            backgroundColor: isDragging ? "hsl(var(--primary) / 0.1)" : "transparent"
          }}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Drag and drop file here</p>
                <p className="text-xs text-muted-foreground">Limit 200MB per file • PDF, DOCX, XLSX, XLS</p>
              </div>
            </div>
            <Button variant="outline" type="button">Browse files</Button>
          </div>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".pdf,.docx,.xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />
        </div>

        {uploadedFile && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <div className="flex items-center gap-2">
                <File className="h-5 w-5" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)}KB
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                ✕
              </Button>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-4 p-4 bg-card/30 rounded-lg border">
              <h3 className="text-sm font-semibold">RFP Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deadline">RFP Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={setDeadline}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="Enter client name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Expected Value / Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internalOwner">Internal Owner / Team (Optional)</Label>
                  <Input
                    id="internalOwner"
                    placeholder="Enter owner or team"
                    value={internalOwner}
                    onChange={(e) => setInternalOwner(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer p-3 bg-card/50 rounded-lg border hover:bg-card transition-colors">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">File Format Guidelines</span>
              </summary>
              <div className="mt-2 p-4 bg-card/30 rounded-lg border text-sm text-muted-foreground">
                <p>Supported formats: PDF, DOCX, XLSX, XLS</p>
                <p>Maximum file size: 200MB</p>
              </div>
            </details>

            {uploadMutation.isPending ? (
              <Alert className="bg-yellow-950/50 border-yellow-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Processing {uploadedFile.name}... Uploading file.
                </AlertDescription>
              </Alert>
            ) : extractMutation.isPending ? (
              <Alert className="bg-yellow-950/50 border-yellow-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Extracting requirements from {uploadedFile.name}...
                </AlertDescription>
              </Alert>
            ) : uploadMutation.isSuccess ? (
              <>
                <Alert className="bg-blue-950/50 border-blue-900">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    🔗 Uploaded file: {uploadedFile.name} (application/pdf)
                  </AlertDescription>
                </Alert>
                {requirementCount > 0 ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setCurrentStep("requirements")}
                  >
                    ✅ View {requirementCount} Extracted Requirements
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-destructive hover:bg-destructive/90"
                    onClick={() => extractMutation.mutate()}
                    disabled={extractMutation.isPending}
                  >
                    🔍 Extract Requirements
                  </Button>
                )}
              </>
            ) : (
              <Button 
                className="w-full bg-destructive hover:bg-destructive/90"
                onClick={handleProcessRFP}
                disabled={uploadMutation.isPending}
              >
                🚀 Process RFP
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
