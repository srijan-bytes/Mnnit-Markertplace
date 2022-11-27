//requires

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');
const app = express();
var favicon = require('serve-favicon');
var cloudinary = require('cloudinary').v2;
const fileupload = require('express-fileupload');

cloudinary.config({ 
  cloud_name: 'dycpksgkp', 
  api_key: '163257742582485', 
  api_secret: 'onuP35l-P8rB6iU6sYLMj6GzSmI',
  secure: true
});
app.use(fileupload({
  useTempFiles:true,
}));
// const multer =  require('multer');

// var multer  = require('multer');
 
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './public/uploads/')
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now()+file.originalname)
//     }
//   })
 
//   const fileFilter=(req, file, cb)=>{
//    if(file.mimetype ==='image/jpeg' || file.mimetype ==='image/jpg' || file.mimetype ==='image/png'){
//        cb(null,true);
//    }else{
//        cb(null, false);
//    }
 
//   }
 
// var upload = multer({ 
//     storage:storage,
//     limits:{
//         fileSize: 1024 * 1024 * 5
//     },
//     fileFilter:fileFilter
//  }).single('image');
 


app.use('/favicon.ico', express.static('/favicon.ico'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/projectDB", {
  useNewUrlParser: true
});

// main page
app.get("/", function(req, res) {
  res.render("index");
});

//Schemas Uesd - books,items,mails,users.
const itemsSchema = new mongoose.Schema({
  pname: String,
  sellp: Number,
  name: String,
  brand: String,
  year: String,
  condition: String,
  others: String,
  phone: String,
  email: String,
  hostel: String,
  room: String,
  imageUrl: String,
  donation: String,
});
const Item = mongoose.model("Item", itemsSchema);

const mailsSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: Number,
  subject: String,
  message: String
});

const Mail = mongoose.model("Mail", mailsSchema);


const usersSchema = new mongoose.Schema({
  username: String,
  fullname: String,
  password: String,
  email: String,
  items: [itemsSchema]
});

const User = mongoose.model("User", usersSchema);

//signup page
app.get("/signup", function(req, res) {
  res.render("signup");
});
app.post("/signup", function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, foundUser) {
    if (!err) {
      if (!foundUser) {
        if (req.body.password === req.body.cpassword) {
          const user = new User({
            username: req.body.username,
            fullname: req.body.fullname,
            password: req.body.password,
            email: req.body.email,

          });
          const u = req.body.username;
          user.save();
          res.redirect("/index/" + u);
        } else {
          console.log("error");
          res.redirect("/signup");
        }
      } else {
        res.redirect("/signup");
      }
    }
  });
});

//login page
app.get("/login", function(req, res) {
  res.render("login");
});
app.post("/login", function(req, res) {
  const user = req.body.username
  User.findOne({
    username: user
  }, function(err, foundUser) {
    if (!err) {
      pass = foundUser.password;
      if (pass === req.body.password) {
        res.redirect("/index/" + user);
      } else {
        console.log("Wrong Password");
        res.render("login");
      }
    }
  });
});

//user home page
app.get("/index/:user", function(req, res) {
  const user = req.params.user;
  User.findOne({
    username: user
  }, function(err, foundUser) {
    if (!err) {
      res.render("indexB", {
        name: foundUser.fullname,
        user: foundUser.username
      });
    }
  });
});

//the products buy page: show all the products
app.get("/products", function(req, res) {
  Item.find({"donation":"NO"}, function(err, foundItems) {

    if (foundItems.length === 0) {
      console.log("No Items Added");
      res.redirect("/");
    } else {
      Item.find({"donation":"NO"}, null, { //to sort alphabetically
        sort: {
          pname: 1
        }
      }, function(err, foundItems) {
        if (!err) {
          res.render("products", {
            newItems: foundItems
          });
        }
      });
    }
  });
});

//the products buy page after signing up: show all the products
app.get("/products/:user", function(req, res) {
  Item.find({"donation":"NO"}, function(err, foundItems) {

    if (foundItems.length === 0) {
      console.log("No Items Added");
      res.redirect("/");
    } else {
      Item.find({"donation":"NO"}, null, { //to sort alphabetically
        sort: {
          pname: 1
        }
      }, function(err, foundItems) {
        if (!err) {
          res.render("productsB", {
            user: req.params.user,
            newItems: foundItems
          });
        }
      });
    }
  });
});

//the dashboard: shows all the products of the user put up for sale
app.get("/dashboard/:user", function(req, res) {
  const user = req.params.user;
  User.findOne({
    username: user
  }, function(err, foundUser) {
    if (!err) {
      res.render("dashboard", {
        user: user,
        newItems: foundUser.items
      });
    }
  });
});

