import { messageRateLimit, typingRateLimit } from "./rateLimiter.js";
import { chatResponse, generateEmbedding } from "../utils/ollamaUtils.js";
import Note from "../Model/NoteModel.js";
import Task from "../Model/ToDoModel.js";
import Event from "../Model/EventModel.js";

// Helper for RAG context (duplicated from Controller, ideally should be shared)
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

import User from "../Model/UserModel.js";

async function getRAGResponse(query, userId) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) return "I'm having trouble understanding that matches.";

    // Fetch user's friends
    let friendsContext = "";
    if (userId) {
      try {
        const user = await User.findById(userId).populate("friends", "FirstName LastName Username Email");
        if (user && user.friends && user.friends.length > 0) {
          const list = user.friends.map(f => `- ${f.FirstName} ${f.LastName || ""} (@${f.Username})`).join("\n");
          friendsContext = `\nMY FRIENDS LIST:\n${list}\n`;
        } else {
          friendsContext = "\nMY FRIENDS LIST:\n(No friends found)\n";
        }
      } catch (e) {
        console.error("Error fetching friends for RAG:", e);
      }
    }

    const [notes, tasks, events] = await Promise.all([
      Note.find({ embedding: { $exists: true } }).select("+embedding title content"),
      Task.find({ embedding: { $exists: true } }).select("+embedding title status dueDate"),
      Event.find({ embedding: { $exists: true } }).select("+embedding title date time"),
    ]);

    const candidates = [];
    notes.forEach(doc => {
      if (doc.embedding) {
        const score = cosineSimilarity(queryEmbedding, doc.embedding);
        candidates.push({ score, content: `Note: ${doc.title}\nContent: ${doc.content || ""}` });
      }
    });
    tasks.forEach(doc => {
      if (doc.embedding) {
        const score = cosineSimilarity(queryEmbedding, doc.embedding);
        candidates.push({ score, content: `Task: ${doc.title}\nStatus: ${doc.status}\nDue: ${doc.dueDate}` });
      }
    });
    events.forEach(doc => {
      if (doc.embedding) {
        const score = cosineSimilarity(queryEmbedding, doc.embedding);
        candidates.push({ score, content: `Event: ${doc.title}\nDate: ${doc.date}\nTime: ${doc.time}` });
      }
    });

    candidates.sort((a, b) => b.score - a.score);
    const topK = candidates.slice(0, 5);
    const contextText = topK.map(c => c.content).join("\n\n");

    const systemPrompt = `
You are a conversational Retrieval-Augmented Generation (RAG) assistant powered by the LLaMA 3.1 model.
Your knowledge source is a MongoDB database accessed via vector search.

CORE OBJECTIVES
1. Convert user queries into semantic intent.
2. Use ONLY the retrieved database context provided to you.
3. Provide "abstract" yet accurate summaries.
4. Respond in a structured, clear, and conversational manner.

CONTEXT USAGE RULES
- You will receive a section called <CONTEXT>.
- You MUST NOT use any knowledge outside this context.
- If the answer is not present or insufficient in the context, respond with: "I couldn’t find this information in the database."
- Do NOT hallucinate.

RESPONSE FORMAT
- **Concise & Abstract**: Get straight to the point. Avoid unmatched verbosity.
- **Structured**: Use Markdown (bullet points, bold text) to organize information clearly.
- **No Filler**: Do not use rigid headers like "Answer:" or "Explanation:" unless necessary for complexity.
- **Conversational Tone**: Be friendly, helpful, and engaging. Acknowledge the user's input naturally.
`;

    const userMessageContent = `
<CONTEXT>
${userContext}

${contextText || "No relevant data found."}
</CONTEXT>

<USER_QUESTION>
${query}
</USER_QUESTION>
`;

    const response = await chatResponse([
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessageContent }
    ]);
    return response;

  } catch (err) {
    console.error("RAG Error:", err);
    return "I encountered an error processing your request.";
  }
}

