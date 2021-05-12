// import routes
const wantToWatchListRoutes = require("./wantToWatchList");
const userRoutes = require("./users");

const constructorMethod = (app) => {
  // routes

  //route for building the want to watch list
  app.use("/", userRoutes);
  app.use("/wantToWatchList", wantToWatchListRoutes);
  app.use("/users", userRoutes);

  // show view for 404 errors for undefined routes
  app.use("*", (req, res) => {
    res.status(404);
    res.render("errors/notFound", { title: "Page Not Found" });
  });
};

module.exports = constructorMethod;
