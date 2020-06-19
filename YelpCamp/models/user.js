var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
    username: String,
    password: String
})

UserSchema.plugin(passportLocalMongoose); //User가 passport 메소드를 사용할수 있게만듬

module.exports = mongoose.model("User",UserSchema)