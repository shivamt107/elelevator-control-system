import { createElevator, Direction, ElevatorState } from '../services/Elevator';

describe('Elevator', () => {
  let elevator;

  beforeEach(() => {
    elevator = createElevator(1, 10);
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(elevator.id).toBe(1);
      expect(elevator.currentFloor).toBe(1);
      expect(elevator.direction).toBe(Direction.IDLE);
      expect(elevator.state).toBe(ElevatorState.IDLE);
      expect(elevator.destinationQueue).toEqual([]);
      expect(elevator.totalFloors).toBe(10);
    });
  });

  describe('addDestination', () => {
    test('should add valid destination to queue', () => {
      elevator.addDestination(5);
      expect(elevator.destinationQueue).toContain(5);
    });

    test('should not add duplicate destinations', () => {
      elevator.addDestination(5);
      elevator.addDestination(5);
      expect(elevator.destinationQueue.filter(f => f === 5).length).toBe(1);
    });

    test('should not add current floor as destination', () => {
      elevator.currentFloor = 3;
      elevator.addDestination(3);
      expect(elevator.destinationQueue).not.toContain(3);
    });

    test('should not add invalid floor numbers', () => {
      elevator.addDestination(0);
      elevator.addDestination(11);
      expect(elevator.destinationQueue).toEqual([]);
    });

    test('should sort destinations after adding', () => {
      elevator.currentFloor = 1;
      elevator.addDestination(5);
      elevator.addDestination(3);
      elevator.addDestination(7);
      expect(elevator.destinationQueue[0]).toBe(3);
    });
  });

  describe('sortDestinations', () => {
    test('should sort destinations for upward movement', () => {
      elevator.currentFloor = 3;
      elevator.direction = Direction.UP;
      elevator.destinationQueue = [8, 4, 6, 2];
      elevator.sortDestinations();
      expect(elevator.destinationQueue).toEqual([4, 6, 8, 2]);
    });

    test('should sort destinations for downward movement', () => {
      elevator.currentFloor = 7;
      elevator.direction = Direction.DOWN;
      elevator.destinationQueue = [3, 9, 5, 8];
      elevator.sortDestinations();
      const belowFloors = elevator.destinationQueue.filter(f => f <= 7);
      const aboveFloors = elevator.destinationQueue.filter(f => f > 7);
      expect(belowFloors).toEqual([5, 3]);
      expect(aboveFloors[0]).toBeLessThanOrEqual(aboveFloors[aboveFloors.length - 1]);
    });

    test('should sort by distance when idle', () => {
      elevator.currentFloor = 5;
      elevator.direction = Direction.IDLE;
      elevator.destinationQueue = [8, 2, 6, 3];
      elevator.sortDestinations();
      const distances = elevator.destinationQueue.map(f => Math.abs(f - 5));
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }
    });
  });

  describe('getNextDestination', () => {
    test('should return first destination in queue', () => {
      elevator.destinationQueue = [5, 7, 3];
      expect(elevator.getNextDestination()).toBe(5);
    });

    test('should return null when queue is empty', () => {
      expect(elevator.getNextDestination()).toBeNull();
    });
  });

  describe('removeCurrentDestination', () => {
    test('should remove first destination from queue', () => {
      elevator.destinationQueue = [5, 7, 3];
      elevator.removeCurrentDestination();
      expect(elevator.destinationQueue).toEqual([7, 3]);
    });

    test('should handle empty queue gracefully', () => {
      elevator.removeCurrentDestination();
      expect(elevator.destinationQueue).toEqual([]);
    });
  });

  describe('updateDirection', () => {
    test('should set direction to UP when next floor is higher', () => {
      elevator.currentFloor = 3;
      elevator.destinationQueue = [5];
      elevator.updateDirection();
      expect(elevator.direction).toBe(Direction.UP);
    });

    test('should set direction to DOWN when next floor is lower', () => {
      elevator.currentFloor = 7;
      elevator.destinationQueue = [3];
      elevator.updateDirection();
      expect(elevator.direction).toBe(Direction.DOWN);
    });

    test('should set direction to IDLE when no destinations', () => {
      elevator.direction = Direction.UP;
      elevator.destinationQueue = [];
      elevator.updateDirection();
      expect(elevator.direction).toBe(Direction.IDLE);
    });
  });

  describe('moveOneFloor', () => {
    test('should move up one floor when direction is UP', () => {
      elevator.currentFloor = 3;
      elevator.destinationQueue = [5];
      elevator.state = ElevatorState.IDLE;
      
      const moved = elevator.moveOneFloor();
      
      expect(moved).toBe(true);
      expect(elevator.currentFloor).toBe(4);
      expect(elevator.state).toBe(ElevatorState.MOVING);
    });

    test('should move down one floor when direction is DOWN', () => {
      elevator.currentFloor = 5;
      elevator.destinationQueue = [2];
      elevator.state = ElevatorState.IDLE;
      
      const moved = elevator.moveOneFloor();
      
      expect(moved).toBe(true);
      expect(elevator.currentFloor).toBe(4);
      expect(elevator.state).toBe(ElevatorState.MOVING);
    });

    test('should not move when state is not IDLE', () => {
      elevator.currentFloor = 5;
      elevator.destinationQueue = [7];
      elevator.state = ElevatorState.LOADING;
      
      const moved = elevator.moveOneFloor();
      
      expect(moved).toBe(false);
      expect(elevator.currentFloor).toBe(5);
    });

    test('should not move beyond top floor', () => {
      elevator.currentFloor = 10;
      elevator.destinationQueue = [11];
      elevator.state = ElevatorState.IDLE;
      
      const moved = elevator.moveOneFloor();
      
      expect(moved).toBe(false);
      expect(elevator.currentFloor).toBe(10);
    });

    test('should not move below ground floor', () => {
      elevator.currentFloor = 1;
      elevator.destinationQueue = [0];
      elevator.state = ElevatorState.IDLE;
      
      const moved = elevator.moveOneFloor();
      
      expect(moved).toBe(false);
      expect(elevator.currentFloor).toBe(1);
    });
  });

  describe('shouldStopAtCurrentFloor', () => {
    test('should return true if current floor is in destination queue', () => {
      elevator.currentFloor = 5;
      elevator.destinationQueue = [5, 7, 3];
      expect(elevator.shouldStopAtCurrentFloor()).toBe(true);
    });

    test('should return false if current floor is not in destination queue', () => {
      elevator.currentFloor = 6;
      elevator.destinationQueue = [5, 7, 3];
      expect(elevator.shouldStopAtCurrentFloor()).toBe(false);
    });
  });

  describe('stopAtFloor', () => {
    test('should change state to LOADING and remove floor from queue', () => {
      elevator.currentFloor = 5;
      elevator.destinationQueue = [5, 7, 3];
      
      elevator.stopAtFloor();
      
      expect(elevator.state).toBe(ElevatorState.LOADING);
      expect(elevator.destinationQueue).not.toContain(5);
      expect(elevator.destinationQueue).toEqual([7, 3]);
    });
  });

  describe('completeLoading', () => {
    test('should change state to IDLE and update direction', () => {
      elevator.state = ElevatorState.LOADING;
      elevator.currentFloor = 5;
      elevator.destinationQueue = [7];
      
      elevator.completeLoading();
      
      expect(elevator.state).toBe(ElevatorState.IDLE);
      expect(elevator.direction).toBe(Direction.UP);
    });
  });

  describe('completeMovement', () => {
    test('should change state to IDLE', () => {
      elevator.state = ElevatorState.MOVING;
      elevator.completeMovement();
      expect(elevator.state).toBe(ElevatorState.IDLE);
    });
  });

  describe('distanceToFloor', () => {
    test('should calculate correct distance to floor above', () => {
      elevator.currentFloor = 3;
      expect(elevator.distanceToFloor(7)).toBe(4);
    });

    test('should calculate correct distance to floor below', () => {
      elevator.currentFloor = 8;
      expect(elevator.distanceToFloor(3)).toBe(5);
    });

    test('should return 0 for current floor', () => {
      elevator.currentFloor = 5;
      expect(elevator.distanceToFloor(5)).toBe(0);
    });
  });

  describe('isMovingTowards', () => {
    test('should return true when idle', () => {
      elevator.direction = Direction.IDLE;
      expect(elevator.isMovingTowards(5, Direction.UP)).toBe(true);
    });

    test('should return true when moving up towards floor above with UP request', () => {
      elevator.currentFloor = 3;
      elevator.direction = Direction.UP;
      expect(elevator.isMovingTowards(5, Direction.UP)).toBe(true);
    });

    test('should return false when moving up towards floor above with DOWN request', () => {
      elevator.currentFloor = 3;
      elevator.direction = Direction.UP;
      expect(elevator.isMovingTowards(5, Direction.DOWN)).toBe(false);
    });

    test('should return true when moving down towards floor below with DOWN request', () => {
      elevator.currentFloor = 7;
      elevator.direction = Direction.DOWN;
      expect(elevator.isMovingTowards(3, Direction.DOWN)).toBe(true);
    });

    test('should return false when moving away from floor', () => {
      elevator.currentFloor = 5;
      elevator.direction = Direction.UP;
      expect(elevator.isMovingTowards(3, Direction.DOWN)).toBe(false);
    });
  });

  describe('getState', () => {
    test('should return complete state object', () => {
      elevator.currentFloor = 5;
      elevator.direction = Direction.UP;
      elevator.state = ElevatorState.MOVING;
      elevator.destinationQueue = [7, 9];

      const state = elevator.getState();

      expect(state).toEqual({
        id: 1,
        currentFloor: 5,
        direction: Direction.UP,
        state: ElevatorState.MOVING,
        destinationQueue: [7, 9],
        nextDestination: 7
      });
    });
  });
});
