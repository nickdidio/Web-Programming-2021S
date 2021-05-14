// import routes
// TODO: Make sure website views respond properly to errors
const wantToWatchListRoutes = require("./wantToWatchList");
const movieSelectRoutes = require("./movieSelection");
const reviewRoutes = require("./reviews");
const movieRoutes = require("./movies.js");
const userRoutes = require("./users");
const groupManagement = require("./groupManagement")

const constructorMethod = (app) => {
  // routes
  app.use("/reviews", reviewRoutes);
  app.use("/movies", movieRoutes);

  //route for building the want to watch list
  app.use("/", userRoutes);
  app.use("/wantToWatchList", wantToWatchListRoutes);

  //routes for movie selection process
  app.use("/pick", movieSelectRoutes);

  app.use("/groups", groupManagement);

  app.use("/", (req, res) => {
    res.render("temporary/fakeLanding", { title: "Temporary Landing Page" });
  });
  app.use("/users", userRoutes);

  // show view for 404 errors for undefined routes
  app.use("*", (req, res) => {
    res.status(404);
    res.render("errors/notFound", { title: "Page Not Found" });
  });
};

module.exports = constructorMethod;
