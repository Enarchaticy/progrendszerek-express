const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const expressSession = require("express-session");

const app = express();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const port = process.env.PORT || 8080;
const dbUrl =
  "mongodb+srv://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASS +
  "@progrendszerek.qm4wr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

//const dbUrl = 'mongodb://localhost:1586';

mongoose.connect(dbUrl);

mongoose.connection.on("connected", () => {
  console.log("db csatlakoztatva");
});

mongoose.connection.on("error", (err) => {
  console.log("Hiba tortént", err);
});

require("./user.model");
require("./product.model");

const userModel = mongoose.model("user");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({}));

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set(
      "Access-Control-Allow-Methods",
      "GET,PUT,POST,DELETE,PATCH,OPTIONS"
    );
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
  }
  next();
});

passport.use(
  "local",
  new localStrategy(function (username, password, done) {
    userModel.findOne({ username: username }, function (err, user) {
      if (err) return done("Hiba lekeres soran", null);
      if (!user) return done("Nincs ilyen felhasználónév", null);
      user.comparePasswords(password, function (error, isMatch) {
        if (error) return done(error, false);
        if (!isMatch) return done("Hibas jelszo", false);
        return done(null, user);
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  if (!user) return done("nincs megadva beléptethető felhasználó", null);
  return done(null, user);
});

passport.deserializeUser(function (user, done) {
  if (!user) return done("nincs user akit kiléptethetnénk", null);
  return done(null, user);
});

app.use(
  expressSession({ secret: process.env.SESSION_SECRET, resave: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res, next) => {
  res.send("Hello World!");
});

app
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"));

app.use("/", require("./user-routes"));
app.use("/", require("./product-routes"));
// REST - Representative State Transfer, GET - Read, POST - Create, PUT - Update, DELETE - Delete

app.use((req, res, next) => {
  console.log("ez a hibakezelo");
  res.status(404).send("A kert eroforras nem talalhato");
});

app.listen(port, () => {
  console.log("The server is running!");
});
