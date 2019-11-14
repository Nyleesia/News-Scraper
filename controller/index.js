// Get dependencies
const express = require("express");
const router = express.Router();
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");
const axios = require("axios");
console.log("controller/index.js => got dependencies."); 

// Get models
const DB = require("../models");
console.log("controller/index.js => got models.");

// Route to scrape new articles
router.get("/scrape", (req, res) => {
  axios.get("https://www.npr.org/sections/world/").then(function(html) {
    let $ = cheerio.load(html.data);
    
    $("article").each(function(i, element)  {

      let result = {};
        
      result.title = $(element).find('.title').text();
      result.teaser = $(element).find('.teaser').text();
      result.link = $(element).find('.title').children("a").attr('href');
      result.img = $(element).find(".imagewrap").children("a").children("img").attr("src"); 

      DB.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    res.redirect("/articles");

  });
});

  // Get articles on landing page
  // router.get("/", (req, res) => {
  //   res.redirect("/articles");
  // });

  router.get("/comments/:id", function(req, res) {
    let articleId = req.params.id;
    // Find all Notes
    DB.Comment.find({})
      .then(function(dbComment) {
        // If all Notes are successfully found, send them back to the client
        res.json(dbComment);
      })
      .catch(function(err) {
        // If an error occurs, send the error back to the client
        res.json(err);
      });
  });


  //Get articles at articles route
  router.get("/articles", (req, res) => {
    DB.Article.find()
      .sort({ _id: 1 })      
      .populate("comment")
      .exec((err, doc) => {
        if (err) {
          console.log(err);
        } else {
          let view = { article: doc };
          res.render("index", view);
          console.log(view);
        }
      });
  });

  // Empty the database
  router.get("/deleteAll", function(req, res) {
    DB.Article.deleteMany({}, function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("All Articles Deleted");
      }
    });
    res.redirect("/articles");
  });
  
  // Delete article by ID
  router.get("/deleteArticle/:id", function(req, res) {
    let articleId = req.params.id;
    DB.Article.findOneAndRemove({ _id: articleId }, function (err, doc){
      if (err) {
        console.log(err);
      } else {
        console.log("Article Deleted");
      }
    })
    res.redirect("/articles");
  });


  // Add a comment to an article
  router.post("/addComment/:id", function(req, res) {
    let artId = req.params.id;
    DB.Comment.create(req.body)
      .then(function (dbComment){
        console.log(dbComment)
        return DB.Article.findOneAndUpdate({_id: artId}, { $push: { comment: dbComment._id } }, { new: true });
    })
    .catch(function(err) {
      console.log(err);
    });

    res.redirect("/articles");
  });

    // Update a comment 
    // router.put("/updateComment/:id", function(req, res) {
    //   let commentId = req.params.id;
    //   let commentText = req.body.commentBody;
    //   let comment = {comment : commentText}

    //   DB.Comment.findOneAndUpdate({ commentId, $set : { comment : comment } }, function (err, doc){
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log("Update Saved");
    //     }
    //   })
    //   res.redirect("/articles");
    // });

    // Delete a comment 
    router.get("/deleteComment/:id", function(req, res) {
      let commentId = req.params.id;
      DB.Comment.findOneAndRemove({ _id: commentId }, function (err, doc){
        if (err) {
          console.log(err);
        } else {
          console.log("Comment Deleted");
        }
      })
      res.redirect("/articles");
    });

   

  //   Export routes
  module.exports = router;