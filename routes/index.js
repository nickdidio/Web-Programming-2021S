// import routes
const wantToWatchListRoutes = require("./wantToWatchList");
const reviewRoutes = require("./reviews");

const constructorMethod = (app) => {
  // routes

  //route for building the want to watch list
  app.use("/wantToWatchList", wantToWatchListRoutes);
  app.use("/reviews", reviewRoutes);

  app.use("/", (req, res) => {
    res.render("temporary/fakeLanding", { title: "Temporary Landing Page" });
  });

  // show view for 404 errors for undefined routes
  app.use("*", (req, res) => {
    res.status(404);
    res.render("errors/notFound", { title: "Page Not Found" });
  });
};

module.exports = constructorMethod;
