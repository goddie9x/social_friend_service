require('dotenv').config();

const express = require('express');
const router = require('./routes');
const getAuthAndPutCurrentUserAuthToBody = require('./utils/middlewares/getAuthAndPutCurrentUserAuthToBody');
const connectToDiscoveryServer = require('./utils/configs/discovery');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(getAuthAndPutCurrentUserAuthToBody);

app.use(process.env.APP_PATH || '/api/v1/friends', router);

connectToDiscoveryServer();

const server = app.listen(PORT, () => {
    console.log(`Express app listening at http://localhost:${PORT}`);
});

module.exports = {
    app, server
};
