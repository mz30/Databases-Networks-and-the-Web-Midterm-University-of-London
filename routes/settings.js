const express = require('express');

const router = express.Router();

/**
 * Route serving the settings page.
 * @name get/settings
 * @function
 * @memberof module:routers/settings~settingsRouter
 * @inner
 * @param {string} path - Express path
 */
router.get('/', (req, res) => {
    const query = "SELECT * FROM settings WHERE author_id = ?";
    // Database interaction: Fetching the settings of the current user
    // Inputs: Author ID from the session
    // Outputs: Settings of the current user if found, else null
    global.db.get(query, [req.session.user.user_id], (err, settings) => {
        if (err) 
        {
            console.error("Error retrieving settings:", err);
            res.status(500).send("Error retrieving settings");
            return;
        }
        if (!settings) 
        {
            settings = { blog_title: 'Default Blog Title', author_name: 'Set your name' };
        }
        res.render('settingsPage', { settings: settings });
    });
});

/**
 * Route for updating the settings.
 * @name post/settings
 * @function
 * @memberof module:routers/settings~settingsRouter
 * @inner
 * @param {string} path - Express path
 */
router.post('/', (req, res) => {
    const blogTitle = req.body.blog_title;
    const authorName = req.body.author_name;
    const authorId = req.session.user.user_id;
    console.log("Received data:", { blogTitle, authorName, authorId });
    if (!blogTitle || !authorName || !authorId) 
    {
        console.error("Missing required fields");
        return res.status(400).send("Missing required fields");
    }
    const query = `
        INSERT INTO settings (blog_title, author_name, author_id)
        VALUES (?, ?, ?)
        ON CONFLICT(author_id) DO UPDATE SET
        blog_title = excluded.blog_title,
        author_name = excluded.author_name;`;
    const params = [blogTitle, authorName, authorId];
    // Database interaction: Inserting or updating the settings in the database
    // Inputs: Blog title, author name, and author ID from the request body and session
    // Outputs: None
    global.db.run(query, params, function(err) 
    {
        if (err) 
        {
            console.error("Error updating settings:", err);
            res.status(500).send("Error updating settings");
            return;
        }
        console.log("Settings updated successfully");
        res.redirect('/author');
    });
});

module.exports = router;