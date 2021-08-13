exports.getPosts = (req , res , next) => {
    //return data : return response
    res.status(200).json({
        posts : [{
            title : 'First Post' ,
            content : 'This is first post!!'
        }]
    });
};

exports.createPost = (req,res,next) => {
    // send data : post data
    const title = req.body.title;
    const content = req.body.content;

    //create post in db

    res.status(201).json ({
        message  : 'post data successfully' ,
        post : { 
            id : new Date().toISOString() ,
            title : title ,
            content : content
        }
    });

};