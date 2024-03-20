var express = require('express');
const connectDB = require('../../lib/connectDb');
var router = express.Router();

const mapData = {
    "locations": [
        { "id": "L001", "name": "SnowPeak", "type": "L", "description": "this is a snow location", "x": 9.5, "y": 6.2, "z": -7.7 },
        { "id": "L002", "name": "FrostHaven", "type": "L", "description": "this is a snow location", "x": 8, "y": 5.3, "z": -3.2 },
        { "id": "L003", "name": "IceCrest", "type": "L", "description": "this is a snow location", "x": 6.1, "y": 4.3, "z": -1.4 },
        { "id": "L004", "name": "Glacier", "type": "L", "description": "this is a snow location", "x": 5.8, "y": 3.4, "z": -12.2 },
        { "id": "L005", "name": "WiterFell", "type": "L", "description": "this is a snow location", "x": 4.7, "y": 2.9, "z": -3.6 },
        { "id": "L006", "name": "SnowDrift", "type": "L", "description": "this is a snow location", "x": 3.9, "y": 2.4, "z": -7 },
        { "id": "L007", "name": "Icicle", "type": "L", "description": "this is a snow location", "x": 3.9, "y": 2.7, "z": -2.8 },
        { "id": "L008", "name": "Iceberg", "type": "L", "description": "this is a snow location", "x": 3.8, "y": 2.2, "z": -5.8 },
        { "id": "L009", "name": "Heixian", "type": "L", "description": "this is a snow location", "x": 0.6, "y": 0.2, "z": -12 },
        { "id": "L010", "name": "Clearview", "type": "L", "description": "this is a snow location", "x": 1, "y": 0.9, "z": -5.4 },
        { "id": "L011", "name": "Troncliff", "type": "L", "description": "this is a snow location", "x": -1.6, "y": -0.7, "z": -12.5 },
        { "id": "L012", "name": "Eaglepeak", "type": "L", "description": "this is a snow location", "x": -4, "y": -1, "z": -5 },
        { "id": "L013", "name": "Suncrest", "type": "L", "description": "this is a snow location", "x": -2.9, "y": -0.7, "z": 2 },
        { "id": "L014", "name": "Evengreen", "type": "L", "description": "this is a snow location", "x": -3.9, "y": -0.9, "z": 4.6 },
        { "id": "L015", "name": "Stonerighe", "type": "L", "description": "this is a snow location", "x": 3, "y": 2.1, "z": 7 },
        { "id": "S001", "name": "Toilet-01", "type": "S", "description": "this is a toliet", "x": -2.3, "y": -0.8, "z": -8.7 },
        { "id": "S002", "name": "Asian sushi", "type": "S", "description": "this is a Asian restaurant", "x": -4.1, "y": -1.4, "z": -1.4 },
        { "id": "S003", "name": "Toilet-02", "type": "S", "description": "this is a toliet", "x": -3.2, "y": -1.1, "z": -0.7 }
    ],
    "routes": [
        { "id": "R001", "difficulty": 4, "lineSegmentType": -1, "D1": { "id": "L001", "x": 9.5, "y": 6.2, "z": -7.7 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L001 and L008" },
        { "id": "N001", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L001", "x": 9.5, "y": 6.2, "z": -7.7 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L001 and L008" },
        { "id": "R002", "difficulty": 4, "lineSegmentType": -1, "D1": { "id": "L002", "x": 8, "y": 5.3, "z": -3.2 }, "D2": { "id": "L005", "x": 4.7, "y": 2.9, "z": -3.6 }, "description": "this is a route from L002 and L005" },
        { "id": "N002", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L002", "x": 8, "y": 5.3, "z": -3.2 }, "D2": { "id": "L005", "x": 4.7, "y": 2.9, "z": -3.6 }, "description": "this is a route from L002 and L005" },
        { "id": "R003", "difficulty": 3, "lineSegmentType": -1, "D1": { "id": "L003", "x": 6.1, "y": 4.3, "z": -1.4 }, "D2": { "id": "L007", "x": 3.9, "y": 2.7, "z": -2.8 }, "description": "this is a route from L003 and L007" },
        { "id": "N003", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L003", "x": 6.1, "y": 4.3, "z": -1.4 }, "D2": { "id": "L007", "x": 3.9, "y": 2.7, "z": -2.8 }, "description": "this is a route from L003 and L007" },
        { "id": "R004", "difficulty": 4, "lineSegmentType": -1, "D1": { "id": "L004", "x": 5.8, "y": 3.4, "z": -12.2 }, "D2": { "id": "L009", "x": 0.6, "y": 0.2, "z": -12 }, "description": "this is a route from L004 and L009" },
        { "id": "N004", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L004", "x": 5.8, "y": 3.4, "z": -12.2 }, "D2": { "id": "L009", "x": 0.6, "y": 0.2, "z": -12 }, "description": "this is a route from L004 and L009" },
        { "id": "R005", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "L005", "x": 4.7, "y": 2.9, "z": -3.6 }, "D2": { "id": "L007", "x": 3.9, "y": 2.7, "z": -2.8 }, "description": "this is a route from L005 and L007" },
        { "id": "R006", "difficulty": 1, "lineSegmentType": -1, "D1": { "id": "L005", "x": 4.7, "y": 2.9, "z": -3.6 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L005 and L008" },
        { "id": "N006", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L005", "x": 4.7, "y": 2.9, "z": -3.6 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L005 and L008" },
        { "id": "N007", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "L006", "x": 3.9, "y": 2.4, "z": -7 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L006 and L008" },
        { "id": "R008", "difficulty": 3, "lineSegmentType": -1, "D1": { "id": "L006", "x": 3.9, "y": 2.4, "z": -7 }, "D2": { "id": "L009", "x": 0.6, "y": 0.2, "z": -12 }, "description": "this is a route from L006 and L009" },
        { "id": "N008", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L006", "x": 3.9, "y": 2.4, "z": -7 }, "D2": { "id": "L009", "x": 0.6, "y": 0.2, "z": -12 }, "description": "this is a route from L006 and L009" },
        { "id": "R009", "difficulty": 2, "lineSegmentType": -1, "D1": { "id": "L007", "x": 3.9, "y": 2.7, "z": -2.8 }, "D2": { "id": "L010", "x": 1, "y": 0.9, "z": -5.4 }, "description": "this is a route from L007 and L010" },
        { "id": "N009", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L007", "x": 3.9, "y": 2.7, "z": -2.8 }, "D2": { "id": "L010", "x": 1, "y": 0.9, "z": -5.4 }, "description": "this is a route from L007 and L010" },
        { "id": "R010", "difficulty": 2, "lineSegmentType": -1, "D1": { "id": "L009", "x": 0.6, "y": 0.2, "z": -12 }, "D2": { "id": "L011", "x": -1.6, "y": -0.7, "z": -12.5 }, "description": "this is a route from L009 and L011" },
        { "id": "N010", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L009", "x": 0.6, "y": 0.2, "z": -12 }, "D2": { "id": "L011", "x": -1.6, "y": -0.7, "z": -12.5 }, "description": "this is a route from L009 and L011" },
        { "id": "R011", "difficulty": 2, "lineSegmentType": -1, "D1": { "id": "L010", "x": 1, "y": 0.9, "z": -5.4 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from L010 and L012" },
        { "id": "N011", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L010", "x": 1, "y": 0.9, "z": -5.4 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from L010 and L012" },
        { "id": "R012", "difficulty": 1, "lineSegmentType": 1, "D1": { "id": "L013", "x": -2.9, "y": -0.7, "z": 2 }, "D2": { "id": "L014", "x": -3.9, "y": -0.9, "z": 4.6 }, "description": "this is a route from L013 and L014" },
        { "id": "N012", "difficulty": 0, "lineSegmentType": -1, "D1": { "id": "L013", "x": -2.9, "y": -0.7, "z": 2 }, "D2": { "id": "L014", "x": -3.9, "y": -0.9, "z": 4.6 }, "description": "this is a route from L013 and L014" },
        { "id": "R013", "difficulty": 3, "lineSegmentType": -1, "D1": { "id": "L014", "x": -3.9, "y": -0.9, "z": 4.6 }, "D2": { "id": "L015", "x": 3, "y": 2.1, "z": 7 }, "description": "this is a route from L014 and L015" },
        { "id": "N013", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L014", "x": -3.9, "y": -0.9, "z": 4.6 }, "D2": { "id": "L015", "x": 3, "y": 2.1, "z": 7 }, "description": "this is a route from L014 and L015" },
        { "id": "R014", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "S001", "x": -2.3, "y": -0.8, "z": -8.7 }, "D2": { "id": "L011", "x": -1.6, "y": -0.7, "z": -12.5 }, "description": "this is a route from S001 and L011" },
        { "id": "R015", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "S001", "x": -2.3, "y": -0.8, "z": -8.7 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from S001 and L012" },
        { "id": "R016", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "S002", "x": -4.1, "y": -1.4, "z": -1.4 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from S002 and L012" },
        { "id": "N017", "difficulty": 0, "lineSegmentType": -1, "D1": { "id": "S002", "x": -4.1, "y": -1.4, "z": -1.4 }, "D2": { "id": "L013", "x": -2.9, "y": -0.7, "z": 2 }, "description": "this is a route from S002 and L013" },
        { "id": "R017", "difficulty": 1, "lineSegmentType": 1, "D1": { "id": "S002", "x": -4.1, "y": -1.4, "z": -1.4 }, "D2": { "id": "L013", "x": -2.9, "y": -0.7, "z": 2 }, "description": "this is a route from S002 and L013" },
        { "id": "R018", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "S003", "x": -3.2, "y": -1.1, "z": -0.7 }, "D2": { "id": "S002", "x": -4.1, "y": -1.4, "z": -1.4 }, "description": "this is a route from S003 and S002" }
    ]
}

/* GET home page. */
router.get('/', async function (req, res, next) {
    await connectDB();
    res.json(mapData);
});

module.exports = router;
