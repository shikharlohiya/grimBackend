const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
const bodyParser = require('body-parser') 
const session = require('express-session')
const db = require('./models/db.js')
var timeout = require('connect-timeout');

app.use(express.static('public'));

const serveIndex = require('serve-index');

app.use('/ftp', express.static('public'), serveIndex('public', {'icons': true}));
app.use(timeout('4m'));

require('dotenv/config')

app.use(cors())
app.use(morgan('tiny'))


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))// Body parser use JSON data

app.use(require('./controller'))
require('express-debug')(app, {/* settings */});
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.listen(process.env.PORT, function(){
	console.log("Connected on port " +process.env.PORT + ".")
})