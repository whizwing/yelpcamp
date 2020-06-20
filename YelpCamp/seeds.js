var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment   = require("./models/comment");
const { populate } = require("./models/campground");
 
var data = [
    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    }
]
 
function seedDB(){
   //Remove all campgrounds
   Campground.remove({}, function(err){
        // if(err){
        //     console.log(err);
        // }
        // console.log("removed campgrounds!");
        // Comment.remove({}, function(err) {
        //     if(err){
        //         console.log(err);
        //     }
        //     console.log("removed comments!");
        //      //add a few campgrounds
        //     data.forEach(function(seed){
        //         Campground.create(seed, function(err, campground){
        //             if(err){
        //                 console.log(err)
        //             } else {
        //                 console.log("added a campground");
        //                 //create a comment
        //                 Comment.create(
        //                     {
        //                         text: "This place is great, but I wish there was internet",
        //                         author: "Homer"
        //                     }, function(err, comment){
        //                         if(err){
        //                             console.log(err);
        //                         } else {
        //                             campground.comments.push(comment);
        //                             campground.save();
        //                             console.log("Created new comment");
        //                        }
        //                     });
        //             }
        //         });
        //     });
        // });
    }); 
    //add a few comments
}

 
module.exports = seedDB;

// var mongoose = require("mongoose");
// var Campground = require("./models/campground");
// var Comment = require("./models/comment");

// var data = [
//     {
//         name: "salmon creek",
//         image: "https://www.nps.gov/mora/planyourvisit/images/OhanaCampground2016_CMeleedy_01_web.jpeg?maxwidth=1200&maxheight=1200&autorotate=false",
//         description: "This is beautifall camp ground in valley most popular area."

//     },
//     {
//         name: "abc creek",
//         image: "https://shawglobalnews.files.wordpress.com/2020/05/camping.jpg?quality=85&strip=all",
//         description: "This is beautifall camp ground in valley most popular area."

//     },
//     {
//         name: "everest creek",
//         image: "https://dailygazette.com/sites/default/files/styles/article_image/public/180702d.jpg?itok=6L_qDMLP",
//         description: "This is beautifall camp ground in valley most popular area."

//     },
// ]

// function seedDBf() {
//     //remove all campgrounds 
//     Campground.remove({}, function (err) {
//         console.log("removed campgrounds");
//         data.forEach(function(el){
//             //added campground
//             Campground.create(el,function(err,campground){
//                 console.log("added campgroung");
//                 //CREATE COMMENT
//                 Comment.create({
//                     text : "this place is awesome",
//                     authot : "David"
//                 },function(err,comment){
//                     if(err){
//                         console.log(err);
//                     }else{
//                         campground.comments.push(comment);
//                         campground.save();
//                         console.log("created comment");
//                     }
//                 })

//             })
//         })
       

//     });
// }



// module.exports = seedDBf;