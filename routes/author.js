const express = require('express');
const moment = require('moment-timezone');
const { body, validationResult } = require('express-validator');
const TIMEZONE = 'Asia/Karachi';

const router = express.Router();

/**
 * Route serving the author's home page.
 * @name get/author
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {string} path - Express path
 */
router.get('/', (req, res) => {
    const queryPublished = `
        SELECT articles.*, users.user_name 
        FROM articles 
        JOIN users ON articles.author_id = users.user_id 
        WHERE published_at IS NOT NULL AND articles.author_id = ?`;
    const queryDrafts = `
        SELECT articles.*, users.user_name 
        FROM articles 
        JOIN users ON articles.author_id = users.user_id 
        WHERE published_at IS NULL AND articles.author_id = ?`;
    const querySettings = "SELECT * FROM settings WHERE author_id = ?";
    // Database interaction: Fetching published articles, drafts & any settings of the current user
    // Inputs: User ID from the session
    // Outputs: Published articles, drafts & any setting of the current user
    global.db.all(queryPublished, [req.session.user.user_id], (err, publishedArticles) => {
        if (err) throw err;
        global.db.all(queryDrafts, [req.session.user.user_id], (err, draftArticles) => {
            if (err) throw err;
            global.db.get(querySettings, [req.session.user.user_id], (err, settings) => {
                if (err) throw err;
                publishedArticles.forEach(article => {
                    article.created_at = moment(article.created_at).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
                    article.updated_at = moment(article.updated_at).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
                    article.published_at = moment(article.published_at).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
                });
                draftArticles.forEach(article => {
                    article.created_at = moment(article.created_at).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
                    article.updated_at = moment(article.updated_at).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
                });
                res.render('authorHome', {
                    publishedArticles: publishedArticles,
                    draftArticles: draftArticles,
                    TIMEZONE: TIMEZONE,
                    moment: moment,
                    blogTitle: settings ? settings.blog_title : 'Set your Blog Title in Settings',
                    authorName: settings ? settings.author_name : 'Default Author Name',
                    publishMessage: res.locals.publishMessage
                });
            });
        });
    });
});

/**
 * Route for creating a new draft.
 * @name post/author/create-draft
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {string} path - Express path
 */
router.post('/create-draft', (req, res) => {
    if (!req.session.user || !req.session.user.user_id) 
    {
        res.status(401).send("Unauthorized");
        return;
    }
    const query = "INSERT INTO articles (title, content, author_id) VALUES (?, ?, ?)";
    const params = ['New Draft', '', req.session.user.user_id];
    // Database interaction: Inserting a new draft into the database
    // Inputs: Title, content, and author ID
    // Outputs: None
    global.db.run(query, params, function(err) 
    {
        if (err) 
        {
            console.error(err);
            res.status(500).send("Error creating draft");
            return;
        }
        res.redirect(`/author/edit/${this.lastID}`);
    });
});

/**
 * Route for editing an article.
 * @name get/author/edit/:id
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {string} path - Express path
 */
router.get('/edit/:id', (req, res) => {
    const query = "SELECT * FROM articles WHERE article_id = ? AND author_id = ?";
    // Database interaction: Fetching the article to be edited
    // Inputs: Article ID from the URL parameters and author ID from the session
    // Outputs: Article data if found, else null
    global.db.get(query, [req.params.id, req.session.user.user_id], (err, article) => {
        if (err) 
        {
            console.error(err);
            res.status(500).send("Error retrieving article");
            return;
        }
        res.render('editArticle', { article: article, errors: [] });
    });
});

/**
 * Route for updating an article.
 * @name post/author/edit/:id
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware
 */
router.post('/edit/:id', [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required')
],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) 
        {
            const query = "SELECT * FROM articles WHERE article_id = ? AND author_id = ?";
            // Database interaction: Fetching the article to be updated
            // Inputs: Article ID from the URL parameters and author ID from the session
            // Outputs: Article data if found, else null
            global.db.get(query, [req.params.id, req.session.user.user_id], (err, article) => {
                if (err) 
                {
                    console.error(err);
                    res.status(500).send("Error retrieving article");
                    return;
                }
                res.render('editArticle', {
                    article: article,
                    errors: errors.array()
                });
            });
            return;
        }
        const query = "UPDATE articles SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE article_id = ? AND author_id = ?";
        const params = [req.body.title, req.body.content, req.params.id, req.session.user.user_id];
        // Database interaction: Updating the article in the database
        // Inputs: Title, content, article ID from the URL parameters, and author ID from the session
        // Outputs: None
        global.db.run(query, params, (err) => {
            if (err) 
            {
                console.error(err);
                res.status(500).send("Error updating article");
                return;
            }
            res.redirect('/author');
        });
    });

/**
 * Route for publishing an article.
 * @name post/author/publish/:id
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {string} path - Express path
 */
router.post('/publish/:id', (req, res) => {
    const query = "SELECT title, content FROM articles WHERE article_id = ? AND author_id = ?";
    // Database interaction: Fetching the title and content of the article to be published
    // Inputs: Article ID from the URL parameters and author ID from the session
    // Outputs: Title and content of the article if found, else null
    global.db.get(query, [req.params.id, req.session.user.user_id], (err, article) => {
        if (err) 
        {
            console.error(err);
            res.status(500).send("Error retrieving article");
            return;
        }
        if (!article.title || !article.content) 
        {
            req.session.publishMessage = 'Title and content are required to publish the article.';
            res.redirect('/author');
            return;
        }
        const updateQuery = "UPDATE articles SET published_at = CURRENT_TIMESTAMP WHERE article_id = ? AND author_id = ?";
        // Database interaction: Updating the published_at timestamp of the article in the database
        // Inputs: Article ID from the URL parameters and author ID from the session
        // Outputs: None
        global.db.run(updateQuery, [req.params.id, req.session.user.user_id], (err) => {
            if (err) 
            {
                console.error(err);
                res.status(500).send("Error publishing article");
                return;
            }
            res.redirect('/author');
        });
    });
});

/**
 * Route for deleting an article.
 * @name post/author/delete/:id
 * @function
 * @memberof module:routers/author~authorRouter
 * @inner
 * @param {string} path - Express path
 */
router.post('/delete/:id', (req, res) => {
    const query = "DELETE FROM articles WHERE article_id = ? AND author_id = ?";
    // Database interaction: Deleting the article from the database
    // Inputs: Article ID from the URL parameters and author ID from the session
    // Outputs: None
    global.db.run(query, [req.params.id, req.session.user.user_id], (err) => {
        if (err) 
        {
            console.error(err);
            res.status(500).send("Error deleting article");
            return;
        }
        res.redirect('/author');
    });
});

module.exports = router;