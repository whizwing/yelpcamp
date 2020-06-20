var express = require("express");
 var   router= express.Router();
 var passport = require("passport");
 var User = require("../models/user");

 router.get("/",function(req,res){
    res.render("campgrounds/landing")
});

// ================
//AUTH ROUTES
// =================

//register route
router.get("/register",function(req,res){
	res.render("register");
});
router.post("/register",function(req,res){
	User.register(new User({username:req.body.username}),req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render('register');
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/campgrounds")
		})
	})
})

//login route

router.get("/login",function(req,res){
	res.render("login");
})

router.post("/login",passport.authenticate("local",{
	successRedirect:"/campgrounds",
	failureRedirect:"/login"}),function(req,res){

})

//logout route
router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/campgrounds")
})

//login 체크 미들웨어
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;