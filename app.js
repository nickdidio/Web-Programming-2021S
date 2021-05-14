const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const static = express.static(__dirname + "/public");
const configRoutes = require("./routes");

app.use(express.json());

app.use(
  session({
    name: 'FlikPik',
    secret: "609dbae6e2ff9c73a4f129e8",
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
