const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();

// Create express app
const app = express();
// Use Render's dynamic port or fallback to 3000 for local development
const port = process.env.PORT || 3000;

// Create pool
const pool = new Pool({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    ssl: { rejectUnauthorized: false }
});

// Add process hook to shutdown pool
process.on('SIGINT', function() {
    pool.end();
    console.log('Application successfully shutdown');
    process.exit(0);
});
         
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    const data = { name: 'Mario' };
    res.render('index', data);
});

app.get('/user', (req, res) => {
    let teammembers = []; // Added 'let' to declare the variable properly
    
    pool.query('SELECT * FROM teammembers;')
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                teammembers.push(query_res.rows[i]);
            }
            const data = { teammembers: teammembers };
            console.log(teammembers);
            res.render('user', data);
        })
        .catch(err => {
            // This catches database errors so your server doesn't crash with a 500
            console.error('Database error:', err);
            res.status(500).send('Database error: ' + err.message);
        });
});

app.listen(port, () => {
    console.log(`Example app listening at port ${port}`);
});