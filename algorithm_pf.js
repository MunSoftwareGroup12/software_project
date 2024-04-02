
function buildGraphWithRoutes(routes, locations) {
    const graph = {};
    routes.forEach((route, index) => {
      const startLoc = route.locs[0];
      const endLoc = route.locs[route.locs.length - 1];
      const startId = locations.find(loc => loc.x === startLoc.x && loc.y === startLoc.y && loc.z === startLoc.z).id;
      const endId = locations.find(loc => loc.x === endLoc.x && loc.y === endLoc.y && loc.z === endLoc.z).id;
  
      if (!graph[startId]) {
        graph[startId] = [];
      }
      graph[startId].push({ end: endId, routeId: route.id, difficulty: route.difficulty });
  
      // Assuming the graph is undirected
      if (!graph[endId]) {
        graph[endId] = [];
      }
      graph[endId].push({ end: startId, routeId: route.id, difficulty: route.difficulty });
    });
  
    return graph;
  }
  
  function findAllRoutePaths(graph, start, end, visited, path, allPaths, difficultyLevels) {
    visited[start] = true;
  
    if (start === end) {
      allPaths.push([...path]);
    } else {
      graph[start].forEach(edge => {
        if (!visited[edge.end] && difficultyLevels.includes(edge.difficulty)) {
          findAllRoutePaths(graph, edge.end, end, visited, path.concat(edge.routeId), allPaths, difficultyLevels);
        }
      });
    }
  
    visited[start] = false;
  }
  
  function findRoutePaths(jsonData, startId, endId, difficultyLevels) {
    const graph = buildGraphWithRoutes(jsonData.routes, jsonData.locations);
    const visited = {};
    jsonData.locations.forEach(location => {
      visited[location.id] = false;
    });
    const allPaths = [];
    findAllRoutePaths(graph, startId, endId, visited, [], allPaths, difficultyLevels);
    return allPaths;
  }

