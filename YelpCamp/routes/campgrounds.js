var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Notification = require("../models/notification");
var User = require("../models/user");
var middleware = require("../middleware"); //폴더이름만 써도 index.js를 검색
const { route } = require("./comments");
const middlewareObj = require("../middleware");

//index (/campgrounds) page
router.get("/", function (req, res) {
  if (req.query.search) {
    //fuzzy search
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Campground.find({ name: regex }, function (err, campgrounds) {
      if (err) {
        req.flash("error", "not found");
        res.redirect("/campgrounds");
      } else {
        let nomatch = "";
        if (campgrounds.length < 1) {
          nomatch = "Not found. Search Again";
        }
        res.render("campgrounds/index", {
          campgrounds: campgrounds,
          nomatch: nomatch,
          page: "campgrounds",
        });
      }
    });
  }
  Campground.find({}, function (err, campgrounds) {
    if (err) {
      console.log(err);
    } else {
      let nomatch = "";
      res.render("campgrounds/index", {
        campgrounds: campgrounds,
        nomatch: nomatch,
        page: "campgrounds",
      });
    }
  });
});

//1-1. create campground post(colt's ver)
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

// 1-2. create campground post + user id(my version)
// router.post("/", middleware.isLoggedIn, function (req, res) {
//   var name = req.body.name;
//   var price = req.body.price;
//   var image = req.body.image;
//   var description = req.body.description;
//   var newCampgronds = {
//     name: name,
//     price: price,
//     image: image,
//     description: description,
//   };
//   Campground.create(newCampgronds, function (err, campground) {
//     if (err) {
//       console.log(err);
//     } else {
//       campground.author.id = req.user._id;
//       campground.author.username = req.user.username;
//       campground.save();
//       res.redirect("/campgrounds");
//     }
//   });
// });

// 1-3. create campground post + user id(my version) + notification
// router.post("/", middleware.isLoggedIn, function (req, res) {
//   var name = req.body.name;
//   var price = req.body.price;
//   var image = req.body.image;
//   var description = req.body.description;
//   var newCampgronds = {
//     name: name,
//     price: price,
//     image: image,
//     description: description,
//   };
//   Campground.create(newCampgronds, function (err, campground) {
//     if (err) {
//       console.log(err);
//     } else {
//       campground.author.id = req.user._id;
//       campground.author.username = req.user.username;
//       campground.save();
//       res.redirect("/campgrounds");
//     }
//   });
// });

// 1-3. create campground post + user id(my version) + notification(my code)
router.post("/", middleware.isLoggedIn, async function (req, res) {
  var newCampgrounds = {
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    description: req.body.description,
    author: {
      id: req.user._id,
      username: req.user.username,
    },
  };
  try {
    const campground = await Campground.create(newCampgrounds);
    const user = await User.findById(req.user._id).populate("followers").exec();
    const notification = await Notification.create({
      username: req.user.username,
      campgroundId: campground.id,
    });

    for (const follower of user.followers) {
      follower.notifications.push(notification);
      follower.save();
    }
    res.redirect("/campgrounds");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

// 2. new campground page
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("campgrounds/new");
});

//2. prevent an unauthenticated user from creating a campground
// router.get("/new", middleware.isLoggedIn, function (req, res) {
//   if (req.user.username === "kim") {
//     res.render("campgrounds/new");
//   } else {
//     res.redirect("/campgrounds");
//   }
// });

//.show page
router.get("/:id", function (req, res) {
  Campground.findById(req.params.id)
    .populate("comments likes")
    .exec(function (err, foundcampground) {
      if (err) {
        // 오브젝트를 넘겨줄때 populate 한뒤 넘겨줌
        console.log(err);
      } else {
        res.render("campgrounds/show", { campground: foundcampground });
      }
    });
});

//4.EDIT CAMPGROUDN ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (
  req,
  res
) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      res.redirect("back");
    } else {
      res.render("campgrounds/edit", { campground: campground });
    }
  });
});
//5.UPDATED CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (
    err,
    campground
  ) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

//6.DESTROY campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findByIdAndDelete(req.params.id, function (err) {
    res.redirect("/campgrounds");
  });
});

//7. add likes to campground
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      var foundUserLike = campground.likes.some((like) =>
        like.equals(req.user._id)
      );
      if (foundUserLike) {
        campground.likes.pull(req.user._id);
      } else {
        campground.likes.push(req.user);
      }
      campground.save(function (err) {
        if (err) {
          req.flash("error", err.message);
          res.redirect("/campgrounds");
        } else {
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

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
function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
module.exports = router;
