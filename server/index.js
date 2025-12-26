const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
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

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: true
    }
});

app.post('/api/feedback', async (req, res) => {
    const { name, content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const userName = name || 'Anonimo';
    const emailSubject = `feedback cb-tierlist, ${userName}`;

    try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            console.log(`Attempting to send email from ${userName}...`);
            console.log(`Using EMAIL_USER: ${process.env.EMAIL_USER ? 'SET' : 'NOT SET'}`);
            console.log(`Using EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET'}`);

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: 'zombyjab@gmail.com',
                subject: emailSubject,
                text: content
            });
            console.log(`✓ Email sent successfully from ${userName}`);
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
        console.error('Error code:', error.code);
        console.error('Error response:', error.response);
        console.error('Full error:', error);
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
