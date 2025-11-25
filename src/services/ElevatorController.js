import { createElevator, Direction, ElevatorState } from './Elevator';

export function createElevatorRequest(floor, direction) {
  return {
    floor,
    direction,
    timestamp: Date.now()
  };
}

export function createElevatorController(numberOfElevators = 4, totalFloors = 10, onStateChange = null) {
  const elevators = [];
  const pendingRequests = [];
  const logs = [];
  const stateCache = new Map();
  const FLOOR_TRAVEL_TIME = 10000;
  const LOADING_TIME = 10000;

  for (let i = 0; i < numberOfElevators; i++) {
    elevators.push(createElevator(i + 1, totalFloors));
  }

  const clearCache = () => {
    stateCache.clear();
  };

  const notifyStateChange = () => {
    if (onStateChange) {
      onStateChange(getState());
    }
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    logs.push(logEntry);
    console.log(logEntry);
    
    if (logs.length > 100) {
      logs.shift();
    }
    
    clearCache();
    notifyStateChange();
  };

  const calculateElevatorScore = (elevator, floor, direction) => {
    const cacheKey = `${elevator.id}-${elevator.currentFloor}-${elevator.direction}-${elevator.destinationQueue.length}-${floor}-${direction}`;
    if (stateCache.has(cacheKey)) {
      return stateCache.get(cacheKey);
    }

    const distance = elevator.distanceToFloor(floor);
    let score;
    
    if (elevator.direction === Direction.IDLE) {
      score = distance;
    } else if (elevator.isMovingTowards(floor, direction)) {
      score = distance;
    } else {
      score = distance + 20 + elevator.destinationQueue.length * 5;
    }

    stateCache.set(cacheKey, score);
    return score;
  };

  const assignElevator = (floor, direction) => {
    let bestElevator = null;
    let bestScore = Infinity;

    for (const elevator of elevators) {
      const score = calculateElevatorScore(elevator, floor, direction);
      
      if (score < bestScore) {
        bestScore = score;
        bestElevator = elevator;
      }
    }

    if (bestElevator) {
      bestElevator.addDestination(floor);
      addLog(`Elevator ${bestElevator.id} assigned to floor ${floor}`);
    }
  };

  const getState = () => {
    return {
      elevators: elevators.map(e => e.getState()),
      pendingRequests: pendingRequests.map(r => ({
        floor: r.floor,
        direction: r.direction,
        timestamp: r.timestamp
      })),
      logs: [...logs]
    };
  };

  return {
    get elevators() { return elevators; },
    get totalFloors() { return totalFloors; },
    get pendingRequests() { return [...pendingRequests]; },
    get logs() { return [...logs]; },
    FLOOR_TRAVEL_TIME,
    LOADING_TIME,

    addLog,

    requestElevator(floor, direction) {
      if (floor < 1 || floor > totalFloors) {
        console.warn(`Invalid floor request: ${floor}`);
        return;
      }

      const existingRequest = pendingRequests.find(
        req => req.floor === floor && req.direction === direction
      );

      if (!existingRequest) {
        pendingRequests.push(createElevatorRequest(floor, direction));
        addLog(`${direction} request received on floor ${floor}`);
        assignElevator(floor, direction);
      }
    },

    assignElevator,

    calculateElevatorScore,

    update() {
      for (const elevator of elevators) {
        if (elevator.shouldStopAtCurrentFloor()) {
          elevator.stopAtFloor();
          addLog(`Elevator ${elevator.id} stopped at floor ${elevator.currentFloor}`);
          
          const currentFloor = elevator.currentFloor;
          for (let i = pendingRequests.length - 1; i >= 0; i--) {
            if (pendingRequests[i].floor === currentFloor) {
              pendingRequests.splice(i, 1);
            }
          }
          
          setTimeout(() => {
            elevator.completeLoading();
            addLog(`Elevator ${elevator.id} ready to move from floor ${elevator.currentFloor}`);
            notifyStateChange();
          }, LOADING_TIME);
          
        } else if (elevator.state === ElevatorState.MOVING) {
          elevator.completeMovement();
          addLog(`Elevator ${elevator.id} arrived at floor ${elevator.currentFloor}`);
        } else if (elevator.state === ElevatorState.IDLE && elevator.getNextDestination() !== null) {
          const moved = elevator.moveOneFloor();
          if (moved) {
            addLog(`Elevator ${elevator.id} moving ${elevator.direction} from floor ${elevator.currentFloor - (elevator.direction === Direction.UP ? 1 : -1)}`);
            
            setTimeout(() => {
              notifyStateChange();
            }, FLOOR_TRAVEL_TIME);
          }
        }
      }

      notifyStateChange();
    },

    notifyStateChange,

    getState,

    getLogs() {
      return [...logs];
    }
  };
}
