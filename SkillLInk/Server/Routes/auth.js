import express from 'express';
import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import  pool  from '../Services/db.js';
import { protect } from '../middleWear/auth.js';

const Router = express.Router();
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// function to generate JWT token 
const generateToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '1d'});
};

//Register customer
Router.post('/CustomerSignup', async (req, res) => {
    try {
        const {fullName, email, phone, password} = req.body;

        if(!fullName || !email || !phone || !password) {
            return res.status(400).json({message: 'All fields are required'});
        }

        const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if(emailExists.rows.length > 0) {
            return res.status(409).json({message: 'Email already exists'});
        }

        const phoneExists = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

        if(phoneExists.rows.length > 0) {
            return res.status(409).json({message: 'Phone number already exists'});
        }

        const hashedPassword = await bycrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role',
            [fullName, email, phone, hashedPassword, 'customer']
        );
        const token = generateToken(newUser.rows[0].id);
        res.cookie('token', token, cookieOptions);
        return res.status(201).json({message: 'User registered successfully', user: newUser.rows[0]});
    } catch (error) {
        console.error('Customer signup error:', error);
        return res.status(500).json({message: 'Server error during registration'});
    }
});

//Register service provider
Router.post('/ProviderSignup', async (req, res) => {
    try {
        const {
            fullName, 
            email, 
            phone, 
            password, 
            serviceCategory, 
            locations, 
            hourlyRate, 
            experience, 
            bio,
            certificate
        } = req.body;

        if(!fullName || !email || !phone || !password || !serviceCategory || !locations || locations.length === 0) {
            return res.status(400).json({message: 'All required fields must be filled'});
        }

        const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if(emailExists.rows.length > 0) {
            return res.status(409).json({message: 'Email already exists'});
        }

        const phoneExists = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

        if(phoneExists.rows.length > 0) {
            return res.status(409).json({message: 'Phone number already exists'});
        }

        const hashedPassword = await bycrypt.hash(password, 10);
        
        // Create user
        const newUser = await pool.query(
            'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, email, role',
            [fullName, email, phone, hashedPassword, 'service_provider']
        );

        const userId = newUser.rows[0].id;

        // Get or create service category
        let categoryResult = await pool.query('SELECT id FROM service_categories WHERE name = $1', [serviceCategory]);
        let categoryId;
        
        if(categoryResult.rows.length === 0) {
            const newCategory = await pool.query(
                'INSERT INTO service_categories (name) VALUES ($1) RETURNING id',
                [serviceCategory]
            );
            categoryId = newCategory.rows[0].id;
        } else {
            categoryId = categoryResult.rows[0].id;
        }

        // Create service provider profile
        const certificateBuffer = certificate ? Buffer.from(certificate, 'base64') : null;
        
        await pool.query(
            'INSERT INTO service_providers (id, service_category_id, hourly_rate, years_of_experience, bio, certificate_file) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, categoryId, hourlyRate || null, experience || null, bio || '', certificateBuffer]
        );

        // Add locations
        for(const location of locations) {
            await pool.query(
                'INSERT INTO service_provider_locations (provider_id, location) VALUES ($1, $2)',
                [userId, location]
            );
        }

        const token = generateToken(userId);
        res.cookie('token', token, cookieOptions);
        return res.status(201).json({
            message: 'Provider registered successfully', 
            user: newUser.rows[0]
        });
    } catch (error) {
        console.error('Provider signup error:', error);
        return res.status(500).json({message: 'Server error during registration'});
    }
});


