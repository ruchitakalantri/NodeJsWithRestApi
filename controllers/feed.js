const { validationResult } = require('express-validator/check');

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

    //create post in db

    res.status(201).json ({
        message  : 'post data successfully' ,
        post : { 
            _id : new Date().toISOString() ,
            title : title ,
            content : content ,
            creator : { name : 'Ruchita'} ,
            createdAt : new Date()
        }
    });

};