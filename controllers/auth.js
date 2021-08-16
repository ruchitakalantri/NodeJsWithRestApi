const { validationResult } = require("express-validator/check");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = User({
      email: email,
      password: hashedPw,
      name: name,
    });
    
    const result = await user.save(); // save() : to store into database
    // result of database operation
    res.status(201).json({ messasge: "User Created", userId: result._id });

  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    // email exist or not
    const user = await User.findOne({ email: email });

    if (!user) {
      //user not define
      const error = new Error("User with Email Not Found!");
      error.statusCode = 401;
      throw error;
    }
    // have email
    // validate password
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      //wrong password
      const error = new Error("Wrong Password!");
      error.statusCode = 401;
      throw error;
    }
    // password and email correct
    //generate JSON Web Token (JWT)
    //.. create new signiture
    // somesupersecretsecret : private key
    // expiresIn : '1h' : invalid after 1 hour
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );
    //return res to client
    res.status(200).json({ token: token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User Not Found!");
      error.statusCode = 404;
      throw error;
    }
    //have user
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User Not Found!");
      error.statusCode = 404;
      throw error;
    }
    //have user
    user.status = newStatus;
    const result = await user.save();

    res.status(200).json({ message: "User Updated" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
