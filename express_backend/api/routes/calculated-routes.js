var express = require('express');
var router = express.Router();
const SkiResort = require('../../lib/SkiResort');

router.get('/', async function (req, res, next) {
    const { startLocationId, endLocationId, difficulty } = req.query;
    const skiResort = new SkiResort()
    res.json(await skiResort.selectLocation(startLocationId, endLocationId, difficulty));
});

module.exports = router;
