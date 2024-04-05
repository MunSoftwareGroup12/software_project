var express = require('express');
var router = express.Router();
const Location = require('../../models/Location');
const Route = require('../../models/Route');
const RouteManager = require('../../lib/RouteManager');
const LocationManager = require('../../lib/LocationManager');


router.get('/', async function (req, res, next) {
    const { startLocationId, endLocationId, difficulty } = req.query;
    
    const map = {
        locations: await Location.find({}),
        routes: await Route.find({})
    }
    const routeManager = new RouteManager(new LocationManager(await Location.find({})));
    res.json(routeManager.calculateRoutes(map, startLocationId, endLocationId, [...difficulty].map(x => parseInt(x))));
});

module.exports = router;
