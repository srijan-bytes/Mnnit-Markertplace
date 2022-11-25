//requires

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');

const app = express();
var favicon = require('serve-favicon');

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
const booksSchema = new mongoose.Schema({
  bookname: String,
  sellp: Number,
  name: String,
  subject: String,
  year: String,
  condition: String,
  edition: String,
  phone: String,
  email: String,
  time: String,
  hostel: String,
  room: String
});

const Book = mongoose.model("Book", booksSchema);
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
  room: String

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
  books: [booksSchema],
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


//the buy page: shows all the books available
app.get("/books", function(req, res) {
  Book.find({}, function(err, foundBooks) {

    if (foundBooks.length === 0) {
      console.log("No Books Added");
      res.redirect("/");
    } else {
      Book.find({}, null, { //to sort alphabetically
        sort: {
          bookname: 1
        }
      }, function(err, foundBooks) {
        if (!err) {
          res.render("books", {

            newBookItems: foundBooks
          });
        }
      });
    }
  });
});

//the buy page after signing up: shows all the books available
app.get("/books/:user", function(req, res) {
  Book.find({}, function(err, foundBooks) {

    if (foundBooks.length === 0) {
      console.log("No Books Added");
      res.redirect("/");
    } else {
      Book.find({}, null, { //to sort alphabetically
        sort: {
          bookname: 1
        }
      }, function(err, foundBooks) {
        if (!err) {
          res.render("booksB", {
            user: req.params.user,
            newBookItems: foundBooks
          });
        }
      });
    }
  });
});

//the other products buy page: show all the products except books
app.get("/others", function(req, res) {
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      console.log("No Items Added");
      res.redirect("/");
    } else {
      Item.find({}, null, { //to sort alphabetically
        sort: {
          pname: 1
        }
      }, function(err, foundItems) {
        if (!err) {
          res.render("others", {

            newItems: foundItems
          });
        }
      });
    }
  });
});

//the other products buy page after signing up: show all the products except books
app.get("/others/:user", function(req, res) {
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      console.log("No Items Added");
      res.redirect("/");
    } else {
      Item.find({}, null, { //to sort alphabetically
        sort: {
          pname: 1
        }
      }, function(err, foundItems) {
        if (!err) {
          res.render("othersB", {
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
        newBookItems: foundUser.books,
        newItems: foundUser.items
      });
    }
  });
});

//this deletes books
app.post("/delete/:user", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const user = req.params.user;

  Book.findByIdAndRemove(checkedItemId, function(err) {
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
        books: {
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

//this deletes the other products
app.post("/deleteo/:user", function(req, res) {
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

//this is the add page for other products
app.get("/addother/:user", function(req, res) {
  const user = req.params.user;
  User.findOne({
    username: user
  }, function(err, foundUser) {
    if (!err) {
      res.render("addother", {
        user: foundUser.username
      });
    }
  });
});

app.post("/addother/:user", function(req, res) {
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
    room: req.body.room
  });
  item.save();
  User.findOne({
    username: user
  }, function(err, foundUser) {
    foundUser.items.push(item);
    foundUser.save();
    res.redirect("/dashboard/" + user);
  });
});

//this is the add page for the books
app.get("/additem/:user", function(req, res) {
  const user = req.params.user;
  User.findOne({
    username: user
  }, function(err, foundUser) {
    if (!err) {
      res.render("additem", {
        user: foundUser.username
      });
    }
  });
});

app.post("/additem/:user", function(req, res) {
  const user = req.params.user;
  const book = new Book({
    bookname: req.body.bookname,
    sellp: req.body.sellp,
    name: req.body.name,
    subject: req.body.subject,
    year: req.body.year,
    condition: req.body.condition,
    edition: req.body.edition,
    phone: req.body.phone,
    email: req.body.email,
    time: req.body.time,
    hostel: req.body.hostel,
    room: req.body.room
  });
  book.save();
  User.findOne({
    username: user
  }, function(err, foundUser) {
    foundUser.books.push(book);
    foundUser.save();
    res.redirect("/dashboard/" + user);
  });


});

//this redirects to the page of full details of a specific book
app.get("/bookd/:bookid", function(req, res) {
  const bookid = req.params.bookid;
  Book.findOne({
    _id: bookid
  }, function(err, foundBook) {
    if (!err) {
      res.render("bookd", {
        bookname: foundBook.bookname,
        sellp: foundBook.sellp,
        name: foundBook.name,
        bookdetails: foundBook.bookd,
        contact: foundBook.contact,
        subject: foundBook.name,
        year: foundBook.year,
        condition: foundBook.condition,
        edition: foundBook.edition,
        phone: foundBook.phone,
        email: foundBook.email,
        hostel: foundBook.hostel,
        room: foundBook.room,
        time: foundBook.time
      });
    }
  });
});

//this redirects to the page of full details of a specific book after signing up
app.get("/bookdB/:user/:bookid", function(req, res) {
  const user = req.params.user;
  const bookid = req.params.bookid;
  Book.findOne({
    _id: bookid
  }, function(err, foundBook) {
    if (!err) {
      res.render("bookdB", {
        user: user,
        bookname: foundBook.bookname,
        sellp: foundBook.sellp,
        name: foundBook.name,
        bookdetails: foundBook.bookd,
        contact: foundBook.contact,
        subject: foundBook.name,
        year: foundBook.year,
        condition: foundBook.condition,
        edition: foundBook.edition,
        phone: foundBook.phone,
        email: foundBook.email,
        hostel: foundBook.hostel,
        room: foundBook.room,
        time: foundBook.time
      });
    }
  });
});

//this redirects to the page of full details of a specific product
app.get("/otherd/:itemid", function(req, res) {
  const itemid = req.params.itemid;
  Item.findOne({
    _id: itemid
  }, function(err, foundItem) {
    if (!err) {
      res.render("otherd", {
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
        room: foundItem.room
      });
    }

  });
});

//this redirects to the page of full details of a specific product after signing up
app.get("/otherdB/:user/:itemid", function(req, res) {
  const user = req.params.user;
  const itemid = req.params.itemid;
  Item.findOne({
    _id: itemid
  }, function(err, foundItem) {
    if (!err) {
      res.render("otherdB", {
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
        room: foundItem.room
      });
    }

  });
});

//book info
app.get("/info", function(req, res) {
  res.render("info");
});

//book info page after signing up
app.get("/info/:user", function(req, res) {
  res.render("infoB", {
    user: req.params.user
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
