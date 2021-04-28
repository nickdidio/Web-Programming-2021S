// import routes

const constructorMethod = (app) => {
  // routes
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
