// api/send-transcript.js
// Sends chat transcript via SendGrid when user provides contact info

const sgMail = require('@sendgrid/mail');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, transcript, userMessage } = req.body;

        if (!email || !transcript) {
    return res.status(400).json({ error: 'Email and transcript are required' });
}

if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
}

        // Initialize SendGrid
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
        const VIREVO_EMAIL = process.env.VIREVO_EMAIL || 'hello@virevo.works';
        const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@virevo.works';

        if (!SENDGRID_API_KEY) {
            console.error('SendGrid API key not configured');
            return res.status(500).json({ error: 'Email service not configured' });
        }

        sgMail.setApiKey(SENDGRID_API_KEY);

        // Format transcript for email
        const formattedTranscript = transcript
            .map(msg => {
                const sender = msg.role === 'user' ? name || 'Visitor' : 'Tojo';
                return `${sender}: ${msg.content}`;
            })
            .join('\n\n');

        const timestamp = new Date().toLocaleString('en-US', { 
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'short'
        });

        // Email to Virevo (lead notification)
        const emailToVirevo = {
            to: VIREVO_EMAIL,
            from: FROM_EMAIL,
            subject: `🔔 New Lead: ${name || 'Visitor'} - ${email}`,
            text: `
New Lead from Virevo Chatbot
━━━━━━━━━━━━━━━━━━━━━━━━━━

Contact Information:
- Name: ${name || 'Not provided'}
- Email: ${email}
- Phone: ${phone}
- Date: ${timestamp}

Last Message:
${userMessage || 'N/A'}

Full Chat Transcript:
━━━━━━━━━━━━━━━━━━━━━━━━━━

${formattedTranscript}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent from Virevo Chatbot
            `.trim(),
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1c4b33, #0f2b1c); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f9f9f9; border-left: 4px solid #b48835; padding: 15px; margin: 20px 0; }
        .info-item { margin: 10px 0; }
        .label { font-weight: 600; color: #1c4b33; }
        .transcript { background: #f4f4f4; border-radius: 4px; padding: 20px; margin: 20px 0; }
        .message { margin: 15px 0; padding: 10px; border-radius: 4px; }
        .user-message { background: #b48835; color: white; margin-left: 20px; }
        .bot-message { background: #e5e5e5; color: #333; margin-right: 20px; }
        .footer { background: #1c4b33; color: white; padding: 20px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Lead from Chatbot</h1>
        </div>
        <div class="content">
            <div class="info-box">
                <div class="info-item"><span class="label">Name:</span> ${name || 'Not provided'}</div>
                <div class="info-item"><span class="label">Email:</span> ${email}</div>
                <div class="info-item"><span class="label">Phone:</span> ${phone || 'Not provided'}</div>
                <div class="info-item"><span class="label">Date:</span> ${timestamp}</div>
            </div>
            
            ${userMessage ? `
            <h3>Last Message:</h3>
            <div class="info-box">
                ${userMessage}
            </div>
            ` : ''}
            
            <h3>Chat Transcript:</h3>
            <div class="transcript">
                ${transcript.map(msg => `
                    <div class="message ${msg.role === 'user' ? 'user-message' : 'bot-message'}">
                        <strong>${msg.role === 'user' ? (name || 'Visitor') : 'Tojo'}:</strong><br>
                        ${msg.content}
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="footer">
            Sent from Virevo Chatbot • virevo.works
        </div>
    </div>
</body>
</html>
            `.trim()
        };

        // Email to user (confirmation)
        const emailToUser = {
            to: email,
            from: FROM_EMAIL,
            replyTo: VIREVO_EMAIL,
            subject: `Thank you for chatting with Virevo!`,
            text: `
Hi ${name || 'there'}!

Thank you for reaching out to Virevo through our chatbot, Tojo. We've received your message and will get back to you shortly.

Here's a copy of your conversation:

${formattedTranscript}

If you have any urgent questions, feel free to reply to this email or call us directly.

Best regards,
The Virevo Team
hello@virevo.works
            `.trim(),
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1c4b33, #0f2b1c); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; line-height: 1.6; color: #333; }
        .transcript { background: #f4f4f4; border-radius: 4px; padding: 20px; margin: 20px 0; }
        .message { margin: 15px 0; padding: 10px; border-radius: 4px; }
        .user-message { background: #b48835; color: white; margin-left: 20px; }
        .bot-message { background: #e5e5e5; color: #333; margin-right: 20px; }
        .footer { background: #1c4b33; color: white; padding: 20px; text-align: center; }
        .cta { background: #b48835; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank you for contacting Virevo!</h1>
        </div>
        <div class="content">
            <p>Hi ${name || 'there'}!</p>
            <p>Thank you for reaching out to Virevo through Tojo, our chatbot assistant. We've received your message and will get back to you shortly.</p>
            
            <h3>Your Conversation:</h3>
            <div class="transcript">
                ${transcript.map(msg => `
                    <div class="message ${msg.role === 'user' ? 'user-message' : 'bot-message'}">
                        <strong>${msg.role === 'user' ? 'You' : 'Tojo'}:</strong><br>
                        ${msg.content}
                    </div>
                `).join('')}
            </div>
            
            <p>In the meantime, feel free to explore our services:</p>
            <a href="https://virevo.works" class="cta">Visit Our Website</a>
            
            <p>If you have any urgent questions, simply reply to this email.</p>
            
            <p>Best regards,<br>
            <strong>The Virevo Team</strong><br>
            hello@virevo.works</p>
        </div>
        <div class="footer">
            Virevo • Healthcare • Hospitality • Agriculture
        </div>
    </div>
</body>
</html>
            `.trim()
        };

        // Send both emails
        await Promise.all([
            sgMail.send(emailToVirevo),
            sgMail.send(emailToUser)
        ]);

        console.log('Emails sent successfully to:', email, 'and', VIREVO_EMAIL);

        res.status(200).json({ 
            success: true,
            message: 'Transcript sent successfully'
        });

    } catch (error) {
        console.error('SendGrid Error:', error);
        res.status(500).json({ 
            error: 'Failed to send email',
            message: error.message 
        });
    }
}
