import React, { memo, useEffect, useRef } from 'react';

const LogPanel = memo(({ logs }) => {
  const logEndRef = useRef(null);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">System Logs</h2>
      
      <div 
        ref={logContainerRef} 
        className="bg-gray-950 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm"
        role="log"
        aria-live="polite"
        aria-label="System activity logs"
      >
        {logs.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No logs yet. Start the simulation to see activity.
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-green-300">
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
});

LogPanel.displayName = 'LogPanel';

export default LogPanel;
