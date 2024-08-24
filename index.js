require('dotenv').config();

const express = require('express');
const router = require('./routes');
const getAuthAndPutCurrentUserAuthToBody = require('./utils/middlewares/getAuthAndPutCurrentUserAuthToBody');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(getAuthAndPutCurrentUserAuthToBody);

app.use('/api/v1/friends', router);

const server = app.listen(PORT, () => {
    console.log(`Express app listening at http://localhost:${PORT}`);
});

module.exports = {
    app, server
};
