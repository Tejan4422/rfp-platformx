import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Database, Upload, CheckCircle2, FileText, TrendingUp, X } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const KnowledgeBase = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel (.xlsx) file",
          variant: "destructive",
        });
        return;
      }
      setUploadedFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} ready to process`,
      });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch('http://localhost:8001/api/index-requirements', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const data = await response.json();
      
      toast({
        title: "✅ Success!",
        description: `Successfully indexed ${data.count || 'all'} requirements from the document`,
      });
      
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Documents</CardDescription>
            <CardTitle className="text-3xl">248</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Vector Embeddings</CardDescription>
            <CardTitle className="text-3xl">12.4K</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Index Status</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-success" />
              Live
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg. Match Score</CardDescription>
            <CardTitle className="text-3xl">94%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Upload Requirements Document
              </CardTitle>
              <CardDescription>
                Upload Excel files containing requirements to index in the knowledge base
              </CardDescription>
            </div>
            <Button 
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4" />
              Upload XLSX
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardHeader>
        <CardContent>
          {uploadedFile ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  className="w-full gap-2 bg-destructive hover:bg-destructive/90"
                  onClick={handleProcessFile}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      🚀 Process & Index Requirements
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Upload Requirements Document</p>
              <p className="text-sm text-muted-foreground mb-4">
                Upload Excel files (.xlsx) containing requirements to be indexed
              </p>
              <Badge variant="secondary">Supports .xlsx files</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Indexing Progress</CardTitle>
          <CardDescription>
            Recently uploaded documents being processed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Q4_2024_Proposal_TechCorp.pdf</span>
                </div>
                <Badge>Complete</Badge>
              </div>
              <Progress value={100} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Enterprise_Implementation_Guide.docx</span>
                </div>
                <Badge variant="secondary">Processing</Badge>
              </div>
              <Progress value={67} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Case_Study_Healthcare_2024.pdf</span>
                </div>
                <Badge variant="outline">Queued</Badge>
              </div>
              <Progress value={0} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Knowledge Base Analytics
          </CardTitle>
          <CardDescription>
            Performance metrics and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Most Referenced Documents</p>
              <p className="font-semibold">Enterprise Security Framework (142 matches)</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Average Response Confidence</p>
              <p className="font-semibold">91% (Excellent)</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Top Content Category</p>
              <p className="font-semibold">Technical Implementation</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
              <p className="font-semibold">2 hours ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
