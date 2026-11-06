const { Pool } = require('pg')

if (
    process.env.NODE_ENV === 'production' &&
    !process.env.DATABASE_URL &&
    !process.env.DB_HOST
) {
    throw new Error('DATABASE_URL ou DB_HOST doit être défini en production')
}

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: true
        }
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'restaurant',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        port: Number(process.env.DB_PORT || 5432)
    }

const pool = new Pool(poolConfig)

pool.on('error', (error) => {
    console.error('Erreur PostgreSQL inattendue :', error.message)
})

module.exports = pool