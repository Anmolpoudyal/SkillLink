import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './Routes/auth.js';
import adminRoutes from './Routes/admin.js';
import paymentRoutes from './Routes/payment.js';
import notificationRoutes from './Routes/notifications.js';
import chatRoutes from './Routes/chat.js';
import { initChatSocket } from './socket/chatSocket.js';
import { ensureChatSchema } from './Services/chat.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Allow multiple frontend ports during development
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Import Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    },
});

initChatSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await ensureChatSchema();
        console.log('Chat schema ready');
    } catch (error) {
        console.error('Failed to ensure chat schema:', error);
    }

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();



