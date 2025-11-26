import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import './App.css';
import { createElevatorController } from './services/ElevatorController';
import { Direction } from './services/Elevator';

const ElevatorCar = lazy(() => import('./components/ElevatorCar'));
const BuildingView = lazy(() => import('./components/BuildingView'));
const LogPanel = lazy(() => import('./components/LogPanel'));
const ControlPanel = lazy(() => import('./components/ControlPanel'));

const TOTAL_FLOORS = 10;
const NUMBER_OF_ELEVATORS = 4;
const UPDATE_INTERVAL = 1000;

function App() {
  const [systemState, setSystemState] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const controllerRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const autoGenerateIntervalRef = useRef(null);

  useEffect(() => {
    const controller = createElevatorController(
      NUMBER_OF_ELEVATORS,
      TOTAL_FLOORS,
      (state) => setSystemState(state)
    );
    controllerRef.current = controller;
    setSystemState(controller.getState());

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (autoGenerateIntervalRef.current) {
        clearInterval(autoGenerateIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && controllerRef.current) {
      updateIntervalRef.current = setInterval(() => {
        controllerRef.current.update();
      }, UPDATE_INTERVAL);
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && autoGenerate && controllerRef.current) {
      const generateRandomRequest = () => {
        const floor = Math.floor(Math.random() * TOTAL_FLOORS) + 1;
        const direction = floor === TOTAL_FLOORS ? Direction.DOWN : 
                         floor === 1 ? Direction.UP :
                         Math.random() > 0.5 ? Direction.UP : Direction.DOWN;
        
        controllerRef.current.requestElevator(floor, direction);
      };

      generateRandomRequest();

      const scheduleNext = () => {
        const delay = 5000 + Math.random() * 10000;
        autoGenerateIntervalRef.current = setTimeout(() => {
          generateRandomRequest();
          scheduleNext();
        }, delay);
      };

      scheduleNext();
    } else {
      if (autoGenerateIntervalRef.current) {
        clearTimeout(autoGenerateIntervalRef.current);
        autoGenerateIntervalRef.current = null;
      }
    }

    return () => {
      if (autoGenerateIntervalRef.current) {
        clearTimeout(autoGenerateIntervalRef.current);
      }
    };
  }, [isRunning, autoGenerate]);

  const handleToggleSimulation = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const handleGenerateRequest = useCallback(() => {
    if (!controllerRef.current) return;

    const floor = Math.floor(Math.random() * TOTAL_FLOORS) + 1;
    const direction = floor === TOTAL_FLOORS ? Direction.DOWN : 
                     floor === 1 ? Direction.UP :
                     Math.random() > 0.5 ? Direction.UP : Direction.DOWN;
    
    controllerRef.current.requestElevator(floor, direction);
  }, []);

  const handleRequestElevator = useCallback((floor, direction) => {
    if (!controllerRef.current || !isRunning) return;
    controllerRef.current.requestElevator(floor, direction);
  }, [isRunning]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setAutoGenerate(false);
    
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    if (autoGenerateIntervalRef.current) {
      clearTimeout(autoGenerateIntervalRef.current);
      autoGenerateIntervalRef.current = null;
    }

    const controller = createElevatorController(
      NUMBER_OF_ELEVATORS,
      TOTAL_FLOORS,
      (state) => setSystemState(state)
    );
    controllerRef.current = controller;
    setSystemState(controller.getState());
  }, []);

  const handleToggleAutoGenerate = useCallback(() => {
    setAutoGenerate(prev => !prev);
  }, []);

  if (!systemState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Elevator Control System
          </h1>
          <p className="text-gray-600">
            {TOTAL_FLOORS} floors • {NUMBER_OF_ELEVATORS} elevators • Real-time simulation
          </p>
        </header>

        <Suspense fallback={<div className="text-center py-8" role="status" aria-live="polite">Loading...</div>}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <BuildingView
                elevators={systemState.elevators}
                totalFloors={TOTAL_FLOORS}
                onRequestElevator={handleRequestElevator}
              />
            </div>

            <div className="space-y-6">
              <ControlPanel
                isRunning={isRunning}
                onToggleSimulation={handleToggleSimulation}
                onGenerateRequest={handleGenerateRequest}
                onReset={handleReset}
                autoGenerateEnabled={autoGenerate}
                onToggleAutoGenerate={handleToggleAutoGenerate}
              />

              <div className="grid grid-cols-1 gap-4" role="region" aria-label="Elevator status cards">
                {systemState.elevators.map((elevator) => (
                  <ElevatorCar key={elevator.id} elevator={elevator} />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <LogPanel logs={systemState.logs} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

export default App;

