// Simple script to test the chat API
// Requires the server to be running on localhost:3000

async function testChat() {
    console.log("Sending test message to /api/chat...");
    try {
        const response = await fetch("http://127.0.0.1:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Summarize my notes",
                history: []
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("\nResponse from Chatbot:");
        console.log("---------------------------------------------------");
        console.log(data.reply);
        console.log("---------------------------------------------------");

    } catch (error) {
        console.error("Test Failed:", error.message);
        console.log("Ensure the server is running with 'npm run dev'");
    }
}

testChat();
