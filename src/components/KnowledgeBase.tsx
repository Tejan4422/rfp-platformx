import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Database, Upload, CheckCircle2, FileText, TrendingUp } from "lucide-react";

export const KnowledgeBase = () => {
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
                Upload Historical RFP Responses
              </CardTitle>
              <CardDescription>
                Add your past successful proposals to improve AI response quality
              </CardDescription>
            </div>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Build Your Knowledge Base</p>
            <p className="text-sm text-muted-foreground mb-4">
              Upload past RFP responses, case studies, and company documentation
            </p>
            <Badge variant="secondary">Supports PDF, DOCX, and structured data</Badge>
          </div>
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
