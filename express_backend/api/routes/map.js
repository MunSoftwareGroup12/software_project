var express = require('express');
const Location = require('../../models/Location');
const Route = require('../../models/Route');
var router = express.Router();

router.get('/', async function (req, res, next) {
    const map = {
        locations: await Location.find({}),
        routes: await Route.find({})
    }
    res.json(mapData);
});

module.exports = router;
