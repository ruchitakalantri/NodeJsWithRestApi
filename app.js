const e = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');

const app = express();

// middleware to parse incoming data
// app.use(bodyParser.urlencoded) // good for x-www-form-uelencoded
app.use(bodyParser.json()); // application/json

app.use('/feed' , feedRoutes);

app.listen(8080);