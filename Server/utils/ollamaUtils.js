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
