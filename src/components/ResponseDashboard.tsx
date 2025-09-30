import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const mockRequirements = [
  { id: 1, text: "Describe your company's experience with enterprise software implementations", status: "completed", quality: "excellent" },
  { id: 2, text: "Detail your approach to project management and methodologies", status: "completed", quality: "good" },
  { id: 3, text: "Explain your security and compliance certifications", status: "processing", quality: null },
  { id: 4, text: "Provide case studies of similar projects", status: "pending", quality: null },
  { id: 5, text: "Describe your team structure and key personnel", status: "pending", quality: null },
];

export const ResponseDashboard = () => {
  const completedCount = mockRequirements.filter(r => r.status === "completed").length;
  const progressPercent = (completedCount / mockRequirements.length) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "processing":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getQualityBadge = (quality: string | null) => {
    if (!quality) return null;
    
    const colors = {
      excellent: "default",
      good: "secondary",
      "needs-review": "destructive"
    } as const;

    return <Badge variant={colors[quality as keyof typeof colors]}>{quality}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Requirements</CardDescription>
            <CardTitle className="text-3xl">{mockRequirements.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-success">{completedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg. Quality Score</CardDescription>
            <CardTitle className="text-3xl">8.9/10</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Response Generation Progress</CardTitle>
              <CardDescription>
                Processing {mockRequirements.length} requirements • ETA: 3 minutes
              </CardDescription>
            </div>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="mb-4" />
          <p className="text-sm text-muted-foreground">{progressPercent.toFixed(0)}% complete</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements & Responses</CardTitle>
          <CardDescription>
            Review and edit generated responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {mockRequirements.map((req) => (
              <AccordionItem key={req.id} value={`item-${req.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <Checkbox checked={req.status === "completed"} />
                    {getStatusIcon(req.status)}
                    <span className="flex-1">{req.text}</span>
                    {getQualityBadge(req.quality)}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pl-9 pt-2">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Generated Response:</p>
                      <p className="text-sm text-muted-foreground">
                        Our company has extensive experience in enterprise software implementations, 
                        having successfully delivered over 150 projects across various industries. 
                        Our proven methodology ensures on-time delivery and exceeds client expectations...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">View Sources</Button>
                      <Button size="sm" variant="outline">Regenerate</Button>
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
