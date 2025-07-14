const express = require("express")
const app = express()
const cors = require("cors")

app.use(cors());
require('dotenv').config();
app.use(express.json()); // to parse JSON

const mysql = require("mysql2");
// creating a pool of connections to mysql db
const pool = mysql.createPool({host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// running the server 
app.listen(process.env.PORT,() => {console.log(`server running on https://localhost:${process.env.PORT}`)})



// Route imports
const projectRoutes = require('./routes/projectroutes');
app.use('/api/projects', projectRoutes);

const serviceRoutes = require('./routes/serviceroutes');
app.use('/api/services', serviceRoutes);

const postRoutes = require('./routes/postroutes');
app.use('/api/posts', postRoutes);