// Get from database
const jsonData = {
    "locations": [
        {
            "id": "L001","name": "Dabsj","type": "L","availability": true,"description": "this is a snow location",
            "x": -21.7,"y": -0.7,"z": 49.7
        },
        {
            "id": "L002","name": "Icicle","type": "L","availability": true,"description": "This is the first ski location!",
            "x": -13,"y": 0.5,"z": 46.8
        },
        {
            "id": "L003","name": "Eaglepeak","type": "L","availability": true,"description": "this is a snow location",
            "x": -1.9,"y": -2.5,"z": 46.5
        },
        {
            "id": "L004","name": "Eagkone","type": "L","availability": true,"description": "this is a snow location",
            "x": -22,"y": 2.4,"z": 32.7
        },
        {
            "id": "L005","name": "Mbbsbd","type": "L","availability": true,"description": "this is a snow location",
            "x": -26.7,"y": 1.3,"z": 34.7
        },
        {
            "id": "L006","name": "Uabdnsn","type": "L","availability": true,"description": "this is a snow location",
            "x": -32,"y": 3,"z": 24.8
        },
        {
            "id": "L007","name": "Monilsi","type": "L","availability": true,"description": "this is a snow location",
            "x": -42.3,"y": 3.8,"z": 29.6
        },
        {
            "id": "L008","name": "Kasdn","type": "L","availability": true,"description": "this is a snow location",
            "x": -19.5,"y": 0.2,"z": 15.4
        },
        {
            "id": "L009","name": "Opdn","type": "L","availability": true,"description": "this is a snow location",
            "x": -5.5,"y": -2.2,"z": 30.7
        },
        {
            "id": "L010","name": "Opdn","type": "L","availability": true,"description": "this is a snow location",
            "x": -8.9,"y": 0.1,"z": 17.1
        },
        {
            "id": "L011","name": "Pdsssn","type": "L","availability": true,"description": "this is a snow location",
            "x": -4.5,"y": 0.5,"z": 15.2
        },
        {
            "id": "L012","name": "Yussssn","type": "L","availability": true,"description": "this is a snow location",
            "x": 2.5,"y": -0.7,"z": 18
        },
        {
            "id": "L013","name": "Rysd","type": "L","availability": true,"description": "this is a snow location",
            "x": 3.5,"y": -2.4,"z": 33.7
        },
        {
            "id": "L014","name": "Fyysyd","type": "L","availability": true,"description": "this is a snow location",
            "x": 8.5,"y": 0.3,"z": 14.7
        },
        {
            "id": "S002","name": "Asian sushi","type": "S","availability": true,"description": "this is a Asian restaurant",
            "x": -4.1,"y": -1.4,"z": -1.4
        }
    ],
    "routes": [
        {  "id": "R001","name": "Skiweg zur Turrachbahn","type": "R","difficulty": 1,"availability": true,"length": 1200,"slope": 15,
        "locs": [
                {  "x": -13,"y": 0.5,"z": 46.8},    
                {  "x": -8.7,"y": -0.9,"z": 46.7},    
                {  "x": -4,"y": -2.3,"z": 48.2},    
                {  "x": -1.9,"y": -2.5,"z": 46.5}],
            "description": "Skipiste blau"
        },
        {
            "id": "R002","name": "Eisenhutabfahrt","type": "R","difficulty": 2,"availability": true,"length": 2150,"slope": 25,
        "locs": [
                {  "x": -22,"y": 2.4,"z": 32.7},    
                {  "x": -20.9,"y": 1.7,"z": 34.8},    
                {  "x": -16.8,"y": 0.8,"z": 38.6},    
                {  "x": -14.9,"y": 0.3,"z": 39.6},    
                {  "x": -7.1,"y": -2,"z": 38.5},    
                {  "x": -1.9,"y": -2.5,"z": 46.5}],
                "description": "Skipiste rot"
        },
        {
            "id": "R003","name": "Direttissima","type": "R","difficulty": 2,"availability": true,"length": 600,"slope": 25,
        "locs": [
                {  "x": -21.7,"y": -0.7,"z": 49.7},    
                {  "x": -17.3,"y": 0,"z": 46.4},    
                {  "x": -13,"y": 0.5,"z": 46.8}],
                "description": "Skipiste rot"
        },    
        {
            "id": "R004","name": "Seitesprung","type": "R","difficulty": 2,"availability": true,"length": 1350,"slope": 25,
        "locs": [
                {  "x": -21.7,"y": -0.7,"z": 49.7},    
                {  "x": -29.4,"y": 0,"z": 41.7},    
                {  "x": -29.5,"y": 0.6,"z": 38.5},    
                {  "x": -26.7,"y": 1.3,"z": 34.7}],
                "description": "Skipiste rot"
        },
        {
            "id": "R005","name": "Schwarzseeabfahrt","type": "R","difficulty": 2,"availability": true,"length": 750,"slope": 25,
        "locs": [
                {  "x": -32,"y": 3,"z": 24.8},    
                {  "x": -30.5,"y": 2.5,"z": 27.5},    
                {  "x": -28.5,"y": 2.1,"z": 28.7},    
                {  "x": -26.7,"y": 1.3,"z": 34.7}],
                "description": "Skipiste rot"
        },
        {
            "id": "R006","name": "Weitentalabfahrt","type": "R","difficulty": 2,"availability": true,"length": 1400,"slope": 25,
        "locs": [
                {  "x": -42.3,"y": 3.8,"z": 29.6},    
                {  "x": -40.8,"y": 2.9,"z": 32.1},    
                {  "x": -36.5,"y": 1.5,"z": 35.5},    
                {  "x": -30.5,"y": 0.2,"z": 42.7},    
                {  "x": -21.7,"y": -0.7,"z": 49.7}],
                "description": "Skipiste rot"
        },
        {
            "id": "R007","name": "Ländereckabfahrt","type": "R","difficulty": 1,"availability": true,"length": 600,"slope": 25,
        "locs": [
                {  "x": -42.3,"y": 3.8,"z": 29.6},    
                {  "x": -38.6,"y": 3.3,"z": 26.5},    
                {  "x": -34.6,"y": 2.9,"z": 26.4},    
                {  "x": -32,"y": 3,"z": 24.8}],
                "description": "Skipiste blau"
        },
        {
            "id": "R008","name": "Abfahrt Sonnenbahn","type": "R","difficulty": 2,"availability": true,"length": 830,"slope": 25,
        "locs": [
                {  "x": -32,"y": 3,"z": 24.8},    
                {  "x": -28.7,"y": 2.4,"z": 24.9},    
                {  "x": -27.5,"y": 2.2,"z": 23},    
                {  "x": -24.2,"y": 1.3,"z": 21.5},    
                {  "x": -19.5,"y": 0.2,"z": 15.4}],
                "description": "Skipiste rot"
        },
        {
            "id": "R009","name": "Skiweg zur Sonnenbahn","type": "R","difficulty": 1,"availability": true,"length": 1250,"slope": 25,
        "locs": [
                {  "x": -22,"y": 2.4,"z": 32.7},    
                {  "x": -23.5,"y": 2.3,"z": 28.7},    
                {  "x": -21.7,"y": 2.2,"z": 28.6},    
                {  "x": -20.4,"y": 2.2,"z": 23.6},    
                {  "x": -19.6,"y": 1.3,"z": 21.1},    
                {  "x": -19.5,"y": 0.2,"z": 15.4}],
                "description": "Skipiste blau"
        },
        {
            "id": "R010","name": "Alibi für Seitensprung","type": "R","difficulty": 1,"availability": true,"length": 650,"slope": 25,
        "locs": [
                {  "x": -22,"y": 2.4,"z": 32.7},    
                {  "x": -23.8,"y": 2.2,"z": 31.5},    
                {  "x": -24.7,"y": 2,"z": 32.7},    
                {  "x": -26.1,"y": 1.6,"z": 32.1},    
                {  "x": -26.7,"y": 1.3,"z": 34.7}],
                "description": "Skipiste blau"
        },
        {
            "id": "R011","name": "Zirbenwaldabfahrt_01","type": "R","difficulty": 1,"availability": true,"length": 1350,"slope": 25,
        "locs": [
                {  "x": -5.5,"y": -2.2,"z": 30.7},    
                {  "x": -5.5,"y": -2.3,"z": 34.7},    
                {  "x": -1.9,"y": -2.5,"z": 46.5}],
                "description": "Skipiste blau"
        },
        {
            "id": "R012","name": "Zirbenwaldabfahrt_02","type": "R","difficulty": 2,"availability": true,"length": 600,"slope": 25,
        "locs": [
                {  "x": -5.5,"y": -2.2,"z": 30.7},    
                {  "x": -3.5,"y": -2.3,"z": 34.7},    
                {  "x": 3.5,"y": -2.4,"z": 33.7}],
                "description": "Skipiste rot"
        },
        {
            "id": "R013","name": "Zirbenwaldabfahrt_03","type": "R","difficulty": 2,"availability": true,"length": 650,"slope": 25,
        "locs": [
                {  "x": -8.9,"y": 0.1,"z": 17.1},    
                {  "x": -5.3,"y": -1.3,"z": 21.4},    
                {  "x": -7.8,"y": -1.6,"z": 27.7},    
                {  "x": -5.5,"y": -2.2,"z": 30.7}],
                "description": "Skipiste rot"
        },
        {
            "id": "R014","name": "Märchenwaldabfahrt_01","type": "R","difficulty": 1,"availability": true,"length": 1300,"slope": 25,
        "locs": [
                {  "x": -8.9,"y": 0.1,"z": 17.1},    
                {  "x": -6.7,"y": -0.9,"z": 18.8},    
                {  "x": -2.5,"y": -1.5,"z": 23.2},    
                {  "x": 3.5,"y": -1.7,"z": 24.2},    
                {  "x": 3.5,"y": -2.4,"z": 33.7}],
                "description": "Skipiste blau"
        },
        {
            "id": "R015","name": "Wildkopfabfahrt","type": "R","difficulty": 1,"availability": true,"length": 600,"slope": 25,
        "locs": [
                {  "x": -8.9,"y": 0.1,"z": 17.1},    
                {  "x": -4,"y": -0.7,"z": 19.6},    
                {  "x": 2.5,"y": -0.7,"z": 18}],
                "description": "Skipiste blau"
        },
        {
            "id": "R016","name": "Lampelabfahrt","type": "R","difficulty": 1,"availability": true,"length": 450,"slope": 25,
        "locs": [
                {  "x": 2.5,"y": -0.7,"z": 18},    
                {  "x": -0.4,"y": -0.3,"z": 14.9},    
                {  "x": -4.5,"y": 0.5,"z": 15.2}],
                "description": "Skipiste blau"
        },
        {
            "id": "R017","name": "Märchenwaldabfahrt_02","type": "R","difficulty": 1,"availability": true,"length": 1250,"slope": 25,
        "locs": [
                {  "x": 8.5,"y": 0.3,"z": 14.7},    
                {  "x": 7.2,"y": -1.3,"z": 22.3},    
                {  "x": 3.5,"y": -2.4,"z": 33.7}],
                "description": "Skipiste blau"
        },
        {
            "id": "R018","name": "Fis Abfahrt","type": "R","difficulty": 2,"availability": true,"length": 1200,"slope": 25,
        "locs": [
                {  "x": -22,"y": 2.4,"z": 32.7},    
                {  "x": -17.2,"y": 0.6,"z": 31.7},    
                {  "x": -15,"y": 0.2,"z": 32.7},    
                {  "x": -5.5,"y": -2.2,"z": 30.7}],
                "description": "Skipiste rot"
        },

        {
            "id": "K001","name": "Turrachbahn_01","type": "R","difficulty": 0,"availability": true,"length": 550,"slope": 25,
        "locs": [
                {  "x": -21.7,"y": -0.7,"z": 49.7},    
                {  "x": -16.2,"y": 0.3,"z": 47.8},    
                {  "x": -13,"y": 0.5,"z": 46.8}],
                "description": "6er-Sesselbahn"
        },
        {
            "id": "K002","name": "Turrachbahn_02","type": "R","difficulty": 0,"availability": true,"length": 1900,"slope": 25,
        "locs": [
                {  "x": -22,"y": 2.4,"z": 32.7},    
                {  "x": -18.5,"y": 1.9,"z": 35.1},    
                {  "x": -1.9,"y": -2.5,"z": 46.5}],
                "description": "6er-Sesselbahn"
        },
        {
            "id": "K003","name": "Seitensprunglift","type": "R","difficulty": 0,"availability": true,"length": 300,"slope": 25,
        "locs": [
                {  "x": -22,"y": 2.4,"z": 32.7},    
                {  "x": -24,"y": 2.3,"z": 33.5},    
                {  "x": -26.7,"y": 1.3,"z": 34.7}],
                "description": "Skilift"
        },
        {
            "id": "K004","name": "Weitentallift_02","type": "R","difficulty": 0,"availability": true,"length": 650,"slope": 25,
        "locs": [
                {  "x": -32,"y": 3,"z": 24.8},    
                {  "x": -31.2,"y": 2.6,"z": 27.4},    
                {  "x": -26.7,"y": 1.3,"z": 34.7}],
                "description": "Skilift"
        },
        {
            "id": "K005","name": "Weitentallift_01","type": "R","difficulty": 0,"availability": true,"length": 1250,"slope": 25,
        "locs": [
                {  "x": -26.7,"y": 1.3,"z": 34.7},    
                {  "x": -26.3,"y": 1.3,"z": 35.9},    
                {  "x": -21.7,"y": -0.7,"z": 49.7}],
                "description": "Skilift"
        },
        {
            "id": "K006","name": "Sonnenbahn_01","type": "R","difficulty": 0,"availability": true,"length": 600,"slope": 25,
        "locs": [
                {  "x": -32,"y": 3,"z": 24.8},    
                {  "x": -30.5,"y": 3.1,"z": 23.7},    
                {  "x": -25.1,"y": 2,"z": 19.7},    
                {  "x": -19.5,"y": 0.2,"z": 15.4}],
                "description": "2er-Sesselbahn"
        },
        {
            "id": "K007","name": "Sonnenbahn_02","type": "R","difficulty": 0,"availability": true,"length": 700,"slope": 25,
        "locs": [
                {  "x": -42.3,"y": 3.8,"z": 29.6},    
                {  "x": -32,"y": 3,"z": 24.8}],
                "description": "2er-Sesselbahn"
        },
        {
            "id": "K008","name": "Zirbenwaldbahn","type": "R","difficulty": 0,"availability": true,"length": 1100,"slope": 25,
        "locs": [
                {  "x": -8.9,"y": 0.1,"z": 17.1},    
                {  "x": 3.5,"y": -2.4,"z": 33.7}],
                "description": "6er-Sesselbahn"
        },
        {
            "id": "K009","name": "Wildkopflift","type": "R","difficulty": 0,"availability": true,"length": 800,"slope": 25,
        "locs": [
                {  "x": 2.5,"y": -0.7,"z": 18},    
                {  "x": -4.5,"y": 0.5,"z": 15.2}],
                "description": "6er-Sesselbahn"
        },
        {
            "id": "K010","name": "Maulwurf","type": "R","difficulty": 0,"availability": true,"length": 550,"slope": 25,
        "locs": [
                {  "x": 2.5,"y": -0.7,"z": 18},    
                {  "x": 8.5,"y": 0.3,"z": 14.7}],
                "description": "Skilift"
        }
    ]
}
  
