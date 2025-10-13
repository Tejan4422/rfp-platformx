import { createContext, useContext, useState, ReactNode } from "react";

export interface Requirement {
  id: string;
  text: string;
  original_text?: string;
}

export interface Response {
  requirement_id: string;
  requirement: string;
  response: string;
  quality_score: number;
  category?: string;
  context_sources?: Array<{
    content: string;
    similarity: number;
  }>;
}

interface SessionContextType {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  requirements: Requirement[];
  setRequirements: (reqs: Requirement[]) => void;
  responses: Response[];
  setResponses: (resps: Response[]) => void;
  currentStep: "upload" | "requirements" | "generate" | "results";
  setCurrentStep: (step: "upload" | "requirements" | "generate" | "results") => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentStep, setCurrentStep] = useState<"upload" | "requirements" | "generate" | "results">("upload");
  
  console.log("SessionProvider mounted - context available");

  const clearSession = () => {
    setSessionId(null);
    setRequirements([]);
    setResponses([]);
    setCurrentStep("upload");
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        setSessionId,
        requirements,
        setRequirements,
        responses,
        setResponses,
        currentStep,
        setCurrentStep,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
