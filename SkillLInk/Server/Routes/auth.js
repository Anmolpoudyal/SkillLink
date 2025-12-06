import express from 'express';
import bycrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import  pool  from '../Services/db.js';
import { protect } from '../middleWear/auth.js';

const Router = express.Router();
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// function to geenrate JWT token 
const generateToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '1d'});
};

//Register customer
Router.post('/CustomerSignup', async (req, res) => {
    const {fullName, email, phone, password} = req.body;

    if(!fullName || !email || !phone || !password) {
        return res.status(400).json({message: 'All fields are required'});
    }

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if(userExists.rows.length > 0) {
        return res.status(409).json({message: 'User already exists'});
    }

    const hashedPassword = await bycrypt.hash(password, 10);
    const newUser = await pool.query(
        'INSERT INTO users (full_name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email',
        [fullName, email, phone, hashedPassword]
    );
    const token = generateToken(newUser.rows[0].id);
    res.cookie('token', token, cookieOptions);
    return res.status(201).json({message: 'User registered successfully', user: newUser.rows[0]});


});


//Login route
Router.post('/login', async (req, res) => {
    const {email, password, role} = req.body;

    if(!email || !password) {
        return res.status(400).json({message: 'Email and password are required'});
    }

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if(user.rows.length === 0) {
        return res.status(401).json({message: 'Invalid email or password'});
    }

    const userData = user.rows[0];

    const isPasswordValid = await bycrypt.compare(password, userData.password);

    if(!isPasswordValid) {
        return res.status(401).json({message: 'Invalid email or password'});
    }

    const token = generateToken(userData.id);
    res.cookie('token', token, cookieOptions);
    return res.status(200).json({message: 'Login successful', user: {id: userData.id, full_name: userData.full_name, email: userData.email}});

    })


    //me
    Router.get('/me',protect , async (req, res) => {
        res.json(req.user);
    });


    //logout
    Router.post('/logout', (req, res) => {
        res.clearCookie('token', cookieOptions);
        return res.status(200).json({message: 'Logout successful'});
    });

    export default Router;