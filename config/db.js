require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { Pool } = require("pg");

// console.log("HOST:", process.env.DB_HOST);
// console.log("PORT:", process.env.DB_PORT);
// console.log("DATABASE:", process.env.DB_NAME);
// console.log("USER:", process.env.DB_USER);
// console.log("PASSWORD TYPE:", typeof process.env.DB_PASSWORD);

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
