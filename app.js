// Load environment variables from the .env file using the dotenv package
require('dotenv').config({ quiet: true });
const express = require('express'); // Express framework for building web applications
const session = require('express-session'); // Middleware for managing user sessions
 
const app = express(); // Create an instance of the Express application
const PORTA = process.env.PORTA || 3000; // Server port, defaulting to 3000 if not set in .env
 
// The ORDER of app.use() matters: a request goes through them from top to bottom.
 
// 1. Configuration
app.set('view engine', 'ejs'); // Set EJS as the templating engine for rendering views
app.use(express.static('public')); // Serve static files (CSS, JS, images) from the 'public' directory
app.use(express.urlencoded({ extended: true })); // Parse form submissions into req.body
 
// Configure session management with express-session.
// It must come BEFORE the routes, which use req.session.
app.use(session({
    secret: process.env.SESSION_SECRET, // Signs the session ID cookie
    resave: false, // Do not save the session if it wasn't modified during the request
    saveUninitialized: false, // Do not create a session until something is stored in it
    cookie: { httpOnly: true }, // Browser JavaScript cannot read the session cookie
    // In production with HTTPS, also set secure: true
}));
 
// 2. Data available in ALL views (also before the routes)
app.use((req, res, next) => {
    res.locals.utilizador = req.session.utilizador || null; // Logged-in user, or null
    res.locals.msg = req.session.msg || null; // Success or error message
    delete req.session.msg; // Shown once, then removed
    next(); // Proceed to the next middleware or route handler
});
 
// 3. Routes
app.get('/', (req, res) => {
    res.render('index', { titulo: 'Início' });
});
 
app.get('/privacidade', (req, res) => {
    res.render('privacidade', { titulo: 'Política de privacidade' });
});
 
app.use('/', require('./routes/auth')); // Registration, login and logout (routes/auth.js)
app.use('/condominios', require('./routes/condominios')); // Condominios (routes/condominios)
// The other routers (condominios, ocorrencias) are added here, one per commit,
// as each routes/*.js file is created.
 
// 4. No route matched: page not found
app.use((req, res) => {
    res.status(404).render('404', { titulo: 'Página não encontrada' });
});
 
// 5. Unexpected error in a route: log the details, show only a generic message
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Ocorreu um erro no servidor.');
});
 
// Start the server and listen on the configured port
app.listen(PORTA, () => {
    console.log(`Servidor a correr em http://localhost:${PORTA}`);
});
