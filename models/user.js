

const { strict } = require('assert/strict');
const mongoose = require('mongoose');

const Schema = momgoose.Schema;

const userSchema = new Schema({
    // how user should look like

    email : {
        type : String,
        required : true
    } ,
    password : {
        type : String,
        required : true
    } ,
    name : {
        type : String,
        required : true
    } ,
    status : {
        type : String,
        required : true
    },
    posts : [{
        type : Schema.Types.ObjectId,
        ref : 'Post'
    }]

});

module.exports = mongoose.model('User' , userSchema);