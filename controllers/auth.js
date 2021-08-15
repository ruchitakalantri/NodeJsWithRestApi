const {validationResult} = require('express-validator/check');

const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email ;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt
        .hash(password , 12)
        .then(hashedPw => {
            const user = User({
                email : email ,
                password : hashedPw ,
                name : name
            });
            return user.save(); // save() : to store into database
        })
        .then(result => {
            // result of database operation
            res.status(201).json({messasge : 'User Created' , userId : result._id});
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req , res , next) => {

    const email = req.body.email ;
    const password = req.body.password;

    // email exist or not
    User
        .findOne({email : email})
        .then(user => {
            if(!user) {
                //user not define
                const error = new Error('User with Email Not Found!');
                error.statusCode = 401;
                throw error;
            }
            // have email
            // validate password
            loadUser = user;
            bcrypt.compare(password , user.password);
        })
        .then(isEqual => {
            if(!isEqual) {
                //wrong password
                const error = new Error('Wrong Password!');
                error.statusCode = 401;
                throw error;
            }
            // paassword correct
            //generate JSON Web Token (JWT)
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

}