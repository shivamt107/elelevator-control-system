import React from 'react';
import { render, screen } from '@testing-library/react';
import LogPanel from '../components/LogPanel';

describe('LogPanel Component', () => {
  test('renders log panel title', () => {
    render(<LogPanel logs={[]} />);
    expect(screen.getByText(/System Logs/i)).toBeInTheDocument();
  });

  test('displays empty state message when no logs', () => {
    render(<LogPanel logs={[]} />);
    expect(screen.getByText(/No logs yet/i)).toBeInTheDocument();
  });

  test('renders log messages', () => {
    const logs = [
      '[10:30:00] Elevator 1 moving UP from floor 1',
      '[10:30:10] UP request received on floor 5',
      '[10:30:20] Elevator 1 stopped at floor 2'
    ];
    
    render(<LogPanel logs={logs} />);
    
    logs.forEach(log => {
      expect(screen.getByText(log)).toBeInTheDocument();
    });
  });

  test('displays multiple log entries', () => {
    const logs = [
      '[10:30:00] Log 1',
      '[10:30:01] Log 2',
      '[10:30:02] Log 3'
    ];
    
    render(<LogPanel logs={logs} />);
    expect(screen.getAllByText(/\[10:30:/)).toHaveLength(3);
  });

  test('updates when new logs are added', () => {
    const { rerender } = render(<LogPanel logs={['[10:30:00] First log']} />);
    expect(screen.getByText('[10:30:00] First log')).toBeInTheDocument();
    
    rerender(<LogPanel logs={['[10:30:00] First log', '[10:30:01] Second log']} />);
    expect(screen.getByText('[10:30:00] First log')).toBeInTheDocument();
    expect(screen.getByText('[10:30:01] Second log')).toBeInTheDocument();
  });

  test('handles large number of logs', () => {
    const logs = Array.from({ length: 100 }, (_, i) => `[10:30:${i}] Log ${i}`);
    render(<LogPanel logs={logs} />);
    
    expect(screen.getByText('[10:30:0] Log 0')).toBeInTheDocument();
    expect(screen.getByText('[10:30:99] Log 99')).toBeInTheDocument();
  });

  test('applies correct styling classes', () => {
    const { container } = render(<LogPanel logs={['Test log']} />);
    
    const logContainer = container.querySelector('.bg-gray-950');
    expect(logContainer).toBeInTheDocument();
  });
});
