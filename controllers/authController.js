require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env")
});

const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// =========================
// REGISTER FORM
// =========================
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASSWORD
//     }
// });


const showRegisterForm = (req, res) => {
    res.send(`
        <div style="width: 60%; margin: 20% auto; border: 1px solid black; padding: 30px;">
            
            <h2>Register</h2>

            <form method="POST" action="/api/auth/register">

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    required
                >

                <br><br>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                >

                <br><br>

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                >

                <br><br>

                <button type="submit">Register</button>

            </form>

            <br>

            <a href="/api/auth/login">
                Already have an account? Login
            </a>

        </div>
    `);
};


// =========================
// HANDLE REGISTER
// =========================

const handleRegister = async (req, res) => {

    try {

        const { username, email, password } = req.body;


        // Check if username or email already exists
        const existingUser = await pool.query(
            `
            SELECT username, email
            FROM users
            WHERE username = $1 OR email = $2
            `,
            [username, email]
        );


        // If user exists
        if (existingUser.rows.length > 0) {

            const user = existingUser.rows[0];


            // Duplicate username
            if (user.username === username) {

                return res.send(`
                    <div style="width: 60%; margin: 20% auto; border: 1px solid black; padding: 30px;">

                        <h2>Registration Failed</h2>

                        <p>Username already exists.</p>

                        <a href="/api/auth/register">
                            Try Again
                        </a>

                    </div>
                `);
            }


            // Duplicate email
            if (user.email === email) {

                return res.send(`
                    <div style="width: 60%; margin: 20% auto; border: 1px solid black; padding: 30px;">

                        <h2>Registration Failed</h2>

                        <p>Email already exists.</p>

                        <a href="/api/auth/register">
                            Try Again
                        </a>

                    </div>
                `);
            }
        }


        // Insert user into database
        const result = await pool.query(
            `
            INSERT INTO users (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING username, email
            `,
            [username, email, password]
        );


        // Newly created user
        const user = result.rows[0];


        // Generate JWT
        const accessToken = jwt.sign(
            {
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        const refreshToken = jwt.sign(
            {
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        // mail
        // await transporter.sendMail({
        //     from: process.env.MAIL_USER,
        //     to: user.email,
        //     subject: "Registration Successful",
        //     html: `
        //         <h2>Welcome ${user.username}!</h2>
        //         <p>Your account has been successfully created.</p>
        //         <p>Thank you for registering.</p>
        //     `
        // });
        // Response
        res.send(`
            <div style="width: 60%; margin: 20% auto; border: 1px solid black; padding: 30px;">

                <h2>Registration Successful</h2>

                <p>Welcome ${user.username}</p>

                <p>Your accessToken:</p>

                <textarea rows="8" cols="80">${accessToken}</textarea>

                <br><br>

                <a href="/api/auth/login">
                    Login
                </a>

            </div>
        `);

    } catch (err) {

        console.log(err);

        res.status(500).send("Registration failed");

    }
};



// =========================
// LOGIN FORM
// =========================

const showLoginForm = (req, res) => {

    res.send(`
        <div style="width: 60%; margin: 20% auto; border: 1px solid black; padding: 30px;">

            <h2>Login</h2>

            <form method="POST" action="/api/auth/login">

                <input
                    type="text"
                    name="usernameOrEmail"
                    placeholder="Username or Email"
                    required
                >

                <br><br>

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                >

                <br><br>

                <button type="submit">
                    Login
                </button>

            </form>

            <br>

            <a href="/api/auth/register">
                Create an account
            </a>

        </div>
    `);
};



// =========================
// HANDLE LOGIN
// =========================

const handleLogin = async (req, res) => {

    try {

        const { usernameOrEmail, password } = req.body;


        // Find user using username OR email
        const result = await pool.query(
            `
            SELECT *
            FROM users
            WHERE username = $1 OR email = $1
            `,
            [usernameOrEmail]
        );


        // User doesn't exist
        if (result.rows.length === 0) {

            return res.send(`
                <div style="width: 60%; margin: 20% auto; border: 1px solid black; padding: 30px;">

                    <h2>Login Failed</h2>

                    <p>Invalid username or email.</p>

                    <a href="/api/auth/login">
                        Try Again
                    </a>

                </div>
            `);
        }


        // Get user
        const user = result.rows[0];


        // Check password
        if (user.password !== password) {

            return res.send(`
                <div style="width: 60%; margin: 20% auto; border: 1px solid black; padding: 30px;">

                    <h2>Login Failed</h2>

                    <p>Invalid password.</p>

                    <a href="/api/auth/login">
                        Try Again
                    </a>

                </div>
            `);
        }


        // Generate JWT
        const accessToken = jwt.sign(
            {
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        const refreshToken = jwt.sign(
            {
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Login successful
        res.send(`
            <div style="width: 60%; margin: 20% auto; border: 1px solid black; padding: 30px;">

                <h2>Login Successful</h2>

                <p>Welcome ${user.username}</p>

                <p>Your accessToken:</p>

                <textarea rows="8" cols="80">${accessToken}</textarea>

            </div>
        `);

    } catch (err) {

        console.log(err);

        res.status(500).send("Login failed");

    }
};

const getMe = async (req, res) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        // Authorization: Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        console.log("--------------")
        console.log(decoded);
        console.log("---------------")
        const result = await pool.query(
            `SELECT username, email
             FROM users
             WHERE username = $1 AND email = $2`,
            [decoded.username, decoded.email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User found",
            user: result.rows[0]
        });

    } catch (err) {

        console.log(err);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};


// =========================
// EXPORT
// =========================


const refreshToken = async (req, res) => {
    try {
        // Get refresh token from cookie
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                message: "Refresh token not found"
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Generate new access token
        const accessToken = jwt.sign(
            {
                username: decoded.username,
                email: decoded.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        // Replace old access token cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.json({
            message: "Access token refreshed"
        });

    } catch (err) {

        console.log(err);

        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
};

module.exports = {
    showRegisterForm,
    handleRegister,
    showLoginForm,
    handleLogin,
    getMe,
    refreshToken
};
