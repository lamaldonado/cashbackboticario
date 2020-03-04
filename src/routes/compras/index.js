const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  console.log(req.decoded);
  console.log(req)
  res.status(200).json({
    success: true,
    message: 'autorizado'
  });
});

module.exports = router;
