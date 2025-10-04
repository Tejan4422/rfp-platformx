import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { NavigationTabs } from "@/components/NavigationTabs";
import { DocumentUpload } from "@/components/DocumentUpload";
import { ChatInterface } from "@/components/ChatInterface";
import { ResponseDashboard } from "@/components/ResponseDashboard";
import { KnowledgeBase } from "@/components/KnowledgeBase";
import { Analytics } from "@/components/Analytics";
import { HealthCheck } from "@/components/HealthCheck";

const Index = () => {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <HeroSection />
      
      {/* Health Check - Test API Connection */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <HealthCheck />
      </div>
      
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === "generate" && (
          <div className="space-y-12">
            <section>
              <h2 className="text-3xl font-bold mb-2">Upload RFP Document</h2>
              <p className="text-muted-foreground mb-6">
                Start by uploading your RFP document to extract requirements automatically
              </p>
              <DocumentUpload />
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-2">Direct Query</h2>
              <p className="text-muted-foreground mb-6">
                Or ask specific questions and get instant AI-generated responses
              </p>
              <ChatInterface />
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-2">Response Generation</h2>
              <p className="text-muted-foreground mb-6">
                Track progress and review generated responses
              </p>
              <ResponseDashboard />
            </section>
          </div>
        )}

        {activeTab === "knowledge" && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Knowledge Base Management</h2>
            <p className="text-muted-foreground mb-6">
              Build and manage your organization's RFP response knowledge base
            </p>
            <KnowledgeBase />
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <h2 className="text-3xl font-bold mb-2">Analytics & Insights</h2>
            <p className="text-muted-foreground mb-6">
              Track performance metrics and identify improvement opportunities
            </p>
            <Analytics />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
