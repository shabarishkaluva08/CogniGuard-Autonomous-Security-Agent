const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDB() {
  try {
    console.log('Connecting to MySQL...');
    // Connect without specifying a database first to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

    console.log('Executing schema.sql...');
    for (let stmt of statements) {
      if (stmt.trim()) {
        await connection.query(stmt);
      }
    }
    
    console.log('Database initialized successfully!');
    await connection.end();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initializeDB();
