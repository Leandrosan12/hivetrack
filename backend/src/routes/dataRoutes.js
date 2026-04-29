const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/dataController');

router.use(auth);

router.get('/summary', c.summary);

router.get('/apiarios', c.listApiarios);
router.post('/apiarios', c.createApiario);
router.delete('/apiarios/:id', c.deleteApiario);

router.get('/agricultores', c.listAgricultores);
router.post('/agricultores', c.createAgricultor);
router.delete('/agricultores/:id', c.deleteAgricultor);

router.get('/colmenas', c.listColmenas);
router.post('/colmenas', c.createColmena);
router.delete('/colmenas/:id', c.deleteColmena);

router.get('/contratos', c.listContratos);
router.post('/contratos', c.createContrato);
router.delete('/contratos/:id', c.deleteContrato);

router.get('/movimientos', c.listMovimientos);
router.post('/movimientos', c.createMovimiento);
router.delete('/movimientos/:id', c.deleteMovimiento);

module.exports = router;