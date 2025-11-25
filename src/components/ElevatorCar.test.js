import React from 'react';
import { render, screen } from '@testing-library/react';
import ElevatorCar from '../components/ElevatorCar';
import { Direction, ElevatorState } from '../services/Elevator';

describe('ElevatorCar Component', () => {
  const mockElevatorIdle = {
    id: 1,
    currentFloor: 5,
    direction: Direction.IDLE,
    state: ElevatorState.IDLE,
    destinationQueue: [],
    nextDestination: null
  };

  const mockElevatorMoving = {
    id: 2,
    currentFloor: 3,
    direction: Direction.UP,
    state: ElevatorState.MOVING,
    destinationQueue: [5, 7, 9],
    nextDestination: 5
  };

  const mockElevatorLoading = {
    id: 3,
    currentFloor: 8,
    direction: Direction.DOWN,
    state: ElevatorState.LOADING,
    destinationQueue: [6, 4],
    nextDestination: 6
  };

  test('renders elevator ID', () => {
    render(<ElevatorCar elevator={mockElevatorIdle} />);
    expect(screen.getByText(/Elevator 1/i)).toBeInTheDocument();
  });

  test('renders current floor', () => {
    render(<ElevatorCar elevator={mockElevatorIdle} />);
    expect(screen.getByText(/Floor 5/i)).toBeInTheDocument();
  });

  test('renders elevator state', () => {
    render(<ElevatorCar elevator={mockElevatorIdle} />);
    expect(screen.getByText(/IDLE/i)).toBeInTheDocument();
  });

  test('displays idle symbol for idle elevator', () => {
    render(<ElevatorCar elevator={mockElevatorIdle} />);
    expect(screen.getByText('•')).toBeInTheDocument();
  });

  test('displays up arrow for upward direction', () => {
    render(<ElevatorCar elevator={mockElevatorMoving} />);
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  test('displays down arrow for downward direction', () => {
    render(<ElevatorCar elevator={mockElevatorLoading} />);
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  test('displays destination queue when not empty', () => {
    render(<ElevatorCar elevator={mockElevatorMoving} />);
    expect(screen.getByText(/Destinations:/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  test('does not display destinations section when queue is empty', () => {
    render(<ElevatorCar elevator={mockElevatorIdle} />);
    expect(screen.queryByText(/Destinations:/i)).not.toBeInTheDocument();
  });

  test('applies correct color class for idle state', () => {
    const { container } = render(<ElevatorCar elevator={mockElevatorIdle} />);
    const stateIndicator = container.querySelector('.bg-green-500');
    expect(stateIndicator).toBeInTheDocument();
  });

  test('applies correct color class for moving state', () => {
    const { container } = render(<ElevatorCar elevator={mockElevatorMoving} />);
    const stateIndicator = container.querySelector('.bg-blue-500');
    expect(stateIndicator).toBeInTheDocument();
  });

  test('applies correct color class for loading state', () => {
    const { container } = render(<ElevatorCar elevator={mockElevatorLoading} />);
    const stateIndicator = container.querySelector('.bg-yellow-500');
    expect(stateIndicator).toBeInTheDocument();
  });
});
