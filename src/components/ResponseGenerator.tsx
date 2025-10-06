import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

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

  useEffect(() => {
    if (generateMutation.isPending && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [generateMutation.isPending, startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          ⚡ Generate Responses 🔗
        </h2>

        <Alert className="bg-green-950/50 border-green-900">
          <AlertDescription>
            🚀 Ready to generate responses using RAG pipeline!
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Number of context chunks to retrieve</label>
            <div className="flex items-center gap-4">
              <Slider
                value={[topK]}
                onValueChange={(value) => setTopK(value[0])}
                min={1}
                max={10}
                step={1}
                disabled={generateMutation.isPending}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">{topK}</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Ollama Model</label>
            <Select value={model} onValueChange={setModel} disabled={generateMutation.isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama3">llama3</SelectItem>
                <SelectItem value="llama2">llama2</SelectItem>
                <SelectItem value="mistral">mistral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Alert className="bg-blue-950/50 border-blue-900">
          <AlertDescription>
            🏬 Processing {requirements.length} requirements (estimated time: ~{estimatedTime * 60} seconds)
          </AlertDescription>
        </Alert>

        <Button
          onClick={() => {
            setStartTime(Date.now());
            setElapsedTime(0);
            handleGenerate();
          }}
          disabled={requirements.length === 0 || generateMutation.isPending}
          className="w-full bg-destructive hover:bg-destructive/90"
          size="lg"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Responses...
            </>
          ) : (
            <>
              🚀 Generate All Responses
            </>
          )}
        </Button>

        {generateMutation.isPending && (
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            
            <div className="grid md:grid-cols-2 gap-3">
              <Alert className="bg-green-950/50 border-green-900">
                <AlertDescription>
                  ✅ Completed: {Math.floor((progress / 100) * requirements.length)}/{requirements.length}
                </AlertDescription>
              </Alert>
              <Alert className="bg-blue-950/50 border-blue-900">
                <AlertDescription>
                  ⏱️ ETA: {formatTime(elapsedTime)}
                </AlertDescription>
              </Alert>
            </div>

            {currentRequirement && (
              <Alert className="bg-blue-950/50 border-blue-900">
                <AlertDescription className="line-clamp-1">
                  🔄 Processing: {currentRequirement.substring(0, 50)}...
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {generateMutation.isSuccess && !generateMutation.isPending && (
          <>
            <Alert className="bg-green-950/50 border-green-900">
              <AlertDescription>
                🎉 Generated responses for {requirements.length} requirements in {formatTime(elapsedTime)}!
              </AlertDescription>
            </Alert>

            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer p-3 bg-card/50 rounded-lg border hover:bg-card transition-colors">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                <span className="text-sm font-medium">📄 Preview Generated Responses</span>
              </summary>
              <div className="mt-2 p-4 bg-card/30 rounded-lg border text-sm text-muted-foreground">
                <p>Click "Continue" to view and download results</p>
              </div>
            </details>
          </>
        )}
      </div>
    </div>
  );
};
