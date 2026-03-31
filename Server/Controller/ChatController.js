import Note from "../Model/NoteModel.js";
import Task from "../Model/ToDoModel.js";
import Event from "../Model/EventModel.js";
import SessionRoom from "../Model/SessionModel.js";
import { generateEmbedding, chatResponse } from "../utils/ollamaUtils.js";

// Cosine similarity helper
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

export const chat = async (req, res) => {
    try {
        const { message, history } = req.body;
        const userId = req.user?._id; // From authMiddleware

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // 1. Generate embedding for query
        // 1. Generate embedding for query
        const queryEmbedding = await generateEmbedding(message);
        if (!queryEmbedding) {
            return res.status(500).json({ error: "Failed to generate embedding for query" });
        }

        // Fetch user profile context
        let userContext = "";
        if (userId) {
            try {
                const user = await User.findById(userId).populate("friends", "FirstName LastName Username Email");

                if (user) {
                    userContext += `\nMY PROFILE:\n`;
                    userContext += `- Name: ${user.FirstName} ${user.LastName || ""}\n`;
                    userContext += `- Username: ${user.Username}\n`;
                    userContext += `- Email: ${user.Email}\n`;
                    if (user.Bio) userContext += `- Bio: ${user.Bio}\n`;
                    if (user.University) userContext += `- University: ${user.University}\n`;
                    if (user.Country) userContext += `- Country: ${user.Country}\n`;
                    if (user.FieldOfStudy) userContext += `- Field of Study: ${user.FieldOfStudy}\n`;
                    if (user.GraduationYear) userContext += `- Graduation Year: ${user.GraduationYear}\n`;

                    // Stats
                    userContext += `- Total Study Hours: ${user.totalStudyHours || 0}\n`;
                    userContext += `- Total Sessions: ${user.sessionCount || 0}\n`;
                    userContext += `- Current Streak: ${user.streaks?.current || 0} days\n`;
                    userContext += `- Max Streak: ${user.streaks?.max || 0} days\n`;
                    userContext += `- Kudos Received: ${user.kudosReceived || 0}\n`;

                    // Badges
                    if (user.badges && user.badges.length > 0) {
                        userContext += `- Badges Earned: ${user.badges.map(b => b.name).join(", ")}\n`;
                    }

                    // Friends
                    if (user.friends && user.friends.length > 0) {
                        const list = user.friends.map(f => `- ${f.FirstName} ${f.LastName || ""} (@${f.Username})`).join("\n");
                        userContext += `\nMY FRIENDS LIST:\n${list}\n`;
                    } else {
                        userContext += `\nMY FRIENDS LIST:\n(No friends found)\n`;
                    }
                }
            } catch (e) {
                console.error("Error fetching user profile for RAG:", e);
            }
        }

        // 2. Fetch all candidate documents with embeddings
        // Ideally, we'd use a vector store, but for local/demo, we fetch and compute similarity.
        // Optimizations: limit fields, maybe cache.
        // Optimizations: limit fields, maybe cache.
        const [notes, tasks, events, rooms, users, openTasks, recentNotes, recentRooms] = await Promise.all([
            Note.find({ owner: userId, embedding: { $exists: true }, status: 'active' }).select("+embedding title content"),
            Task.find({ user: userId, embedding: { $exists: true } }).select("+embedding title status dueDate"),
            Event.find({ user: userId, embedding: { $exists: true } }).select("+embedding title date time"),
            SessionRoom.find({ embedding: { $exists: true } }).select("+embedding name description cateogery"),
            User.find({ embedding: { $exists: true } }).select("+embedding FirstName LastName Bio University FieldOfStudy Country badges totalStudyHours kudosReceived"),
            // DETERMINISTIC FETCH: Get up to 5 open tasks directly
            Task.find({ user: userId, status: { $ne: 'closed' } }).limit(5).select("title status dueDate"),
            // DETERMINISTIC FETCH: Get up to 5 recent notes
            Note.find({ owner: userId, status: 'active' }).sort({ updatedAt: -1 }).limit(5).select("title content"),
            // DETERMINISTIC FETCH: Get up to 10 recent rooms
            SessionRoom.find({}).sort({ createdAt: -1 }).limit(10).select("name description cateogery"),
        ]);

        // 3. Compute similarities and rank
        // 3. Compute similarities and rank
        const candidates = [];

        // Helper to process docs
        const processDocs = (docs, type, formatter) => {
            if (!docs) return;
            docs.forEach(doc => {
                if (doc.embedding) {
                    const score = cosineSimilarity(queryEmbedding, doc.embedding);
                    candidates.push({ score, content: formatter(doc), type });
                }
            });
        };

        processDocs(notes, 'Note', doc => `Note: ${doc.title}\nContent: ${doc.content || ""}`);
        processDocs(tasks, 'Task', doc => `Task: ${doc.title}\nStatus: ${doc.status}\nDue: ${doc.dueDate}`);
        processDocs(events, 'Event', doc => `Event: ${doc.title}\nDate: ${doc.date}\nTime: ${doc.time}`);
        processDocs(rooms, 'Room', doc => `Study Room: ${doc.name}\nDescription: ${doc.description || ""}\nCategory: ${doc.cateogery}`);

        users.forEach(doc => {
            if (doc.embedding) {
                const score = cosineSimilarity(queryEmbedding, doc.embedding);
                const badges = doc.badges ? doc.badges.map(b => b.name).join(", ") : "";
                candidates.push({
                    score,
                    content: `User Profile: ${doc.FirstName} ${doc.LastName || ""}
                              Bio: ${doc.Bio || ""}
                              University: ${doc.University || ""}
                              Field of Study: ${doc.FieldOfStudy || ""}
                              Badges: ${badges}
                              Stats: ${doc.totalStudyHours || 0} hrs, ${doc.kudosReceived || 0} kudos`,
                    type: 'User'
                });
            }
        });



        // Sort by score descending and take top K
        candidates.sort((a, b) => b.score - a.score);
        const topK = candidates.slice(0, 5); // Increased to 5

        // 4. Construct Context
        let contextText = topK.map(c => c.content).join("\n\n");

        // Append Deterministic Open Tasks
        if (openTasks.length > 0) {
            const taskList = openTasks.map(t => `- ${t.title} (Due: ${t.dueDate ? t.dueDate.toDateString() : 'No date'})`).join("\n");
            contextText += `\n\n### BACKGROUND INFO - MY ACTIVE TASKS:\n${taskList}`;
        }

        // Append Deterministic Recent Notes
        if (recentNotes && recentNotes.length > 0) {
            const noteList = recentNotes.map(n => `- Title: ${n.title}\n  Content: ${n.content.substring(0, 100)}${n.content.length > 100 ? '...' : ''}`).join("\n");
            contextText += `\n\n### BACKGROUND INFO - MY RECENT NOTES:\n${noteList}`;
        }

        // Append Deterministic Recent Rooms
        if (recentRooms && recentRooms.length > 0) {
            const roomList = recentRooms.map(r => `- Name: ${r.name} (Category: ${r.cateogery})\n  Description: ${r.description}`).join("\n");
            contextText += `\n\n### BACKGROUND INFO - AVAILABLE ROOMS:\n${roomList}`;
        }

        console.log(`Top context scores: ${topK.map(c => c.score.toFixed(4)).join(", ")}`);

        // Badge Information Context
        const badgeInfo = `
### **Available Badges & Criteria**
*   **Rookie**: Complete your full profile (Bio, University, etc.).
*   **Kickstarter**: Complete your first task/goal.
*   **Consistency Starter**: Maintain a 7-day study streak.
*   **Focus Enthusiast**: Complete 10 focus sessions.
*   **Top 1/2/3**: Reach rank 1, 2, or 3 on the leaderboard.
`;

        // 5. Build Messages for LLM
        const systemPrompt = `
You are Studia AI, a helpful and knowledgeable learning assistant.

CORE RULES:
1. **Source-Based**: Answer ONLY using the provided <CONTEXT> (including Badge Rules). If the answer is missing, say "I don't have that information."
2. **Format**: Use **natural paragraphs** for summaries. Use bullet points for lists.
3. **No Fluff**: Start directly with the answer.
4. **Tone**: Professional yet conversational.
5. **Unknowns**: If asked about "Platinum" or other unknown badges, clarify that only the listed badges (Rookie, Kickstarter, etc.) are currently available.
6. **Conciseness**: Keep answers **brief** (1-2 sentences) for simple questions. Do not over-explain.
7. **Relevance**: The <CONTEXT> may contain "Active Tasks" or "Badges". IGNORE them if they are not relevant to the user's question. (e.g., if asked about "Notes", do NOT list "Tasks").
8. **Greeting**: If the user says "hello" or "hi", respond ONLY with: "Hello there! I am Studia AI assistant, how can I help you?"

Example Response (Profile):
You are **Rithivkesh Manne**, a student at GRIET. You have studied for **33.95 hours** and hold the "Rookie" badge.
`;

        const userMessageContent = `
<CONTEXT>
${userContext}

${contextText || "No relevant data found."}

${badgeInfo}
</CONTEXT>

<USER_QUESTION>
${message}
</USER_QUESTION>
`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...(history || []).map(h => ({ role: h.role, content: h.content || h.text || "" })),
            { role: "user", content: userMessageContent }
        ];

        // 6. Get Response
        // 6. Get Response
        const reply = await chatResponse(messages);

        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
