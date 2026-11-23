// Condominiums router: lists the condominiums that belong to the logged-in user.
// More routes (create, edit, delete) are added here, one commit each.
const express = require('express');
const db = require('../db'); // MySQL connection pool
const exigirLogin = require('../middleware/auth'); // Access control middleware

const router = express.Router();

// Every route in this file requires a logged-in user
router.use(exigirLogin);

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

module.exports = router;