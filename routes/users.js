const express = require("express");
const router = express.Router();
const session = require("express-session");
const data = require("../data");
const bcrypt = require("bcrypt");
const userData = data.users;

router.use(
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

router.use(logMiddleware);

router.get("/", async function (req, res) {
  if (activeSession(req)) {
    res.redirect("/profile");
  } else {
    res.render("landing", { title: "FlikPik" });
  }
});

router.post("/login", async function (req, res) {
  const { username, password } = req.body;
});

router.post("/signup", async function (req, res) {});
