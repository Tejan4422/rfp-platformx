import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  FileSpreadsheet, 
  Play, 
  Download, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Eye,
  BarChart3,
  FileText,
  Edit,
  Save,
  X
} from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:8001";

interface SheetPreview {
  sheet_name: string;
  total_rows: number;
  columns: string[];
  sample_data: Record<string, any>[];
}

interface SheetResults {
  [sheetName: string]: Array<{
    requirement: string;
    category: string;
    status: string;
    sheet_name: string;
    response?: string;
    quality_score?: number;
    quality_status?: string;
    context_sources?: any[];
  }>;
}

interface Summary {
  [sheetName: string]: {
    [category: string]: number;
  };
}

export const MultiSheetProcessor = () => {
  const { sessionId } = useSession();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("preview");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMode, setProcessingMode] = useState<"classification" | "rag">("rag");
  
  // Edit state
  const [editingCell, setEditingCell] = useState<{sheetName: string, index: number} | null>(null);
  const [editingText, setEditingText] = useState("");
  
  // RAG Configuration
  const [topK, setTopK] = useState(3);
  const [model, setModel] = useState("llama3");
  const [includeClassification, setIncludeClassification] = useState(true);
  
  // Fetch sheet previews
  const {
    data: previewData,
    isLoading: isLoadingPreview,
    error: previewError
  } = useQuery({
    queryKey: ['sheet-preview', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session ID");
      
      const response = await fetch(`${API_BASE_URL}/api/sheets/preview/${sessionId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch sheet preview');
      }
      return response.json();
    },
    enabled: !!sessionId,
  });

  // Process multi-sheet mutation (updated for RAG)
  const processMultiSheetMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("No session ID");
      
      const endpoint = processingMode === "rag" 
        ? `${API_BASE_URL}/api/sheets/process-multi-sheet-rag`
        : `${API_BASE_URL}/api/sheets/process-multi-sheet`;
      
      const payload = processingMode === "rag" 
        ? {
            session_id: sessionId,
            requirement_columns: ["requirements", "requirement", "description", "details", "specification"],
            top_k: topK,
            model: model,
            include_classification: includeClassification
          }
        : {
            session_id: sessionId,
            requirement_columns: ["requirements", "requirement", "description", "details", "specification"]
          };
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to process sheets');
      }
      
      return response.json();
    },
    onMutate: () => {
      setIsProcessing(true);
      setProcessingProgress(0);
      
      // Simulate progress
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      return { interval };
    },
    onSuccess: (data, variables, context) => {
      if (context?.interval) {
        clearInterval(context.interval);
      }
      setProcessingProgress(100);
      setIsProcessing(false);
      setActiveTab("results");
      
      const resultCount = processingMode === "rag" 
        ? Object.keys(data.responses || {}).length 
        : Object.keys(data.results || {}).length;
      
      toast({
        title: "Processing Complete!",
        description: `Successfully processed ${resultCount} sheets with ${processingMode === "rag" ? "AI responses" : "classifications"}`,
      });
    },
    onError: (error, variables, context) => {
      if (context?.interval) {
        clearInterval(context.interval);
      }
      setIsProcessing(false);
      setProcessingProgress(0);
      
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleExportResults = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/sheets/export/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to export results');
      }
      
      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `classified_results_${sessionId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Results exported to Excel file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Update multi-sheet response mutation
  const updateMultiSheetResponseMutation = useMutation({
    mutationFn: async ({ sheetName, responseIndex, newResponse }: { 
      sheetName: string, 
      responseIndex: number, 
      newResponse: string 
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/responses/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          requirement_index: responseIndex,
          new_response: newResponse,
          sheet_name: sheetName
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update response');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the mutation data directly since it's stored in the processMultiSheetMutation
      if (processMultiSheetMutation.data) {
        const currentData = processMultiSheetMutation.data;
        const responses = currentData.responses || {};
        
        if (responses[variables.sheetName]) {
          responses[variables.sheetName][variables.responseIndex] = {
            ...responses[variables.sheetName][variables.responseIndex],
            response: variables.newResponse,
            last_modified: new Date().toISOString()
          };
          
          // Trigger a re-render by updating the mutation data
          processMultiSheetMutation.data = { ...currentData, responses };
        }
      }
      
      setEditingCell(null);
      setEditingText("");
      
      toast({
        title: "Response Updated",
        description: `Response in ${variables.sheetName} has been updated successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Edit handlers
  const handleEditResponse = (sheetName: string, index: number, currentResponse: string) => {
    setEditingCell({ sheetName, index });
    setEditingText(currentResponse);
  };

  const handleSaveResponse = () => {
    if (!editingCell || !editingText.trim()) {
      toast({
        title: "Invalid Response",
        description: "Response cannot be empty",
        variant: "destructive",
      });
      return;
    }

    updateMultiSheetResponseMutation.mutate({
      sheetName: editingCell.sheetName,
      responseIndex: editingCell.index,
      newResponse: editingText.trim()
    });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditingText("");
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      'Tech': 'bg-blue-500/20 text-blue-300',
      'Technical': 'bg-blue-500/20 text-blue-300',
      'Functional': 'bg-purple-500/20 text-purple-300',
      'Security': 'bg-red-500/20 text-red-300',
      'Non-Functional': 'bg-green-500/20 text-green-300',
      'BI Tool': 'bg-orange-500/20 text-orange-300',
      'Compliance': 'bg-yellow-500/20 text-yellow-300',
      'Gen AI or AI': 'bg-pink-500/20 text-pink-300',
      'Machine Learning': 'bg-cyan-500/20 text-cyan-300',
    };
    
    const colorClass = categoryColors[category] || 'bg-gray-500/20 text-gray-300';
    return <Badge variant="outline" className={`text-xs ${colorClass} border-current`}>{category}</Badge>;
  };

  if (previewError) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Multi-Sheet Processing Not Available</h3>
          <p className="text-muted-foreground mb-4">
            This feature is only available for Excel files with multiple sheets.
          </p>
          <p className="text-sm text-muted-foreground">
            {previewError instanceof Error ? previewError.message : "Please upload an Excel file to continue."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingPreview) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Loading Sheet Information</h3>
          <p className="text-muted-foreground">
            Analyzing your Excel file structure...
          </p>
        </CardContent>
      </Card>
    );
  }

  const sheetNames = previewData?.sheet_names || [];
  const previews = previewData?.previews || {};
  const results: SheetResults = processingMode === "rag" 
    ? (processMultiSheetMutation.data?.responses || {})
    : (processMultiSheetMutation.data?.results || {});
  const summary: Summary = processMultiSheetMutation.data?.summary || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Sheet className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Multi-Sheet Processor</h2>
            <p className="text-sm text-muted-foreground">
              Process {sheetNames.length} sheets with AI classification
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {sheetNames.length} Sheets Found
          </Badge>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing All Sheets</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(processingProgress)}%
                </span>
              </div>
              <Progress value={processingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Classifying requirements across {sheetNames.length} sheets...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview Sheets
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Process & Classify
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!processMultiSheetMutation.data}>
            <BarChart3 className="h-4 w-4" />
            Results & Export
          </TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Sheet Structure Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {sheetNames.map((sheetName) => {
                  const preview = previews[sheetName] as SheetPreview;
                  return (
                    <Card key={sheetName} className="border-muted">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>{sheetName}</span>
                          <Badge variant="outline">
                            {preview?.total_rows || 0} rows
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {preview ? (
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Columns:</h4>
                              <div className="flex flex-wrap gap-1">
                                {preview.columns?.map((col) => (
                                  <Badge key={col} variant="secondary" className="text-xs">
                                    {col}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {preview.sample_data && preview.sample_data.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Sample Data:</h4>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        {preview.columns?.map((col) => (
                                          <TableHead key={col} className="text-xs font-medium">
                                            {col}
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {preview.sample_data.slice(0, 2).map((row, idx) => (
                                        <TableRow key={idx}>
                                          {preview.columns?.map((col) => (
                                            <TableCell key={col} className="text-xs max-w-[200px] truncate">
                                              {String(row[col] || '').substring(0, 100)}
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No preview available</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Tab */}
        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                AI Processing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Processing Mode Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Processing Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <Card 
                    className={`cursor-pointer transition-all ${processingMode === 'classification' ? 'ring-2 ring-blue-500 bg-blue-500/5' : 'hover:bg-muted/50'}`}
                    onClick={() => setProcessingMode('classification')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${processingMode === 'classification' ? 'bg-blue-500/20' : 'bg-muted'}`}>
                          <BarChart3 className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">Classification Only</h4>
                          <p className="text-xs text-muted-foreground">Categorize requirements</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-all ${processingMode === 'rag' ? 'ring-2 ring-emerald-500 bg-emerald-500/5' : 'hover:bg-muted/50'}`}
                    onClick={() => setProcessingMode('rag')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${processingMode === 'rag' ? 'bg-emerald-500/20' : 'bg-muted'}`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">RAG + Classification</h4>
                          <p className="text-xs text-muted-foreground">Generate AI responses</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* RAG Configuration */}
              {processingMode === 'rag' && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg border">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Context Chunks (Top-K)</label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[topK]}
                        onValueChange={(value) => setTopK(value[0])}
                        min={1}
                        max={10}
                        step={1}
                        disabled={isProcessing}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-8">{topK}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">AI Model</label>
                    <Select value={model} onValueChange={setModel} disabled={isProcessing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llama3">Llama 3</SelectItem>
                        <SelectItem value="llama2">Llama 2</SelectItem>
                        <SelectItem value="mistral">Mistral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Include Classification</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeClassification"
                        checked={includeClassification}
                        onChange={(e) => setIncludeClassification(e.target.checked)}
                        disabled={isProcessing}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="includeClassification" className="text-sm">
                        Categorize requirements
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {processingMode === 'rag' 
                    ? `Process all ${sheetNames.length} sheets to generate AI responses using RAG (Retrieval-Augmented Generation). This will create comprehensive answers for each requirement.`
                    : `Process all ${sheetNames.length} sheets to automatically classify requirements into categories.`
                  }
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {["Tech", "Security", "Compliance", "Functional", "Non-Functional", "BI Tool", "Gen AI or AI", "Machine Learning"].map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={() => processMultiSheetMutation.mutate()}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {processingMode === 'rag' ? 'Generating AI Responses...' : 'Processing Classifications...'}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {processingMode === 'rag' ? 'Start RAG Processing' : 'Start Classification'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {processMultiSheetMutation.data && (
            <>
              {/* Summary Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(summary).map(([sheetName, categories]) => {
                  const totalRequirements = Object.values(categories).reduce((sum, count) => sum + count, 0);
                  const sheetResults = results[sheetName] || [];
                  const successfulResponses = processingMode === 'rag' 
                    ? sheetResults.filter(r => r.status === 'success' && r.response).length
                    : sheetResults.filter(r => r.status === 'success').length;
                  
                  return (
                    <Card key={sheetName}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{sheetName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total Requirements:</span>
                            <Badge>{totalRequirements}</Badge>
                          </div>
                          
                          {processingMode === 'rag' && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">AI Responses:</span>
                              <Badge variant="outline">{successfulResponses}/{totalRequirements}</Badge>
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            {Object.entries(categories).map(([category, count]) => (
                              <div key={category} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{category}:</span>
                                <span className="font-medium">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Detailed Results by Sheet */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Classified Requirements by Sheet</span>
                    <Button onClick={handleExportResults} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export to Excel
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue={Object.keys(results)[0]} className="w-full">
                    <TabsList className="w-full justify-start p-1 border-b rounded-none">
                      {Object.keys(results).map((sheetName) => (
                        <TabsTrigger key={sheetName} value={sheetName} className="text-sm">
                          {sheetName} ({results[sheetName]?.length || 0})
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {Object.entries(results).map(([sheetName, sheetResults]) => (
                      <TabsContent key={sheetName} value={sheetName} className="mt-0">
                        <div className="max-h-[70vh] overflow-auto">
                          <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
                              <TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead className="min-w-[300px]">Requirement</TableHead>
                                {processingMode === 'rag' && <TableHead className="min-w-[400px]">AI Response</TableHead>}
                                <TableHead className="w-32">Category</TableHead>
                                <TableHead className="w-24">Status</TableHead>
                                {processingMode === 'rag' && <TableHead className="w-24">Quality</TableHead>}
                                {processingMode === 'rag' && <TableHead className="w-24">Actions</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sheetResults.map((result, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{index + 1}</TableCell>
                                  <TableCell className="max-w-[300px] min-w-[300px]">
                                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                      {result.requirement}
                                    </p>
                                  </TableCell>
                                  {processingMode === 'rag' && (
                                    <TableCell className="max-w-[400px] min-w-[400px]">
                                      <div className="bg-muted/20 rounded-md p-3 min-h-[60px] border border-border/30">
                                        {editingCell?.sheetName === sheetName && editingCell?.index === index ? (
                                          <div className="space-y-2">
                                            <Textarea
                                              value={editingText}
                                              onChange={(e) => setEditingText(e.target.value)}
                                              className="min-h-[100px] resize-none text-sm"
                                              disabled={updateMultiSheetResponseMutation.isPending}
                                              placeholder="Edit the response..."
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                onClick={handleSaveResponse}
                                                disabled={updateMultiSheetResponseMutation.isPending || !editingText.trim()}
                                                className="h-7 px-2 text-xs"
                                              >
                                                <Save className="h-3 w-3 mr-1" />
                                                {updateMultiSheetResponseMutation.isPending ? "Saving..." : "Save"}
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelEdit}
                                                disabled={updateMultiSheetResponseMutation.isPending}
                                                className="h-7 px-2 text-xs"
                                              >
                                                <X className="h-3 w-3 mr-1" />
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            {result.response ? (
                                              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                                {result.response}
                                              </p>
                                            ) : (
                                              <p className="text-sm text-muted-foreground italic">
                                                No response generated
                                              </p>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </TableCell>
                                  )}
                                  <TableCell className="w-32">
                                    {getCategoryBadge(result.category)}
                                  </TableCell>
                                  <TableCell className="w-24">
                                    {result.status === 'success' ? (
                                      <Badge className="bg-green-500/20 text-green-300">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Success
                                      </Badge>
                                    ) : (
                                      <Badge variant="destructive">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {result.status}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  {processingMode === 'rag' && (
                                    <TableCell className="w-24">
                                      {result.quality_score !== undefined && result.quality_score > 0 ? (
                                        <div className="space-y-1">
                                          <Badge 
                                            className={
                                              result.quality_score >= 80 ? "bg-green-500/20 text-green-300" :
                                              result.quality_score >= 60 ? "bg-yellow-500/20 text-yellow-300" :
                                              result.quality_score >= 40 ? "bg-orange-500/20 text-orange-300" :
                                              "bg-red-500/20 text-red-300"
                                            }
                                          >
                                            {result.quality_score >= 80 ? "High" :
                                             result.quality_score >= 60 ? "Medium" :
                                             result.quality_score >= 40 ? "Low" : "Very Low"}
                                          </Badge>
                                          <div className="text-xs text-muted-foreground font-mono">
                                            {result.quality_score}%
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                      )}
                                    </TableCell>
                                  )}
                                  {processingMode === 'rag' && (
                                    <TableCell className="w-24">
                                      {editingCell?.sheetName === sheetName && editingCell?.index === index ? (
                                        <span className="text-xs text-muted-foreground">Editing...</span>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEditResponse(sheetName, index, result.response || "")}
                                          disabled={updateMultiSheetResponseMutation.isPending}
                                          className="h-7 px-2 text-xs"
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          Edit
                                        </Button>
                                      )}
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};