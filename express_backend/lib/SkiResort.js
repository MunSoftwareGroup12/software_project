const Location = require('../models/Location');
const Route = require('../models/Route');
const RouteManager = require('./RouteManager');
const LocationManager = require('./LocationManager');

module.exports = class SkiResort {

    async selectLocation(startLocationId, endLocationId, difficulty) {
        const map = {
            locations: await Location.find({}),
            routes: await Route.find({})
        }
        const routeManager = new RouteManager(new LocationManager(await Location.find({})));
        return routeManager.calculateRoutes(map, startLocationId, endLocationId, [...difficulty].map(x => parseInt(x)));
    }

}
