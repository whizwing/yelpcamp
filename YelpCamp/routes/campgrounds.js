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

var express = require("express");
 var   router= express.Router();
 var Campground = require("../models/campground");


//index page
router.get("/",function(req,res){
	Campground.find({},function(err,campgrounds){
		if(err){
			console.log(err);
		}else{
			res.render('campgrounds/index',{campgrounds:campgrounds,currentUser:req.user});
		}
	});
});
//create campground post
router.post("/",isLoggedIn,function(req,res){
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

router.get("/new",isLoggedIn,function(req,res){
	res.render("campgrounds/new");
})
//show page
router.get("/:id",function(req,res){
	
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundcampground){
		if(err){					// 오브젝트를 넘겨줄때 populate 한뒤 넘겨줌
			console.log(err);
		}else{
			
			res.render("campgrounds/show",{campground:foundcampground});
			
		}
	});
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


module.exports = router;