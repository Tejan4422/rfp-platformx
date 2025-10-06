import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle, CheckCircle2, File } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:8001";

export const DocumentUpload = () => {
  const { setSessionId, setCurrentStep } = useSession();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [requirementCount, setRequirementCount] = useState<number>(0);

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
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload-rfp`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setRequirementCount(data.requirements_count || 0);
      setUploadedFile(data.filename);
      toast({
        title: "Upload successful",
        description: `Extracted ${data.requirements_count} requirements from ${data.filename}`,
      });
      setCurrentStep("requirements");
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

  const handleFileUpload = (file: File) => {
    setUploadedFile(file.name);
    uploadMutation.mutate(file);
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
                <span className="text-sm font-medium">{uploadedFile}</span>
                <span className="text-xs text-muted-foreground">21.9KB</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                ✕
              </Button>
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
                  Processing {uploadedFile}... Extracting requirements.
                </AlertDescription>
              </Alert>
            ) : uploadMutation.isSuccess ? (
              <>
                <Alert className="bg-blue-950/50 border-blue-900">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    🔗 Uploaded file: {uploadedFile} (application/pdf)
                  </AlertDescription>
                </Alert>
                <Button 
                  className="w-full bg-destructive hover:bg-destructive/90"
                  onClick={() => setCurrentStep("requirements")}
                >
                  🔍 Extract Requirements
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
