require('dotenv').config()
const express = require('express')
const cors = require('cors')
const route = require('./routes')
require('./dbconnection')

const bookreviewServer = express()
bookreviewServer.use(cors())
bookreviewServer.use(express.json())
bookreviewServer.use(route)

const PORT = process.env.PORT || 4000;
bookreviewServer.listen(PORT, ()=>{
console.log(`Server running Successfully at port number ${PORT} `);

})