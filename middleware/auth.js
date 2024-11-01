/**
 * Middleware to check if the user is authenticated.
 * If the user is authenticated, it sets the user object in the response locals and calls the next middleware.
 * If the user is not authenticated, it redirects the user to the login page.
 * 
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 * @property {boolean} req.session.isAuthenticated - Indicates if the user is authenticated
 * @property {Object} req.session.user - The authenticated user's session data
 * @property {Object} res.locals.user - The authenticated user's local data
 */
module.exports = function(req, res, next) 
{
    if (req.session.isAuthenticated) 
    {
        // Purpose: To set the user's session data in the response locals
        // Inputs: User's session data
        // Outputs: User's local data
        res.locals.user = req.session.user;
        next();
    } 
    else 
    {
        // Purpose: To redirect unauthenticated users to the login page
        // Inputs: None
        // Outputs: Redirection to '/auth/login'
        res.redirect('/auth/login');
    }
};