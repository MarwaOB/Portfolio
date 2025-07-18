const express = require("express")
const app = express()
const cors = require("cors")

app.use(cors());
require('dotenv').config();
app.use(express.json()); // to parse JSON

// Log environment variables (without sensitive data)
console.log('🚀 Starting server...');
console.log('�� Environment check:');
console.log('  - DB_HOST:', process.env.DB_HOST ? '✅ Set' : '❌ Missing');
console.log('  - DB_USER:', process.env.DB_USER ? '✅ Set' : '❌ Missing');
console.log('  - DB_NAME:', process.env.DB_NAME ? '✅ Set' : '❌ Missing');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('  - EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
console.log('  - EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
console.log('  - FRONTEND_URL:', process.env.FRONTEND_URL ? '✅ Set' : '❌ Missing');

const mysql = require("mysql2");
// creating a pool of connections to mysql db
const pool = mysql.createPool({host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    connection.release();
  }
});

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Make upload and cloudinary available to routes
app.set('cloudinary', cloudinary);
app.set('upload', upload);

// running the server 
app.listen(process.env.PORT,() => {console.log(`server running on http://localhost:${process.env.PORT}`)})

// Route imports
const { router: authRoutes, authenticateToken } = require('./routes/authroutes');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/projectroutes');
app.use('/api/projects', projectRoutes);

const serviceRoutes = require('./routes/serviceroutes');
app.use('/api/services', serviceRoutes);

const postRoutes = require('./routes/postroutes');
app.use('/api/posts', postRoutes);






