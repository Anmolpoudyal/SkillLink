import jwt from 'jsonwebtoken';
import pool from '../Services/db.js';
import {
    bookingRoom,
    createBookingMessage,
    createDirectMessage,
    directRoom,
    getBookingParticipant,
    getDirectPeer,
} from '../Services/chat.js';

const getCookieValue = (cookieHeader, name) => {
    if (!cookieHeader) return null;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : null;
};

const authenticateSocket = async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie || '';
        const token = getCookieValue(cookieHeader, 'token');

        if (!token) {
            return next(new Error('Not authorized, no token'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userResult = await pool.query(
            'SELECT id, full_name, role, is_active FROM users WHERE id = $1',
            [decoded.id]
        );

        if (userResult.rows.length === 0) {
            return next(new Error('Not authorized, user not found'));
        }

        const user = userResult.rows[0];
        if (!user.is_active) {
            return next(new Error('Your account has been suspended'));
        }

        socket.user = {
            id: user.id,
            name: user.full_name,
            role: user.role,
        };

        return next();
    } catch (error) {
        console.error('Socket auth error:', error);
        return next(new Error('Not authorized'));
    }
};

export const initChatSocket = (io) => {
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        socket.on('chat:join', async ({ bookingId }) => {
            try {
                if (!bookingId) {
                    socket.emit('chat:error', { message: 'Booking id is required' });
                    return;
                }

                const booking = await getBookingParticipant(bookingId, socket.user.id);
                if (!booking) {
                    socket.emit('chat:error', { message: 'Not authorized to join this chat' });
                    return;
                }

                const room = bookingRoom(bookingId);
                socket.join(room);
                socket.emit('chat:joined', { bookingId });
            } catch (error) {
                console.error('chat:join error:', error);
                socket.emit('chat:error', { message: 'Failed to join chat room' });
            }
        });

        socket.on('chat:leave', ({ bookingId }) => {
            if (!bookingId) return;
            socket.leave(bookingRoom(bookingId));
        });

        socket.on('chat:send', async ({ bookingId, message }) => {
            try {
                const trimmed = String(message || '').trim();
                if (!bookingId || !trimmed) {
                    socket.emit('chat:error', { message: 'Message cannot be empty' });
                    return;
                }
                if (trimmed.length > 2000) {
                    socket.emit('chat:error', { message: 'Message is too long' });
                    return;
                }

                const booking = await getBookingParticipant(bookingId, socket.user.id);
                if (!booking) {
                    socket.emit('chat:error', { message: 'Not authorized to send message' });
                    return;
                }

                const saved = await createBookingMessage({
                    bookingId,
                    senderId: socket.user.id,
                    message: trimmed,
                });

                const payload = {
                    ...saved,
                    senderName: socket.user.name,
                    senderRole: socket.user.role,
                };

                io.to(bookingRoom(bookingId)).emit('chat:message', payload);
            } catch (error) {
                console.error('chat:send error:', error);
                socket.emit('chat:error', { message: 'Failed to send message' });
            }
        });

        socket.on('chat:join_direct', async ({ peerId }) => {
            try {
                if (!peerId) {
                    socket.emit('chat:error', { message: 'Peer id is required' });
                    return;
                }

                const peer = await getDirectPeer(socket.user.id, peerId);
                if (!peer) {
                    socket.emit('chat:error', { message: 'Direct chat is only allowed between customer and provider' });
                    return;
                }

                const room = directRoom(socket.user.id, peerId);
                socket.join(room);
                socket.emit('chat:joined_direct', { peerId });
            } catch (error) {
                console.error('chat:join_direct error:', error);
                socket.emit('chat:error', { message: 'Failed to join direct chat room' });
            }
        });

        socket.on('chat:leave_direct', ({ peerId }) => {
            if (!peerId) return;
            socket.leave(directRoom(socket.user.id, peerId));
        });

        socket.on('chat:send_direct', async ({ peerId, message }) => {
            try {
                const trimmed = String(message || '').trim();
                if (!peerId || !trimmed) {
                    socket.emit('chat:error', { message: 'Message cannot be empty' });
                    return;
                }
                if (trimmed.length > 2000) {
                    socket.emit('chat:error', { message: 'Message is too long' });
                    return;
                }

                const peer = await getDirectPeer(socket.user.id, peerId);
                if (!peer) {
                    socket.emit('chat:error', { message: 'Direct chat is only allowed between customer and provider' });
                    return;
                }

                const saved = await createDirectMessage({
                    senderId: socket.user.id,
                    receiverId: peerId,
                    message: trimmed,
                });

                const payload = {
                    ...saved,
                    senderName: socket.user.name,
                    senderRole: socket.user.role,
                };

                io.to(directRoom(socket.user.id, peerId)).emit('chat:direct_message', payload);
            } catch (error) {
                console.error('chat:send_direct error:', error);
                socket.emit('chat:error', { message: 'Failed to send direct message' });
            }
        });
    });
};
