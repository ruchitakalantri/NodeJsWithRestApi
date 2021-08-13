const { error } = require('console');
const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req , res , next) => {
    // FETCH ACTUAL POST
    Post
        .find()
        .then(posts => {
            res.status(200).json({message : 'Fetched Post Success' , posts : posts})
        })
        .catch( err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createPost = (req,res,next) => {
    const errrors = validationResult(req);
    if(!errrors.isEmpty) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        throw error;
    }
    // send data : post data
    const title = req.body.title;
    const content = req.body.content;

    const post = new Post ({
        title : title ,
        content : content ,
        imageUrl : 'images/ring1.jpeg' ,
        creator : { name : 'Ruchita'} 
    })
    //create post in db
    post
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json ({
                message  : 'post data successfully' ,
                post : result
            });
        })
        .catch( err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};

exports.getPost = (req , res , next) => {
    const postId = req.params.postId;
    //find post of that id from database
    Post
        .findById(postId) 
        .then(post => {
            if(!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error; // with this throw we end up in catch block
            }
            res.status(200).json({message : 'Post Fetched' , post : post});


        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}