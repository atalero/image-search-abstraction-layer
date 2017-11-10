const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const searchTermSchema = new Schema ({
  searchValue : String,
  searchDate: Date
  });

const model = mongoose.model('searchTerm', searchTermSchema)

module.exports = model;