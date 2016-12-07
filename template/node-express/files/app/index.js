
const express = require('express')
const app = express.app()

app.use( require('./route') )

app.use((req, res, next, error) => {
  res.status(500).send('Error')
})

