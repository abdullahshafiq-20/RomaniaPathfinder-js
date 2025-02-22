import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Graph data structure for Romania map
const romaniaGraph = {
  Oradea: {
    Zerind: 71,
    Sibiu: 151
  },
  Zerind: {
    Oradea: 71,
    Arad: 75
  },
  Arad: {
    Zerind: 75,
    Sibiu: 140,
    Timisoara: 118
  },
  Timisoara: {
    Arad: 118,
    Lugoj: 111
  },
  Lugoj: {
    Timisoara: 111,
    Mehadia: 70
  },
  Mehadia: {
    Lugoj: 70,
    Drobeta: 75
  },
  Drobeta: {
    Mehadia: 75,
    Craiova: 120
  },
  Craiova: {
    Drobeta: 120,
    RimnicuVilcea: 146,
    Pitesti: 138
  },
  RimnicuVilcea: {
    Craiova: 146,
    Pitesti: 97,
    Sibiu: 80
  },
  Sibiu: {
    Arad: 140,
    Oradea: 151,
    RimnicuVilcea: 80,
    Fagaras: 99
  },
  Fagaras: {
    Sibiu: 99,
    Bucharest: 211
  },
  Pitesti: {
    Craiova: 138,
    RimnicuVilcea: 97,
    Bucharest: 101
  },
  Bucharest: {
    Fagaras: 211,
    Pitesti: 101,
    Giurgiu: 90,
    Urziceni: 85
  },
  Giurgiu: {
    Bucharest: 90
  },
  Urziceni: {
    Bucharest: 85,
    Vaslui: 142,
    Hirsova: 98
  },
  Hirsova: {
    Urziceni: 98,
    Eforie: 86
  },
  Eforie: {
    Hirsova: 86
  },
  Vaslui: {
    Urziceni: 142,
    Iasi: 92
  },
  Iasi: {
    Vaslui: 92,
    Neamt: 87
  },
  Neamt: {
    Iasi: 87
  }
};

// Straight-line distances to Bucharest
const straightLineDistances = {
  Arad: 366,
  Bucharest: 0,
  Craiova: 160,
  Drobeta: 242,
  Eforie: 161,
  Fagaras: 176,
  Giurgiu: 77,
  Hirsova: 151,
  Iasi: 226,
  Lugoj: 244,
  Mehadia: 241,
  Neamt: 234,
  Oradea: 380,
  Pitesti: 100,
  RimnicuVilcea: 193,
  Sibiu: 253,
  Timisoara: 329,
  Urziceni: 80,
  Vaslui: 199,
  Zerind: 374
};

const bfs = (graph, start, goal) => {
  const queue = [[start, [start]]];
  const visited = new Set();
  const costs = new Map();
  costs.set(start, 0);

  while (queue.length > 0) {
    const [current, path] = queue.shift();
    
    if (current === goal) {
      let totalCost = 0;
      for (let i = 0; i < path.length - 1; i++) {
        totalCost += graph[path[i]][path[i + 1]];
      }
      return { path, cost: totalCost, expandedNodes: visited.size };
    }

    if (!visited.has(current)) {
      visited.add(current);
      
      const neighbors = Object.keys(graph[current]);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push([neighbor, [...path, neighbor]]);
          const newCost = costs.get(current) + graph[current][neighbor];
          if (!costs.has(neighbor) || newCost < costs.get(neighbor)) {
            costs.set(neighbor, newCost);
          }
        }
      }
    }
  }
  
  return null;
};

const ucs = (graph, start, goal) => {
  const pQueue = [[0, start, [start]]]; 
  const visited = new Set();
  const expandedNodes = new Set();

  while (pQueue.length > 0) {
    pQueue.sort((a, b) => a[0] - b[0]); 
    const [cost, current, path] = pQueue.shift();
    
    if (current === goal) {
      return { path, cost, expandedNodes: expandedNodes.size };
    }

    if (!visited.has(current)) {
      visited.add(current);
      expandedNodes.add(current);
      
      for (const neighbor in graph[current]) {
        if (!visited.has(neighbor)) {
          const newCost = cost + graph[current][neighbor];
          pQueue.push([newCost, neighbor, [...path, neighbor]]);
        }
      }
    }
  }
  
  return null;
};

