/**
 * Middleware to set the user object in the response locals.
 * If the user is authenticated, it sets the user object in the response locals.
 * If the user is not authenticated, it sets the user object in the response locals to null.
 * If there is a publishMessage in the session, it sets the publishMessage in the response locals and clears it from the session.
 * 
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Express next middleware function
 * @property {boolean} req.session.isAuthenticated - Indicates if the user is authenticated
 * @property {Object} req.session.user - The authenticated user's session data
 * @property {string} req.session.publishMessage - The message to be published
 * @property {Object} res.locals.user - The authenticated user's local data
 * @property {string} res.locals.publishMessage - The message to be published
 */
module.exports = function(req, res, next) 
{
    if (req.session.isAuthenticated) 
    {
        // Purpose: To set the user's session data in the response locals
        // Inputs: User's session data
        // Outputs: User's local data
        res.locals.user = req.session.user || { user_name: 'Guest' };
    } 
    else 
    {
        // Purpose: To clear the user's local data if not authenticated
        // Inputs: None
        // Outputs: User's local data set to null
        res.locals.user = null;
    }
    if (req.session.publishMessage) 
    {
        // Purpose: To set the publish message in the response locals and clear it from the session
        // Inputs: Publish message from the session
        // Outputs: Publish message in the response locals
        res.locals.publishMessage = req.session.publishMessage;
        req.session.publishMessage = null;
    }
    next();
};