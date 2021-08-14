const fs = require('fs');
const path = require('path');
const multer = require('multer');


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
        const error = new Error('Validation Failed , entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    // send data : post data

    if(!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
        console.log('comign here');
    }

    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;

    const post = new Post ({
        title : title ,
        content : content ,
        imageUrl : imageUrl ,
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
        });
};

exports.updatePost = (res , req , next) => {
    const errrors = validationResult(req);
    if(!errrors.isEmpty) {
        const error = new Error('Validation Failed , entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    const postId = req.body.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if(req.file) {
        imageUrl = req.file.path;
    }
    if(!imageUrl) {
        const error = new Error('No File Picked');
        error.statusCode = 422;
        throw error;
    }

    // update into database
    Post
        .findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }
            if(imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            // UPDATE THE POST
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then( result => {
            res.status(200).json({messsage : 'POST UPDATED' , post : result});
        })
        .catch( err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deletePost = (req , res , next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }
            //checked logged in user
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then( result => {
            console.log(result);
            res.status(200).json({message : 'DELETED POST'});
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

const clearImage = filePath => {
    filePath = path.join(__dirname , '..' , filePath);
    // delete ... unlink
    fs.unlink(filePath , err => console.log(err));
};