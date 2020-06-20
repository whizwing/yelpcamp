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
 var middleware = require("../middleware") //폴더이름만 써도 index.js를 검색
const { route } = require("./comments");


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
//1. create campground post(colt's ver)
// router.post("/",isLoggedIn,function(req,res){
// 	var name = req.body.name;
// 	var image = req.body.image;
//     var description = req.body.description;
//     var author ={
//         id: req.user._id,
//         username : req.user.username
//     }
// 	var newCampgronds = {name : name , image : image , description : description ,author:author};
// 	Campground.create(newCampgronds,function(err,campground){
// 		if(err){
// 		   		console.log(err);
// 		   }else{
//                console.log(campground);
// 			   res.redirect("/campgrounds");
// 		   }
// 	});	
// 	// campgrounds.push(newCampgronds);
// });

// 1. createh campground post + user id(my version)
router.post("/",middleware.isLoggedIn,function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var newCampgronds = {name : name , image : image , description : description};
	Campground.create(newCampgronds,function(err,campground){
		if(err){
		   		console.log(err);
		   }else{
               campground.author.id = req.user._id;
               campground.author.username = req.user.username;
               campground.save();
			   res.redirect("/campgrounds");
		   }
	});	
	
});

// 2. new campground page
// router.get("/new",isLoggedIn,function(req,res){
// 	res.render("campgrounds/new");
// })

//2. prevent an unauthenticated user from creating a campground
router.get("/new",middleware.isLoggedIn,function(req,res){
    if(req.user.username === "kim"){
        res.render("campgrounds/new");
    }else{
        res.redirect("/campgrounds");
    }
})
//.show page
router.get("/:id",function(req,res){
	
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundcampground){
		if(err){					// 오브젝트를 넘겨줄때 populate 한뒤 넘겨줌
			console.log(err);
		}else{
			
			res.render("campgrounds/show",{campground:foundcampground});
			
		}
	});
});

//4.EDIT CAMPGROUDN ROUTE
router.get("/:id/edit",middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            res.redirect("back");
        }else{
            res.render("campgrounds/edit",{campground:campground});  
        }
        });
})
//5.UPDATED CAMPGROUND ROUTE
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,campground){
        if(err){
            res.redirect("/campgrounds")
        }else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})

//6.DESTROY campground route
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndDelete(req.params.id,function(err){
        res.redirect("/campgrounds");
    })
})

//7.iSLOGGEDIN FUNCTION
// function isLoggedIn(req,res,next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/login");
// }

//8. check campground ownership -moved to midleware
// function checkCampgroundOwnership(req,res,next){
//     if(req.isAuthenticated()){
//         Campground.findById(req.params.id,function(err,campground){
//             if(err){
//                 res.redirect("back");
//             }else{
//                 if(campground.author.id.equals(req.user._id)){
//                     next();
//                 }else{
//                     res.redirect("back");
//                 }                
//             }            
//         })
//     }else{
//         res.redirect("back");
//     } 
// }


module.exports = router;