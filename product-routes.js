const express = require("express");
const router = express.Router();
const ObjectId = require("mongodb").ObjectId;

const mongoose = require("mongoose");
const productModel = mongoose.model("product");

router
  .route("/product")
  .get((req, res, next) => {
    try {
      if (req.isAuthenticated()) {
        productModel.find({}, (err, products) => {
          if (err) return res.status(500).send("DB hiba");
          res.status(200).send(products);
        });
      } else {
        res.sendStatus(401);
      }
    } catch (e) {
      next(e);
    }
  })
  .post((req, res, next) => {
    try {
      if (
        req.isAuthenticated() &&
        req.session.passport.user.accessLevel === "admin"
      ) {
        const product = new productModel({
          name: req.body.name,
          price: req.body.price,
          inStock: true,
          description: req.body.description,
        });
        product.save((error) => {
          if (error) return res.status(500).send("A mentés során hiba történt");
          return res.status(200).send("Sikeres mentes tortent");
        });
      } else {
        res.sendStatus(401);
      }
    } catch (e) {
      next(e);
    }
  })
  .put(async (req, res, next) => {
    try {
      if (
        req.isAuthenticated() &&
        req.session.passport.user.accessLevel === "admin"
      ) {
        const product = {
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
        };
        await productModel.updateOne(
          { _id: ObjectId(req.body._id) },
          { $set: product }
        );
        res.sendStatus(200);
      } else {
        res.sendStatus(401);
      }
    } catch (e) {
      next(e);
    }
  });

module.exports = router;
