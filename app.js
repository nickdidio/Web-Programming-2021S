const express = require("express");
const app = express();
const static = express.static(__dirname + "/public");
const configRoutes = require("./routes");
const session = require("express-session")

app.use(express.json());

app.use(
  session({
    name: 'FlikPik',
    secret: "609da9a2d5ca590fa27fd848",
    saveUninitialized: true,
    resave: false
  })
);

const exphbs = require("express-handlebars");

app.use("/public", static);
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
