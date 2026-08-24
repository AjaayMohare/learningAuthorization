const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = [];
const jwtSecret = process.env.JWT_SECRET || "development-only-secret-change-me";



function sendPage(res, title, content) {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);
}

function homePage(req, res) {
    const page = `
        <a href="/login">login</a>
        <hr>
        <a href="/register">register</a>
        <hr>
    `;

    sendPage(res, "Home", page);
}

function showLoginForm(req, res) {
    sendPage(res, "Login", `
        <h1>Login</h1>
        <form method="POST" action="/login">
            <label>Email <input type="email" name="email" required></label>
            <br>
            <label>Password <input type="password" name="password" required></label>
            <br>
            <button type="submit">Login</button>
        </form>
        <p>New user? <a href="/register">Register here</a></p>
    `);
}

function showRegisterForm(req, res) {
    sendPage(res, "Register", `
        <h1>Register</h1>
        <form method="POST" action="/register">
            <label>Name <input type="text" name="name" required></label>
            <br>
            <label>Email <input type="email" name="email" required></label>
            <br>
            <label>Password <input type="password" name="password" minlength="6" required></label>
            <br>
            <button type="submit">Register</button>
        </form>
        <p>Already registered? <a href="/login">Login here</a></p>
    `);
}

async function handleRegister(req, res) {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send("Name, email, and password are required.");
    }
    if (password.length < 6) {
        return res.status(400).send("Password must be at least 6 characters long.");
    }
    if (users.some((user) => user.email === email)) {
        return res.status(409).send("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    users.push({ id: users.length + 1, name, email, passwordHash });
    return res.redirect("/login");
}

async function handleLogin(req, res) {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    const user = users.find((savedUser) => savedUser.email === email);

    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
        return res.status(401).send("Invalid email or password.");
    }

    const token = jwt.sign(
        { userId: user.id, name: user.name, email: user.email },
        jwtSecret,
        { expiresIn: "1h" }
    );

    sendPage(res, "Login successful", `
        <h1>Login successful</h1>
        <p>Welcome, ${user.name}.</p>
        <p>Your JSON Web Token:</p>
        <textarea rows="8" cols="70" readonly>${token}</textarea>
        <p><a href="/login">Back to login</a></p>
    `);
}

module.exports = { showLoginForm, showRegisterForm, handleRegister, handleLogin , homePage};
