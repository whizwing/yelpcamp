var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  avatar: String,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  resetPasswordToken: String,
  resetPaddwordExpires: Date,
  isAdmin: { type: Boolean, default: false },
});

UserSchema.plugin(passportLocalMongoose); //User가 passport 메소드를 사용할수 있게만듬

module.exports = mongoose.model("User", UserSchema);
