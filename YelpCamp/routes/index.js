var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
const { route } = require("./comments");

router.get("/", function (req, res) {
  res.render("campgrounds/landing");
});

// ================
//AUTH ROUTES
// =================

//register route
router.get("/register", function (req, res) {
  res.render("register", { page: "register" });
});

router.post("/register", function (req, res) {
  var newUser = new User({
    username: req.body.username,
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    avatar: req.body.avatar,
    email: req.body.email,
  });
  //admin User
  if (req.body.adminCode === "secret") {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      // req.flash("error", err.message);
      return res.render("register", { error: err.message });
    }
    passport.authenticate("local")(req, res, function () {
      req.flash("success", "Successfully singed up");
      res.redirect("/campgrounds");
    });
  });
});

//login route
router.get("/login", function (req, res) {
  res.render("login", { page: "login" });
});

// 2. login post
// router.post("/login",passport.authenticate("local",{
// 	successRedirect:"/campgrounds",
// 	failureRedirect:"/login"}),function(req,res){

// })

//2. login post with flash message // moved middleware into callback function and execute inside callback function
router.post("/login", function (req, res) {
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true, //실패시 자동으로 에러 메세지가 출력
    successFlash: "Welcome to yelpcamp " + req.body.username, //this looks for "success" flash
  })(req, res);
});

//logout route
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "successfully logged out");
  res.redirect("/campgrounds");
});

//user profile route
router.get("/users/:id", function (req, res) {
  User.findOne({ username: req.params.id }, function (err, user) {
    if (err) {
      req.flash("error", "no user found");
      res.redirect("back");
    } else {
      Campground.find()
        .where("author.id")
        .equals(user._id)
        .exec(function (err, campground) {
          if (err) {
            req.flash("no campground found");
            res.redirect("back");
          } else {
            res.render("profile", { user: user, campground: campground });
          }
        });
    }
  });
});

//login 체크 미들웨어
// function isLoggedIn(req,res,next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/login");
// }

module.exports = router;
