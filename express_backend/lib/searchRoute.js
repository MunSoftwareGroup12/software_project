function searchRoutes(map, startLocation, endLocation, maxDifficulty) {
    let queue = [[startLocation]];
  
    let validPaths = [];
  
    while (queue.length > 0) {
      let path = queue.shift();
      let currentLocation = path[path.length - 1];
  
      if (currentLocation === endLocation) {
        validPaths.push(path);
        continue;
      }
  
      map.routes.forEach(route => {
        if (route.start === currentLocation && route.difficulty <= maxDifficulty) {
          if (!path.includes(route.end)) {
            let newPath = path.concat([route.end]);
            queue.push(newPath);
          }
        }
      });
    }
  
    return validPaths.length > 0 ? validPaths : "No paths found.";
  }
