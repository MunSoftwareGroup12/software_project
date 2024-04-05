
module.exports = class RouteManager {

    buildGraphWithRoutes(routes, locations) {
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

    findAllRoutePaths(graph, start, end, visited, path, allPaths, difficultyLevels) {
        visited[start] = true;

        if (start === end) {
            allPaths.push([...path]);
        } else {
            graph[start].forEach(edge => {
                if (!visited[edge.end] && (difficultyLevels.includes(edge.difficulty) || edge.difficulty === 0)) {
                    this.findAllRoutePaths(graph, edge.end, end, visited, path.concat(edge.routeId), allPaths, difficultyLevels);
                }
            });
        }

        visited[start] = false;
    }

    findRoutePaths(jsonData, startId, endId, difficultyLevels) {
        const graph = this.buildGraphWithRoutes(jsonData.routes, jsonData.locations);
        const visited = {};
        jsonData.locations.forEach(location => {
            visited[location.id] = false;
        });
        const allPaths = [];
        this.findAllRoutePaths(graph, startId, endId, visited, [], allPaths, difficultyLevels);
        return allPaths;
    }

    getPathLength(path, routes) {
        return path.reduce((acc, routeId) => {
            const route = routes.find(route => route.id === routeId);
            return acc + (route ? route.length : 0);
        }, 0);
    }

    findShortestPath(allPaths, jsonData) {
        if (allPaths.length === 0) return [];

        return allPaths.reduce((shortest, path) => {
            const shortestLength = this.getPathLength(shortest, jsonData.routes);
            const currentLength = this.getPathLength(path, jsonData.routes);
            return currentLength < shortestLength ? path : shortest;
        }, allPaths[0]);
    }


    findLongestPath(allPaths, jsonData) {
        if (allPaths.length === 0) return [];

        return allPaths.reduce((longest, path) => {
            const longestLength = this.getPathLength(longest, jsonData.routes);
            const currentLength = this.getPathLength(path, jsonData.routes);
            return currentLength > longestLength ? path : longest;
        }, allPaths[0]);
    }

    formatPathResult(id, tag, path, jsonData) {
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


    calculateRoutes(map, startLocationId, endLocationId, difficultyLevels) {
        const allRoutePaths = this.findRoutePaths(map, startLocationId, endLocationId, difficultyLevels);
        console.log(allRoutePaths)

        const shortestPath = this.findShortestPath(allRoutePaths, map);
        const longestPath = this.findLongestPath(allRoutePaths, map);

        const shortestPathResult = this.formatPathResult(1, "Shortest", shortestPath, map);
        const longestPathResult = this.formatPathResult(2, "Longest", longestPath, map);

        return [
            shortestPathResult,
            longestPathResult
        ].filter(r => r.routes.length > 0);
    }

}
