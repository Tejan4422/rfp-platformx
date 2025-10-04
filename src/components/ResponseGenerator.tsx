import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Rocket, Settings2, Loader2 } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:8001";

export const ResponseGenerator = () => {
  const { sessionId, requirements, setResponses, setCurrentStep } = useSession();
  const { toast } = useToast();
  const [topK, setTopK] = useState(3);
  const [model, setModel] = useState("llama3");
  const [progress, setProgress] = useState(0);
  const [currentRequirement, setCurrentRequirement] = useState("");

  const generateMutation = useMutation({
    mutationFn: async () => {
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
      if (!response.ok) throw new Error("Failed to generate responses");
      return response.json();
    },
    onSuccess: (data) => {
      setResponses(data.responses || []);
      setProgress(100);
      toast({
        title: "Generation complete",
        description: `Successfully generated ${data.responses?.length || 0} responses`,
      });
      setTimeout(() => {
        setCurrentStep("results");
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      setProgress(0);
    },
  });

  const handleGenerate = () => {
    setProgress(0);
    setCurrentRequirement(requirements[0]?.text || "");
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        const newProgress = prev + (100 / requirements.length) * 0.1;
        const currentIndex = Math.floor((newProgress / 100) * requirements.length);
        if (requirements[currentIndex]) {
          setCurrentRequirement(requirements[currentIndex].text);
        }
        return Math.min(newProgress, 95);
      });
    }, 300);

    generateMutation.mutate();
  };

  const estimatedTime = Math.ceil((requirements.length * 3) / 60);

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Adjust RAG parameters and select the AI model for response generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Context Chunks (top_k)</label>
              <Badge variant="secondary">{topK}</Badge>
            </div>
            <Slider
              value={[topK]}
              onValueChange={(value) => setTopK(value[0])}
              min={1}
              max={10}
              step={1}
              disabled={generateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Number of relevant context chunks to retrieve from the knowledge base
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">AI Model</label>
            <Select value={model} onValueChange={setModel} disabled={generateMutation.isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama3">Llama 3 (Recommended)</SelectItem>
                <SelectItem value="llama2">Llama 2</SelectItem>
                <SelectItem value="mistral">Mistral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Generate Responses
          </CardTitle>
          <CardDescription>
            Ready to process {requirements.length} requirement{requirements.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Estimated Processing Time</p>
              <p className="text-2xl font-bold text-primary">~{estimatedTime} min</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Using {model}</p>
              <p className="text-sm text-muted-foreground">Top-{topK} context</p>
            </div>
          </div>

          {generateMutation.isPending && (
            <div className="space-y-3">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Processing {Math.floor((progress / 100) * requirements.length)}/{requirements.length}
                </span>
                <span className="font-medium">{Math.floor(progress)}%</span>
              </div>
              {currentRequirement && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Currently processing: "{currentRequirement}"
                </p>
              )}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={requirements.length === 0 || generateMutation.isPending}
            className="w-full"
            size="lg"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Responses...
              </>
            ) : (
              <>
                <Rocket className="h-5 w-5 mr-2" />
                Generate All Responses
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
