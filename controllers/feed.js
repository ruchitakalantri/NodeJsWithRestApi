exports.getPosts = (req , res , next) => {
    //return data : return response
    res.status(200).json({
        posts : [{
            title : 'First Post' ,
            content : 'This is first post!!'
        }]
    });
};

