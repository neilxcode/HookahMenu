const express = require("express");
const authRoutes = express.Router();
const User    = require('../models/userSchema');
const bcrypt         = require("bcrypt");
const bcryptSalt     = 10;


//SIGNUP ROUTES
authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

//MAKE SURE FORMS ARENT BLANK
authRoutes.post('/signup', (req, res, next)=>{
   const username = req.body.username;
   const password = req.body.password;
   const role     = req.body.role;

   if(username ===""||password===""){
     res.render('auth/signup', {
       message: `Missing Credentials.
       Please enter a username and password in order to sign up`
     })
     return;
   };

//MAKE SURE USERNAME DOESNT EXIST ALREADY
   User.findOne({ "username": username },
  "username",
  (err, user) => {
    if (user !== null) {
      res.render("auth/signup", {
        errorMessage: "The username already exists"
      });
      return;
    }// end the if statement

   const salt = bcrypt.genSaltSync(bcryptSalt);
   const hashPass = bcrypt.hashSync(password, salt);


   const newUser = User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      res.redirect("/");
    });
  });
});


//    User.create({username:username, password: hashPass,})
//    .then((theUser)=>{
//      res.redirect('/')
//    })
//    .catch((err)=>{
//      console.log(err);
//      next(err);
//    })

//  })//end the .then function for user.findOne query
//    .catch((err)=>{
//      console.log(err);
//      next(err);
//    })
//  });//end post /signup route

//END SIGNUP ROUTES



//LOGIN ROUTES

authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login");
});

//POST FOR LOGIN FORM
authRoutes.post("/login", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

//ERROR CHECKING
  if (username === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }

  User.findOne({ "username": username }, (err, user) => {
      if (err || !user) {
        res.render("auth/login", {
          errorMessage: "The username doesn't exist"
        });
        return;
      }
      if (bcrypt.compareSync(password, user.password)) {
        // Save the login in the session!
        req.session.currentUser = user;
        res.redirect("/");
      } else {
        res.render("auth/login", {
          errorMessage: "Incorrect password"
        });
      }
  });
});

authRoutes.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    // cannot access session here
    res.redirect("/login");
  });
});





module.exports = authRoutes;