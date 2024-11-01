const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
dotenv.config();
const app = express();
const port = 3000;

// Set up SQLite
global.db = new sqlite3.Database('./database.db', function(err) 
{
    if (err) 
    {
        console.error(err);
        process.exit(1); // bail out we can't connect to the DB
    } 
    else 
    {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
    }
});

// Security Best Practices
app.use(helmet());
app.disable('x-powered-by');

// Middleware setup
app.use(compression()); // Compress responses
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.set('view engine', 'ejs');

// Static file caching
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1y' }));

// Session management with secure cookies
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensure cookies are secure in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000 // 1 hour
    }
}));

// Prevent caching for dynamic responses
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// Middleware and Routes setup
const authMiddleware = require('./middleware/auth');
const setUserMiddleware = require('./middleware/setUser');

const authRoutes = require('./routes/auth');
const authorRoutes = require('./routes/author');
const readerRoutes = require('./routes/reader');
const settingsRoutes = require('./routes/settings');

app.use(setUserMiddleware); // Ensure setUserMiddleware runs before routes

app.use('/auth', authRoutes); // Public route
app.use('/author', authMiddleware, authorRoutes); // Protected route
app.use('/reader', readerRoutes); // Public route
app.use('/settings', authMiddleware, settingsRoutes); // Protected route

// Route for getting user data
app.get('/api/user', (req, res) => {
    if (req.session.isAuthenticated) {
        res.json({ user: req.session.user });
    } 
    else 
    {
        res.status(401).json({ error: 'Unauthorized' });
    }
    res.setHeader('Cache-Control', 'no-store');
});

// Route for serving the main home page
app.get('/', (req, res) => {
    res.render('mainHome');
});

// Start the server
app.listen(port, () => {
    console.log(`Blogging tool listening at http://localhost:${port}`);
});