const express = require('express');
const db = require('../db');
const exigirLogin = require('../middleware/auth');

const router = express.Router();

router.use(exigirLogin);

router.get('/', async (req, res) => {
    const [condominios] = await db.query(
    `SELECT c.id_condominio, c.nome, c.morada, COUNT(o.id_condominio) AS total_ocorrencias
        FROM condominios c
        LEFT JOIN ocorrencias o ON o.id_condominio = c.id_condominio
        WHERE c.id_utilizador = ?
        GROUP BY c.id_condominio, c.nome, c.morada
        ORDER BY c.nome`, [req.session.utilizador.id]
    );
    res.render('condominios/lista', { titulo: 'Condomínios', condominios });
});    

module.exports = router;