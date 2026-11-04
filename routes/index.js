const router = require('express').Router();
const mapNormalUserRoute = require('./normalUserRoute');
const mapHealthStatusRoute = require('@godsocial/utils/eureka/healthStatusRoute');

mapHealthStatusRoute(router);
mapNormalUserRoute(router);

module.exports = router;
