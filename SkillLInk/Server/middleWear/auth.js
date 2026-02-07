import jwt from 'jsonwebtoken';
import pool from '../Services/db.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(401).json({message: 'Not authorized, no token'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await pool.query('SELECT id, full_name, email, role, is_active FROM users WHERE id = $1', [decoded.id]);
        if(user.rows.length === 0) {
            return res.status(401).json({message: 'Not authorized, user not found'});
        }
        
        // Check if user is active
        if(user.rows[0].is_active === false) {
            return res.status(403).json({message: 'Account suspended. Please contact support.'});
        }
        
        req.user = user.rows[0];
        next();

    } catch (error) {
        console.error('Auth middleware error', error);
        res.status(401).json({message: 'Not authorized, token failed'});
    }
};

// Admin only middleware
export const adminOnly = async (req, res, next) => {
    try {
        if(!req.user) {
            console.log('Admin check failed: No user in request');
            return res.status(401).json({message: 'Not authorized'});
        }
        
        console.log('Admin check - User role:', req.user.role, '| User email:', req.user.email);
        
        if(req.user.role !== 'admin') {
            console.log('Admin check failed: User role is', req.user.role, 'not admin');
            return res.status(403).json({message: 'Access denied. Admin only.'});
        }
        
        next();
    } catch (error) {
        console.error('Admin middleware error', error);
        res.status(403).json({message: 'Access denied'});
    }
};

