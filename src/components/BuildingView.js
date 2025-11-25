import React, { memo, useMemo, useCallback } from 'react';

const BuildingView = memo(({ elevators, totalFloors, onRequestElevator }) => {
  const floors = useMemo(
    () => Array.from({ length: totalFloors }, (_, i) => totalFloors - i),
    [totalFloors]
  );

  const handleRequest = useCallback((floor, direction) => {
    onRequestElevator(floor, direction);
  }, [onRequestElevator]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Building View</h2>
      
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        {floors.map(floor => (
          <div
            key={floor}
            className="flex items-center border-b border-gray-200 last:border-b-0 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="w-16 flex-shrink-0 text-center py-4 font-bold text-gray-700 border-r border-gray-300">
              {floor}
            </div>
            
            <div className="flex-1 flex items-center justify-around py-2 px-4">
              {elevators.map(elevator => {
                const isOnFloor = elevator.currentFloor === floor;
                if (!isOnFloor) {
                  return (
                    <div
                      key={elevator.id}
                      className="w-12 h-12 flex items-center justify-center"
                    />
                  );
                }
                
                const stateColor = 
                  elevator.state === 'MOVING' ? 'bg-blue-500' :
                  elevator.state === 'LOADING' ? 'bg-yellow-500' : 'bg-green-500';
                
                return (
                  <div
                    key={elevator.id}
                    className="w-12 h-12 flex items-center justify-center"
                  >
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center font-bold text-white text-sm ${stateColor}`}
                      title={`Elevator ${elevator.id} - ${elevator.state}`}
                    >
                      {elevator.id}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="w-24 flex-shrink-0 flex justify-center gap-2 py-2 border-l border-gray-300">
              {floor < totalFloors && (
                <button
                  onClick={() => handleRequest(floor, 'UP')}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-semibold transition-colors"
                  title={`Call elevator going up from floor ${floor}`}
                >
                  ↑
                </button>
              )}
              {floor > 1 && (
                <button
                  onClick={() => handleRequest(floor, 'DOWN')}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-semibold transition-colors"
                  title={`Call elevator going down from floor ${floor}`}
                >
                  ↓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Moving</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Loading</span>
        </div>
      </div>
    </div>
  );
});

BuildingView.displayName = 'BuildingView';

export default BuildingView;
