import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Clock, CheckCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  quality?: "excellent" | "good" | "needs-review";
  timestamp?: string;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI RFP assistant. Ask me anything about generating responses, or try one of the quick questions below.",
      timestamp: "2:30 PM"
    }
  ]);
  const [input, setInput] = useState("");

  const quickQuestions = [
    "What are your company's core competencies?",
    "Describe your implementation methodology",
    "What's your approach to security and compliance?",
    "Tell me about your team's experience",
    "What is your project management approach?",
    "Describe your quality assurance process",
    "What are your service level agreements?",
    "How do you handle data privacy and GDPR compliance?",
    "What is your disaster recovery plan?",
    "Describe your technical support capabilities",
    "What are your pricing models and payment terms?",
    "How do you ensure scalability and performance?",
    "What is your change management process?",
    "Describe your training and onboarding approach",
    "What certifications does your company hold?",
    "How do you handle system integration?",
    "What is your reporting and analytics capability?",
    "Describe your business continuity plan",
    "What are your key differentiators?",
    "How do you measure success and ROI?"
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "Based on your knowledge base, here's a comprehensive response addressing this requirement with relevant case studies and examples from past successful proposals.",
      quality: "excellent",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput("");
  };

  const getQualityBadge = (quality?: string) => {
    if (!quality) return null;
    
    const variants = {
      excellent: "default",
      good: "secondary",
      "needs-review": "destructive"
    } as const;

    return (
      <Badge variant={variants[quality as keyof typeof variants] || "secondary"} className="ml-2">
        {quality === "excellent" && <CheckCircle className="h-3 w-3 mr-1" />}
        {quality}
      </Badge>
    );
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Direct Query Interface
          </CardTitle>
          <CardDescription>
            Ask questions directly and get AI-generated responses instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs opacity-70 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {msg.timestamp}
                      </span>
                      {getQualityBadge(msg.quality)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your RFP..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="relative border-0 shadow-glow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-90"></div>
        <CardHeader className="relative">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-t-lg"></div>
          <CardTitle className="relative flex items-center gap-2">
            <span className="text-foreground">✨ Quick Questions</span>
          </CardTitle>
          <CardDescription className="relative text-foreground/70">
            AI-powered RFP question suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm rounded-b-lg"></div>
          <div className="relative h-[400px] overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="space-y-2 p-2 animate-scroll-vertical hover:[animation-play-state:paused]">
              {[...quickQuestions, ...quickQuestions].map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 bg-card/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all hover:shadow-md"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
