//app.js 에서 복사한뒤 express , model 들 불러오고 app을 router로 이름바꾼뒤 export

var express = require("express");
var router = express.Router({ mergeParams: true }); //refactoring
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
const campground = require("../models/campground");

//1. new comment page
router.get("/new", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { campground: campground });
    }
  });
});

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

// 2.create comment
router.post("/", middleware.isLoggedIn, function (req, res) {
  Comment.create(req.body.comment, function (err, comment) {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      Campground.findById(req.params.id, function (err, campground) {
        if (err) {
          console.log(err);
        } else {
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //save comment
          comment.save();

          campground.comments.push(comment);
          campground.save();
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

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

//3 edit comment form
router.get("/:comments_id/edit", middleware.checkCommentOwnership, function (
  req,
  res
) {
  Comment.findById(req.params.comments_id, function (err, comment) {
    if (err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {
        comment: comment,
        campground_id: req.params.id,
      });
    }
  });
});

//4 edit comment /put
router.put("/:comments_id", middleware.checkCommentOwnership, function (
  req,
  res
) {
  Comment.findByIdAndUpdate(req.params.comments_id, req.body.comment, function (
    err,
    comment
  ) {
    if (err) {
      console.log(err);
    } else {
      req.flash("success", "successfully added comment");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

//5 destroy comment /delete
router.delete("/:comments_id", middleware.checkCommentOwnership, function (
  req,
  res
) {
  Comment.findByIdAndDelete(req.params.comments_id, function (err) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "successfully deleted comment");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// function isLoggedIn(req,res,next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/login");
// }

// function checkCommentOwnership(req,res,next){
// 	if(req.isAuthenticated()){
// 		Comment.findById(req.params.comments_id,function(err,comment){
// 			if(err){
// 				res.redirect("back");
// 			}else{
// 				if(comment.author.id.equals(req.user._id)){
// 					next();
// 				}else{
// 					res.redirect("back");
// 				}
// 			}
// 		})
// 	}else{
// 		res.redirect("back");
// 	}
// }

module.exports = router;
