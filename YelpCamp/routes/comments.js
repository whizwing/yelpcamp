//app.js 에서 복사한뒤 express , model 들 불러오고 app을 router로 이름바꾼뒤 export


var express = require("express");
 var   router= express.Router({mergeParams:true});
var Campground = require("../models/campground");
var Comment = require("../models/comment")


// new comment page
router.get("/new",isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){console.log(err);}
		else{
			res.render("comments/new",{campground:campground})
		}
	})
	
})

//reference model new comment page
// router.get("/new",isLoggedIn,function(req,res){
// 	Campground.findById(req.params.id,function(err,campground){
// 		if(err){console.log(err);}
// 		else{
//             Campground.findOne(campground).populate({
//                 path:'comments',
//                 populate:{
//                     path:"author",
//                     model:"User"
//                 }
//             })
//             console.log(campground);
// 			res.render("comments/new",{campground:campground})
// 		}
// 	})
	
// })

// create comment
router.post("/",isLoggedIn,function(req,res){
	Comment.create(req.body.comment,function(err,comment){
		if(err){
			console.log(err);
			res.redirect("/campgrounds")
		}
		else{
			Campground.findById(req.params.id,function(err,campground){
				if(err){console.log(err);}
				else{
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/"+campground._id);
				}
			})
		}
	})
})

//refrencing model
// router.post("/",isLoggedIn,function(req,res){
//     	Comment.create(req.body.comment,function(err,comment){
//     		if(err){
//     			console.log(err);
//     			res.redirect("/campgrounds")
//     		}
//     		else{
//     			Campground.findById(req.params.id,function(err,campground){
//     				if(err){console.log(err);}
//     				else{
//                         //add username and id to comment
//                         comment.author = req.user;
                        
//                         //save comment
//                         comment.save();
                        
//     					campground.comments.push(comment);
//                         campground.save();
                        
//                         res.redirect("/campgrounds/"+campground._id);
//     				}
//     			})
//     		}
//     	})
//     })
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


module.exports = router;