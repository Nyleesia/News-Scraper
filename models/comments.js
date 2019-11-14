//Get dependency
const mongoose = require("mongoose");

// Setup new schema to handle comments
const Schema = mongoose.Schema;
const CommentSchema = new Schema({
  commentBody: {
    type: String,
    required: true
  },
  article: [
    {
      type: Schema.Types.ObjectId,
      ref: "Article"
    }
  ]
});
const Comment = mongoose.model("Comment", CommentSchema);

//Export Comment Schema
module.exports = Comment;