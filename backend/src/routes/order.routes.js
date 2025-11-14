const router = require('express').Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/order.controller');

router.post('/', auth, ctrl.create);
router.get('/me', auth, ctrl.myOrders);
module.exports = router;
