import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ControlPanel from '../components/ControlPanel';

describe('ControlPanel Component', () => {
  const mockOnToggleSimulation = jest.fn();
  const mockOnGenerateRequest = jest.fn();
  const mockOnReset = jest.fn();
  const mockOnToggleAutoGenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders control panel title', () => {
    render(
      <ControlPanel
        isRunning={false}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    expect(screen.getByText(/Control Panel/i)).toBeInTheDocument();
  });

  test('shows "Start Simulation" button when not running', () => {
    render(
      <ControlPanel
        isRunning={false}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    expect(screen.getByText(/Start Simulation/i)).toBeInTheDocument();
  });

  test('shows "Pause Simulation" button when running', () => {
    render(
      <ControlPanel
        isRunning={true}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    expect(screen.getByText(/Pause Simulation/i)).toBeInTheDocument();
  });

  test('calls onToggleSimulation when simulation button is clicked', () => {
    render(
      <ControlPanel
        isRunning={false}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    const button = screen.getByText(/Start Simulation/i);
    fireEvent.click(button);
    expect(mockOnToggleSimulation).toHaveBeenCalledTimes(1);
  });

  test('calls onReset when reset button is clicked', () => {
    render(
      <ControlPanel
        isRunning={false}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    const button = screen.getByText(/Reset/i);
    fireEvent.click(button);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  test('calls onGenerateRequest when generate button is clicked while running', () => {
    render(
      <ControlPanel
        isRunning={true}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    const button = screen.getByText(/Generate Random Request/i);
    fireEvent.click(button);
    expect(mockOnGenerateRequest).toHaveBeenCalledTimes(1);
  });

  test('disables generate request button when not running', () => {
    render(
      <ControlPanel
        isRunning={false}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    const button = screen.getByText(/Generate Random Request/i);
    expect(button).toBeDisabled();
  });

  test('enables generate request button when running', () => {
    render(
      <ControlPanel
        isRunning={true}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    const button = screen.getByText(/Generate Random Request/i);
    expect(button).not.toBeDisabled();
  });

  test('renders auto-generate toggle', () => {
    render(
      <ControlPanel
        isRunning={false}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    expect(screen.getByText(/Auto-generate Requests/i)).toBeInTheDocument();
  });

  test('calls onToggleAutoGenerate when auto-generate toggle is clicked', () => {
    render(
      <ControlPanel
        isRunning={true}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockOnToggleAutoGenerate).toHaveBeenCalledTimes(1);
  });

  test('auto-generate checkbox reflects enabled state', () => {
    const { rerender } = render(
      <ControlPanel
        isRunning={true}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    rerender(
      <ControlPanel
        isRunning={true}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={true}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('disables auto-generate checkbox when simulation not running', () => {
    render(
      <ControlPanel
        isRunning={false}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  test('displays auto-generate description text', () => {
    render(
      <ControlPanel
        isRunning={false}
        onToggleSimulation={mockOnToggleSimulation}
        onGenerateRequest={mockOnGenerateRequest}
        onReset={mockOnReset}
        autoGenerateEnabled={false}
        onToggleAutoGenerate={mockOnToggleAutoGenerate}
      />
    );
    
    expect(screen.getByText(/Automatically generates random elevator requests/i)).toBeInTheDocument();
  });
});
