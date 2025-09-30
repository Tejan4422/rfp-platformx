import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export const Analytics = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Total RFPs Processed
            </CardDescription>
            <CardTitle className="text-3xl">127</CardTitle>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg. Processing Time
            </CardDescription>
            <CardTitle className="text-3xl">4.2m</CardTitle>
            <p className="text-xs text-muted-foreground">-45% from last month</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Win Rate
            </CardDescription>
            <CardTitle className="text-3xl">68%</CardTitle>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Avg. Quality Score
            </CardDescription>
            <CardTitle className="text-3xl">8.9</CardTitle>
            <p className="text-xs text-muted-foreground">+0.4 from last month</p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Quality Distribution</CardTitle>
            <CardDescription>Quality scores across all generated responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Excellent (9-10)</span>
                <div className="flex items-center gap-2">
                  <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: "72%" }} />
                  </div>
                  <span className="text-sm font-medium">72%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Good (7-8)</span>
                <div className="flex items-center gap-2">
                  <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "23%" }} />
                  </div>
                  <span className="text-sm font-medium">23%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Needs Review (Below 7)</span>
                <div className="flex items-center gap-2">
                  <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-warning" style={{ width: "5%" }} />
                  </div>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>RFPs processed over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, idx) => {
                const values = [18, 24, 19, 31, 27, 34];
                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-sm w-8">{month}</span>
                    <div className="flex-1 h-8 bg-muted rounded overflow-hidden">
                      <div 
                        className="h-full bg-primary flex items-center justify-end pr-2 text-xs text-white font-medium"
                        style={{ width: `${(values[idx] / 40) * 100}%` }}
                      >
                        {values[idx]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Response Categories</CardTitle>
          <CardDescription>Categories with highest quality scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Technical Implementation</p>
              <p className="text-2xl font-bold mb-1">9.2</p>
              <p className="text-xs text-muted-foreground">45 responses</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Security & Compliance</p>
              <p className="text-2xl font-bold mb-1">9.0</p>
              <p className="text-xs text-muted-foreground">38 responses</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Case Studies</p>
              <p className="text-2xl font-bold mb-1">8.8</p>
              <p className="text-xs text-muted-foreground">52 responses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
