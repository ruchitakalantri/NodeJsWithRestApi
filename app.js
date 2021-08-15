const path = require('path');

const express = require('express');

const mongoose = require('mongoose');

const multer = require('multer');

const bodyParser = require('body-parser');

const feedRoutes = require('./routes/feed');

const authRoutes = require('./routes/auth');

const app = express();

//configure file storage with multer disk storage
const fileStorage = multer.diskStorage ({
    // file destination -- cb: callback
    // in cb first argument is error : which is null
    destination : (req , file , cb) => { 
        cb(null , 'images');
    } ,
    // filename : how the file should be anme
    filename : (req , file , cb) => {
        // date-originalFilename
        cb(null , new Date().toISOString() + '-' + file.originalname);
    }
});

// fileFilter
const fileFilter = (req , file , cb ) => {
    if( file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg') {
            // valid file
            cb( null , true);
    }
    else {
        console.log('INVALID')
        // in-valid file
        cb(null, false);
    }
}

// middleware to parse incoming data
// app.use(bodyParser.urlencoded) // good for x-www-form-uelencoded
app.use(bodyParser.json()); // application/json



// for parsing multipart/form-data
// register multer .. for single file 
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
  );

//middleware for image request
// path : to construct absoulute path
app.use('/images', express.static(path.join(__dirname, 'images')));


// add headers for server side to solve CORS error
app.use((req , res , next) => {
    // modify and add new header
    res.setHeader('Access-Control-Allow-Origin' , '*');
    res.setHeader('Access-Control-Allow-Methods' , 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers' , 'Content-Type , Authorization');
    next();
});

app.use('/feed' , feedRoutes);

app.use('/auth' , authRoutes);

// error handeling middleware
app.use((error, req , res, next) => {
    console.log(error);
    const status = error.statusCode || 500 ;
    const message = error.message; 
    const data = error.data;
    res.status(status).json({ message : message , data : data});
})

// establish a connection
mongoose
    .connect('mongodb+srv://ruchita:saurabh@cluster0.t1cyv.mongodb.net/messages')
    .then(result => {
        //start node server
        app.listen(8080);
    })
    .catch(err => console.log(err));

