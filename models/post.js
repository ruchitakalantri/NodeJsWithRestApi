const momgoose = require("mongoose");

const Schema = momgoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Object,
      required: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = momgoose.model("Post", postSchema);
