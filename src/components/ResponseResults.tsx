import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, FileText, RefreshCw, Edit, BarChart3 } from "lucide-react";
import { useSession, Response } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export const ResponseResults = () => {
  const { responses, sessionId } = useSession();
  const { toast } = useToast();
  const [expandedSources, setExpandedSources] = useState<string | null>(null);

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-blue-400";
    if (score >= 60) return "text-success";
    if (score >= 40) return "text-yellow-400";
    return "text-destructive";
  };

  const getQualityBadge = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Review";
  };

  const avgQuality = responses.length > 0
    ? Math.round(responses.reduce((sum, r) => sum + r.quality_score, 0) / responses.length)
    : 0;

  const handleDownloadExcel = async () => {
    if (!sessionId) {
      toast({
        title: "Download failed",
        description: "No session ID available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8001/api/download-responses/${sessionId}?format=excel`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: Download failed`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rfp-responses-${sessionId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download successful",
        description: "Excel report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!sessionId) {
      toast({
        title: "Download failed",
        description: "No session ID available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8001/api/download-responses/${sessionId}?format=pdf`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: Download failed`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rfp-responses-${sessionId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download successful",
        description: "PDF report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const toggleSources = (reqId: string) => {
    setExpandedSources(expandedSources === reqId ? null : reqId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          📬 Download Results
        </h2>

        <Alert className="bg-green-950/50 border-green-900">
          <AlertDescription>
            Ready to download results for {responses.length} requirements!
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">📊 Excel Format</h3>
            </div>
            <Button 
              onClick={handleDownloadExcel}
              className="w-full bg-destructive hover:bg-destructive/90"
            >
              ⬇️ Download Excel
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h3 className="text-lg font-semibold">📄 PDF Format</h3>
            </div>
            <Button 
              onClick={handleDownloadPDF}
              className="w-full bg-destructive hover:bg-destructive/90"
            >
              ⬇️ Download PDF
            </Button>
          </div>
        </div>

        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer p-3 bg-card/50 rounded-lg border hover:bg-card transition-colors">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            <span className="text-sm font-medium">📄 Preview Generated Responses</span>
          </summary>
          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {responses.map((response, index) => (
                <AccordionItem 
                  key={response.requirement_id || index} 
                  value={`response-${index}`}
                  className="border rounded-lg bg-card/50 px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3 text-left flex-1">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="line-clamp-1 flex-1 text-sm">{response.requirement}</span>
                      </div>
                      <Badge className={getQualityColor(response.quality_score)}>
                        {response.quality_score}%
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4 pb-3">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Question:</h4>
                        <p className="text-sm p-3 bg-muted/30 rounded-md border-l-2 border-primary/50">
                          {response.requirement}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          Generated Response:
                          <Badge variant="secondary">{getQualityBadge(response.quality_score)}</Badge>
                        </h4>
                        <div className="text-sm p-4 bg-muted/50 rounded-md space-y-2">
                          <p className="whitespace-pre-wrap">{response.response}</p>
                          <Progress value={response.quality_score} className="h-1.5 mt-3" />
                        </div>
                      </div>

                      {response.context_sources && response.context_sources.length > 0 && (
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSources(response.requirement_id)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {expandedSources === response.requirement_id ? "Hide" : "View"} Sources ({response.context_sources.length})
                          </Button>
                          {expandedSources === response.requirement_id && (
                            <div className="mt-3 space-y-2">
                              {response.context_sources.map((source, idx) => (
                                <div key={idx} className="text-xs p-3 bg-background/50 rounded border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">Source {idx + 1}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(source.similarity * 100)}% match
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground">{source.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Response
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </details>
      </div>
    </div>
  );
};
