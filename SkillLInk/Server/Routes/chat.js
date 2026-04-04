import express from 'express';
import { protect } from '../middleWear/auth.js';
import {
    getBookingParticipant,
    getBookingMessages,
    getDirectConversations,
    getDirectMessages,
    getDirectPeer,
} from '../Services/chat.js';

const Router = express.Router();

Router.get('/bookings/:bookingId/messages', protect, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { limit } = req.query;
        const userId = req.user.id;

        const booking = await getBookingParticipant(bookingId, userId);
        if (!booking) {
            return res.status(403).json({ message: 'Not authorized to access this booking chat' });
        }

        const messages = await getBookingMessages(bookingId, limit);

        res.json({
            booking: {
                id: booking.id,
                customerId: booking.customer_id,
                providerId: booking.provider_id,
                customerName: booking.customer_name,
                providerName: booking.provider_name,
            },
            messages,
        });
    } catch (error) {
        console.error('Get booking chat messages error:', error);
        res.status(500).json({ message: 'Server error getting chat messages' });
    }
});

Router.get('/direct/conversations', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await getDirectConversations(userId);
        res.json({ conversations });
    } catch (error) {
        console.error('Get direct conversations error:', error);
        res.status(500).json({ message: 'Server error getting conversations' });
    }
});

Router.get('/direct/:peerId/messages', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { peerId } = req.params;
        const { limit } = req.query;

        const peer = await getDirectPeer(userId, peerId);
        if (!peer) {
            return res.status(403).json({ message: 'Direct chat is only allowed between customer and provider' });
        }

        const messages = await getDirectMessages(userId, peerId, limit);

        res.json({
            peer: {
                id: peer.id,
                name: peer.full_name,
                role: peer.role,
            },
            messages,
        });
    } catch (error) {
        console.error('Get direct messages error:', error);
        if (error?.code === '42P01') {
            return res.status(500).json({
                message: 'Chat tables are missing. Please restart backend to auto-create schema.',
            });
        }
        res.status(500).json({ message: 'Server error getting direct messages' });
    }
});

export default Router;
