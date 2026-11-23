// Access control middleware: lets the request through only if a user is logged in.
// Applied to the protected routers (with router.use) and to individual routes.
function exigirLogin(req, res, next) {
    // The login route stores the user in the session, so no user means not logged in
    if (!req.session.utilizador) {
        // One-time message, shown on the login page and then removed (see app.js)
        req.session.msg = { tipo: 'erro', texto: 'Tem de iniciar sessão para poder ver esta página.' };
        // "return" stops the function here, so the request never reaches the route
        return res.redirect('/login');
    }
    next(); // User is logged in: continue to the next middleware or route handler
}

module.exports = exigirLogin; // Export the function so other files can require it