//this deletes the products
app.post("/delete/:user", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const user = req.params.user;

  Item.findByIdAndRemove(checkedItemId, function(err) {
    if (!err) {
      console.log("Success");
    } else {
      console.log("Fail");
    }
  });
  User.findOneAndUpdate({
      username: user
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    },
    function(err, foundList) {
      if (!err) {
        res.redirect("/dashboard/" + user);
      }
    });
});

//this is the add page for products
app.get("/addproduct/:user", function(req, res) {
  const user = req.params.user;
  User.findOne({
    username: user
  }, function(err, foundUser) {
    if (!err) {
      res.render("addproduct", {
        user: foundUser.username
      });
    }
  });
});

  
app.post("/addproduct/:user", function(req, res) {
  const file = req.files.image;
  cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
    console.log(result);
    const user = req.params.user;
  const item = new Item({
    pname: req.body.pname,
    sellp: req.body.sellp,
    name: req.body.name,
    brand: req.body.brand,
    year: req.body.year,
    condition: req.body.condition,
    others: req.body.others,
    phone: req.body.phone,
    email: req.body.email,
    time: req.body.time,
    hostel: req.body.hostel,
    room: req.body.room,
    imageUrl: result.url,
    donation: req.body.donation,
    });
  
  item.save();
  User.findOne({
    username: user
  }, function(err, foundUser) {
    foundUser.items.push(item);
    foundUser.save();
    console.log(err);
    res.redirect("/dashboard/" + user);
  });
  })
  
});


//this redirects to the page of full details of a specific product
app.get("/productd/:itemid", function(req, res) {
  const itemid = req.params.itemid;
  Item.findOne({
    _id: itemid
  }, function(err, foundItem) {
    if (!err) {
      res.render("productd", {
        pname: foundItem.pname,
        sellp: foundItem.sellp,
        name: foundItem.name,
        brand: foundItem.brand,
        year: foundItem.year,
        condition: foundItem.condition,
        others: foundItem.others,
        phone: foundItem.phone,
        email: foundItem.email,
        time: foundItem.time,
        hostel: foundItem.hostel,
        room: foundItem.room,
        imageUrl: foundItem.imageUrl,
      });
    }

  });
});

//this redirects to the page of full details of a specific product after signing up
app.get("/productdB/:user/:itemid", function(req, res) {
  const user = req.params.user;
  const itemid = req.params.itemid;
  Item.findOne({
    _id: itemid
  }, function(err, foundItem) {
    if (!err) {
      res.render("productdB", {
        user: user,
        pname: foundItem.pname,
        sellp: foundItem.sellp,
        name: foundItem.name,
        brand: foundItem.brand,
        year: foundItem.year,
        condition: foundItem.condition,
        others: foundItem.others,
        phone: foundItem.phone,
        email: foundItem.email,
        time: foundItem.time,
        hostel: foundItem.hostel,
        room: foundItem.room,
        imageUrl: foundItem.imageUrl,
      });
    }

  });
});

//donations page without signup
app.get("/donations", function(req, res) {
  Item.find({"donation":"YES"}, function(err, foundItems) {

    if (foundItems.length === 0) {
      console.log("No Items Added");
      res.redirect("/");
    } else {
      Item.find({"donation": "YES"}, null, { //to sort alphabetically
        sort: {
          pname: 1
        }
      }, function(err, foundItems) {
        if (!err) {
          res.render("donations", {
            newItems: foundItems
          });
        }
      });
    }
  });
});

//donations page after signing up: show all the products
app.get("/donations/:user", function(req, res) {
  Item.find({"donation": "YES"}, function(err, foundItems) {

    if (foundItems.length === 0) {
      console.log("No Items Added");
      res.redirect("/");
    } else {
      Item.find({"donation": "YES"}, null, { //to sort alphabetically
        sort: {
          pname: 1
        }
      }, function(err, foundItems) {
        if (!err) {
          res.render("donationsB", {
            user: req.params.user,
            newItems: foundItems
          });
        }
      });
    }
  });
});
//contact us
app.get("/contact", function(req, res) {
  res.render("contact");
});

app.post("/contact", function(req, res) {
  const mail = new Mail({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    subject: req.body.subject,
    message: req.body.message
  });
  mail.save();
  res.redirect("/");
});

//contact us page after signing up
app.get("/contact/:user", function(req, res) {
  res.render("contactB", {
    user: req.params.user
  });
});

app.post("/contact/:user", function(req, res) {
  const user = req.params.user;
  const mail = new Mail({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    subject: req.body.subject,
    message: req.body.message
  });
  mail.save();
  res.redirect("/contact/" + user);
});

//server
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
