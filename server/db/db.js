const Pool = require('pg').Pool

const pool = new Pool({
    host:process.env.DB_HOST || 'localhost', 
    database:process.env.DB_NAME || 'restaurant',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || '5432'
})

module.exports = pool