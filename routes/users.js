const express = require("express");
const app = express();
const session = require("express-session");
const data = require("../data");
const bcrypt = require("bcrypt");
const utils = require("../utils");
const userData = data.users;
const xss = require("xss");
const { response } = require("express");

// Cookie
app.use(
  session({
    name: "AuthCookie",
    secret: "dontbeasnitch",
    resave: false,
    saveUninitialized: true,
  })
);

// Check if a cookie is active
const activeSession = function (req) {
  if (typeof req.session.user !== "undefined") return true;
  return false;
};

// Get landing page
app.get("/", async function (req, res) {
  if (activeSession(req)) {
    res.redirect("/home/profile");
    return;
  }
  res.render("home/landing", { title: "FlikPik" });
});

// Get login page
app.get("/home/login", async function (req, res) {
  if (activeSession(req)) {
    res.redirect("/home/profile");
    return;
  } else {
    res.render("home/login", { title: "Login to FlikPik" });
  }
});

// Post login form info
// Redirect to profile page if authorized
app.post("/login", async function (req, res) {
  if (activeSession(req)) {
    res.redirect("/home/profile");
    return;
  }

  const password = req.body.password;
  const username = req.body.username;
  // Check if username or password is provided
  if (!username || !password) {
    res.status(401);
    res.render("home/login", {
      title: "Login error",
      error: "A username and password must be provided.",
    });
    return;
  }
  // Check username and password against all users
  let users = await userData.getAllUsers();
  for (const user of users) {
    if (user.username === username) {
      let match = false;
      try {
        match = await bcrypt.compare(password, user.password);
        if (match) {
          // Authenticated user
          req.session.user = user;
          res.redirect("/home/profile");
          return;
        } else {
          // Non-auth user
          res.status(401);
          res.render("home/login", {
            title: "Login Error",
            error: "Invalid username and/or password. Try again.",
          });
          return;
        }
      } catch (error) {
        res.status(401);
        res.render("home/login", {
          title: "Login Error",
          error: "Invalid username and/or password. Try again.",
        });
        return;
      }
    }
  }
  // If no active cookie is found
  if (!req.session.user) {
    res.status(401);
    res.render("home/login", {
      title: "Login Error",
      error: "Please login.",
    });
    return;
  }
});

// Get signup page
app.get("/home/signup", async function (req, res) {
  if (activeSession(req)) {
    res.redirect("/home/profile");
    return;
  }
  res.render("home/signup", { title: "Signup for FlikPik" });
});

// Post form from signup info
// Redirect to profile page if authorized
app.post("/signup", async function (req, res) {
  if (activeSession(req)) {
    res.redirect("/home/profile");
    return;
  }

  const userInfo = req.body;
  // Check for info submitted
  if (!userInfo) {
    res
      .status(400)
      .render("home/signup", { error: "You must fill in all fields." });
    return;
  }
  // Check for proper email
  if (!userInfo.email || !utils.emailValidator(userInfo.email)) {
    res
      .status(400)
      .render("home/signup", { error: "You must enter a valid email" });
    return;
  }
  // Check for first namwe
  if (!userInfo.firstName || userInfo.firstName === "") {
    res
      .status(400)
      .render("home/signup", { error: "You must enter a first name" });
    return;
  }
  if (!userInfo.lastName || userInfo.lastName === "") {
    res
      .status(400)
      .render("home/signup", { error: "You must enter a last name" });
    return;
  }
  if (!userInfo.username || userInfo.userName === "") {
    res
      .status(400)
      .render("home/signup", { error: "You must enter a username" });
    return;
  }
  if (!userInfo.password || userInfo.password === "") {
    res
      .status(400)
      .render("home/signup", { error: "You must enter a password" });
    return;
  }

  // Add user
  try {
    const userDb = await userData.getAllUsers();
    // Check if user is already registered
    for (const user of userDb) {
      if (
        user.username === userInfo.username ||
        user.email === userInfo.email
      ) {
        res.status(401).render("home/signup", {
          error: "That account is already registered.",
        });
        return;
      }
    }
    // Add user to DB
    const newUser = await userData.addUser(
      xss(userInfo.email),
      xss(userInfo.firstName),
      xss(userInfo.lastName),
      xss(userInfo.username),
      xss(userInfo.password)
    );

    req.session.user = newUser;
    res.redirect("/home/profile");
    return;
  } catch (error) {
    res.status(400);
    res.render("home/signup", {
      title: "Signup for FlikPik",
      error: "Could not register account.",
    });
  }
});

// Check if user session is active
// When trying to reach profile page
app.use("/home/profile", async function (req, res, next) {
  if (!req.session.user) {
    res.status(403);
    res.redirect("/");
    return;
  } else {
    next();
  }
});

// Get profile page
app.get("/home/profile", async function (req, res) {
  res.render("home/profile", {
    title: "FlikPik Profile",
    user: req.session.user,
  });
  return;
});

// Destroy cookie and redirect to landing page
app.get("/logout", async function (req, res) {
  req.session.destroy();
  res.redirect("/");
  return;
});

module.exports = app;
