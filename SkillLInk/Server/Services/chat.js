import pool from './db.js';

export const bookingRoom = (bookingId) => `booking:${bookingId}`;
export const directRoom = (userA, userB) => {
    const [first, second] = [String(userA), String(userB)].sort();
    return `direct:${first}:${second}`;
};

export const ensureChatSchema = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS booking_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
            sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS direct_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            CHECK (sender_id <> receiver_id)
        )
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_booking_messages_booking
        ON booking_messages(booking_id, created_at)
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_receiver
        ON direct_messages(sender_id, receiver_id, created_at)
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_sender
        ON direct_messages(receiver_id, sender_id, created_at)
    `);
};

export const getBookingParticipant = async (bookingId, userId) => {
    const result = await pool.query(
        `SELECT 
            b.id,
            b.customer_id,
            b.provider_id,
            cu.full_name AS customer_name,
            pu.full_name AS provider_name
         FROM bookings b
         JOIN users cu ON cu.id = b.customer_id
         JOIN users pu ON pu.id = b.provider_id
         WHERE b.id = $1
           AND (b.customer_id = $2 OR b.provider_id = $2)`,
        [bookingId, userId]
    );

    return result.rows[0] || null;
};

export const getBookingMessages = async (bookingId, limit = 100) => {
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);

    const result = await pool.query(
        `SELECT
            bm.id,
            bm.booking_id,
            bm.sender_id,
            u.full_name AS sender_name,
            u.role AS sender_role,
            bm.message,
            bm.created_at
         FROM booking_messages bm
         JOIN users u ON u.id = bm.sender_id
         WHERE bm.booking_id = $1
         ORDER BY bm.created_at ASC
         LIMIT $2`,
        [bookingId, safeLimit]
    );

    return result.rows.map((row) => ({
        id: row.id,
        bookingId: row.booking_id,
        senderId: row.sender_id,
        senderName: row.sender_name,
        senderRole: row.sender_role,
        message: row.message,
        createdAt: row.created_at,
    }));
};

export const createBookingMessage = async ({ bookingId, senderId, message }) => {
    const result = await pool.query(
        `INSERT INTO booking_messages (booking_id, sender_id, message)
         VALUES ($1, $2, $3)
         RETURNING id, booking_id, sender_id, message, created_at`,
        [bookingId, senderId, message]
    );

    const row = result.rows[0];
    return {
        id: row.id,
        bookingId: row.booking_id,
        senderId: row.sender_id,
        message: row.message,
        createdAt: row.created_at,
    };
};

export const getDirectPeer = async (userId, peerId) => {
    if (!peerId || String(userId) === String(peerId)) return null;

    const result = await pool.query(
        `SELECT id, full_name, role, is_active
         FROM users
         WHERE id IN ($1, $2)`,
        [userId, peerId]
    );

    if (result.rows.length !== 2) return null;
    const me = result.rows.find((u) => String(u.id) === String(userId));
    const peer = result.rows.find((u) => String(u.id) === String(peerId));
    if (!me || !peer || !peer.is_active) return null;

    const validPair =
        (me.role === 'customer' && peer.role === 'service_provider') ||
        (me.role === 'service_provider' && peer.role === 'customer');

    if (!validPair) return null;
    return peer;
};

export const getDirectMessages = async (userId, peerId, limit = 100) => {
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);

    const result = await pool.query(
        `SELECT
            dm.id,
            dm.sender_id,
            dm.receiver_id,
            su.full_name AS sender_name,
            su.role AS sender_role,
            dm.message,
            dm.created_at
         FROM direct_messages dm
         JOIN users su ON su.id = dm.sender_id
         WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
            OR (dm.sender_id = $2 AND dm.receiver_id = $1)
         ORDER BY dm.created_at ASC
         LIMIT $3`,
        [userId, peerId, safeLimit]
    );

    return result.rows.map((row) => ({
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        senderName: row.sender_name,
        senderRole: row.sender_role,
        message: row.message,
        createdAt: row.created_at,
    }));
};

export const createDirectMessage = async ({ senderId, receiverId, message }) => {
    const result = await pool.query(
        `INSERT INTO direct_messages (sender_id, receiver_id, message)
         VALUES ($1, $2, $3)
         RETURNING id, sender_id, receiver_id, message, created_at`,
        [senderId, receiverId, message]
    );

    const row = result.rows[0];
    return {
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        message: row.message,
        createdAt: row.created_at,
    };
};

export const getDirectConversations = async (userId) => {
    const result = await pool.query(
        `WITH convo AS (
            SELECT
                dm.id,
                dm.message,
                dm.created_at,
                CASE
                    WHEN dm.sender_id = $1 THEN dm.receiver_id
                    ELSE dm.sender_id
                END AS peer_id,
                ROW_NUMBER() OVER (
                    PARTITION BY
                        CASE WHEN dm.sender_id = $1 THEN dm.receiver_id ELSE dm.sender_id END
                    ORDER BY dm.created_at DESC
                ) AS rn
            FROM direct_messages dm
            WHERE dm.sender_id = $1 OR dm.receiver_id = $1
        )
        SELECT
            c.peer_id,
            u.full_name AS peer_name,
            u.role AS peer_role,
            c.id AS last_message_id,
            c.message AS last_message,
            c.created_at AS last_message_at
        FROM convo c
        JOIN users u ON u.id = c.peer_id
        WHERE c.rn = 1
        ORDER BY c.created_at DESC`,
        [userId]
    );

    return result.rows.map((row) => ({
        peerId: row.peer_id,
        peerName: row.peer_name,
        peerRole: row.peer_role,
        lastMessageId: row.last_message_id,
        lastMessage: row.last_message,
        lastMessageAt: row.last_message_at,
    }));
};
