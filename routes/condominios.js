// Condominiums router: lists, creates and edits the condominiums of the logged-in user.
// More routes (delete) are added here, one commit each.
const express = require('express');
const db = require('../db'); // MySQL connection pool
const exigirLogin = require('../middleware/auth'); // Access control middleware

const router = express.Router();

// Every route in this file requires a logged-in user
router.use(exigirLogin);

// Reads the form fields into an object, without spaces at the ends.
// The owner (id_utilizador) is NOT read here: it always comes from the session.
function lerCondominio(body) {
    return {
        nome: (body.nome || '').trim(), // || '' avoids an error when the field is missing
        morada: (body.morada || '').trim(),
    };
}

// Returns a list of error messages (empty if the data is valid).
// The maximums match the column sizes in the database (120 and 200);
// the minimums (3 and 5) are business rules that avoid meaningless values.
// Keep them in sync with data-minimo and maxlength in views/condominios/form.ejs.
function validarCondominio(condominio) {
    const erros = [];

    if (condominio.nome.length < 3 || condominio.nome.length > 120) {
        erros.push('O nome do condomínio é obrigatório e deve ter entre 3 e 120 caracteres.');
    }

    if (condominio.morada.length < 5 || condominio.morada.length > 200) {
        erros.push('A morada é obrigatória e deve ter entre 5 e 200 caracteres.');
    }

    return erros;
}

// GET /condominios - list, with the number of occurrences of each condominium
router.get('/', async (req, res) => {
    // LEFT JOIN keeps condominiums that have no occurrences yet (they show 0).
    // WHERE limits the result to the current user's condominiums (isolation per administrator).
    // The ? is replaced by the value in the array, so the query is parameterized (no SQL injection).
    const [condominios] = await db.query(
        `SELECT c.id_condominio, c.nome, c.morada, COUNT(o.id_ocorrencia) AS total_ocorrencias
         FROM condominios c
         LEFT JOIN ocorrencias o ON o.id_condominio = c.id_condominio
         WHERE c.id_utilizador = ?
         GROUP BY c.id_condominio, c.nome, c.morada
         ORDER BY c.nome`,
        [req.session.utilizador.id]
    );
    res.render('condominios/lista', { titulo: 'Condomínios', condominios });
});

// GET /condominios/novo - show the empty form
router.get('/novo', (req, res) => {
    res.render('condominios/form', {
        titulo: 'Novo condomínio',
        acao: '/condominios/novo', // where the form sends the data
        condominio: lerCondominio({}), // empty fields
        erros: [],
    });
});

// POST /condominios/novo - validate and save a new condominium
router.post('/novo', async (req, res) => {
    const condominio = lerCondominio(req.body);
    const erros = validarCondominio(condominio);

    // Invalid data: show the form again, keeping what was typed
    if (erros.length > 0) {
        return res.render('condominios/form', {
            titulo: 'Novo condomínio',
            acao: '/condominios/novo',
            condominio,
            erros,
        });
    }

    // The owner comes from the session, never from the form: otherwise a user
    // could create condominiums in another administrator's account.
    await db.query(
        'INSERT INTO condominios (id_utilizador, nome, morada) VALUES (?, ?, ?)',
        [req.session.utilizador.id, condominio.nome, condominio.morada]
    );

    // Post/Redirect/Get: redirecting avoids a duplicate if the page is refreshed
    req.session.msg = { tipo: 'sucesso', texto: 'Condomínio criado.' };
    res.redirect('/condominios');
});

// GET /condominios/:id/editar - show the form filled with the condominium's data
router.get('/:id/editar', async (req, res) => {
    // AND id_utilizador = ? makes sure the condominium belongs to the logged-in user.
    // Without it, anyone could open another user's condominium by changing the id in the address.
    const [linhas] = await db.query(
        'SELECT nome, morada FROM condominios WHERE id_condominio = ? AND id_utilizador = ?',
        [req.params.id, req.session.utilizador.id]
    );

    // No row: it does not exist OR it belongs to someone else (same answer for both cases)
    if (linhas.length === 0) {
        req.session.msg = { tipo: 'erro', texto: 'Esse condomínio não existe.' };
        return res.redirect('/condominios');
    }

    res.render('condominios/form', {
        titulo: 'Editar condomínio',
        acao: `/condominios/${req.params.id}/editar`, // the same form is used to create and to edit
        condominio: linhas[0],
        erros: [],
    });
});

// POST /condominios/:id/editar - validate and save the changes
router.post('/:id/editar', async (req, res) => {
    const condominio = lerCondominio(req.body);
    const erros = validarCondominio(condominio);

    // Invalid data: show the form again, keeping what was typed
    if (erros.length > 0) {
        return res.render('condominios/form', {
            titulo: 'Editar condomínio',
            acao: `/condominios/${req.params.id}/editar`,
            condominio,
            erros,
        });
    }

    // The values follow the order of the ? placeholders.
    // AND id_utilizador = ? stops a user from changing another user's condominium.
    const [resultado] = await db.query(
        'UPDATE condominios SET nome = ?, morada = ? WHERE id_condominio = ? AND id_utilizador = ?',
        [condominio.nome, condominio.morada, req.params.id, req.session.utilizador.id]
    );

    // No row matched: it does not exist or it is not the user's
    if (resultado.affectedRows === 0) {
        req.session.msg = { tipo: 'erro', texto: 'Esse condomínio não existe.' };
        return res.redirect('/condominios');
    }

    // Post/Redirect/Get, as in the create route
    req.session.msg = { tipo: 'sucesso', texto: 'Condomínio atualizado.' };
    res.redirect('/condominios');
});

module.exports = router;