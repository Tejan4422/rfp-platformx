import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary py-20 px-6">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-6">
            <Zap className="h-4 w-4" />
            <span>AI-Powered RFP Response Generator</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Generate Professional RFP<br />Responses with AI
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Transform your proposal process with enterprise-grade AI. Save time, improve win rates, and deliver exceptional responses.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Watch Demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Zap className="h-8 w-8 text-white mb-3 mx-auto" />
              <div className="text-3xl font-bold text-white mb-1">90%</div>
              <div className="text-white/80 text-sm">Time Saved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <TrendingUp className="h-8 w-8 text-white mb-3 mx-auto" />
              <div className="text-3xl font-bold text-white mb-1">45%</div>
              <div className="text-white/80 text-sm">Higher Win Rates</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Shield className="h-8 w-8 text-white mb-3 mx-auto" />
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-white/80 text-sm">Enterprise Security</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