const handleMessageOperations = (socket, io) => {
  socket.on("send_message", async (data) => {
    try {
      const allowed = await messageRateLimit(socket, data);
      if (!allowed) return;

      const { roomId, message, messageType = "text" } = data;

      if (!message || !message.trim()) {
        socket.emit("error", { message: "Message cannot be empty" });
        return;
      }

      // 1. Save/Broadcast User Message
      const userMessageData = {
        id: `msg_${Date.now()}_${socket.userId}`,
        roomId,
        userId: socket.userId,
        username: socket.name || "User",
        profileImage: socket.profileImage,
        message: message.trim(),
        messageType,
        timestamp: new Date(),
        edited: false,
      };

      io.to(roomId).emit("new_message", userMessageData);

      // 2. AI Response Logic
      // Assuming this is a 1-on-1 chat with the AI or the user expects a response.
      // We'll respond if the room is an AI chat or generally for this demo.
      // (For now, responding to ALL messages to demonstrate the feature as requested)

      // Simulate typing
      socket.broadcast.to(roomId).emit("user_typing", {
        userId: "ai-bot",
        username: "Studia AI",
        isTyping: true
      });

      let botReply = "I'm having a bit of trouble connecting to my brain right now.";

      try {
        botReply = await getRAGResponse(message.trim(), socket.userId);
      } catch (e) {
        console.error("Critical RAG failure:", e);
        botReply = "I encountered a critical error while processing your request.";
      } finally {
        socket.broadcast.to(roomId).emit("user_typing", {
          userId: "ai-bot",
          username: "Studia AI",
          isTyping: false
        });
      }

      const botMessageData = {
        id: `msg_${Date.now()}_ai`,
        roomId,
        userId: "ai-bot", // specific ID for the bot
        username: "Studia AI",
        profileImage: "https://api.dicebear.com/9.x/bottts/svg?seed=StudiaAI",
        message: botReply,
        messageType: "text",
        timestamp: new Date(),
        edited: false,
      };

      io.to(roomId).emit("new_message", botMessageData);

    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("get_messages", async (data) => {
    try {
      const { roomId, limit = 50, offset = 0 } = data;
      // Mock history for now
      const messages = [];
      socket.emit("messages_history", {
        roomId,
        messages,
        hasMore: false,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      socket.emit("error", { message: "Failed to fetch messages" });
    }
  });

  socket.on("typing_start", async (data) => {
    const allowed = await typingRateLimit(socket, data);
    if (!allowed) return;
    const { roomId } = data;
    socket.to(roomId).emit("user_typing", {
      userId: socket.userId,
      username: socket.username,
      isTyping: true,
    });
  });

  socket.on("typing_stop", async (data) => {
    const allowed = await typingRateLimit(socket, data);
    if (!allowed) return;
    const { roomId } = data;
    socket.to(roomId).emit("user_typing", {
      userId: socket.userId,
      username: socket.username,
      isTyping: false,
    });
  });
};

export async function sendWelcomeMessage(socket, roomId, io) {
  try {
    // Simulate typing
    socket.broadcast.to(roomId).emit("user_typing", {
      userId: "ai-bot",
      username: "Studia AI",
      isTyping: true
    });

    const systemPrompt = `
      You are Studia AI, a helpful and friendly study assistant.
      Your goal is to welcome the user to the chat and offer assistance.
      
      Generate a warm, short welcome message (1-2 sentences).
      Then, provide 3 specific, short suggestions of what the user can ask you about, related to:
      - Creating or summarizing notes
      - Managing tasks and deadlines
      - Scheduling events
      - General study questions

      Format the response with the welcome message first, followed by the suggestions as a bulleted list.
      Do not make up fake data, just suggest *types* of questions.
    `;

    const welcomeMsg = await chatResponse([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate a welcome message for a user who just joined the study room." }
    ]);

    // specific ID for the bot
    const botMessageData = {
      id: `msg_${Date.now()}_ai_welcome`,
      roomId,
      userId: "ai-bot",
      username: "Studia AI",
      profileImage: "https://api.dicebear.com/9.x/bottts/svg?seed=StudiaAI",
      message: welcomeMsg,
      messageType: "text",
      timestamp: new Date(),
      edited: false,
    };

    io.to(roomId).emit("new_message", botMessageData);

  } catch (error) {
    console.error("Error sending welcome message:", error);
  } finally {
    socket.broadcast.to(roomId).emit("user_typing", {
      userId: "ai-bot",
      username: "Studia AI",
      isTyping: false
    });
  }
}

export { handleMessageOperations };
