import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, BarChart3, Clock } from "lucide-react";

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden gradient-hero py-20 px-6 border-b border-border">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border text-foreground text-sm mb-6">
            <FileText className="h-4 w-4" />
            <span>AI-Powered RFP Response Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Generate Professional RFP<br />Responses with AI
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your proposal process with enterprise-grade AI. Save time, improve win rates, and deliver exceptional responses.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              Watch Demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-6 border border-border">
              <Clock className="h-8 w-8 text-foreground mb-3 mx-auto" />
              <div className="text-3xl font-bold text-foreground mb-1">90%</div>
              <div className="text-muted-foreground text-sm">Time Saved</div>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <BarChart3 className="h-8 w-8 text-foreground mb-3 mx-auto" />
              <div className="text-3xl font-bold text-foreground mb-1">45%</div>
              <div className="text-muted-foreground text-sm">Higher Win Rates</div>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <FileText className="h-8 w-8 text-foreground mb-3 mx-auto" />
              <div className="text-3xl font-bold text-foreground mb-1">100%</div>
              <div className="text-muted-foreground text-sm">Enterprise Security</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
