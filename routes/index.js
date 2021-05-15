// import routes
// TODO: Make sure website views respond properly to errors
const wantToWatchListRoutes = require("./wantToWatchList");
const movieSelectRoutes = require("./movieSelection");
const reviewRoutes = require("./reviews");
const movieRoutes = require("./movies.js");
const userRoutes = require("./users");
const groupManagement = require("./groupManagement");
const e = require("express");

// Log user's behavior
const logMiddleware = async function (req, res, next) {
  let timestamp = new Date().toUTCString();
  let userAuthenticated;
  if (req.session.user) {
    userAuthenticated = "Authenticated User";
  } else {
    userAuthenticated = "Non-Authenticated User";
  }
  console.log(
    `[${timestamp}]: ${req.method} ${req.originalUrl} (${userAuthenticated})`
  );
  next();
};

const constructorMethod = (app) => {
  // routes
  //log middleware
  app.use(logMiddleware);
  app.use("/", userRoutes);

  // Prevent unauthenticated user from accessing routes that need authentification
  app.use("*", (req, res, next) => {
    if (!req.session.user) {
      res.render("home/landing", { title: "FlikPik" });
    } else {
      next();
    }
  });

  // app.use("/home/signup", (req, res) => {
  //   res.render("home/signup", { title: "Signup for FlikPik" });
  // });
  // app.use("/home/login", (req, res) => {
  //   res.render("home/login", { title: "Login to FlikPik" });
  // });

  app.use("/reviews", reviewRoutes);
  app.use("/movies", movieRoutes);

  //route for building the want to watch list
  app.use("/wantToWatchList", wantToWatchListRoutes);

  //routes for movie selection process
  app.use("/pick", movieSelectRoutes);

  //route for group list and creation
  app.use("/groups", groupManagement);

  app.use("/users", userRoutes);

  // show view for 404 errors for undefined routes
  app.use("*", (req, res) => {
    res.status(404);
    res.render("errors/error", {
      title: "error",
      code: 404,
      error: "Page Not Found",
    });
  });
};

module.exports = constructorMethod;