const gbfs = (graph, start, goal) => {
  const pQueue = [[straightLineDistances[start], start, [start], 0]]; 
  const visited = new Set();
  const expandedNodes = new Set();

  while (pQueue.length > 0) {
    pQueue.sort((a, b) => a[0] - b[0]); 
    const [h, current, path, actualCost] = pQueue.shift();
    
    if (current === goal) {
      return { path, cost: actualCost, expandedNodes: expandedNodes.size };
    }

    if (!visited.has(current)) {
      visited.add(current);
      expandedNodes.add(current);
      
      for (const neighbor in graph[current]) {
        if (!visited.has(neighbor)) {
          const newActualCost = actualCost + graph[current][neighbor];
          pQueue.push([
            straightLineDistances[neighbor],
            neighbor,
            [...path, neighbor],
            newActualCost
          ]);
        }
      }
    }
  }
  
  return null;
};

const iddfs = (graph, start, goal) => {
  const depthLimit = 20; 
  let totalExpandedNodes = 0;
  
  for (let depth = 0; depth <= depthLimit; depth++) {
    const visited = new Set();
    const result = dls(graph, start, goal, depth, [start], 0, visited);
    if (result) {
      let pathCost = 0;
      const path = result.path;
      for (let i = 0; i < path.length - 1; i++) {
        pathCost += graph[path[i]][path[i + 1]];
      }
      return { 
        path: result.path, 
        cost: pathCost,
        expandedNodes: totalExpandedNodes + visited.size
      };
    }
    totalExpandedNodes += visited.size;
  }
  
  return null;
};

const dls = (graph, current, goal, depth, path, cost, visited) => {
  if (depth < 0) return null;
  if (current === goal) return { path, cost };
  
  visited.add(current);
  
  const neighbors = Object.keys(graph[current]);
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      const result = dls(
        graph,
        neighbor,
        goal,
        depth - 1,
        [...path, neighbor],
        cost + graph[current][neighbor],
        visited
      );
      if (result) return result;
    }
  }
  
  return null;
};

const RomaniaPathfinder = () => {
  const [source, setSource] = useState('Arad');
  const [destination, setDestination] = useState('Bucharest');
  const [results, setResults] = useState({});
  
  const cities = Object.keys(romaniaGraph).sort();
  
  useEffect(() => {
    // Run all algorithms
    const bfsResult = bfs(romaniaGraph, source, destination);
    const ucsResult = ucs(romaniaGraph, source, destination);
    const gbfsResult = gbfs(romaniaGraph, source, destination);
    const iddfsResult = iddfs(romaniaGraph, source, destination);
    
    setResults({
      'Breadth-first Search': bfsResult,
      'Uniform Cost Search': ucsResult,
      'Greedy Best-first Search': gbfsResult,
      'Iterative Deepening DFS': iddfsResult
    });
  }, [source, destination]);

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Romania Path Finder</h2>
      </div>
      <div className="p-6">
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700">Source City:</label>
            <select 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700">Destination City:</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          {Object.entries(results)
            .sort((a, b) => (a[1]?.cost || 0) - (b[1]?.cost || 0))
            .map(([algorithm, result]) => (
              <div key={algorithm} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-bold mb-2 text-gray-900">{algorithm}</h3>
                {result ? (
                  <>
                    <p className="mb-2 text-gray-800">
                      Path: {result.path.join(' → ')}
                    </p>
                    <p className="mb-1 text-gray-800">Total Cost: {result.cost} miles</p>
                    <p className="text-sm text-gray-600">Nodes Expanded: {result.expandedNodes}</p>
                  </>
                ) : (
                  <p className="text-gray-800">No path found</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RomaniaPathfinder;