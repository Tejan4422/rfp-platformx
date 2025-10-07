import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Edit, Trash2, Plus, Save, X } from "lucide-react";
import { useSession, Requirement } from "@/contexts/SessionContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = "http://localhost:8001";

export const RequirementsManager = () => {
  const { sessionId, requirements, setRequirements, setCurrentStep } = useSession();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [localRequirements, setLocalRequirements] = useState<Requirement[]>(requirements);

  // Sync with session context when requirements change
  useEffect(() => {
    console.log("RequirementsManager: Session requirements changed:", requirements);
    setLocalRequirements(requirements);
  }, [requirements]);

  const { data, isLoading } = useQuery({
    queryKey: ["requirements", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      console.log("RequirementsManager: Fetching requirements for session:", sessionId);
      const response = await fetch(`${API_BASE_URL}/api/requirements/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch requirements");
      return response.json();
    },
    enabled: !!sessionId && requirements.length === 0, // Only fetch if no requirements in context
  });

  useEffect(() => {
    console.log("RequirementsManager: API data changed:", data);
    if (data?.data?.requirements && requirements.length === 0) {
      console.log("RequirementsManager: Converting API requirements to local format");
      const reqs = data.data.requirements.map((req: string, index: number) => ({
        id: `req-${index}`,
        text: req,
        original_text: req,
      }));
      setLocalRequirements(reqs);
      setRequirements(reqs);
    }
  }, [data, requirements.length, setRequirements]);

  console.log("RequirementsManager: Rendering with localRequirements:", localRequirements);

  const handleEdit = (req: Requirement) => {
    setEditingId(req.id);
    setEditText(req.text);
  };

  const handleSave = (id: string) => {
    setLocalRequirements((prev) =>
      prev.map((req) => (req.id === id ? { ...req, text: editText } : req))
    );
    setEditingId(null);
    toast({
      title: "Requirement updated",
      description: "Changes saved successfully",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = (id: string) => {
    setLocalRequirements((prev) => prev.filter((req) => req.id !== id));
    toast({
      title: "Requirement deleted",
      description: "Requirement removed from the list",
    });
  };

  const handleAddNew = () => {
    const newReq: Requirement = {
      id: `req-${Date.now()}`,
      text: "",
    };
    setLocalRequirements((prev) => [...prev, newReq]);
    setEditingId(newReq.id);
    setEditText("");
  };

  const handleSaveAll = () => {
    setRequirements(localRequirements);
    toast({
      title: "All changes saved",
      description: `${localRequirements.length} requirements ready for processing`,
    });
    setCurrentStep("generate");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <p>Loading requirements...</p>
        </div>
      </div>
    );
  }

  if (localRequirements.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No requirements found. Please upload a document first.</p>
          <Button 
            className="mt-4"
            onClick={() => setCurrentStep("upload")}
          >
            Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Loading requirements...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            📋 Extracted Requirements
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!editingId}
              onChange={() => setEditingId(null)}
              className="rounded"
            />
            <span className="text-sm">✏️ Edit Requirements</span>
          </label>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {localRequirements.map((req, index) => (
            <AccordionItem 
              key={req.id} 
              value={req.id}
              className="border rounded-lg bg-card/50 px-4"
            >
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-medium text-left">
                  Requirement {index + 1}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2 pb-3">
                  {editingId === req.id ? (
                    <>
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Enter requirement text..."
                        className="min-h-[100px]"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(req.id)}
                          disabled={!editText.trim()}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-foreground/90">
                        {req.text}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(req)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(req.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer p-3 bg-card/50 rounded-lg border hover:bg-card transition-colors">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            <span className="text-sm font-medium">🏬 Vector Store Information</span>
          </summary>
          <div className="mt-2 p-4 bg-card/30 rounded-lg border text-sm text-muted-foreground">
            <p>Vector store contains {localRequirements.length} requirement embeddings</p>
          </div>
        </details>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleAddNew} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add New Requirement
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={localRequirements.length === 0}
            className="flex-1 bg-destructive hover:bg-destructive/90"
          >
            🚀 Process All Requirements
          </Button>
        </div>
      </div>
    </div>
  );
};
