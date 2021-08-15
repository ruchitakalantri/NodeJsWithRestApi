const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { validationResult } = require("express-validator/check");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      // FETCH ACTUAL POST
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched Post Success",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errrors = validationResult(req);
  if (!errrors.isEmpty) {
    const error = new Error("Validation Failed , entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  // send data : post data

  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  //create post in db
  post
    .save()
    .then((result) => {
      console.log(result);
      //add post
      return User.findById(req.userId);
    })
    .then((user) => {
      // have  user : which was found .. logged in user
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "post data successfully",
        post: post,
        creator : {_id : creator._id , name : creator.name}
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  //find post of that id from database
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error; // with this throw we end up in catch block
      }
      res.status(200).json({ message: "Post Fetched", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (res, req, next) => {
  const postId = req.params.postId;

  const errrors = validationResult(req);
  if (!errrors.isEmpty) {
    const error = new Error("Validation Failed , entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
    console.log("RUCHITA" + imageUrl);
  }
  if (!imageUrl) {
    const error = new Error("No File Picked");
    error.statusCode = 422;
    throw error;
  }

  // update into database
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }
      // token id: creator id
      if(post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      // UPDATE THE POST
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ messsage: "POST UPDATED", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }
       // token id: creator id
       if(post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
        throw error;
      }
      //checked logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "DELETED POST" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  // delete ... unlink
  fs.unlink(filePath, (err) => console.log(err));
};
