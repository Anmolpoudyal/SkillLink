import express from 'express';
import pool from '../Services/db.js';
import { protect } from '../middleWear/auth.js';

const Router = express.Router();

// Helper: create a notification
export const createNotification = async (userId, type, title, message, relatedId = null) => {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, related_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, type, title, message, relatedId]
        );
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Get notifications for the logged-in user
Router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { unread_only } = req.query;

        let query = `SELECT * FROM notifications WHERE user_id = $1`;
        const params = [userId];

        if (unread_only === 'true') {
            query += ` AND is_read = FALSE`;
        }

        query += ` ORDER BY created_at DESC LIMIT 50`;

        const result = await pool.query(query, params);

        // Also get unread count
        const countResult = await pool.query(
            `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );

        res.json({
            notifications: result.rows,
            unreadCount: parseInt(countResult.rows[0].unread_count)
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error getting notifications' });
    }
});

// Get unread count only
Router.get('/unread-count', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        res.json({ unreadCount: parseInt(result.rows[0].unread_count) });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark a single notification as read
Router.patch('/:id/read', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification: result.rows[0] });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark all notifications as read
Router.patch('/read-all', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a notification
Router.delete('/:id', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default Router;
