var express = require('express');
var router = express.Router();

const staticRoute = {
  "testAddArr":[
      {
          "id": 1,
          "tag": "Fastest",
          "details": {
              "estimateTime": "45m",
              "condition": "↗5m↘95m",
              "length": "900m"
          },
          "locations": [
              { "id": "L001", "name": "SnowPeak", "type": "L", "description": "this is a snow location", "x": 9.5, "y": 6.2, "z": -7.7 },
              { "id": "L005", "name": "WiterFell", "type": "L", "description": "this is a snow location", "x": 4.7, "y": 2.9, "z": -3.6 },
              { "id": "L007", "name": "Icicle", "type": "L", "description": "this is a snow location", "x": 3.9, "y": 2.7, "z": -2.8 },
              { "id": "L008", "name": "Iceberg", "type": "L", "description": "this is a snow location", "x": 3.8, "y": 2.2, "z": -5.8 },
              { "id": "L010", "name": "Clearview", "type": "L", "description": "this is a snow location", "x": 1, "y": 0.9, "z": -5.4 },
              { "id": "L012", "name": "Eaglepeak", "type": "L", "description": "this is a snow location", "x": -4, "y": -1, "z": -5 },
              { "id": "S002", "name": "Asian sushi", "type": "S", "description": "this is a Asian restaurant", "x": -4.1, "y": -1.4, "z": -1.4 }
  
          ],
          "routes": [
              { "id": "R001", "difficulty": 4, "lineSegmentType": -1, "D1": { "id": "L001", "x": 9.5, "y": 6.2, "z": -7.7 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L001 and L008" },
              { "id": "R005", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "L005", "x": 4.7, "y": 2.9, "z": -3.6 }, "D2": { "id": "L007", "x": 3.9, "y": 2.7, "z": -2.8 }, "description": "this is a route from L005 and L007" },
              { "id": "R006", "difficulty": 1, "lineSegmentType": -1, "D1": { "id": "L005", "x": 4.7, "y": 2.9, "z": -3.6 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L005 and L008" },
              { "id": "R009", "difficulty": 2, "lineSegmentType": -1, "D1": { "id": "L007", "x": 3.9, "y": 2.7, "z": -2.8 }, "D2": { "id": "L010", "x": 1, "y": 0.9, "z": -5.4 }, "description": "this is a route from L007 and L010" },
              { "id": "R011", "difficulty": 2, "lineSegmentType": -1, "D1": { "id": "L010", "x": 1, "y": 0.9, "z": -5.4 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from L010 and L012" },
              { "id": "R016", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "S002", "x": -4.1, "y": -1.4, "z": -1.4 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from S002 and L012" }
          ]
      },
      {
          "id": 2,
          "tag": "Simplest",
          "details": {
              "estimateTime": "1h5m",
              "condition": "↗15m↘105m",
              "length": "1050m"
          },
          "locations": [
              { "id": "L001", "name": "SnowPeak", "type": "L", "description": "this is a snow location", "x": 9.5, "y": 6.2, "z": -7.7 },
              { "id": "L006", "name": "SnowDrift", "type": "L", "description": "this is a snow location", "x": 3.9, "y": 2.4, "z": -7 },
              { "id": "L008", "name": "Iceberg", "type": "L", "description": "this is a snow location", "x": 3.8, "y": 2.2, "z": -5.8 },
              { "id": "L009", "name": "Heixian", "type": "L", "description": "this is a snow location", "x": 0.6, "y": 0.2, "z": -12 },
              { "id": "L011", "name": "Troncliff", "type": "L", "description": "this is a snow location", "x": -1.6, "y": -0.7, "z": -12.5 },
              { "id": "L012", "name": "Eaglepeak", "type": "L", "description": "this is a snow location", "x": -4, "y": -1, "z": -5 },
              { "id": "S001", "name": "Toilet-01", "type": "S", "description": "this is a toliet", "x": -2.3, "y": -0.8, "z": -8.7 },
              { "id": "S002", "name": "Asian sushi", "type": "S", "description": "this is a Asian restaurant", "x": -4.1, "y": -1.4, "z": -1.4 }
  
          ],
          "routes": [
              { "id": "N001", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L001", "x": 9.5, "y": 6.2, "z": -7.7 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L001 and L008" },
              { "id": "N007", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "L006", "x": 3.9, "y": 2.4, "z": -7 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L006 and L008" },
              { "id": "N008", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L006", "x": 3.9, "y": 2.4, "z": -7 }, "D2": { "id": "L009", "x": 0.6, "y": 0.2, "z": -12 }, "description": "this is a route from L006 and L009" },
              { "id": "N010", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L009", "x": 0.6, "y": 0.2, "z": -12 }, "D2": { "id": "L011", "x": -1.6, "y": -0.7, "z": -12.5 }, "description": "this is a route from L009 and L011" },
              { "id": "R014", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "S001", "x": -2.3, "y": -0.8, "z": -8.7 }, "D2": { "id": "L011", "x": -1.6, "y": -0.7, "z": -12.5 }, "description": "this is a route from S001 and L011" },
              { "id": "R015", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "S001", "x": -2.3, "y": -0.8, "z": -8.7 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from S001 and L012" },
              { "id": "R016", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "S002", "x": -4.1, "y": -1.4, "z": -1.4 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from S002 and L012" }
          ]
      },
      {
          "id": 3,
          "tag": "Shortest",
          "details": {
              "estimateTime": "55m",
              "condition": "↗5m↘95m",
              "length": "670m"
          },
          "locations": [
              { "id": "L001", "name": "SnowPeak", "type": "L", "description": "this is a snow location", "x": 9.5, "y": 6.2, "z": -7.7 },
              { "id": "L005", "name": "WiterFell", "type": "L", "description": "this is a snow location", "x": 4.7, "y": 2.9, "z": -3.6 },
              { "id": "L007", "name": "Icicle", "type": "L", "description": "this is a snow location", "x": 3.9, "y": 2.7, "z": -2.8 },
              { "id": "L008", "name": "Iceberg", "type": "L", "description": "this is a snow location", "x": 3.8, "y": 2.2, "z": -5.8 },
              { "id": "L010", "name": "Clearview", "type": "L", "description": "this is a snow location", "x": 1, "y": 0.9, "z": -5.4 },
              { "id": "L012", "name": "Eaglepeak", "type": "L", "description": "this is a snow location", "x": -4, "y": -1, "z": -5 },
              { "id": "S002", "name": "Asian sushi", "type": "S", "description": "this is a Asian restaurant", "x": -4.1, "y": -1.4, "z": -1.4 }
  
          ],
          "routes": [
              { "id": "N001", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L001", "x": 9.5, "y": 6.2, "z": -7.7 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L001 and L008" },
              { "id": "R005", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "L005", "x": 4.7, "y": 2.9, "z": -3.6 }, "D2": { "id": "L007", "x": 3.9, "y": 2.7, "z": -2.8 }, "description": "this is a route from L005 and L007" },
              { "id": "R006", "difficulty": 1, "lineSegmentType": -1, "D1": { "id": "L005", "x": 4.7, "y": 2.9, "z": -3.6 }, "D2": { "id": "L008", "x": 3.8, "y": 2.2, "z": -5.8 }, "description": "this is a route from L005 and L008" },
              { "id": "N009", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L007", "x": 3.9, "y": 2.7, "z": -2.8 }, "D2": { "id": "L010", "x": 1, "y": 0.9, "z": -5.4 }, "description": "this is a route from L007 and L010" },
              { "id": "N011", "difficulty": 0, "lineSegmentType": 1, "D1": { "id": "L010", "x": 1, "y": 0.9, "z": -5.4 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from L010 and L012" },
              { "id": "R016", "difficulty": 0, "lineSegmentType": 0, "D1": { "id": "S002", "x": -4.1, "y": -1.4, "z": -1.4 }, "D2": { "id": "L012", "x": -4, "y": -1, "z": -5 }, "description": "this is a route from S002 and L012" }
          ]
      }
  ]
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(staticRoute);
});

module.exports = router;
