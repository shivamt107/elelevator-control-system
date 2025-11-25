import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BuildingView from '../components/BuildingView';
import { Direction, ElevatorState } from '../services/Elevator';

describe('BuildingView Component', () => {
  const mockElevators = [
    {
      id: 1,
      currentFloor: 5,
      direction: Direction.UP,
      state: ElevatorState.MOVING,
      destinationQueue: [7],
      nextDestination: 7
    },
    {
      id: 2,
      currentFloor: 8,
      direction: Direction.IDLE,
      state: ElevatorState.IDLE,
      destinationQueue: [],
      nextDestination: null
    },
    {
      id: 3,
      currentFloor: 3,
      direction: Direction.DOWN,
      state: ElevatorState.LOADING,
      destinationQueue: [1],
      nextDestination: 1
    },
    {
      id: 4,
      currentFloor: 10,
      direction: Direction.IDLE,
      state: ElevatorState.IDLE,
      destinationQueue: [],
      nextDestination: null
    }
  ];

  const mockOnRequestElevator = jest.fn();

  beforeEach(() => {
    mockOnRequestElevator.mockClear();
  });

  test('renders building view title', () => {
    render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    expect(screen.getByText(/Building View/i)).toBeInTheDocument();
  });

  test('renders all 10 floors', () => {
    render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    
    for (let i = 1; i <= 10; i++) {
      const floorElements = screen.getAllByText(i.toString());
      expect(floorElements.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('displays elevators at correct floors', () => {
    const { container } = render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    
    // Each elevator ID should appear once
    const elevator1Elements = screen.getAllByText('1');
    const elevator2Elements = screen.getAllByText('2');
    const elevator3Elements = screen.getAllByText('3');
    const elevator4Elements = screen.getAllByText('4');
    
    // Filter to only get elevator indicators (not floor numbers)
    const elevator1Indicator = elevator1Elements.find(el => 
      el.className.includes('bg-')
    );
    const elevator2Indicator = elevator2Elements.find(el => 
      el.className.includes('bg-')
    );
    const elevator3Indicator = elevator3Elements.find(el => 
      el.className.includes('bg-')
    );
    
    expect(elevator1Indicator).toBeInTheDocument();
    expect(elevator2Indicator).toBeInTheDocument();
    expect(elevator3Indicator).toBeInTheDocument();
  });

  test('up button calls onRequestElevator with correct parameters', () => {
    render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    
    const upButtons = screen.getAllByText('↑');
    fireEvent.click(upButtons[0]);
    
    expect(mockOnRequestElevator).toHaveBeenCalled();
    const [floor, direction] = mockOnRequestElevator.mock.calls[0];
    expect(floor).toBeGreaterThanOrEqual(1);
    expect(floor).toBeLessThan(10);
    expect(direction).toBe('UP');
  });

  test('down button calls onRequestElevator with correct parameters', () => {
    render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    
    const downButtons = screen.getAllByText('↓');
    fireEvent.click(downButtons[0]); 
    
    expect(mockOnRequestElevator).toHaveBeenCalled();
    const [floor, direction] = mockOnRequestElevator.mock.calls[0];
    expect(floor).toBeGreaterThan(1);
    expect(floor).toBeLessThanOrEqual(10);
    expect(direction).toBe('DOWN');
  });

  test('does not show up button on top floor', () => {
    const { container } = render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    
    const upButtons = screen.getAllByText('↑');
    expect(upButtons).toHaveLength(9);
  });

  test('does not show down button on ground floor', () => {
    const { container } = render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
  
    const downButtons = screen.getAllByText('↓');
    expect(downButtons).toHaveLength(9);
  });

  test('displays legend with state colors', () => {
    render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    
    expect(screen.getByText('Idle')).toBeInTheDocument();
    expect(screen.getByText('Moving')).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  test('applies correct color for moving elevator', () => {
    const { container } = render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    
    const movingElevators = container.querySelectorAll('.bg-blue-500');
    expect(movingElevators.length).toBeGreaterThan(0);
  });

  test('applies correct color for loading elevator', () => {
    const { container } = render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    
    const loadingElevators = container.querySelectorAll('.bg-yellow-500');
    expect(loadingElevators.length).toBeGreaterThan(0);
  });

  test('applies correct color for idle elevator', () => {
    const { container } = render(
      <BuildingView
        elevators={mockElevators}
        totalFloors={10}
        onRequestElevator={mockOnRequestElevator}
      />
    );
    
    const idleElevators = container.querySelectorAll('.bg-green-500');
    expect(idleElevators.length).toBeGreaterThan(0);
  });
});
