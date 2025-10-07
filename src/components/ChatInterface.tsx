import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "http://localhost:8001";

interface Message {
  role: "user" | "assistant";
  content: string;
  quality?: "excellent" | "good" | "needs-review";
  timestamp?: string;
  loading?: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const quickQuestions = [
    "What are your company's core competencies?",
    "Describe your implementation methodology",
    "What's your approach to security and compliance?",
    "Tell me about your team's experience"
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add user message and loading message
    const loadingMessage: Message = {
      role: "assistant",
      content: "Generating response...",
      loading: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input,
          top_k: 3
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.data.answer,
          quality: data.data.quality_score >= 90 ? "excellent" : data.data.quality_score >= 75 ? "good" : "needs-review",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Replace loading message with actual response
        setMessages(prev => prev.slice(0, -1).concat(assistantMessage));
      } else {
        throw new Error(data.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Error calling direct query API:", error);
      
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing your query. Please make sure the backend server is running and try again.",
        quality: "needs-review",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Replace loading message with error message
      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
      
      toast({
        title: "Query Failed",
        description: "Could not connect to the AI service. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                    <div className="flex items-center gap-2">
                      {msg.loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <p className="text-sm">{msg.content}</p>
                    </div>
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
              disabled={isLoading}
            />
            <Button onClick={handleSend} size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Questions</CardTitle>
          <CardDescription>
            Common RFP questions to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {quickQuestions.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setInput(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
