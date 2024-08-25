const connectToDB = require('../utils/configs/singleMongoDb');
const mongoose = require('mongoose');

connectToDB(mongoose, process.env.MONGODB_URI);

module.exports = mongoose;