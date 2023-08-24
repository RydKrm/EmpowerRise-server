require('dotenv').config()
const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;

const adminRouter = require('./admin');


app.use(cors())
app.use(express.json())

  app.use('/',adminRouter);
  


app.get('/', (req, res) => {
    res.send('Empower Rise Website Running!')
})

app.listen(port, () => {
    console.log(`Empower Rise Website listening on port ${port}`)
})
