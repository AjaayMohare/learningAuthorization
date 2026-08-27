require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function testDB() {
    try {
        await pool.query("SELECT 1");
        console.log("Database connected");
    } catch(err) {
        console.log("Database connection failed");
        console.log(err.message);
    }
}

testDB();

module.exports = pool;
