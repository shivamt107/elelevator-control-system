
export const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  IDLE: 'IDLE'
};

export const ElevatorState = {
  IDLE: 'IDLE',
  MOVING: 'MOVING',
  LOADING: 'LOADING'
};

export function createElevator(id, totalFloors = 10) {
  let currentFloor = 1;
  let direction = Direction.IDLE;
  let state = ElevatorState.IDLE;
  let destinationQueue = [];
  let cachedState = null;

  const invalidateCache = () => {
    cachedState = null;
  };

  const getNextDestination = () => {
    return destinationQueue.length > 0 ? destinationQueue[0] : null;
  };

  const sortDestinations = () => {
    if (destinationQueue.length === 0) return;

    destinationQueue.sort((a, b) => {
      if (direction === Direction.UP) {
        const aAbove = a >= currentFloor;
        const bAbove = b >= currentFloor;
        
        if (aAbove && bAbove) return a - b; 
        if (!aAbove && !bAbove) return b - a; 
        return aAbove ? -1 : 1; 
      } else if (direction === Direction.DOWN) {
        const aBelow = a <= currentFloor;
        const bBelow = b <= currentFloor;
        
        if (aBelow && bBelow) return b - a; 
        if (!aBelow && !bBelow) return a - b; 
        return aBelow ? -1 : 1; 
      } else {
        const aDist = Math.abs(a - currentFloor);
        const bDist = Math.abs(b - currentFloor);
        return aDist - bDist;
      }
    });
  };

  const updateDirection = () => {
    const nextFloor = getNextDestination();
    
    if (nextFloor === null) {
      direction = Direction.IDLE;
    } else if (nextFloor > currentFloor) {
      direction = Direction.UP;
    } else if (nextFloor < currentFloor) {
      direction = Direction.DOWN;
    }
  };

  return {
    id,
    get currentFloor() { return currentFloor; },
    set currentFloor(value) { currentFloor = value; invalidateCache(); },
    get direction() { return direction; },
    set direction(value) { direction = value; invalidateCache(); },
    get state() { return state; },
    set state(value) { state = value; invalidateCache(); },
    get destinationQueue() { return [...destinationQueue]; },
    set destinationQueue(value) { destinationQueue = [...value]; invalidateCache(); },
    get totalFloors() { return totalFloors; },

    addDestination(floor) {
      if (floor < 1 || floor > totalFloors) {
        console.warn(`Invalid floor ${floor} for elevator ${id}`);
        return;
      }

      if (!destinationQueue.includes(floor) && floor !== currentFloor) {
        destinationQueue.push(floor);
        sortDestinations();
        invalidateCache();
      }
    },

    sortDestinations,

    getNextDestination,

    removeCurrentDestination() {
      if (destinationQueue.length > 0) {
        destinationQueue.shift();
      }
    },

    updateDirection,

    moveOneFloor() {
      if (state !== ElevatorState.IDLE) {
        return false;
      }

      updateDirection();

      if (direction === Direction.UP && currentFloor < totalFloors) {
        currentFloor++;
        state = ElevatorState.MOVING;
        invalidateCache();
        return true;
      } else if (direction === Direction.DOWN && currentFloor > 1) {
        currentFloor--;
        state = ElevatorState.MOVING;
        invalidateCache();
        return true;
      }

      return false;
    },

    shouldStopAtCurrentFloor() {
      return destinationQueue.includes(currentFloor);
    },

    stopAtFloor() {
      state = ElevatorState.LOADING;
      destinationQueue = destinationQueue.filter(f => f !== currentFloor);
      invalidateCache();
    },

    completeLoading() {
      state = ElevatorState.IDLE;
      updateDirection();
      invalidateCache();
    },

    completeMovement() {
      state = ElevatorState.IDLE;
      invalidateCache();
    },

    distanceToFloor(floor) {
      return Math.abs(currentFloor - floor);
    },

    isMovingTowards(floor, requestDirection) {
      if (direction === Direction.IDLE) return true;
      
      const isAbove = floor > currentFloor;
      const isBelow = floor < currentFloor;
      
      if (direction === Direction.UP && requestDirection === Direction.UP && isAbove) {
        return true;
      }
      if (direction === Direction.DOWN && requestDirection === Direction.DOWN && isBelow) {
        return true;
      }
      
      return false;
    },

    getState() {
      if (!cachedState) {
        cachedState = {
          id,
          currentFloor,
          direction,
          state,
          destinationQueue: [...destinationQueue],
          nextDestination: getNextDestination()
        };
      }
      return cachedState;
    }
  };
}
