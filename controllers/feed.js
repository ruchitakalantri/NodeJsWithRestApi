const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { validationResult } = require("express-validator/check");

const io = require("../socket");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  try {
    // .then() => is called promise
    // post.find is async operation
    // async-await uses 'then' behind the seen
    const totalItems = await Post.find().countDocuments();

    // FETCH ACTUAL POST
    const posts = await Post.find()
      .populate("creator")
      .sort({createdAt : -1})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Fetched Post Success",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
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
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  try {
    //create post in db
    await post.save();

    //add post
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    //inform all user
    io.getIO().emit("posts", {
      action: "create",
      post: {
        ...post._doc,
        creator: {
          _id: req.userId,
          name: user.name,
        },
      },
    });
    res.status(201).json({
      message: "post data successfully",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    //find post of that id from database
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post");
      error.statusCode = 404;
      throw error; // with this throw we end up in catch block
    }
    res.status(200).json({ message: "Post Fetched", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();
    io.getIO().emit("posts", { action: "update", post: result });
    res.status(200).json({ message: "Post updated!", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);

  if (!post) {
    const error = new Error("Could not find post");
    error.statusCode = 404;
    throw error;
  }
  // token id: creator id
  if (post.creator.toString() !== req.userId) {
    const error = new Error("Not Authorized");
    error.statusCode = 403;
    throw error;
  }
  //checked logged in user
  clearImage(post.imageUrl);
  try {
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit('posts' , { acction : 'delete' , post : postId });
    res.status(200).json({ message: "DELETED POST" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  // delete ... unlink
  fs.unlink(filePath, (err) => console.log(err));
};
