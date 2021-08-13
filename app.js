const path = require('path');

const express = require('express');

const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const app = express();

// middleware to parse incoming data
// app.use(bodyParser.urlencoded) // good for x-www-form-uelencoded
app.use(bodyParser.json()); // application/json

//middleware for image request
// path : to construct absoulute path
app.use('/images' , express.static(path.join(__dirname , 'images')));

// add headers for server side to solve CORS error
app.use((req , res , next) => {
    // modify and add new header
    res.setHeader('Access-Control-Allow-Origin' , '*');
    res.setHeader('Access-Control-Allow-Methods' , 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers' , 'Content-Type , Authorization');
    next();
});

app.use('/feed' , feedRoutes);

// error handeling middleware
app.use((error, req , res, next) => {
    console.log(error);
    const status = error.statusCode || 500 ;
    const message = error.message; 
    res.status(status).json({ message : message});
})

// establish a connection
mongoose
    .connect('mongodb+srv://ruchita:saurabh@cluster0.t1cyv.mongodb.net/messages')
    .then(result => {
        //start node server
        app.listen(8080);
    })
    .catch(err => console.log(err));

