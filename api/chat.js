// api/chat.js
// Serverless function for Vercel - Virevo Chatbot Backend
// This handles all chat requests and integrates with Claude API

const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
        if (!ANTHROPIC_API_KEY) {
            console.error('ANTHROPIC_API_KEY is not set');
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Load all knowledge base files
        const knowledgeBase = await loadKnowledgeBase();

        // Build system prompt with knowledge base
        const systemPrompt = `You are Tojo, the intelligent and friendly mascot of Virevo.

${knowledgeBase}

CRITICAL RESPONSE RULES:
- Keep all sentences within 10 words maximum
- Be concise and clear
- After every response, invite the visitor to continue
- Always guide toward a next step
- Never overwhelm with information

Remember: You represent Virevo's professionalism and expertise. Be helpful, warm, and consultative.`;

        // Build messages array
        const messages = [];
        
        if (history && history.length > 0) {
            messages.push(...history);
        }
        
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.content !== message) {
            messages.push({
                role: 'user',
                content: message
            });
        }

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                system: systemPrompt,
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Claude API Error:', errorData);
            return res.status(response.status).json({ 
                error: 'Failed to get response from Claude',
                details: errorData 
            });
        }

        const data = await response.json();
        const assistantMessage = data.content[0].text;

        res.status(200).json({
            message: assistantMessage,
            conversationId: data.id
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}

// Function to load all knowledge base files
async function loadKnowledgeBase() {
    try {
        // In Vercel, we need to use __dirname to find files
        const knowledgeDir = path.join(process.cwd(), 'knowledge');
        
        // Knowledge base files in order
        const knowledgeFiles = [
            '01-bot-personality.md',
            '02-virevo-overview.md',
            '03-healthworks.md',
            '04-guestworks.md',
            '05-bismara.md',
            '06-founder-mascot.md',
            '07-booking-flow.md'
        ];

        let knowledgeBase = '';

        for (const file of knowledgeFiles) {
            try {
                const filePath = path.join(knowledgeDir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                knowledgeBase += `\n\n${content}\n\n`;
            } catch (fileError) {
                console.warn(`Could not load ${file}:`, fileError.message);
                // Continue with other files
            }
        }

        if (!knowledgeBase) {
            console.error('No knowledge base files loaded');
            // Return a minimal knowledge base as fallback
            return `You are Tojo, Virevo's intelligent assistant. Help visitors understand Virevo's services across healthcare (HealthWorks), hospitality (Guest.Works), and agriculture (Bismara Reserve Farms). Guide them to book a call at https://calendly.com/avishek-virevo/30min`;
        }

        return knowledgeBase;

    } catch (error) {
        console.error('Error loading knowledge base:', error);
        // Return fallback
        return `You are Tojo, Virevo's intelligent assistant. Help visitors understand Virevo's services. Guide them to book a call at https://calendly.com/avishek-virevo/30min`;
    }
}

