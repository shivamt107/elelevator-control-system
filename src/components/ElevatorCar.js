import React, { memo, useMemo } from 'react';
import { Direction } from '../services/Elevator';

const ElevatorCar = memo(({ elevator }) => {
  const directionSymbol = useMemo(() => {
    switch (elevator.direction) {
      case Direction.UP:
        return '↑';
      case Direction.DOWN:
        return '↓';
      default:
        return '•';
    }
  }, [elevator.direction]);

  const stateColor = useMemo(() => {
    switch (elevator.state) {
      case 'MOVING':
        return 'bg-blue-500';
      case 'LOADING':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  }, [elevator.state]);

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="text-lg font-bold text-gray-800 mb-2">
        Elevator {elevator.id}
      </div>
      
      <div className={`w-20 h-20 ${stateColor} rounded-lg flex items-center justify-center text-white text-3xl font-bold mb-3`}>
        {directionSymbol}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mb-1">
        Floor {elevator.currentFloor}
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        {elevator.state}
      </div>
      
      {elevator.destinationQueue.length > 0 && (
        <div className="w-full mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-1">
            Destinations:
          </div>
          <div className="flex flex-wrap gap-1">
            {elevator.destinationQueue.map((floor, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {floor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ElevatorCar.displayName = 'ElevatorCar';

export default ElevatorCar;
