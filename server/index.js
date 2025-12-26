const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Resend } = require('resend');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Resend setup
const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/feedback', async (req, res) => {
    const { name, content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const userName = name || 'Anonimo';
    const emailSubject = `feedback cb-tierlist, ${userName}`;

    try {
        if (process.env.RESEND_API_KEY) {
            console.log(`Attempting to send email from ${userName}...`);
            console.log(`Using RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'SET' : 'NOT SET'}`);

            const { data, error } = await resend.emails.send({
                from: 'CB Tierlist <onboarding@resend.dev>',
                to: ['zombyjab@gmail.com'],
                subject: emailSubject,
                text: `Feedback from: ${userName}\n\n${content}`,
            });

            if (error) {
                throw error;
            }

            console.log(`✓ Email sent successfully from ${userName}. ID: ${data.id}`);
        } else {
            console.log('--- MOCK EMAIL SEND ---');
            console.log(`To: zombyjab@gmail.com`);
            console.log(`Subject: ${emailSubject}`);
            console.log(`Body: ${content}`);
            console.log('-----------------------');
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('✗ ERROR sending email:');
        console.error('Error message:', error.message);
        console.error('Error details:', error);
        res.status(500).json({ error: 'Failed to send feedback' });
    }
});

let connectedUsers = 0;

io.on('connection', (socket) => {
    connectedUsers++;
    io.emit('userCount', connectedUsers);
    console.log(`User connected. Total: ${connectedUsers}`);

    socket.on('disconnect', () => {
        connectedUsers--;
        io.emit('userCount', connectedUsers);
        console.log(`User disconnected. Total: ${connectedUsers}`);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
