// 없어도 실행은 됨
//  var Campground = require("../models/campground")
//  var Comment = require("../models/comment")

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function (err, campground) {
      if (err) {
        res.redirect("back");
      } else {
        if (
          campground.author.id.equals(req.user._id) ||
          (req.user && req.user.isAdmin)
        ) {
          next();
        } else {
          req.flash("error", "You are not permitted to edit");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to log in first");
    res.redirect("back");
  }
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comments_id, function (err, comment) {
      if (err) {
        res.redirect("back");
      } else {
        if (
          comment.author.id.equals(req.user._id) ||
          (req.user && req.user.isAdmin)
        ) {
          next();
        } else {
          req.flash("success", "you don't have a permission");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "you need to log in first");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please Login First"); // "error" 키밸류 함께 가지고 리다이렉트됨
  res.redirect("/login");
};

module.exports = middlewareObj;
