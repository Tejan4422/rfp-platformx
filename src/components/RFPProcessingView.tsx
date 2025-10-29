import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Edit3, 
  Save, 
  X, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Settings,
  Download,
  RefreshCw,
  Sheet,
  Table
} from "lucide-react";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession, Requirement, Response } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { MultiSheetProcessor } from "./MultiSheetProcessor";

const API_BASE_URL = "http://localhost:8001";

interface ProcessingStatus {
  total: number;
  completed: number;
  current: string;
  isRunning: boolean;
  progress: number;
}

export const RFPProcessingView = () => {
  const { sessionId, requirements, setRequirements, responses, setResponses } = useSession();
  const { toast } = useToast();
  
  // Tab state for single vs multi-sheet processing
  const [processingMode, setProcessingMode] = useState<"single" | "multi">("single");
  
  // Processing state
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    total: 0,
    completed: 0,
    current: "",
    isRunning: false,
    progress: 0
  });
  
  // Configuration
  const [topK, setTopK] = useState(3);
  const [model, setModel] = useState("llama3");
  
  // Editing state
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  // Local state for responses during generation
  const [localResponses, setLocalResponses] = useState<Response[]>([]);

  useEffect(() => {
    setLocalResponses(responses);
  }, [responses]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("No session ID available");
      
      const response = await fetch(`${API_BASE_URL}/api/generate-responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: requirements.map((r) => r.text),
          top_k: topK,
          model: model,
          session_id: sessionId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to generate responses`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const mappedResponses = data.data?.responses?.map((response: any, index: number) => ({
        requirement_id: `req-${index}`,
        requirement: response.requirement,
        response: response.answer || "No response generated",
        quality_score: response.quality_score || 0,
        quality_status: response.quality_status,
        category: response.category || "Unknown",
        context_sources: response.context || []
      })) || [];
      
      setLocalResponses(mappedResponses);
      setResponses(mappedResponses);
      
      setProcessingStatus(prev => ({
        ...prev,
        isRunning: false,
        completed: prev.total,
        progress: 100
      }));
      
      toast({
        title: "Processing Complete!",
        description: `Generated responses for ${mappedResponses.length} requirements`,
      });
    },
    onError: (error) => {
      setProcessingStatus(prev => ({
        ...prev,
        isRunning: false
      }));
      
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleStartProcessing = () => {
    setProcessingStatus({
      total: requirements.length,
      completed: 0,
      current: requirements[0]?.text || "",
      isRunning: true,
      progress: 0
    });

    // Initialize empty responses
    const emptyResponses = requirements.map((req, index) => ({
      requirement_id: req.id,
      requirement: req.text,
      response: "",
      quality_score: 0,
      category: "Processing...",
      context_sources: []
    }));
    setLocalResponses(emptyResponses);

    // Simulate progress updates
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < requirements.length && processingStatus.isRunning) {
        const progress = ((currentIndex + 1) / requirements.length) * 100;
        setProcessingStatus(prev => ({
          ...prev,
          completed: currentIndex + 1,
          current: requirements[currentIndex]?.text || "",
          progress
        }));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    generateMutation.mutate();
  };

  const handleEditRequirement = (req: Requirement) => {
    setEditingRequirement(req.id);
    setEditText(req.text);
  };

  const handleEditResponse = (resp: Response) => {
    setEditingResponse(resp.requirement_id);
    setEditText(resp.response);
  };

  const handleSaveRequirement = () => {
    if (!editingRequirement) return;
    
    setRequirements(requirements.map(req => 
      req.id === editingRequirement ? { ...req, text: editText } : req
    ));
    
    setEditingRequirement(null);
    setEditText("");
    
    toast({
      title: "Requirement Updated",
      description: "Requirement has been saved successfully",
    });
  };

  const handleSaveResponse = () => {
    if (!editingResponse) return;
    
    setLocalResponses(localResponses.map(resp => 
      resp.requirement_id === editingResponse ? { ...resp, response: editText } : resp
    ));
    
    setResponses(localResponses.map(resp => 
      resp.requirement_id === editingResponse ? { ...resp, response: editText } : resp
    ));
    
    setEditingResponse(null);
    setEditText("");
    
    toast({
      title: "Response Updated",
      description: "Response has been saved successfully",
    });
  };

  const handleCancel = () => {
    setEditingRequirement(null);
    setEditingResponse(null);
    setEditText("");
  };

  const getStatusBadge = (response: Response) => {
    if (processingStatus.isRunning && !response.response) {
      return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">Processing...</Badge>;
    }
    if (response.response && response.response !== "") {
      return <Badge variant="secondary" className="bg-green-500/20 text-green-300">Completed</Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-500/20 text-gray-300">Pending</Badge>;
  };

  const getQualityBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500/20 text-green-300">High Quality</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500/20 text-yellow-300">Medium Quality</Badge>;
    if (score >= 40) return <Badge className="bg-orange-500/20 text-orange-300">Low Quality</Badge>;
    return <Badge className="bg-red-500/20 text-red-300">Very Low</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      'Tech': 'bg-blue-500/20 text-blue-300',
      'Technical': 'bg-blue-500/20 text-blue-300',
      'Functional': 'bg-purple-500/20 text-purple-300',
      'Security': 'bg-red-500/20 text-red-300',
      'Non-Functional': 'bg-green-500/20 text-green-300',
      'Performance': 'bg-green-500/20 text-green-300',
      'BI Tool': 'bg-orange-500/20 text-orange-300',
      'Compliance': 'bg-yellow-500/20 text-yellow-300',
      'Gen AI or AI': 'bg-pink-500/20 text-pink-300',
      'Machine Learning': 'bg-cyan-500/20 text-cyan-300',
      'Business': 'bg-pink-500/20 text-pink-300',
      'Infrastructure': 'bg-gray-500/20 text-gray-300',
      'Data': 'bg-cyan-500/20 text-cyan-300',
      'UI/UX': 'bg-indigo-500/20 text-indigo-300',
      'Integration': 'bg-orange-500/20 text-orange-300'
    };
    
    const colorClass = categoryColors[category] || 'bg-gray-500/20 text-gray-300';
    return <Badge variant="outline" className={`text-xs ${colorClass} border-current`}>{category}</Badge>;
  };

  if (requirements.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Requirements Found</h3>
            <p className="text-muted-foreground mb-4">
              Please upload an RFP document first to extract requirements.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Supported formats:
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline">PDF</Badge>
                <Badge variant="outline">DOCX</Badge>
                <Badge variant="outline">XLSX (Single & Multi-sheet)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FileText className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">RFP Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Process requirements and generate AI responses
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {requirements.length} Requirements
          </Badge>
        </div>
      </div>

      {/* Processing Mode Tabs */}
      <Tabs value={processingMode} onValueChange={(value) => setProcessingMode(value as "single" | "multi")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Single Sheet Processing
          </TabsTrigger>
          <TabsTrigger value="multi" className="flex items-center gap-2">
            <Sheet className="h-4 w-4" />
            Multi-Sheet Processing
          </TabsTrigger>
        </TabsList>

        {/* Single Sheet Processing */}
        <TabsContent value="single" className="space-y-6">
          {/* Progress Section */}
          {processingStatus.isRunning && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing Requirements</span>
                    <span className="text-sm text-muted-foreground">
                      {processingStatus.completed} of {processingStatus.total}
                    </span>
                  </div>
                  <Progress value={processingStatus.progress} className="h-2" />
                  {processingStatus.current && (
                    <p className="text-xs text-muted-foreground truncate">
                      Current: {processingStatus.current.substring(0, 100)}...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Processing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Context Chunks (Top-K)</label>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[topK]}
                      onValueChange={(value) => setTopK(value[0])}
                      min={1}
                      max={10}
                      step={1}
                      disabled={processingStatus.isRunning}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-8">{topK}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Model</label>
                  <Select value={model} onValueChange={setModel} disabled={processingStatus.isRunning}>
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
                
                <div className="flex items-end">
                  <Button
                    onClick={handleStartProcessing}
                    disabled={processingStatus.isRunning}
                    className="w-full"
                    size="sm"
                  >
                    {processingStatus.isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Process All
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements and Responses Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Requirements & Responses</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-auto">
                  <UITable>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-muted/80 backdrop-blur">
                        <TableHead className="w-16 text-center font-semibold border-r border-border">#</TableHead>
                        <TableHead className="w-1/3 font-semibold border-r border-border">RFP Question</TableHead>
                        <TableHead className="w-1/3 font-semibold border-r border-border">RFP Answer</TableHead>
                        <TableHead className="w-24 text-center font-semibold border-r border-border">Category</TableHead>
                        <TableHead className="w-20 text-center font-semibold border-r border-border">Status</TableHead>
                        <TableHead className="w-20 text-center font-semibold border-r border-border">Quality</TableHead>
                        <TableHead className="w-20 text-center font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {requirements.map((req, index) => {
                      const response = localResponses.find(r => r.requirement_id === req.id);
                      const isEditingReq = editingRequirement === req.id;
                      const isEditingResp = editingResponse === req.id;
                      
                      return (
                        <TableRow key={req.id} className="hover:bg-muted/30 border-b border-border/50">
                          <TableCell className="font-medium text-center border-r border-border/50 bg-muted/10">
                            {index + 1}
                          </TableCell>
                          
                          {/* RFP Question Column */}
                          <TableCell className="align-top border-r border-border/50 p-4 max-w-0">
                            {isEditingReq ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="min-h-[100px] text-sm resize-none"
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" onClick={handleSaveRequirement}>
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancel}>
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                  {req.text}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRequirement(req)}
                                  disabled={processingStatus.isRunning}
                                  className="h-6 text-xs opacity-60 hover:opacity-100"
                                >
                                  <Edit3 className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            )}
                          </TableCell>

                          {/* RFP Answer Column */}
                          <TableCell className="align-top border-r border-border/50 p-4 max-w-0">
                            {isEditingResp ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="min-h-[100px] text-sm resize-none"
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" onClick={handleSaveResponse}>
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancel}>
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="bg-muted/20 rounded-md p-3 min-h-[60px] border border-border/30">
                                  {processingStatus.isRunning && (!response?.response || response.response === "") ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Generating response...
                                    </div>
                                  ) : response?.response ? (
                                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                      {response.response}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                      Response will appear here after processing...
                                    </p>
                                  )}
                                </div>
                                {response?.response && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditResponse(response)}
                                    disabled={processingStatus.isRunning}
                                    className="h-6 text-xs opacity-60 hover:opacity-100"
                                  >
                                    <Edit3 className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                            )}
                          </TableCell>

                          {/* Category Column */}
                          <TableCell className="align-top text-center border-r border-border/50 p-4">
                            {response?.category ? (
                              getCategoryBadge(response.category)
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          {/* Status Column */}
                          <TableCell className="align-top text-center border-r border-border/50 p-4">
                            {getStatusBadge(response || {} as Response)}
                          </TableCell>

                          {/* Quality Column */}
                          <TableCell className="align-top text-center border-r border-border/50 p-4">
                            {response?.quality_score !== undefined && response.quality_score > 0 ? (
                              <div className="space-y-1">
                                {getQualityBadge(response.quality_score)}
                                <div className="text-xs text-muted-foreground font-mono">
                                  {response.quality_score}%
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          {/* Actions Column */}
                          <TableCell className="align-top text-center p-4">
                            <div className="flex flex-col gap-1">
                              {response?.response && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs"
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </UITable>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Sheet Processing */}
        <TabsContent value="multi" className="space-y-6">
          <MultiSheetProcessor />
        </TabsContent>
      </Tabs>
    </div>
  );
};