function getPathLength(path, routes) {
    return path.reduce((acc, routeId) => {
        const route = routes.find(route => route.id === routeId);
        return acc + (route ? route.length : 0);
    }, 0);
    }
    
function findShortestPath(allPaths, jsonData) {
    if (allPaths.length === 0) return [];

    return allPaths.reduce((shortest, path) => {
        const shortestLength = getPathLength(shortest, jsonData.routes);
        const currentLength = getPathLength(path, jsonData.routes);
        return currentLength < shortestLength ? path : shortest;
    }, allPaths[0]);
}
    
    
function findLongestPath(allPaths, jsonData) {
    if (allPaths.length === 0) return [];
    
    return allPaths.reduce((longest, path) => {
        const longestLength = getPathLength(longest, jsonData.routes);
        const currentLength = getPathLength(path, jsonData.routes);
        return currentLength > longestLength ? path : longest;
    }, allPaths[0]);
}

function formatPathResult(id, tag, path, jsonData) {
    const routeDetails = path.map(routeId => jsonData.routes.find(route => route.id === routeId));
    const totalLength = routeDetails.reduce((acc, route) => acc + route.length, 0);
    const estimateTime = `${Math.round((totalLength / 1000) / 15 * 60)}m`;  // Convert distance to km and time to minutes
    const condition = `↗${routeDetails.reduce((acc, route) => acc + route.slope, 0)}m`;  // Sum of the slopes as a simplified aggregation
  
    const locations = [];
    routeDetails.forEach(route => {
      [route.locs[0], route.locs[route.locs.length - 1]].forEach(loc => {
        if (!locations.some(existingLoc => existingLoc.x === loc.x && existingLoc.y === loc.y && existingLoc.z === loc.z)) {
          locations.push(loc);
        }
      });
    });
  
    return {
      id: id,
      tag: tag,
      details: {
        estimateTime: estimateTime,
        condition: condition,
        length: `${totalLength}m`
      },
      locations: locations,
      routes: routeDetails
    };
}
  
    
// Search parameters
let start = 'L001';
let end = 'L003';
let difficulty_level = [0, 1, 2];
// Search parameters


const allRoutePaths = findRoutePaths(jsonData, start, end, difficulty_level);

console.log(allRoutePaths.length);
//console.log(allRoutePaths);

const shortestPath = findShortestPath(allRoutePaths, jsonData);
const longestPath = findLongestPath(allRoutePaths, jsonData);

//console.log("Shortest Path:", shortestPath);
//clearconsole.log("Longest Path:", longestPath);

 
const shortestPathResult = formatPathResult(1, "Shortest", shortestPath, jsonData);
const longestPathResult = formatPathResult(2, "Longest", longestPath, jsonData);
  
// result with UI structure
let result_file_structure = JSON.stringify([shortestPathResult, longestPathResult]);
  