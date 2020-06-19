var passport = require("passport");

var express = require("express"),
 app = express(),
 bodyParser = require('body-parser'),
 mongoose = require("mongoose");
 passport = require("passport");
 LocalStrategy = require("passport-local");
 Campground = require("./models/campground");
 seedDB = require("./seeds");
 User =require("./models/user");
 Comment = require("./models/comment");


mongoose.set('useNewUrlParser', true);	
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelpcamp")
app.use(bodyParser.urlencoded({extended:true})); 
app.set("view engine","ejs");
app.use(express.static(__dirname+'/public'));

// seedDB();
//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "I like Welches ",
	resave:false,
	saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//모든 템플릿으로 오브젝트 넘김 미들웨어 //모든 route에서 실행
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
})


// Campground.create(
// {
// 	name : "salmon creek", 
// 	image : "https://www.nps.gov/mora/planyourvisit/images/OhanaCampground2016_CMeleedy_01_web.jpeg?maxwidth=1200&maxheight=1200&autorotate=false",
// 	description : "This is beautifall camp ground in valley most popular area."
	
// },function(err,campground){
// 	if(err){
// 		console.log(err)
// 	}else{
// 		console.log(campground);
// 	}
// });

//  campgrounds = [
// 	{name : "dowson creek", image : "
// 
// 	{name : "city creek", image : " https://farm9.staticflickr.com/8605/16573646931_22fc928bf9_o.jpg"},
// 	{name : "dowson creek", image : "https://www.nps.gov/mora/planyourvisit/images/OhanaCampground2016_CMeleedy_01_web.jpeg?maxwidth=1200&maxheight=1200&autorotate=false"},
// 	{name : "salmon creek", image : "https://lh3.googleusercontent.com/proxy/vZT5IfkAYX_MXKxJPBOrxXAaUqUxZOUIswd4Pr3M2P3GZoWw6APn6wqHfYOyKUN8b5wPjqYSWh1rb4CWVHPSY8OyVwMSdx8XdmEtHegqnARz0KiTQSC_dhal-LUY6k69HJGppWwwMdo1wdxC"},
// 	{name : "city creek", image : " https://farm9.staticflickr.com/8605/16573646931_22fc928bf9_o.jpg"},
// ];	



app.get("/",function(req,res){
	res.render("campgrounds/landing")
});
//index page
app.get("/campgrounds",function(req,res){
	Campground.find({},function(err,campgrounds){
		if(err){
			console.log(err);
		}else{
			res.render('campgrounds/index',{campgrounds:campgrounds,currentUser:req.user});
		}
	});
});
//create post
app.post("/campgrounds",isLoggedIn,function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var newCampgronds = {name : name , image : image , description : description};
	Campground.create(newCampgronds,function(err,campground){
		if(err){
		   		console.log(err);
		   }else{
			   res.redirect("/campgrounds");
		   }
	});	
	// campgrounds.push(newCampgronds);
});

app.get("/campgrounds/new",isLoggedIn,function(req,res){
	res.render("campgrounds/new");
})
//show page
app.get("/campgrounds/:id",function(req,res){
	
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundcampground){
		if(err){					// 오브젝트를 넘겨줄때 populate 한뒤 넘겨줌
			console.log(err);
		}else{
			console.log(foundcampground);
			res.render("campgrounds/show",{campground:foundcampground});
			
		}
	});
});
//comment page
app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){console.log(err);}
		else{
			res.render("comments/new",{campground:campground})
		}
	})
	
})

//post comment
app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
	Comment.create(req.body.comment,function(err,comment){
		if(err){
			console.log(err);
			res.redirect("/campgrounds")
		}
		else{
			Campground.findById(req.params.id,function(err,campground){
				if(err){console.log(err);}
				else{
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/"+campground._id);
				}
			})
		}
	})
})
// ================
//AUTH ROUTES
// =================

//register route
app.get("/register",function(req,res){
	res.render("register");
});
app.post("/register",function(req,res){
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

app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login",passport.authenticate("local",{
	successRedirect:"/campgrounds",
	failureRedirect:"/login"}),function(req,res){

})

//logout route
app.get("/logout",function(req,res){
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


app.listen(3000,function(){
	console.log("YelpCamp Server Started");
});



