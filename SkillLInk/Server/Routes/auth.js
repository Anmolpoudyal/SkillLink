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

    // Get provider availability schedule
    Router.get('/providers/:id/availability', async (req, res) => {
        try {
            const { id } = req.params;
            const { date } = req.query; // Optional: specific date to check

            // Get weekly availability schedule
            const availabilityResult = await pool.query(`
                SELECT day_of_week, is_available, start_time, end_time
                FROM provider_availability
                WHERE provider_id = $1
                ORDER BY day_of_week
            `, [id]);

            // Get blocked slots (from provider_blocked_slots table)
            let blockedSlotsResult = { rows: [] };
            try {
                blockedSlotsResult = await pool.query(`
                    SELECT blocked_date, start_time, end_time, reason
                    FROM provider_blocked_slots
                    WHERE provider_id = $1 
                    AND blocked_date >= CURRENT_DATE
                    ORDER BY blocked_date
                `, [id]);
                console.log('Blocked slots found:', blockedSlotsResult.rows.length, blockedSlotsResult.rows);
            } catch (e) {
                // Table might not exist, continue without blocked slots
                console.log('provider_blocked_slots table not found or error:', e.message);
            }

            // Get booked slots for the next 30 days
            let bookedSlotsResult = { rows: [] };
            try {
                bookedSlotsResult = await pool.query(`
                    SELECT preferred_date, preferred_time
                    FROM bookings
                    WHERE provider_id = $1
                    AND status IN ('pending', 'accepted', 'in_progress')
                    AND preferred_date >= CURRENT_DATE
                    AND preferred_date <= CURRENT_DATE + INTERVAL '30 days'
                `, [id]);
            } catch (e) {
                // Table might not exist, continue without booked slots
                console.log('bookings table not found or error:', e.message);
            }

            // Format weekly schedule
            const weeklySchedule = {};
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            // Default all days to unavailable
            dayNames.forEach((day, index) => {
                weeklySchedule[index] = {
                    day: day,
                    isAvailable: false,
                    startTime: null,
                    endTime: null
                };
            });

            // Override with actual availability
            availabilityResult.rows.forEach(row => {
                weeklySchedule[row.day_of_week] = {
                    day: dayNames[row.day_of_week],
                    isAvailable: row.is_available,
                    startTime: row.start_time,
                    endTime: row.end_time
                };
            });

            // Generate time slots for a specific date if provided
            let timeSlots = [];
            if (date) {
                const requestedDate = new Date(date);
                const dayOfWeek = requestedDate.getDay();
                const schedule = weeklySchedule[dayOfWeek];

                console.log('Checking availability for date:', date, 'requestedDate:', requestedDate.toDateString());

                if (schedule.isAvailable && schedule.startTime && schedule.endTime) {
                    // Generate hourly slots
                    const startHour = parseInt(schedule.startTime.split(':')[0]);
                    const endHour = parseInt(schedule.endTime.split(':')[0]);

                    // Get blocked times for this date - compare dates properly
                    const blockedTimes = blockedSlotsResult.rows
                        .filter(b => {
                            const blockedDateStr = new Date(b.blocked_date).toISOString().split('T')[0];
                            const requestedDateStr = date; // Already in YYYY-MM-DD format
                            console.log('Comparing blocked date:', blockedDateStr, 'with requested:', requestedDateStr);
                            return blockedDateStr === requestedDateStr;
                        })
                        .map(b => ({
                            start: b.start_time,
                            end: b.end_time
                        }));

                    console.log('Blocked times for this date:', blockedTimes);

                    // Get booked times for this date
                    const bookedTimes = bookedSlotsResult.rows
                        .filter(b => {
                            const bookedDateStr = new Date(b.preferred_date).toISOString().split('T')[0];
                            return bookedDateStr === date;
                        })
                        .map(b => b.preferred_time?.slice(0, 5));

                    for (let hour = startHour; hour < endHour; hour++) {
                        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                        const displayTime = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
                        
                        // Check if slot is blocked
                        const isBlocked = blockedTimes.some(b => {
                            const blockStart = parseInt(b.start?.split(':')[0] || 0);
                            const blockEnd = parseInt(b.end?.split(':')[0] || 24);
                            return hour >= blockStart && hour < blockEnd;
                        });

                        // Check if slot is booked
                        const isBooked = bookedTimes.includes(timeStr);

                        // Skip lunch hour (1 PM)
                        const isLunch = hour === 13;

                        let status = 'available';
                        if (isBlocked) status = 'blocked';
                        else if (isBooked) status = 'booked';
                        else if (isLunch) status = 'lunch';

                        timeSlots.push({
                            time: displayTime,
                            timeValue: timeStr,
                            status: status
                        });
                    }
                }
            }

            res.json({
                weeklySchedule: Object.values(weeklySchedule),
                blockedSlots: blockedSlotsResult.rows.map(b => ({
                    date: b.blocked_date,
                    startTime: b.start_time,
                    endTime: b.end_time,
                    reason: b.reason
                })),
                timeSlots: timeSlots
            });
        } catch (error) {
            console.error('Get provider availability error:', error);
            res.status(500).json({ message: 'Server error getting availability' });
        }
    });

    // Save provider availability schedule (protected route)
    Router.post('/availability', protect, async (req, res) => {
        try {
            const providerId = req.user.id;
            const { schedule } = req.body;

            if (!schedule || !Array.isArray(schedule)) {
                return res.status(400).json({ message: 'Invalid schedule data' });
            }

            // Delete existing availability for this provider
            await pool.query('DELETE FROM provider_availability WHERE provider_id = $1', [providerId]);

            // Insert new availability
            for (const slot of schedule) {
                if (slot.enabled && slot.startTime && slot.endTime) {
                    // Convert day name to day number (0 = Sunday, 6 = Saturday)
                    const dayMap = {
                        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
                        'Thursday': 4, 'Friday': 5, 'Saturday': 6
                    };
                    const dayOfWeek = dayMap[slot.day];

                    // Convert 12-hour format to 24-hour format
                    const convertTo24Hour = (timeStr) => {
                        const [time, modifier] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':');
                        hours = parseInt(hours);
                        if (modifier === 'PM' && hours !== 12) hours += 12;
                        if (modifier === 'AM' && hours === 12) hours = 0;
                        return `${hours.toString().padStart(2, '0')}:${minutes}`;
                    };

                    const startTime24 = convertTo24Hour(slot.startTime);
                    const endTime24 = convertTo24Hour(slot.endTime);

                    await pool.query(`
                        INSERT INTO provider_availability (provider_id, day_of_week, is_available, start_time, end_time)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [providerId, dayOfWeek, true, startTime24, endTime24]);
                }
            }

            res.json({ message: 'Availability saved successfully' });
        } catch (error) {
            console.error('Save availability error:', error);
            res.status(500).json({ message: 'Server error saving availability' });
        }
    });

    // Add blocked time slot (time off)
    Router.post('/time-off', protect, async (req, res) => {
        try {
            const providerId = req.user.id;
            const { date, startTime, endTime, reason } = req.body;

            console.log('Adding time off:', { providerId, date, startTime, endTime, reason });

            if (!date) {
                return res.status(400).json({ message: 'Date is required' });
            }

            // Convert 12-hour format to 24-hour format if needed
            const convertTo24Hour = (timeStr) => {
                if (!timeStr) return null;
                if (!timeStr.includes('AM') && !timeStr.includes('PM')) return timeStr;
                const [time, modifier] = timeStr.split(' ');
                let [hours, minutes] = time.split(':');
                hours = parseInt(hours);
                if (modifier === 'PM' && hours !== 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;
                return `${hours.toString().padStart(2, '0')}:${minutes}`;
            };

            const startTime24 = convertTo24Hour(startTime) || '00:00';
            const endTime24 = convertTo24Hour(endTime) || '23:59';

            console.log('Converted times:', { startTime24, endTime24 });

            // Delete existing entry for this date if any, then insert new one
            await pool.query(`
                DELETE FROM provider_blocked_slots 
                WHERE provider_id = $1 AND blocked_date = $2
            `, [providerId, date]);
            
            const result = await pool.query(`
                INSERT INTO provider_blocked_slots (provider_id, blocked_date, start_time, end_time, reason)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [providerId, date, startTime24, endTime24, reason || 'Personal']);

            console.log('Time off added:', result.rows[0]);

            res.json({ message: 'Time off added successfully', blockedSlot: result.rows[0] });
        } catch (error) {
            console.error('Add time off error:', error);
            // Check if table doesn't exist
            if (error.code === '42P01') {
                return res.status(500).json({ message: 'Database table not found. Please run database migrations.' });
            }
            res.status(500).json({ message: 'Server error adding time off' });
        }
    });

    // Get provider's own availability (for provider dashboard)
    Router.get('/my-availability', protect, async (req, res) => {
        try {
            const providerId = req.user.id;

            // Get weekly schedule
            const availabilityResult = await pool.query(`
                SELECT day_of_week, is_available, start_time, end_time
                FROM provider_availability
                WHERE provider_id = $1
                ORDER BY day_of_week
            `, [providerId]);

            // Get blocked slots
            let blockedSlotsResult = { rows: [] };
            try {
                blockedSlotsResult = await pool.query(`
                    SELECT id, blocked_date, start_time, end_time, reason
                    FROM provider_blocked_slots
                    WHERE provider_id = $1
                    AND blocked_date >= CURRENT_DATE
                    ORDER BY blocked_date
                `, [providerId]);
            } catch (e) {
                console.log('provider_blocked_slots query error:', e.message);
            }

            // Format weekly schedule
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const schedule = dayNames.map((day, index) => {
                const found = availabilityResult.rows.find(r => r.day_of_week === index);
                if (found) {
                    // Convert 24-hour to 12-hour format
                    const convertTo12Hour = (timeStr) => {
                        if (!timeStr) return '';
                        const [hours, minutes] = timeStr.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                    };
                    return {
                        day: day,
                        enabled: found.is_available,
                        startTime: convertTo12Hour(found.start_time),
                        endTime: convertTo12Hour(found.end_time)
                    };
                }
                return {
                    day: day,
                    enabled: false,
                    startTime: '09:00 AM',
                    endTime: '06:00 PM'
                };
            });

            res.json({
                schedule,
                blockedSlots: blockedSlotsResult.rows.map(b => ({
                    id: b.id,
                    date: b.blocked_date,
                    startTime: b.start_time,
                    endTime: b.end_time,
                    reason: b.reason
                }))
            });
        } catch (error) {
            console.error('Get my availability error:', error);
            res.status(500).json({ message: 'Server error getting availability' });
        }
    });

    // Delete time off
    Router.delete('/time-off/:id', protect, async (req, res) => {
        try {
            const providerId = req.user.id;
            const { id } = req.params;

            await pool.query(`
                DELETE FROM provider_blocked_slots
                WHERE id = $1 AND provider_id = $2
            `, [id, providerId]);

            res.json({ message: 'Time off deleted successfully' });
        } catch (error) {
            console.error('Delete time off error:', error);
            res.status(500).json({ message: 'Server error deleting time off' });
        }
    });

    // ============================================
    // BOOKING ENDPOINTS
    // ============================================

    // Create a new booking (customer)
    Router.post('/bookings', protect, async (req, res) => {
        try {
            const customerId = req.user.id;
            const { 
                providerId, 
                problemDescription, 
                serviceAddress, 
                latitude, 
                longitude, 
                preferredDate, 
                preferredTime 
            } = req.body;

            if (!providerId || !problemDescription || !serviceAddress || !preferredDate || !preferredTime) {
                return res.status(400).json({ message: 'All required fields must be filled' });
            }

            const result = await pool.query(`
                INSERT INTO bookings (customer_id, provider_id, problem_description, service_address, latitude, longitude, preferred_date, preferred_time)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [customerId, providerId, problemDescription, serviceAddress, latitude || null, longitude || null, preferredDate, preferredTime]);

            res.status(201).json({ 
                message: 'Booking request sent successfully', 
                booking: result.rows[0] 
            });
        } catch (error) {
            console.error('Create booking error:', error);
            res.status(500).json({ message: 'Server error creating booking' });
        }
    });

    // Get bookings for provider
    Router.get('/provider/bookings', protect, async (req, res) => {
        try {
            const providerId = req.user.id;
            const { status } = req.query;

            console.log('Fetching bookings for provider:', providerId, 'User:', req.user.full_name);

            let query = `
                SELECT 
                    b.*,
                    u.full_name as customer_name,
                    u.phone as customer_phone,
                    u.email as customer_email,
                    u.profile_photo as customer_photo,
                    p.status as payment_status,
                    p.otp_verified as otp_verified
                FROM bookings b
                JOIN users u ON b.customer_id = u.id
                LEFT JOIN payments p ON b.id = p.booking_id
                WHERE b.provider_id = $1
            `;
            const params = [providerId];

            if (status && status !== 'all') {
                query += ` AND b.status = $2`;
                params.push(status);
            }

            query += ` ORDER BY b.created_at DESC`;

            const result = await pool.query(query, params);

            const bookings = result.rows.map(b => ({
                id: b.id,
                customer: {
                    id: b.customer_id,
                    name: b.customer_name,
                    phone: b.customer_phone,
                    email: b.customer_email,
                    photo: b.customer_photo,
                    initial: b.customer_name ? b.customer_name.charAt(0).toUpperCase() : 'C'
                },
                problemDescription: b.problem_description,
                serviceAddress: b.service_address,
                latitude: b.latitude,
                longitude: b.longitude,
                preferredDate: b.preferred_date,
                preferredTime: b.preferred_time,
                status: b.status,
                verificationCode: b.verification_code,
                estimatedAmount: b.estimated_amount,
                finalAmount: b.final_amount,
                providerNotes: b.provider_notes,
                rejectionReason: b.rejection_reason,
                createdAt: b.created_at,
                acceptedAt: b.accepted_at,
                startedAt: b.started_at,
                completedAt: b.completed_at,
                paymentStatus: b.payment_status || 'pending',
                otpVerified: b.otp_verified || false
            }));

            res.json({ bookings });
        } catch (error) {
            console.error('Get provider bookings error:', error);
            res.status(500).json({ message: 'Server error getting bookings' });
        }
    });

    // Get bookings for customer
    Router.get('/customer/bookings', protect, async (req, res) => {
        try {
            const customerId = req.user.id;
            const { status } = req.query;

            console.log('Fetching bookings for customer:', customerId, 'User:', req.user.full_name);

            let query = `
                SELECT 
                    b.*,
                    u.full_name as provider_name,
                    u.phone as provider_phone,
                    u.email as provider_email,
                    u.profile_photo as provider_photo,
                    sc.name as service_name,
                    p.status as payment_status,
                    p.otp_verified as otp_verified
                FROM bookings b
                JOIN users u ON b.provider_id = u.id
                LEFT JOIN service_providers sp ON b.provider_id = sp.id
                LEFT JOIN service_categories sc ON sp.service_category_id = sc.id
                LEFT JOIN payments p ON b.id = p.booking_id
                WHERE b.customer_id = $1
            `;
            const params = [customerId];

            if (status && status !== 'all') {
                query += ` AND b.status = $2`;
                params.push(status);
            }

            query += ` ORDER BY b.created_at DESC`;

            const result = await pool.query(query, params);
            
            console.log('Found', result.rows.length, 'bookings for customer:', customerId);

            const bookings = result.rows.map(b => ({
                id: b.id,
                provider: {
                    id: b.provider_id,
                    name: b.provider_name,
                    phone: b.provider_phone,
                    email: b.provider_email,
                    photo: b.provider_photo,
                    initial: b.provider_name ? b.provider_name.charAt(0).toUpperCase() : 'P',
                    service: b.service_name || 'General'
                },
                problemDescription: b.problem_description,
                serviceAddress: b.service_address,
                preferredDate: b.preferred_date,
                preferredTime: b.preferred_time,
                status: b.status,
                verificationCode: b.verification_code,
                estimatedAmount: b.estimated_amount,
                finalAmount: b.final_amount,
                providerNotes: b.provider_notes,
                createdAt: b.created_at,
                acceptedAt: b.accepted_at,
                completedAt: b.completed_at,
                paymentStatus: b.payment_status || 'pending',
                otpVerified: b.otp_verified || false
            }));

            res.json({ bookings });
        } catch (error) {
            console.error('Get customer bookings error:', error);
            res.status(500).json({ message: 'Server error getting bookings' });
        }
    });

    // Get single booking details
    Router.get('/bookings/:id', protect, async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const result = await pool.query(`
                SELECT 
                    b.*,
                    c.full_name as customer_name,
                    c.phone as customer_phone,
                    c.email as customer_email,
                    c.profile_photo as customer_photo,
                    c.address as customer_address,
                    p.full_name as provider_name,
                    p.phone as provider_phone,
                    p.email as provider_email,
                    p.profile_photo as provider_photo,
                    sc.name as service_name,
                    sp.hourly_rate
                FROM bookings b
                JOIN users c ON b.customer_id = c.id
                JOIN users p ON b.provider_id = p.id
                LEFT JOIN service_providers sp ON b.provider_id = sp.id
                LEFT JOIN service_categories sc ON sp.service_category_id = sc.id
                WHERE b.id = $1 AND (b.customer_id = $2 OR b.provider_id = $2)
            `, [id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            const b = result.rows[0];
            res.json({
                booking: {
                    id: b.id,
                    customer: {
                        id: b.customer_id,
                        name: b.customer_name,
                        phone: b.customer_phone,
                        email: b.customer_email,
                        photo: b.customer_photo,
                        address: b.customer_address,
                        initial: b.customer_name ? b.customer_name.charAt(0).toUpperCase() : 'C'
                    },
                    provider: {
                        id: b.provider_id,
                        name: b.provider_name,
                        phone: b.provider_phone,
                        email: b.provider_email,
                        photo: b.provider_photo,
                        initial: b.provider_name ? b.provider_name.charAt(0).toUpperCase() : 'P',
                        service: b.service_name || 'General',
                        hourlyRate: b.hourly_rate
                    },
                    problemDescription: b.problem_description,
                    serviceAddress: b.service_address,
                    latitude: b.latitude,
                    longitude: b.longitude,
                    preferredDate: b.preferred_date,
                    preferredTime: b.preferred_time,
                    status: b.status,
                    verificationCode: b.verification_code,
                    estimatedAmount: b.estimated_amount,
                    finalAmount: b.final_amount,
                    providerNotes: b.provider_notes,
                    rejectionReason: b.rejection_reason,
                    createdAt: b.created_at,
                    acceptedAt: b.accepted_at,
                    startedAt: b.started_at,
                    completedAt: b.completed_at
                }
            });
        } catch (error) {
            console.error('Get booking details error:', error);
            res.status(500).json({ message: 'Server error getting booking details' });
        }
    });

    // Update booking status (provider actions: accept, reject, start, complete)
    Router.patch('/bookings/:id/status', protect, async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { status, rejectionReason, providerNotes, estimatedAmount } = req.body;

            console.log('Update booking status:', { bookingId: id, providerId: userId, status });

            // Verify the booking belongs to this provider
            const bookingCheck = await pool.query(
                'SELECT * FROM bookings WHERE id = $1 AND provider_id = $2',
                [id, userId]
            );

            console.log('Booking check result:', bookingCheck.rows.length, 'bookings found');

            if (bookingCheck.rows.length === 0) {
                // Debug: check if booking exists at all
                const anyBooking = await pool.query('SELECT id, provider_id FROM bookings WHERE id = $1', [id]);
                console.log('Booking exists?', anyBooking.rows.length > 0 ? 'Yes, provider_id=' + anyBooking.rows[0]?.provider_id : 'No');
                return res.status(404).json({ message: 'Booking not found' });
            }

            const currentBooking = bookingCheck.rows[0];
            let updateQuery = 'UPDATE bookings SET status = $1, updated_at = NOW()';
            const params = [status];
            let paramIndex = 2;

            // Handle different status transitions
            if (status === 'accepted') {
                // Generate 6-digit verification code
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                updateQuery += `, accepted_at = NOW(), verification_code = $${paramIndex}`;
                params.push(verificationCode);
                paramIndex++;
                
                if (estimatedAmount) {
                    updateQuery += `, estimated_amount = $${paramIndex}`;
                    params.push(estimatedAmount);
                    paramIndex++;
                }
            } else if (status === 'rejected') {
                updateQuery += `, rejection_reason = $${paramIndex}`;
                params.push(rejectionReason || 'Not available');
                paramIndex++;
            } else if (status === 'in_progress') {
                updateQuery += `, started_at = NOW()`;
            } else if (status === 'completed') {
                updateQuery += `, completed_at = NOW()`;
            }

            if (providerNotes) {
                updateQuery += `, provider_notes = $${paramIndex}`;
                params.push(providerNotes);
                paramIndex++;
            }

            updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
            params.push(id);

            const result = await pool.query(updateQuery, params);

            res.json({ 
                message: `Booking ${status} successfully`, 
                booking: result.rows[0] 
            });
        } catch (error) {
            console.error('Update booking status error:', error);
            res.status(500).json({ message: 'Server error updating booking' });
        }
    });

    // Cancel booking (customer)
    Router.patch('/bookings/:id/cancel', protect, async (req, res) => {
        try {
            const customerId = req.user.id;
            const { id } = req.params;

            const result = await pool.query(`
                UPDATE bookings 
                SET status = 'cancelled', updated_at = NOW()
                WHERE id = $1 AND customer_id = $2 AND status IN ('pending', 'accepted')
                RETURNING *
            `, [id, customerId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Booking not found or cannot be cancelled' });
            }

            res.json({ message: 'Booking cancelled successfully', booking: result.rows[0] });
        } catch (error) {
            console.error('Cancel booking error:', error);
            res.status(500).json({ message: 'Server error cancelling booking' });
        }
    });


    //logout
    Router.post('/logout', (req, res) => {
        res.clearCookie('token', cookieOptions);
        return res.status(200).json({message: 'Logout successful'});
    });

    export default Router;