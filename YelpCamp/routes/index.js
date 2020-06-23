var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

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
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    function (err, user) {
      if (err) {
        // req.flash("error", err.message);
        return res.render("register", { error: err.message });
      }
      passport.authenticate("local")(req, res, function () {
        res.redirect("/campgrounds");
      });
    }
  );
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

//login 체크 미들웨어
// function isLoggedIn(req,res,next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/login");
// }

module.exports = router;
