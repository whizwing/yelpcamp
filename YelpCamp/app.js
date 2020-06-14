var express = require("express"),
 app = express(),
 bodyParser = require('body-parser'),
 mongoose = require("mongoose");
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelpcamp")
app.use(bodyParser.urlencoded({extended:true})); 
app.set("view engine","ejs");

var campgroundSchema = new mongoose.Schema({
	name : String,
	image : String,
	description : String
});
var Campground = mongoose.model("Campground",campgroundSchema);

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



app.get("/",function(req,res){
	res.render("landing")
});

app.get("/campgrounds",function(req,res){
	Campground.find({},function(err,campgrounds){
		if(err){
			console.log(err);
		}else{
			res.render('index',{campgrounds:campgrounds});
		}
	});
});

app.post("/campgrounds",function(req,res){
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

app.get("/campgrounds/new",function(req,res){
	res.render("new");
})

app.get("/campgrounds/:id",function(req,res){
	
	Campground.findById(req.params.id,function(err,foundcampground){
		if(err){
			console.log(err);
		}else{
			console.log(foundcampground);
			res.render("show",{campground:foundcampground});
			
		}
	})
	 
})

app.listen(3000,function(){
	console.log("YelpCamp Server Started");
});