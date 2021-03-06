var passport = require("passport");

var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose");
passport = require("passport");
flash = require("connect-flash");
LocalStrategy = require("passport-local");
Campground = require("./models/campground");
seedDB = require("./seeds");
User = require("./models/user");
methodOverride = require("method-override");
async = require("async");
nodemailer = require("nodemailer");
crypto = require("crypto");
Comment = require("./models/comment");
User = require("./models/user");

//refactoring
var commentRoutes = require("./routes/comments"),
  campgroundRoutes = require("./routes/campgrounds"),
  indexRoutes = require("./routes/index");

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/yelpcamp");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); //css파일 경로 설정
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

// seedDB();
//PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    secret: "I like Welches ",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//모든 템플릿으로 req.user 넘김 미들웨어 //모든 route에서 미들웨어로 실행
//!!!모든 라우트의 위쪽에 위치해야함!!!
app.use(async function (req, res, next) {
  res.locals.currentUser = req.user;
  if (req.user) {
    try {
      const user = await User.findById(req.user._id)
        .populate("notifications", null, { isRead: false })
        .exec();
      res.locals.notifications = user.notifications.reverse();
    } catch (err) {
      console.log(err.message);
    }
  }
  res.locals.error = req.flash("error"); //flash 설정
  res.locals.success = req.flash("success");
  next();
});

//라우트 위치는 모든 설정의 맨 밑에 위치시켜야함
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, function () {
  console.log("YelpCamp Server Started");
});
