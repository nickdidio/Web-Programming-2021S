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
  res.render("home/landing", { title: "FlikPik", unauthenticated: true });
});

// Get login page
app.get("/home/login", async function (req, res) {
  if (activeSession(req)) {
    res.redirect("/home/profile");
    return;
  } else {
    res.render("home/login", {
      title: "Login to FlikPik",
      unauthenticated: true,
    });
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
  if (
    !username ||
    !password ||
    typeof username != "string" ||
    typeof password != "string"
  ) {
    res.status(401);
    res.render("home/login", {
      title: "Login error",
      error: "A username and password must be provided.",
      unauthenticated: true,
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
            unauthenticated: true,
          });
          return;
        }
      } catch (error) {
        res.status(401);
        res.render("home/login", {
          title: "Login Error",
          error: "Invalid username and/or password. Try again.",
          unauthenticated: true,
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
      unauthenticated: true,
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
  res.render("home/signup", {
    title: "Signup for FlikPik",
    unauthenticated: true,
  });
});

// Post form from signup info
// Redirect to profile page if authorized
app.post("/signup", async function (req, res) {
  if (activeSession(req)) {
    res.redirect("/home/profile");
    return;
  }

  // error check userInfo parameters
  const { email, firstName, lastName, username, password } = req.body;
  try {
    utils.checkUserParameters(email, firstName, lastName, username, password);
  } catch (e) {
    res.status(400).render("home/signup", {
      title: "Sign up Error",
      error: "Must enter a value for all fields",
      unauthenticated: true,
    });
    return;
  }

  // Add user
  try {
    const userDb = await userData.getAllUsers();
    // Check if user is already registered
    for (const user of userDb) {
      if (user.username === username || user.email === email) {
        res.status(401).render("home/signup", {
          title: "Sign up Error",
          error: "That account is already registered.",
          unauthenticated: true,
        });
        return;
      }
    }
    // Add user to DB
    const newUser = await userData.addUser(
      xss(email),
      xss(firstName),
      xss(lastName),
      xss(username),
      xss(password)
    );

    req.session.user = newUser;
    res.redirect("/home/profile");
    return;
  } catch (error) {
    res.status(400);
    res.render("home/signup", {
      title: "Signup for FlikPik",
      error: "Sign in error",
      unauthenticated: true,
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
  req.session.active = false
  req.session.chosen = false
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
