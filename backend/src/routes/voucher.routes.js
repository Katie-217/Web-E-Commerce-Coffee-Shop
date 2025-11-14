// src/routes/voucher.routes.js
const router = require('express').Router();
const { apply } = require('../controllers/voucher.controller');
const auth = require('../middlewares/auth'); // optional nếu muốn bắt buộc đăng nhập
router.post('/apply', /*auth,*/ apply);
module.exports = router;
