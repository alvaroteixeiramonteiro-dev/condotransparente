// Authentication routes: registration, login and logout
const express = require('express');
const bcrypt = require('bcryptjs'); // Password hashing (bcrypt algorithm, pure JavaScript)
const db = require('../db'); // Shared MySQL connection pool
const router = express.Router(); // Mini-application that app.js mounts at '/'
 
// ---------- Registration ----------
 
// Show the empty registration form.
// registo.ejs needs titulo, erros, nome and email, even when they are empty.
router.get('/registo', (req, res) => {
    res.render('registo', { titulo: 'Criar conta', erros: [], nome: '', email: '' });
});
 
// Receive the form, validate it on the server and create the account.
// async because the database and bcrypt return Promises (await).
router.post('/registo', async (req, res) => {
    // Read the fields; "|| ''" avoids errors if a field is missing.
    // The password is NOT trimmed: spaces are part of it.
    const nome = (req.body.nome || '').trim();
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';
    const erros = []; // All the errors are collected and shown together
 
    // 1. Validate on the server (browser validation can be bypassed)
    if (nome === '' || nome.length > 100) {
        erros.push('O nome é obrigatório e não pode ter mais de 100 caracteres.');
    }
 
    // Simple email format: something@something.something, with no spaces
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        erros.push('O email inserido não é válido.');
    }
 
    if (password.length < 8) {
        erros.push('A password tem de ter pelo menos 8 caracteres.');
    }
 
    // The checkbox only appears in req.body when it is ticked
    if (!req.body.consentimento) {
        erros.push('Tem de aceitar a política de privacidade.');
    }
 
    // 2. The email must not be taken yet. Only worth a query if the rest is valid.
    // The "?" placeholder and the array keep the value separate from the SQL
    // (protection against SQL Injection).
    if (erros.length === 0) {
        const [linhas] = await db.query('SELECT id_utilizador FROM utilizadores WHERE email = ?', [email]);
        if (linhas.length > 0) {
            erros.push('Já existe uma conta com esse email registado.');
        }
    }
 
    // With errors: show the form again with what the user typed.
    // The password is never sent back. "return" stops the function here.
    if (erros.length > 0) {
        return res.render('registo', { titulo: 'Criar conta', erros, nome, email });
    }
 
    // 3. Save: only the hash of the password is stored (10 = bcrypt cost).
    // NOW() records the moment the user accepted the privacy policy.
    const hash = await bcrypt.hash(password, 10);
    await db.query(
        'INSERT INTO utilizadores (nome, email, password_hash, consentimento_em) VALUES (?, ?, ?, NOW())',
        [nome, email, hash]
    );
 
    // Post/Redirect/Get: the message lives in the session and is shown once (see app.js)
    req.session.msg = { tipo: 'sucesso', texto: 'Conta criada. Pode iniciar sessão.' };
    res.redirect('/login');
});
 
// ---------- Login ----------
 
// Show the empty login form
router.get('/login', (req, res) => {
    res.render('login', { titulo: 'Entrar', erros: [], email: '' });
});
 
router.post('/login', async (req, res, next) => {
    const email = (req.body.email || '').trim();
    const password = req.body.password || '';
 
    // 1. Look the user up by email
    const [linhas] = await db.query(
        'SELECT id_utilizador, nome, password_hash FROM utilizadores WHERE email = ?',
        [email]
    );
    const utilizador = linhas[0]; // undefined if the email does not exist
 
    // 2. Compare the typed password with the stored hash.
    // The message is the same in both cases, so nobody can find out which emails have an account.
    if (!utilizador || !(await bcrypt.compare(password, utilizador.password_hash))) {
        return res.render('login', { titulo: 'Entrar', erros: ['Email ou password errados.'], email });
    }
 
    // 3. Create a NEW session (new id) and keep the user in it.
    // This prevents session fixation (reusing an id set before the login).
    req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.utilizador = { id: utilizador.id_utilizador, nome: utilizador.nome };
        req.session.msg = { tipo: 'sucesso', texto: `Sessão iniciada. Bem-vindo, ${utilizador.nome}!` };
        res.redirect('/'); // Will become '/condominios' when that page exists
    });
});
 
// ---------- Logout ----------
 
// Throw away the old session and start an empty one, which only carries the message
router.get('/logout', (req, res, next) => {
    req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.msg = { tipo: 'sucesso', texto: 'Sessão terminada.' };
        res.redirect('/');
    });
});

module.exports = router;