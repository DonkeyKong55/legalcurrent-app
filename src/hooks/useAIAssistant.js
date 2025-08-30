import { useState } from "react";

export function useAIAssistant() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIQuestion = async (e) => {
    if (e) e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiResponse(null);
    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: aiQuestion }),
      });

      if (response.ok) {
        const result = await response.json();
        setAiResponse(result);
      }
    } catch (error) {
      console.error("Error asking AI assistant:", error);
      setAiResponse({ answer: "Sorry, I encountered an error. Please try again." });
    } finally {
      setAiLoading(false);
    }
  };

  const openModal = () => setShowAIAssistant(true);

  const closeModal = () => {
    setShowAIAssistant(false);
    setAiResponse(null);
    setAiQuestion("");
  };

  return {
    showAIAssistant,
    aiQuestion,
    setAiQuestion,
    aiResponse,
    aiLoading,
    handleAIQuestion,
    openModal,
    closeModal,
  };
}
