const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const router = express.Router();

/**
 * Route serving login form.
 * @name get/auth/login
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {string} path - Express path
 */
router.get('/login', (req, res) => {
    res.render('login', { errors: [] });
});

/**
 * Route processing login form.
 * @name post/auth/login
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 */
router.post('/login',
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required').trim().escape(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) 
        {
            return res.status(400).render('login', { errors: errors.array() });
        }
        const { email, password } = req.body;
        const query = "SELECT * FROM users WHERE email = ?";
        // Database interaction: Fetching user with the provided email
        // Inputs: Email provided by the user
        // Outputs: User data if found, else null
        global.db.get(query, [email], async (err, user) => {
            if (err || !user) 
            {
                return res.status(401).render('login', { errors: [{ msg: 'Invalid credentials' }] });
            }
            // Compare hashed password for regular users
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) 
            {
                req.session.isAuthenticated = true;
                req.session.user = user;
                return res.redirect('/author');
            } 
            else 
            {
                return res.status(401).render('login', { errors: [{ msg: 'Invalid credentials' }] });
            }
        });
    });

/**
 * Route serving register form.
 * @name get/auth/register
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {string} path - Express path
 */
router.get('/register', (req, res) => {
    res.render('register', { errors: [] });
});

/**
 * Route processing register form.
 * @name post/auth/register
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 */
router.post('/register',
    body('user_name').notEmpty().withMessage('User name is required').trim().escape(),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').trim().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) 
        {
            return res.status(400).render('register', { errors: errors.array() });
        }
        const { user_name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (user_name, email, password) VALUES (?, ?, ?)";
        // Database interaction: Inserting new user into the database
        // Inputs: User name, email, and hashed password provided by the user
        // Outputs: None
        global.db.run(query, [user_name, email, hashedPassword], function(err) 
        {
            if (err) 
            {
                return res.status(500).render('register', { errors: [{ msg: 'Error registering user' }] });
            }
            res.redirect('/auth/login');
        });
    });

const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback" }, 
    (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const query = "SELECT * FROM users WHERE email = ?";
    // Database interaction: Fetching user with the provided email
    // Inputs: Email provided by Google OAuth
    // Outputs: User data if found, else null
    global.db.get(query, [email], (err, user) => {
        if (user) 
        {
            return done(null, user);
        } 
        else 
        {
            const newUser = {
                user_name: profile.displayName,
                email: email,
                password: null
            };
            const insertQuery = "INSERT INTO users (user_name, email, password) VALUES (?, ?, ?)";
            // Database interaction: Inserting new user into the database
            // Inputs: User name and email provided by Google OAuth
            // Outputs: None
            global.db.run(insertQuery, [newUser.user_name, newUser.email, newUser.password], function(err) 
            {
                if (err) 
                {
                    return done(err, null);
                }
                newUser.user_id = this.lastID;
                return done(null, newUser);
            });
        }
    });
}));

/**
 * Route for Google OAuth.
 * @name get/auth/google
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 */
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * Route for Google OAuth callback.
 * @name get/auth/google/callback
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 */
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    (req, res) => {
        req.session.isAuthenticated = true;
        req.session.user = req.user;
        res.redirect('/author');
    });

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser((id, done) => {
    const query = "SELECT * FROM users WHERE user_id = ?";
    // Database interaction: Fetching user with the provided user ID
    // Inputs: User ID provided by Passport.js
    // Outputs: User data if found, else null
    global.db.get(query, [id], (err, user) => {
        done(err, user);
    });
});

/**
 * Route for logout.
 * @name get/auth/logout
 * @function
 * @memberof module:routers/auth~authRouter
 * @inner
 * @param {string} path - Express path
 */
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) 
        {
            console.log(err);
        } 
        else 
        {
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.redirect('/auth/login');
        }
    });
});

module.exports = router;