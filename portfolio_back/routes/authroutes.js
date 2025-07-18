const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate secure token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Send login email
router.post('/login', async (req, res) => {
    console.log('🔐 LOGIN REQUEST:', req.body);
    try {
        const { email } = req.body;
        
        if (!email) {
            console.log('❌ No email provided');
            return res.status(400).json({ error: 'Email is required' });
        }

        // Restrict to only the admin email in .env
        if (email !== process.env.EMAIL_USER) {
            console.log('❌ Unauthorized email:', email);
            return res.status(403).json({ error: 'Unauthorized email' });
        }

        console.log('📧 Processing login for email:', email);

        // Generate a secure token
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        console.log('🔑 Generated token:', token.substring(0, 10) + '...');
        console.log('⏰ Token expires at:', expiresAt);

        // Store token in database
        console.log('💾 Storing token in database...');
        await pool.execute(
            'INSERT INTO auth_tokens (email, token, expires_at) VALUES (?, ?, ?)',
            [email, token, expiresAt]
        );
        console.log('✅ Token stored successfully');

        // Create login link
        const loginLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
        console.log('🔗 Login link created:', loginLink);

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Admin Login Link',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Admin Access Request</h2>
                    <p>You requested access to the admin panel. Click the link below to log in:</p>
                    <a href="${loginLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Login to Admin Panel</a>
                    <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        // Send email
        console.log('📤 Sending email...');
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully');

        res.json({ message: 'Login link sent to your email' });
    } catch (error) {
        console.error('❌ LOGIN ERROR:', error);
        res.status(500).json({ error: 'Failed to send login email' });
    }
});

// Verify token and generate JWT
router.post('/verify', async (req, res) => {
    console.log('🔍 VERIFY REQUEST:', req.body);
    try {
        const { token } = req.body;

        if (!token) {
            console.log('❌ No token provided');
            return res.status(400).json({ error: 'Token is required' });
        }

        console.log('🔑 Verifying token:', token.substring(0, 10) + '...');

        // Find and validate token
        console.log('🔍 Searching for token in database...');
        const [rows] = await pool.execute(
            'SELECT * FROM auth_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE',
            [token]
        );

        console.log('📊 Database query result:', rows.length, 'rows found');

        if (rows.length === 0) {
            console.log('❌ Token not found, expired, or already used');
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const tokenRecord = rows[0];
        console.log('✅ Token found:', {
            id: tokenRecord.id,
            email: tokenRecord.email,
            expires_at: tokenRecord.expires_at,
            used: tokenRecord.used
        });

        // Mark token as used
        console.log('🔄 Marking token as used...');
        await pool.execute(
            'UPDATE auth_tokens SET used = TRUE WHERE id = ?',
            [tokenRecord.id]
        );
        console.log('✅ Token marked as used');

        // Generate JWT token
        console.log('🎫 Generating JWT token...');
        const jwtToken = jwt.sign(
            { email: tokenRecord.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('✅ JWT token generated');

        console.log('🎉 Login successful for:', tokenRecord.email);

        res.json({ 
            message: 'Login successful',
            token: jwtToken,
            user: { email: tokenRecord.email, role: 'admin' }
        });
    } catch (error) {
        console.error('❌ VERIFY ERROR:', error);
        res.status(500).json({ error: 'Failed to verify token' });
    }
});

// Verify JWT middleware
const authenticateToken = (req, res, next) => {
    console.log('🔒 AUTHENTICATING REQUEST');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('❌ No authorization token provided');
        return res.status(401).json({ error: 'Access token required' });
    }

    console.log('🔍 Verifying JWT token...');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('❌ JWT verification failed:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        console.log('✅ JWT verified for user:', user.email);
        req.user = user;
        next();
    });
};

module.exports = { router, authenticateToken }; 