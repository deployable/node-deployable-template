
const router = require('express').router()

router.get(['','/'], (req, res) => {
  res.send('Hello Route')
})
