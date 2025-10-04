import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

  const handleDownloadExcel = () => {
    toast({
      title: "Preparing download",
      description: "Your Excel file will be ready shortly",
    });
    // TODO: Implement actual Excel download
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Preparing download",
      description: "Your PDF file will be ready shortly",
    });
    // TODO: Implement actual PDF download
  };

  const toggleSources = (reqId: string) => {
    setExpandedSources(expandedSources === reqId ? null : reqId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Generated Responses
              </CardTitle>
              <CardDescription>
                Review and export your AI-generated RFP responses
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadExcel}>
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Responses</p>
              <p className="text-3xl font-bold text-primary">{responses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-success">
                {responses.length > 0 ? "100" : "0"}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Avg Quality</p>
              <p className={`text-3xl font-bold ${getQualityColor(avgQuality)}`}>
                {avgQuality}%
              </p>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {responses.map((response, index) => (
              <AccordionItem key={response.requirement_id || index} value={`response-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3 text-left flex-1">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="line-clamp-1 flex-1">{response.requirement}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Quality:</span>
                      <Badge className={getQualityColor(response.quality_score)}>
                        {response.quality_score}%
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        Question:
                      </h4>
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
                          {expandedSources === response.requirement_id
                            ? "Hide"
                            : "View"}{" "}
                          Sources ({response.context_sources.length})
                        </Button>
                        {expandedSources === response.requirement_id && (
                          <div className="mt-3 space-y-2">
                            {response.context_sources.map((source, idx) => (
                              <div
                                key={idx}
                                className="text-xs p-3 bg-background/50 rounded border"
                              >
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
        </CardContent>
      </Card>
    </div>
  );
};
