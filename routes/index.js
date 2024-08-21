const router = require('express').Router();
const mapNormalUserRoute = require('./normalUserRoute');

mapNormalUserRoute(router);

module.exports = router;
