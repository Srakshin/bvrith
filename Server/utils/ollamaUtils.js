import ollama from 'ollama';

/**
 * Generates an embedding for the given text using Ollama.
 * Uses 'nomic-embed-text' model by default.
 * @param {string} text - The text to generate an embedding for.
 * @returns {Promise<number[]|null>} - The embedding vector or null if failed.
 */
export async function generateEmbedding(text) {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
        console.error("Invalid text for embedding");
        return null;
    }

    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Embedding request timed out")), 30000); // 30s timeout
        });

        const embedPromise = ollama.embeddings({
            model: 'nomic-embed-text',
            prompt: text.trim(),
        });

        const response = await Promise.race([embedPromise, timeoutPromise]);
        return response.embedding;
    } catch (error) {
        console.error("Error generating embedding with Ollama:", error.message);
        return null;
    }
}

/**
 * Chat with the LLM.
 * @param {Array} messages - Array of message objects [{ role: 'user', content: '...' }]
 * @returns {Promise<string>} - The assistant's response content.
 */
export async function chatResponse(messages) {
    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Ollama request timed out after 300 seconds")), 300000); // 5 min timeout
        });

        const chatPromise = ollama.chat({
            model: 'llama3.1', // As requested by user
            messages: messages,
        });

        const response = await Promise.race([chatPromise, timeoutPromise]);
        return response.message.content;
    } catch (error) {
        console.error("Error calling Ollama chat:", error.message);
        // Fallback or rethrow
        if (error.message.includes("timed out")) {
            return "I'm sorry, I'm waiting too long for a response. Please try asking a shorter question.";
        }
        throw error;
    }
}
