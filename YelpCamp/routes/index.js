var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var Campground = require("../models/campground");
const { route } = require("./comments");
const { isLoggedIn } = require("../middleware");
const Notification = require("../models/notification");

router.get("/", function (req, res) {
  res.render("campgrounds/landing");
});
console.log(process.env.GMAILPW);
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

//password reset
router.get("/forgot", function (req, res) {
  res.render("forgot");
});

router.post("/forgot", function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          //token 생성
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "whizwing@gmail.com", //구글 less secure apps 에서 om->off->on 먼저 해야됨
            pass: process.env.GMAILPW,
          },
        });
        var mailOptions = {
          to: user.email,
          from: "whizwing@gmail.com",
          subject: "Node.js Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          console.log("mail sent");
          req.flash(
            "success",
            "An e-mail has been sent to " +
              user.email +
              " with further instructions."
          );
          done(err, "done");
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect("/forgot");
    }
  );
});
//reset password
router.get("/reset/:token", function (req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }, // greater than Date.now
    },
    function (err, user) {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("reset", { token: req.params.token });
    }
  );
});

router.post("/reset/:token", function (req, res) {
  async.waterfall(
    //async.waterfall 콜백지옥방지
    [
      function (done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          function (err, user) {
            if (!user) {
              req.flash(
                "error",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function (err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function (err) {
                  req.logIn(user, function (err) {
                    //로그인 시킴
                    done(err, user);
                  });
                });
              });
            } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect("back");
            }
          }
        );
      },
      function (user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "learntocodeinfo@gmail.com",
            pass: GMAILPW,
          },
        });
        var mailOptions = {
          to: user.email,
          from: "learntocodeinfo@mail.com",
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          req.flash("success", "Success! Your password has been changed.");
          done(err);
        });
      },
    ],
    function (err) {
      res.redirect("/campgrounds");
    }
  );
});

//user profile route #1
// router.get("/users/:id", function (req, res) {
//   User.findOne({ username: req.params.id }, function (err, user) {
//     if (err) {
//       req.flash("error", "no user found");
//       res.redirect("back");
//     } else {
//       Campground.find()
//         .where("author.id")
//         .equals(user._id)
//         .exec(function (err, campground) {
//           if (err) {
//             req.flash("no campground found");
//             res.redirect("back");
//           } else {
//             res.render("profile", { user: user, campground: campground });
//           }
//         });
//     }
//   });
// });
//notification 기능 설명
// 유저프로필에 팔로우 버튼을 만듬(profile.ejs) 클릭하면 (프로필 페이지 유저의 id를 넘김)
// router.get('follow/:id')에서 현재로그인한 유저 오브젝트를 팔로잉하는 유저의 followers안에 집어넣어준다
// router.post('/campgrounds')에서 새로운 캠프그라운드를 만들때 현재유저의 followers를 모두 불러와서(for loop)
// 그안에 notification을 만들어 준다
//네비(헤더파일)에 notification 오브젝트 넘겨주기위해 app.js에서 app.use를 설정해준다
// 네비에 notification 을 달아주고 클릭하면 router.get('/notifications/)에서  먼저 현재유저를 불러온뒤 notifications를
// populate해서 notifications/index 페이지로 넘겨준다
// 각각의 notification 을 클릭하면 router.get('/notifications/:id')에서 해당하는 notification을 불러온뒤
// redirect('campgrounds/id') 에서 보여준다

//user profile route #2
router.get("/users/:id", async function (req, res) {
  try {
    let user = await User.findById(req.params.id).populate("followers").exec();
    let campground = await Campground.find()
      .where("author.id")
      .equals(user._id)
      .exec();
    res.render("profile", { user, campground }); // res.render('profile',{user : user }) 를 줄여씀
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("back");
  }
});

//follow user
router.get("/follow/:id", isLoggedIn, async function (req, res) {
  try {
    let user = await User.findById(req.params.id);
    user.followers.push(req.user._id);
    user.save();
    req.flash("success", "Successfully followed " + user.username + "!");
    res.redirect("/campgrounds");
  } catch (err) {
    req.flash("error", err.message);
    req.redirect("back");
  }
});

//view all notification
router.get("/notifications", isLoggedIn, async function (req, res) {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "notifications",
        options: { sort: { _id: -1 } }, //newest first
      })
      .exec();
    res.render("notifications", { user });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

//handle notifications
router.get("/notifications/:id", async function (req, res) {
  try {
    const notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect("/campgrounds/" + notification.campgroundId);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("back");
  }
});

//login 체크 미들웨어
// function isLoggedIn(req,res,next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	}
// 	res.redirect("/login");
// }

module.exports = router;
