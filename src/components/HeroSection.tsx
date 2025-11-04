import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, BarChart3, Clock } from "lucide-react";

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden gradient-hero py-20 px-6 border-b border-border">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border text-foreground text-sm mb-6">
            <FileText className="h-4 w-4" />
            <span>Intelligent Document Processing</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Organize & Navigate<br />Complex RFPs with Clarity
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform overwhelming RFP documents into organized, categorized dashboards. Help your sales teams and clients quickly find what matters most.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="gap-2">
              Organize Your RFP <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              See Dashboard
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-6 border border-border">
              <BarChart3 className="h-8 w-8 text-foreground mb-3 mx-auto" />
              <div className="text-3xl font-bold text-foreground mb-1">8 Categories</div>
              <div className="text-muted-foreground text-sm">Smart Classification</div>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <Clock className="h-8 w-8 text-foreground mb-3 mx-auto" />
              <div className="text-3xl font-bold text-foreground mb-1">Instant</div>
              <div className="text-muted-foreground text-sm">Dashboard Creation</div>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <FileText className="h-8 w-8 text-foreground mb-3 mx-auto" />
              <div className="text-3xl font-bold text-foreground mb-1">Multi-Sheet</div>
              <div className="text-muted-foreground text-sm">Excel Navigation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
