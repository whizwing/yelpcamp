var mongoose = require("mongoose");

// colt's
var commentSchema = new mongoose.Schema( {
    text : String,
    author : {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username: String
    }
});

//referencing author
// var commentSchema = new mongoose.Schema( {
//     text : String,
//     author : {        
//             type: mongoose.Schema.Types.ObjectId,
//             ref:"User"
//         }
        
//     }
// );

//embed 모델
// var commentSchema = new mongoose.Schema( {
//     text : String,
//     author : {
//         // id: String,
//         username: String
//     }
// });


module.exports = mongoose.model("Comment",commentSchema);