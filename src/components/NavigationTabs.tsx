import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Database, BarChart3, Zap } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  return (
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="h-14 bg-transparent border-0 gap-2">
            <TabsTrigger 
              value="generate" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4" />
              Generate Responses
            </TabsTrigger>
            <TabsTrigger 
              value="processing" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Zap className="h-4 w-4" />
              RFP Processing
            </TabsTrigger>
            <TabsTrigger 
              value="knowledge" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Database className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
