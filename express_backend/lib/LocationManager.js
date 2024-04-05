const Location = require('../models/Location');

module.exports = class LocationManager {

    constructor(locations) {
        this.locations = locations;
    }

    getLocation(locationId) {
        return this.locations.filter(l => l.id === locationId)[0];
    }

}
