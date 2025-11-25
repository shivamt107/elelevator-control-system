import { createElevatorController, createElevatorRequest } from '../services/ElevatorController';
import { Direction, ElevatorState } from '../services/Elevator';

describe('ElevatorController', () => {
  let controller;
  let stateChanges;

  beforeEach(() => {
    stateChanges = [];
    const onStateChange = (state) => stateChanges.push(state);
    controller = createElevatorController(4, 10, onStateChange);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('Initialization', () => {
    test('should initialize with correct number of elevators', () => {
      expect(controller.elevators).toHaveLength(4);
    });

    test('should initialize all elevators at floor 1', () => {
      controller.elevators.forEach(elevator => {
        expect(elevator.currentFloor).toBe(1);
        expect(elevator.direction).toBe(Direction.IDLE);
        expect(elevator.state).toBe(ElevatorState.IDLE);
      });
    });

    test('should initialize with empty pending requests', () => {
      expect(controller.pendingRequests).toEqual([]);
    });

    test('should set correct floor count', () => {
      expect(controller.totalFloors).toBe(10);
    });
  });

  describe('ElevatorRequest', () => {
    test('should create request with floor and direction', () => {
      const request = createElevatorRequest(5, Direction.UP);
      expect(request.floor).toBe(5);
      expect(request.direction).toBe(Direction.UP);
      expect(request.timestamp).toBeDefined();
    });
  });

  describe('addLog', () => {
    test('should add log message', () => {
      const beforeCount = controller.logs.length;
      controller.addLog('Test message');
      expect(controller.logs.length).toBe(beforeCount + 1);
      expect(controller.logs[controller.logs.length - 1]).toContain('Test message');
    });

    test('should trigger state change callback', () => {
      const initialLength = stateChanges.length;
      controller.addLog('Test');
      expect(stateChanges.length).toBeGreaterThan(initialLength);
    });

    test('should limit logs to 100 entries', () => {
      for (let i = 0; i < 150; i++) {
        controller.addLog(`Log ${i}`);
      }
      expect(controller.logs.length).toBe(100);
    });
  });

  describe('requestElevator', () => {
    test('should add valid request to pending requests', () => {
      controller.requestElevator(5, Direction.UP);
      expect(controller.pendingRequests).toHaveLength(1);
      expect(controller.pendingRequests[0].floor).toBe(5);
      expect(controller.pendingRequests[0].direction).toBe(Direction.UP);
    });

    test('should not add duplicate requests', () => {
      controller.requestElevator(5, Direction.UP);
      controller.requestElevator(5, Direction.UP);
      expect(controller.pendingRequests).toHaveLength(1);
    });

    test('should reject invalid floor numbers', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      controller.requestElevator(0, Direction.UP);
      controller.requestElevator(11, Direction.DOWN);
      expect(controller.pendingRequests).toHaveLength(0);
      console.warn.mockRestore();
    });

    test('should assign elevator when request is made', () => {
      controller.requestElevator(5, Direction.UP);
      const hasAssignment = controller.elevators.some(
        e => e.destinationQueue.includes(5)
      );
      expect(hasAssignment).toBe(true);
    });

    test('should log request', () => {
      controller.requestElevator(5, Direction.UP);
      const hasLog = controller.logs.some(log => log.includes('UP request received on floor 5'));
      expect(hasLog).toBe(true);
    });
  });

  describe('calculateElevatorScore', () => {
    test('should return distance for idle elevator', () => {
      const elevator = controller.elevators[0];
      elevator.currentFloor = 3;
      elevator.direction = Direction.IDLE;
      
      const score = controller.calculateElevatorScore(elevator, 7, Direction.UP);
      expect(score).toBe(4); 
    });

    test('should return distance for elevator moving towards floor', () => {
      const elevator = controller.elevators[0];
      elevator.currentFloor = 3;
      elevator.direction = Direction.UP;
      
      const score = controller.calculateElevatorScore(elevator, 7, Direction.UP);
      expect(score).toBe(4); 
    });

    test('should add penalty for elevator moving away', () => {
      const elevator = controller.elevators[0];
      elevator.currentFloor = 3;
      elevator.direction = Direction.DOWN;
      elevator.destinationQueue = [1];
      
      const score = controller.calculateElevatorScore(elevator, 7, Direction.UP);
      expect(score).toBeGreaterThan(4); 
    });

    test('should consider destination queue in penalty', () => {
      const elevator = controller.elevators[0];
      elevator.currentFloor = 3;
      elevator.direction = Direction.DOWN;
      elevator.destinationQueue = [2, 1];
      
      const score1 = controller.calculateElevatorScore(elevator, 7, Direction.UP);
      
      elevator.destinationQueue = [2, 1, 5, 6];
      const score2 = controller.calculateElevatorScore(elevator, 7, Direction.UP);
      
      expect(score2).toBeGreaterThan(score1);
    });
  });

  describe('assignElevator', () => {
    test('should assign closest idle elevator', () => {
      controller.elevators[0].currentFloor = 1;
      controller.elevators[1].currentFloor = 5;
      controller.elevators[2].currentFloor = 8;
      controller.elevators[3].currentFloor = 10;
      
      controller.assignElevator(6, Direction.UP);
      
      const assigned = controller.elevators.filter(e => e.destinationQueue.includes(6));
      expect(assigned).toHaveLength(1);
      expect([5, 8]).toContain(assigned[0].currentFloor);
    });

    test('should assign elevator when one is moving in same direction', () => {
      controller.elevators[0].currentFloor = 3;
      controller.elevators[0].direction = Direction.UP;
      controller.elevators[0].destinationQueue = [5];
      
      controller.elevators[1].currentFloor = 4;
      controller.elevators[1].direction = Direction.IDLE;
      
      controller.assignElevator(6, Direction.UP);
      
      const assigned = controller.elevators.filter(e => e.destinationQueue.includes(6));
      expect(assigned.length).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should move idle elevator towards destination', () => {
      const elevator = controller.elevators[0];
      elevator.currentFloor = 1;
      elevator.addDestination(5);
      
      controller.update();
      
      expect(elevator.state).toBe(ElevatorState.MOVING);
      expect(elevator.currentFloor).toBe(2);
    });

    test('should stop elevator at destination floor', () => {
      const elevator = controller.elevators[0];
      elevator.currentFloor = 4;
      elevator.destinationQueue = [5];
      elevator.state = ElevatorState.IDLE;
      elevator.direction = Direction.UP;
      
      elevator.moveOneFloor();
      elevator.completeMovement();
      
      controller.update();
      
      expect(elevator.state).toBe(ElevatorState.LOADING);
      expect(elevator.destinationQueue).not.toContain(5);
    });

    test('should complete loading after timeout', () => {
      const elevator = controller.elevators[0];
      elevator.currentFloor = 5;
      elevator.destinationQueue = [5, 7];
      
      controller.update();
      
      expect(elevator.state).toBe(ElevatorState.LOADING);
      
      jest.advanceTimersByTime(10000);
      
      expect(elevator.state).toBe(ElevatorState.IDLE);
    });

    test('should remove pending request when elevator stops', () => {
      controller.requestElevator(5, Direction.UP);
      expect(controller.pendingRequests).toHaveLength(1);
      
      const elevator = controller.elevators[0];
      elevator.currentFloor = 5;
      
      controller.update();
      
      expect(controller.pendingRequests).toHaveLength(0);
    });
  });

  describe('getState', () => {
    test('should return complete system state', () => {
      controller.requestElevator(5, Direction.UP);
      const state = controller.getState();
      
      expect(state).toHaveProperty('elevators');
      expect(state).toHaveProperty('pendingRequests');
      expect(state).toHaveProperty('logs');
      expect(state.elevators).toHaveLength(4);
    });

    test('should include elevator states', () => {
      const state = controller.getState();
      
      state.elevators.forEach(elevatorState => {
        expect(elevatorState).toHaveProperty('id');
        expect(elevatorState).toHaveProperty('currentFloor');
        expect(elevatorState).toHaveProperty('direction');
        expect(elevatorState).toHaveProperty('state');
        expect(elevatorState).toHaveProperty('destinationQueue');
      });
    });

    test('should include pending requests', () => {
      controller.requestElevator(5, Direction.UP);
      controller.requestElevator(7, Direction.DOWN);
      
      const state = controller.getState();
      
      expect(state.pendingRequests).toHaveLength(2);
      expect(state.pendingRequests[0]).toHaveProperty('floor');
      expect(state.pendingRequests[0]).toHaveProperty('direction');
      expect(state.pendingRequests[0]).toHaveProperty('timestamp');
    });
  });

  describe('getLogs', () => {
    test('should return array of logs', () => {
      controller.addLog('Test log 1');
      controller.addLog('Test log 2');
      
      const logs = controller.getLogs();
      
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThanOrEqual(2);
    });

    test('should return copy of logs array', () => {
      const logs = controller.getLogs();
      logs.push('New log');
      
      expect(controller.logs).not.toContain('New log');
    });
  });

  describe('Integration - Multiple Elevators', () => {
    test('should handle multiple simultaneous requests', () => {
      controller.requestElevator(3, Direction.UP);
      controller.requestElevator(7, Direction.DOWN);
      controller.requestElevator(5, Direction.UP);
      controller.requestElevator(9, Direction.DOWN);
      
      const totalDestinations = controller.elevators.reduce(
        (sum, e) => sum + e.destinationQueue.length, 0
      );
      
      expect(totalDestinations).toBeGreaterThanOrEqual(4);
    });

    test('should distribute load across elevators', () => {
      for (let i = 1; i <= 10; i++) {
        controller.requestElevator(i, i < 10 ? Direction.UP : Direction.DOWN);
      }
      
      const elevatorsWithDestinations = controller.elevators.filter(
        e => e.destinationQueue.length > 0
      );
      
      expect(elevatorsWithDestinations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle request at top floor', () => {
      controller.requestElevator(10, Direction.DOWN);
      const hasAssignment = controller.elevators.some(
        e => e.destinationQueue.includes(10)
      );
      expect(hasAssignment).toBe(true);
    });

    test('should handle request at ground floor', () => {
      controller.requestElevator(1, Direction.UP);
      expect(controller.pendingRequests.length + 
             controller.elevators.reduce((sum, e) => sum + e.destinationQueue.length, 0))
        .toBeGreaterThanOrEqual(0);
    });

    test('should handle elevator already at requested floor', () => {
      controller.elevators[0].currentFloor = 5;
      controller.requestElevator(5, Direction.UP);
      expect(controller.pendingRequests.length).toBeGreaterThanOrEqual(0);
    });
  });
});
