import { useCallback } from 'react';

const apikey = import.meta.env.VITE_GEMINI_KEY;

export const useApi = () => {
  const generateResponse = useCallback(async (question, conversationContext) => {
    const updatedContext = [
      ...conversationContext,
      { role: "user", text: question }
    ].slice(-10);

    const contextPrompt = updatedContext.length > 1
      ? `You are Studia AI, an intelligent learning assistant for the Studia educational platform. 
      
Context of previous conversation:
${updatedContext.slice(0, -1).map(msg => `${msg.role}: ${msg.text}`).join('\n')}

Current question: ${question}

Studia Platform Features:
- Study Sessions (group, 1-on-1, exam prep, topic deep dives)
- Learning Games (educational games, quizzes, tournaments)
- AI Notes (smart note-taking, flashcards, summarization)
- Progress Tracking and Analytics
- Collaborative Learning Tools

Please provide helpful, educational responses focused on learning, studying, and using the Studia platform. If the question is unrelated to education or learning, gently guide the conversation back to how Studia can help with learning goals.`
      : `You are Studia AI, an intelligent learning assistant for the Studia educational platform. 

Studia Platform Features:
- Study Sessions (group, 1-on-1, exam prep, topic deep dives)
- Learning Games (educational games, quizzes, tournaments)  
- AI Notes (smart note-taking, flashcards, summarization)
- Progress Tracking and Analytics
- Collaborative Learning Tools

Please provide helpful, educational responses focused on learning, studying, and using the Studia platform. If the question is unrelated to education or learning, gently guide the conversation back to how Studia can help with learning goals.

Current question: ${question}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apikey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: contextPrompt }],
            },
          ],
        }),
      }
    );

    if (response.status === 429) {
      throw new Error("Rate limit exceeded");
    }

    const data = await response.json();

    if (data && data.candidates && data.candidates.length > 0) {
      const generatedResponse =
        data.candidates[0]?.content?.parts[0]?.text || "I apologize, but I couldn't generate a response. Please try again or ask about Studia's learning features!";
      
      return { type: 'ai', response: generatedResponse, context: updatedContext };
    }
  }, []);

  return { generateResponse };
};
