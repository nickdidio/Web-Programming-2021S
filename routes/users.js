const express = require("express");
const app = express();
const session = require("express-session");
const data = require("../data");
const bcrypt = require("bcrypt");
const userData = data.users;

app.use(
  session({
    name: "AuthCookie",
    secret: "dontbeasnitch",
    resave: false,
    saveUninitialized: true,
  })
);

const activeSession = async function (req) {
  const activeBool = !!req.session.user;
  return activeBool;
};

const logMiddleware = async function (req, res, next) {
  let timestamp = new Date().toUTCString();
  let userAuthenticated;
  if (activeSession(req)) {
    userAuthenticated = "Authenticated User";
  } else {
    userAuthenticated = "Non-Authenticated User";
  }
  console.log(
    `[${timestamp}]: ${req.method} ${req.originalUrl} (${userAuthenticated})`
  );
  next();
};

app.use(logMiddleware);

app.get("/", async function (req, res) {
  if (activeSession(req)) {
    res.render("home/landing", { title: "FlikPik" });
  } else {
    res.render("landing", { title: "FlikPik" });
  }
});

app.post("/login", async function (req, res) {
  const { username, password } = req.body;
});

app.post("/signup", async function (req, res) {});

module.exports = app;
