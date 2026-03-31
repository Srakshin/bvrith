import ollama from 'ollama';

async function testOllama() {
    console.log("Testing Ollama Connection...");

    try {
        // Test 1: List models
        console.log("\n1. Listing Models...");
        const list = await ollama.list();
        console.log("Available models:", list.models.map(m => m.name).join(", "));

        // Check for required models
        const hasLlama3 = list.models.some(m => m.name.includes('llama3.1'));
        const hasNomic = list.models.some(m => m.name.includes('nomic-embed-text'));

        console.log(`- llama3.1 present: ${hasLlama3}`);
        console.log(`- nomic-embed-text present: ${hasNomic}`);

        if (!hasLlama3) console.warn("WARNING: llama3.1 model missing! Run 'ollama pull llama3.1'");
        if (!hasNomic) console.warn("WARNING: nomic-embed-text model missing! Run 'ollama pull nomic-embed-text'");

        // Test 2: Chat Completion
        if (hasLlama3) {
            console.log("\n2. Testing Chat (llama3.1)...");
            const response = await ollama.chat({
                model: 'llama3.1',
                messages: [{ role: 'user', content: 'Say "Hello, World!"' }],
            });
            console.log("Response:", response.message.content);
        }

        // Test 3: Embeddings
        if (hasNomic) {
            console.log("\n3. Testing Embeddings (nomic-embed-text)...");
            const embed = await ollama.embeddings({
                model: 'nomic-embed-text',
                prompt: 'Hello world',
            });
            console.log("Embedding generated successfully. Length:", embed.embedding.length);
        }

    } catch (error) {
        console.error("Ollama Test Failed:", error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error("Is Ollama running? Try running 'ollama serve' in a separate terminal.");
        }
    }
}

testOllama();
