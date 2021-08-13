const express = require('express');

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const app = express();

// middleware to parse incoming data
// app.use(bodyParser.urlencoded) // good for x-www-form-uelencoded
app.use(bodyParser.json()); // application/json

// add headers for server side to solve CORS error
app.use((req , res , next) => {
    // modify and add new header
    res.setHeader('Access-Control-Allow-Origin' , '*');
    res.setHeader('Access-Control-Allow-Methods' , 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers' , 'Content-Type , Authorization');
    next();
});

app.use('/feed' , feedRoutes);

// establish a connection
mongoose
    .connect('mongodb+srv://ruchita:saurabh@cluster0.t1cyv.mongodb.net/messages')
    .then(result => {
        //start node server
        app.listen(8080);
    })
    .catch(err => console.log(err));

