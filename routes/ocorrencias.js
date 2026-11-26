// Ocurrences router: lists, creates, edits and deletes the ocurrences of the logged-in user's condominiums.
// The condominiums routes live in routes/condominios.js.
const express = require('express');
const db = require('../db'); // MySQL connection pool
const exigirLogin = require('../middleware/auth'); // Access control middleware

const router = express.Router();

// Every route in this file requires a logged-in user
router.use(exigirLogin);

// Reads the form fields into an object, without spaces at the ends.
// The owner (id_utilizador) is NOT read here: it always comes from the session.
function lerOcorrencia(body) {
    return {
        titulo: (body.titulo || '').trim(), // || '' avoids an error when the field is missing
        descricao: (body.descricao || '').trim(),
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
    const [ocorrencias] = await db.query(
        `SELECT o.id_ocorrencia, o.titulo, o.prioridade, o.estado, o.data_registo, c.nome AS condominio
         FROM ocorrencias o
         JOIN condominios c ON c.id_condominio = o.id_condominio
         WHERE c.id_utilizador = ?
         ORDER BY o.data_registo DESC`,
        [req.session.utilizador.id]
    );
    res.render('ocorrencias/lista', { titulo: 'Ocorrências', ocorrencias });
});

module.exports = router;