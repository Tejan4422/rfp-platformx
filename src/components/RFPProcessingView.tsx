import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  RefreshCw
} from "lucide-react";
import { useSession, Requirement, Response } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

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
              Generating Answers... {processingStatus.completed}/{processingStatus.total}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {Math.round(processingStatus.progress)}% Completed
          </Badge>
        </div>
      </div>

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
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {requirements.map((req, index) => {
                const response = localResponses.find(r => r.requirement_id === req.id);
                const isEditingReq = editingRequirement === req.id;
                const isEditingResp = editingResponse === req.id;
                
                return (
                  <div key={req.id} className="border rounded-lg p-4 space-y-4 bg-card/30">
                    {/* Requirement Row */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">RFP Question {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(response || {} as Response)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRequirement(req)}
                            disabled={isEditingReq || processingStatus.isRunning}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {isEditingReq ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[80px] text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
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
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {req.text}
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Response Row */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">RFP Answer</h4>
                        <div className="flex items-center gap-2">
                          {response?.quality_score !== undefined && response.quality_score > 0 && (
                            getQualityBadge(response.quality_score)
                          )}
                          {response?.response && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditResponse(response)}
                              disabled={isEditingResp || processingStatus.isRunning}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {isEditingResp ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[100px] text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
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
                        <div className="bg-muted/30 rounded-md p-3">
                          {processingStatus.isRunning && (!response?.response || response.response === "") ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating response...
                            </div>
                          ) : response?.response ? (
                            <p className="text-sm leading-relaxed">
                              {response.response}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Response will appear here after processing...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};