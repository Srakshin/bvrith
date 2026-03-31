import { generateEmbedding } from '../utils/ollamaUtils.js';

async function testRAG() {
    console.log("Testing Project Embedding Generation...");
    try {
        const vector = await generateEmbedding("This is a test note about biology.");
        if (vector && vector.length > 0) {
            console.log("SUCCESS: Embedding generated. Length:", vector.length);
        } else {
            console.error("FAILURE: Embedding returned null or empty.");
        }
    } catch (error) {
        console.error("ERROR:", error);
    }
}

testRAG();
