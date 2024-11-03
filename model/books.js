const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    publishedDate: {
      type: Date,
      required: true
    },
    pages: {
      type: Number,
      required: true,
      min: 1 // Ensures at least 1 page
    },
    available: {
      type: Boolean,
      default: true // Sets default value to 'true' for availability
    }
  }, { timestamps: true });

const Book = mongoose.model('Book',bookSchema)

module.exports=Book;
