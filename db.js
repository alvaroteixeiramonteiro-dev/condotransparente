// Database connection configuration
// Credentials are loaded from the .env file using the dotenv package
const mysql = require('mysql2/promise');
// Create a connection pool to the MySQL database
// A connection pool allows for efficient management of multiple database connections
const db = mysql.createPool({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database user
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
  charset: 'utf8mb4', // Character set for the connection
});

module.exports = db; // Export the connection pool for use in other parts of the application