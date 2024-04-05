const LocationManager = require('./LocationManager');

module.exports = class RouteManager {

    constructor(locationManager) {
        this.locationManager = locationManager;
    }

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

        const startLocation = this.locationManager.getLocation(start);

        if (start === end) {
            allPaths.push([...path]);
        } else {
            graph[start].forEach((edge) => {
                const endLocation = this.locationManager.getLocation(edge.end);
                if (!visited[edge.end] && (difficultyLevels.includes(edge.difficulty) && startLocation.y >= endLocation.y || edge.difficulty === 0)) {
                    this.findAllRoutePaths(graph, edge.end, end, visited, path.concat(edge.routeId), allPaths, difficultyLevels);
                }
            });
        }

        visited[start] = false;
    }

    findRoutePaths(map, startId, endId, difficultyLevels) {
        const graph = this.buildGraphWithRoutes(map.routes, map.locations);
        const visited = {};
        map.locations.forEach(location => {
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

    getLiftsCount(path, routes) {
        return path.reduce((acc, routeId) => {
            const route = routes.find(route => route.id === routeId);
            return acc + (route.type === 'K');
        }, 0);
    }

    getSlopesCount(path, routes) {
        return path.reduce((acc, routeId) => {
            const route = routes.find(route => route.id === routeId);
            return acc + (route.type === 'R');
        }, 0);
    }

    getPathTime(path, routes) {
        return path.reduce((acc, routeId) => {
            const route = routes.find(route => route.id === routeId);
            let time = 0;
            if (route.type === 'K') time = 7;
            else time = (route.length / 1000) / (20 / 60);
            return acc + time;
        }, 0);
    }

    getPathEasinessScore(path, routes) {
        return path.reduce((acc, routeId) => {
            const route = routes.find(route => route.id === routeId);
            if (route.difficulty === 1) return acc + route.length;
            else if (route.difficulty === 2) return acc + 1.5 * route.length;
            else if (route.difficulty === 3) return acc + 2 * route.length;
            return acc + 9999;
        }, 0);  
    }

    findLiftsOnlyPath(allPaths, map) {
        if (allPaths.length === 0) return [];
        return allPaths.reduce((allLiftsPath, path) => {
            const allLiftsPathLength = this.getLiftsCount(allLiftsPath, map.routes);
            const currentLiftsLength = this.getLiftsCount(path, map.routes);
            const currentSlopesLength = this.getSlopesCount(path, map.routes);
            return currentLiftsLength > allLiftsPathLength && currentSlopesLength == 0 ? path : allLiftsPath;
        }, []);
    }

    findLongestLengthPath(allPaths, map) {
        if (allPaths.length === 0) return [];

        return allPaths.reduce((longest, path) => {
            const longestLength = this.getPathLength(longest, map.routes);
            const currentLength = this.getPathLength(path, map.routes);
            return currentLength > longestLength ? path : longest;
        }, allPaths[0]);
    }

    findEasiestPath(allPaths, map) {
        if (allPaths.length === 0) return [];

        return allPaths.reduce((easiest, path) => {
            const easiestPath = this.getPathEasinessScore(easiest, map.routes);
            const current = this.getPathEasinessScore(path, map.routes);
            return current < easiestPath ? path : easiest;
        }, allPaths[0]);
    }

    findFastestPath(allPaths, map) {
        if (allPaths.length === 0) return [];
        return allPaths.reduce((shortest, path) => {
            const shortestLength = this.getPathTime(shortest, map.routes);
            const currentLength = this.getPathTime(path, map.routes);
            return currentLength < shortestLength ? path : shortest;
        }, allPaths[0]);
    }

    formatPathResult(id, tag, path, map) {
        const routeDetails = path.map(routeId => map.routes.find(route => route.id === routeId));
        const totalLength = routeDetails.reduce((acc, route) => acc + route.length, 0);
        const numberOfLifts = routeDetails.reduce((acc, route) => acc + (route.type === 'K' ? 1: 0), 0);
        const estimateTime = `${Math.round((totalLength / 1000) / 20 * 60) + numberOfLifts * 7}m`;
        const condition = `↗${routeDetails.reduce((acc, route) => acc + route.slope, 0)}m`;

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

        const liftsOnlyPath = this.findLiftsOnlyPath(allRoutePaths, map);
        const easiestPath = this.findEasiestPath(allRoutePaths, map);
        const shortestTimePath = this.findFastestPath(allRoutePaths, map);
        const longestLengthPath = this.findLongestLengthPath(allRoutePaths, map);

        const liftsOnlyPathResult = this.formatPathResult(1, "Lifts Only", liftsOnlyPath, map);
        const easiestPathResult = this.formatPathResult(2, "Easiest", easiestPath, map);
        const shortestTimePathResult = this.formatPathResult(3, "Fastest", shortestTimePath, map);
        const longestLengthPathResult = this.formatPathResult(4, "Longest Length", longestLengthPath, map);

        return [
            liftsOnlyPathResult,
            easiestPathResult,
            shortestTimePathResult,
            longestLengthPathResult
        ].filter(r => r.routes.length > 0);
    }

}
