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
      toast({
        title: "Upload successful",
        description: `Extracted ${data.requirements_count} requirements from ${uploadedFile}`,
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
      <Card className="border-2 border-dashed transition-colors" 
            style={{ 
              borderColor: isDragging ? "hsl(var(--primary))" : "hsl(var(--border))",
              backgroundColor: isDragging ? "hsl(var(--primary) / 0.05)" : "transparent"
            }}>
        <CardHeader>
          <CardTitle>Upload RFP Document</CardTitle>
          <CardDescription>
            Drag and drop your RFP document or click to browse. Supports PDF, DOCX, and Excel formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer hover:bg-muted/50"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your RFP document here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">PDF</Badge>
              <Badge variant="secondary">DOCX</Badge>
              <Badge variant="secondary">XLSX</Badge>
            </div>
            <input
              id="fileInput"
              type="file"
              className="hidden"
              accept=".pdf,.docx,.xlsx"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>

          {uploadedFile && (
            <Alert className="mt-4">
              {uploadMutation.isPending ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Processing {uploadedFile}... Extracting requirements.
                  </AlertDescription>
                </>
              ) : uploadMutation.isSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Successfully processed {uploadedFile}</span>
                    <Badge>{requirementCount} requirements found</Badge>
                  </AlertDescription>
                </>
              ) : null}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Sample Templates
          </CardTitle>
          <CardDescription>
            Download our sample RFP templates to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              IT Services RFP
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Consulting RFP
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Software RFP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
