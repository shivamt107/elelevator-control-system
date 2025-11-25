import React, { memo } from 'react';

const ControlPanel = memo(({ 
  isRunning, 
  onToggleSimulation, 
  onGenerateRequest,
  onReset,
  autoGenerateEnabled,
  onToggleAutoGenerate
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Control Panel</h2>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={onToggleSimulation}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRunning ? 'Pause Simulation' : 'Start Simulation'}
          </button>
          
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={onGenerateRequest}
            disabled={!isRunning}
            className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              isRunning
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Generate Random Request
          </button>
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 font-medium">
              Auto-generate Requests
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={autoGenerateEnabled}
                onChange={onToggleAutoGenerate}
                disabled={!isRunning}
                className="sr-only"
              />
              <div
                className={`block w-14 h-8 rounded-full transition-colors ${
                  autoGenerateEnabled && isRunning ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                    autoGenerateEnabled && isRunning ? 'transform translate-x-6' : ''
                  }`}
                />
              </div>
            </div>
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Automatically generates random elevator requests every 5-15 seconds
          </p>
        </div>
      </div>
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';

export default ControlPanel;
