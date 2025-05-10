module.exports = function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/login'); // Redirect to login page if not authenticated
    }
}