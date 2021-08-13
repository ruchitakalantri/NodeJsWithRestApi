const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req , res , next) => {
    //return data : return response
    res.status(200).json({
        posts : [{
            _id : 1 ,
            title : 'First Post' ,
            content : 'This is first post!!' ,
            imageUrl : 'images/ring1.jpeg' ,
            creator : {
                name : 'Ruchita'
            } ,
            createdAt : new Date()
        }]
    });
};

exports.createPost = (req,res,next) => {
    const errrors = validationResult(req);
    if(!errrors.isEmpty) {
        return res.
                status(422).
                json ({
                    message : 'Validation Failed ' , 
                    errors : errors.array()
                })
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
        .catch( err => console.log(err))

  

};