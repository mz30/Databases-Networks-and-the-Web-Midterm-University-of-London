const express = require('express');
const moment = require('moment-timezone');
const TIMEZONE = 'Asia/Karachi';

const router = express.Router();

/**
 * Route serving the reader's home page.
 * @name get/reader
 * @function
 * @memberof module:routers/reader~readerRouter
 * @inner
 * @param {string} path - Express path
 */
router.get('/', (req, res) => {
    const articlesQuery = `
        SELECT articles.*, IFNULL(settings.author_name, users.user_name) AS author_name 
        FROM articles 
        LEFT JOIN settings ON articles.author_id = settings.author_id 
        LEFT JOIN users ON articles.author_id = users.user_id
        WHERE published_at IS NOT NULL 
        ORDER BY published_at DESC`;
    // Database interaction: Fetching all published articles
    // Inputs: None
    // Outputs: All published articles
    global.db.all(articlesQuery, [], (err, articles) => {
        if (err) 
        {
            console.error(err);
            return res.status(500).send("Error retrieving articles");
        }
        articles.forEach(article => {
            article.published_at = moment.utc(article.published_at).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
        });
        res.render('readerHome', {
            blogTitle: 'Blog',
            articles: articles,
            moment: moment
        });
    });
});

/**
 * Route for viewing an article.
 * @name get/reader/article/:id
 * @function
 * @memberof module:routers/reader~readerRouter
 * @inner
 * @param {string} path - Express path
 */
router.get('/article/:id', (req, res) => {
    const articleQuery = "SELECT articles.*, users.user_name FROM articles JOIN users ON articles.author_id = users.user_id WHERE article_id = ?";
    const commentsQuery = "SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC";
    const likesQuery = "SELECT COUNT(*) AS like_count FROM likes WHERE article_id = ?";
    const viewsInsertQuery = "INSERT INTO views (article_id, user_id) VALUES (?, ?)";
    const viewsUpdateQuery = "UPDATE articles SET views = views + 1 WHERE article_id = ?";
    // Database interaction: Fetching the article
    // Inputs: Article ID from the URL parameters
    // Outputs: Article data if found, else null
    global.db.get(articleQuery, [req.params.id], (err, article) => {
        if (err) 
        {
            console.error(err);
            res.status(500).send("Error retrieving article");
            return;
        }
        if (!req.session.user) 
        {
            req.session.user = { user_id: null };
        }
        if (!req.session.viewedArticles) 
        {
            req.session.viewedArticles = [];
        }
        if (!req.session.viewedArticles.includes(req.params.id)) 
        {
            // Database interaction: Inserting a view into the database
            // Inputs: Article ID from the URL parameters and user ID from the session
            // Outputs: None
            global.db.run(viewsInsertQuery, [req.params.id, req.session.user ? req.session.user.user_id : null], (err) => {
                if (err) 
                {
                    console.error(err);
                }
            });
            // Database interaction: Updating the views count of the article in the database
            // Inputs: Article ID from the URL parameters
            // Outputs: None
            global.db.run(viewsUpdateQuery, [req.params.id], (err) => {
                if (err) 
                {
                    console.error(err);
                }
            });
            req.session.viewedArticles.push(req.params.id);
        }
        // Database interaction: Fetching the comments of the article
        // Inputs: Article ID from the URL parameters
        // Outputs: Comments of the article if found, else null
        global.db.all(commentsQuery, [req.params.id], (err, comments) => {
            if (err) 
            {
                console.error(err);
                res.status(500).send("Error retrieving comments");
                return;
            }
            // Database interaction: Fetching the likes count of the article
            // Inputs: Article ID from the URL parameters
            // Outputs: Likes count of the article
            global.db.get(likesQuery, [req.params.id], (err, likeData) => {
                if (err) 
                {
                    console.error(err);
                    res.status(500).send("Error retrieving likes");
                    return;
                }
                article.published_at = moment(article.published_at).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
                comments.forEach(comment => {
                    comment.created_at = moment(comment.created_at).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
                });
                const likeMessage = req.session.likeMessage;
                req.session.likeMessage = null;
                res.render('articlePage', {
                    article: article,
                    comments: comments,
                    likeCount: likeData.like_count,
                    moment: moment,
                    likeMessage: likeMessage
                });
            });
        });
    });
});

/**
 * Route for liking an article.
 * @name post/reader/article/:id/like
 * @function
 * @memberof module:routers/reader~readerRouter
 * @inner
 * @param {string} path - Express path
 */
router.post('/article/:id/like', (req, res) => {
    const userId = req.session.user ? req.session.user.user_id : null;
    if (!userId) 
    {
        req.session.likeMessage = 'Please log in to like articles.';
        return res.redirect(`/reader/article/${req.params.id}`);
    }
    const checkLikeQuery = "SELECT COUNT(*) AS count FROM likes WHERE article_id = ? AND user_id = ?";
    const insertLikeQuery = "INSERT INTO likes (article_id, user_id) VALUES (?, ?)";
    // Database interaction: Checking if the user has already liked the article and inserting a like if not
    // Inputs: Article ID from the URL parameters and user ID from the session
    // Outputs: None
    global.db.get(checkLikeQuery, [req.params.id, userId], (err, row) => {
        if (err) 
        {
            console.error(err);
            res.status(500).send("Error checking like status");
            return;
        }
        if (row.count > 0) 
        {
            return res.redirect(`/reader/article/${req.params.id}`);
        }
        // Database interaction: Inserting a like into the database
        // Inputs: Article ID from the URL parameters and user ID from the session
        // Outputs: None
        global.db.run(insertLikeQuery, [req.params.id, userId], (err) => {
            if (err) 
            {
                console.error(err);
                res.status(500).send("Error liking article");
                return;
            }
            res.redirect(`/reader/article/${req.params.id}`);
        });
    });
});

/**
 * Route for commenting on an article.
 * @name post/reader/article/:id/comment
 * @function
 * @memberof module:routers/reader~readerRouter
 * @inner
 * @param {string} path - Express path
 */
router.post('/article/:id/comment', (req, res) => {
    const query = "INSERT INTO comments (article_id, commenter_name, comment) VALUES (?, ?, ?)";
    const params = [req.params.id, req.body.commenter_name, req.body.comment];
    // Database interaction: Inserting a new comment into the database
    // Inputs: Article ID from the URL parameters, commenter name, and comment from the request body
    // Outputs: None
    global.db.run(query, params, (err) => {
        if (err)
        {
            console.error(err);
            res.status(500).send("Error adding comment");
            return;
        }
        res.redirect(`/reader/article/${req.params.id}`);
    });
});

module.exports = router;