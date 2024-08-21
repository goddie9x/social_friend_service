const mongoose = require('mongoose');

const connectToDD = async (url, callback) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('connected to dbconnect db successfully');
    } catch (error) {
        console.log(error);
    }
}

connectToDD();

module.exports = mongoose;