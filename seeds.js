var mongoose = require("mongoose");
var Campground = require("./models/food");
var Comment   = require("./models/comment");
 
//var data = [
 //   {
 //       name: "Cloud's Rest", 
 //       image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
  //      description: "Situated in western Ghats this gives us the view of river narmada flowing"
 //   },
  //  {
  //      name: "Desert Mesa", 
  //      image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
  //      description: "This region is drier but u would not feel discomfort here as this campground is air conditionered..."
  //  },
  //  {
  //      name: "Canyon Floor", 
  //      image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
  //      description: "Situated in the dry region of Alpes ,this campground is equipped with all neccesities... "
  //  }
//]
 
function seedDB(){
   //Remove all campgrounds
   food.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed food!");
        food.remove({}, function(err) {
            if(err){
                console.log(err);
            }
            console.log("removed comments!");
             //add a few campgrounds
            data.forEach(function(seed){
                food.create(seed, function(err, campground){
                    if(err){
                        console.log(err)
                    } else {
                        console.log("added a food");
                        //create a comment
                       // Comment.create(
                        //    {
                        //        text: "This place is great, but I wish there was internet",
                        //        author: "Homer"
                         //   }, function(err, comment){
                         //       if(err){
                          //          console.log(err);
                          //      } else {
                           //         campground.comments.push(comment);
                                food.save();
                           //         console.log("Created new comment");
                           //     }
                          //  });
                    }
                });
            });
        });
    }); 

}
 
module.exports = seedDB;







