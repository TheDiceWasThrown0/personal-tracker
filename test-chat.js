const fetch = require('node-fetch');

async function testChat() {
    const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [{ role: 'user', content: 'What is my current daily routine?' }]
        })
    });
    
    if (!res.ok) {
        console.error('Error:', res.status, await res.text());
        return;
    }

    const reader = res.body;
    reader.on('data', chunk => {
        process.stdout.write(chunk.toString());
    });
}
testChat();
