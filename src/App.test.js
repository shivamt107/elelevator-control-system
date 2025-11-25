import { render, screen } from '@testing-library/react';
import App from './App';

test('renders elevator control system', () => {
  render(<App />);
  const titleElement = screen.getByText(/Elevator Control System/i);
  expect(titleElement).toBeInTheDocument();
});