//Login route
Router.post('/login', async (req, res) => {
    try {
        const {email, password, role} = req.body;

        if(!email || !password) {
            return res.status(400).json({message: 'Email and password are required'});
        }

        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if(user.rows.length === 0) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const userData = user.rows[0];

        // Check if user account is suspended
        if (userData.is_active === false) {
            return res.status(403).json({message: 'Account suspended. Please contact support.'});
        }

        // Verify role if provided
        if(role && userData.role !== role) {
            return res.status(401).json({message: 'Invalid credentials for this role'});
        }

        const isPasswordValid = await bycrypt.compare(password, userData.password_hash);

        if(!isPasswordValid) {
            return res.status(401).json({message: 'Invalid email or password'});
        }

        const token = generateToken(userData.id);
        res.cookie('token', token, cookieOptions);
        return res.status(200).json({
            message: 'Login successful', 
            user: {
                id: userData.id, 
                full_name: userData.full_name, 
                email: userData.email,
                role: userData.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({message: 'Server error during login'});
    }
});


    //me
    Router.get('/me',protect , async (req, res) => {
        res.json(req.user);
    });

    // Get full profile (for customers and providers)
    Router.get('/profile', protect, async (req, res) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            // Get base user data
            const userResult = await pool.query(
                'SELECT id, full_name, email, phone, address, profile_photo, role, created_at FROM users WHERE id = $1',
                [userId]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            let userData = userResult.rows[0];

            // If service provider, get additional provider data
            if (userRole === 'service_provider') {
                const providerResult = await pool.query(
                    `SELECT sp.*, sc.name as service_name 
                     FROM service_providers sp 
                     LEFT JOIN service_categories sc ON sp.service_category_id = sc.id 
                     WHERE sp.id = $1`,
                    [userId]
                );

                if (providerResult.rows.length > 0) {
                    userData = { ...userData, ...providerResult.rows[0] };
                }

                // Get provider locations
                const locationsResult = await pool.query(
                    'SELECT location FROM service_provider_locations WHERE provider_id = $1',
                    [userId]
                );
                userData.locations = locationsResult.rows.map(row => row.location);
            }

            res.json({ user: userData });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Server error getting profile' });
        }
    });

    // Update profile
    Router.put('/profile', protect, async (req, res) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { fullName, email, phone, address, bio, hourlyRate, experience, location } = req.body;

            // Update base user data
            const updateUserResult = await pool.query(
                `UPDATE users 
                 SET full_name = COALESCE($1, full_name), 
                     email = COALESCE($2, email), 
                     phone = COALESCE($3, phone),
                     address = COALESCE($4, address),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $5 
                 RETURNING id, full_name, email, phone, address, role`,
                [fullName, email, phone, address, userId]
            );

            if (updateUserResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            let userData = updateUserResult.rows[0];

            // If service provider, update additional provider data
            if (userRole === 'service_provider') {
                await pool.query(
                    `UPDATE service_providers 
                     SET bio = COALESCE($1, bio),
                         hourly_rate = COALESCE($2, hourly_rate),
                         years_of_experience = COALESCE($3, years_of_experience)
                     WHERE id = $4`,
                    [bio, hourlyRate, experience, userId]
                );

                // Update location if provided
                if (location) {
                    // Delete existing locations and add new one
                    await pool.query('DELETE FROM service_provider_locations WHERE provider_id = $1', [userId]);
                    await pool.query(
                        'INSERT INTO service_provider_locations (provider_id, location) VALUES ($1, $2)',
                        [userId, location]
                    );
                }

                // Get updated provider data
                const providerResult = await pool.query(
                    `SELECT sp.*, sc.name as service_name 
                     FROM service_providers sp 
                     LEFT JOIN service_categories sc ON sp.service_category_id = sc.id 
                     WHERE sp.id = $1`,
                    [userId]
                );

                if (providerResult.rows.length > 0) {
                    userData = { ...userData, ...providerResult.rows[0] };
                }

                const locationsResult = await pool.query(
                    'SELECT location FROM service_provider_locations WHERE provider_id = $1',
                    [userId]
                );
                userData.locations = locationsResult.rows.map(row => row.location);
            }

            // Update localStorage values if name or email changed
            res.json({ 
                message: 'Profile updated successfully', 
                user: userData 
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ message: 'Server error updating profile' });
        }
    });

    // Get all service providers with search/filter
    Router.get('/providers', async (req, res) => {
        try {
            const { search, location, service, maxRate } = req.query;

            let query = `
                SELECT 
                    u.id,
                    u.full_name as name,
                    u.profile_photo,
                    sp.hourly_rate,
                    sp.years_of_experience as experience,
                    sp.bio,
                    sc.name as service,
                    COALESCE(
                        (SELECT AVG(r.rating) FROM reviews r WHERE r.provider_id = u.id),
                        0
                    ) as rating,
                    COALESCE(
                        (SELECT COUNT(*) FROM reviews r WHERE r.provider_id = u.id),
                        0
                    ) as reviews_count,
                    COALESCE(
                        (SELECT spl.location FROM service_provider_locations spl WHERE spl.provider_id = u.id LIMIT 1),
                        'Not specified'
                    ) as location
                FROM users u
                JOIN service_providers sp ON u.id = sp.id
                LEFT JOIN service_categories sc ON sp.service_category_id = sc.id
                WHERE u.role = 'service_provider' AND u.is_active = true
            `;

            const params = [];
            let paramIndex = 1;

            // Search filter (name or service)
            if (search) {
                query += ` AND (u.full_name ILIKE $${paramIndex} OR sc.name ILIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            // Location filter
            if (location && location !== 'All Locations') {
                query += ` AND EXISTS (SELECT 1 FROM service_provider_locations spl WHERE spl.provider_id = u.id AND spl.location ILIKE $${paramIndex})`;
                params.push(`%${location}%`);
                paramIndex++;
            }

            // Service filter
            if (service && service !== 'All Services') {
                query += ` AND sc.name = $${paramIndex}`;
                params.push(service);
                paramIndex++;
            }

            // Max hourly rate filter
            if (maxRate) {
                query += ` AND sp.hourly_rate <= $${paramIndex}`;
                params.push(parseFloat(maxRate));
                paramIndex++;
            }

            query += ` ORDER BY rating DESC, reviews_count DESC`;

            const result = await pool.query(query, params);

            // Format the response
            const providers = result.rows.map(row => ({
                id: row.id,
                name: row.name,
                initial: row.name ? row.name.charAt(0).toUpperCase() : 'P',
                service: row.service || 'General',
                location: row.location,
                rating: parseFloat(row.rating) || 0,
                reviews: parseInt(row.reviews_count) || 0,
                experience: row.experience || 0,
                hourlyRate: parseFloat(row.hourly_rate) || 0,
                bio: row.bio || '',
                profilePhoto: row.profile_photo
            }));

            res.json({ providers });
        } catch (error) {
            console.error('Get providers error:', error);
            res.status(500).json({ message: 'Server error getting providers' });
        }
    });

    // Get single provider details
    Router.get('/providers/:id', async (req, res) => {
        try {
            const { id } = req.params;

            const providerQuery = `
                SELECT 
                    u.id,
                    u.full_name as name,
                    u.email,
                    u.phone,
                    u.profile_photo,
                    sp.hourly_rate,
                    sp.years_of_experience as experience,
                    sp.bio,
                    sc.name as service,
                    COALESCE(
                        (SELECT AVG(r.rating) FROM reviews r WHERE r.provider_id = u.id),
                        0
                    ) as rating,
                    COALESCE(
                        (SELECT COUNT(*) FROM reviews r WHERE r.provider_id = u.id),
                        0
                    ) as reviews_count
                FROM users u
                JOIN service_providers sp ON u.id = sp.id
                LEFT JOIN service_categories sc ON sp.service_category_id = sc.id
                WHERE u.id = $1 AND u.role = 'service_provider'
            `;

            const providerResult = await pool.query(providerQuery, [id]);

            if (providerResult.rows.length === 0) {
                return res.status(404).json({ message: 'Provider not found' });
            }

            const provider = providerResult.rows[0];

            // Get locations
            const locationsResult = await pool.query(
                'SELECT location FROM service_provider_locations WHERE provider_id = $1',
                [id]
            );

            // Get reviews
            const reviewsResult = await pool.query(`
                SELECT r.*, u.full_name as customer_name
                FROM reviews r
                JOIN users u ON r.customer_id = u.id
                WHERE r.provider_id = $1
                ORDER BY r.created_at DESC
                LIMIT 10
            `, [id]);

            res.json({
                provider: {
                    id: provider.id,
                    name: provider.name,
                    initial: provider.name ? provider.name.charAt(0).toUpperCase() : 'P',
                    email: provider.email,
                    phone: provider.phone,
                    service: provider.service || 'General',
                    locations: locationsResult.rows.map(r => r.location),
                    location: locationsResult.rows[0]?.location || 'Not specified',
                    rating: parseFloat(provider.rating) || 0,
                    reviews: parseInt(provider.reviews_count) || 0,
                    experience: provider.experience || 0,
                    hourlyRate: parseFloat(provider.hourly_rate) || 0,
                    bio: provider.bio || '',
                    profilePhoto: provider.profile_photo
                },
                reviews: reviewsResult.rows.map(r => ({
                    id: r.id,
                    rating: r.rating,
                    comment: r.comment,
                    customerName: r.customer_name,
                    createdAt: r.created_at
                }))
            });
        } catch (error) {
            console.error('Get provider details error:', error);
            res.status(500).json({ message: 'Server error getting provider details' });
        }
    });

    // Get service categories
    Router.get('/categories', async (req, res) => {
        try {
            const result = await pool.query('SELECT id, name FROM service_categories ORDER BY name');
            res.json({ categories: result.rows });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ message: 'Server error getting categories' });
        }
    });

    // Get available locations
    Router.get('/locations', async (req, res) => {
        try {
            const result = await pool.query('SELECT DISTINCT location FROM service_provider_locations ORDER BY location');
            res.json({ locations: result.rows.map(r => r.location) });
        } catch (error) {
            console.error('Get locations error:', error);
            res.status(500).json({ message: 'Server error getting locations' });
        }
    });


    //logout
    Router.post('/logout', (req, res) => {
        res.clearCookie('token', cookieOptions);
        return res.status(200).json({message: 'Logout successful'});
    });

    export default Router;