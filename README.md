# Elevator Control System

A real-time elevator control system simulation built with React. Features intelligent elevator dispatching, visual floor representation, and comprehensive testing.

## Live Demo

[View Live Demo](https://shivamt107.github.io/elelevator-control-system)

## Features

- **Smart Elevator Dispatching**: Intelligent algorithm assigns closest available elevator based on direction and distance
- **Real-time Simulation**: 10-second travel and loading times with live state updates
- **Visual Building Representation**: 10-floor building with 4 elevators and interactive call buttons
- **Auto-generation Mode**: Random elevator requests at 5-15 second intervals
- **Performance Optimized**: Code splitting, React.memo, useMemo, and state caching
- **Comprehensive Testing**: 111 Jest tests with full coverage
- **Accessible**: WCAG compliant with keyboard navigation support
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Technical Stack

- React 19.2.0
- Tailwind CSS 3.4.0
- Jest & React Testing Library
- Factory function pattern for state management
- Closure-based encapsulation

## Installation

```bash
npm install
```

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`

Runs the test suite with 111 tests covering all functionality

### `npm run build`

Creates optimized production build in the `build` folder

### `npm run deploy`

Builds and deploys to GitHub Pages

## Architecture

### Core Components

- **createElevator()**: Factory function managing individual elevator state and behavior
- **createElevatorController()**: Orchestrates multiple elevators and request dispatching
- **BuildingView**: Visual representation of floors and elevator positions
- **ElevatorCar**: Individual elevator status display
- **ControlPanel**: Simulation controls
- **LogPanel**: Real-time activity logging

- React.lazy for code splitting
- React.memo for component memoization
- useMemo for expensive computations
- useCallback for stable function references
- State caching in service layer

## Testing

```bash
npm test
```

All 111 tests cover:
- Elevator movement and state transitions
- Controller request handling and dispatching
- Component rendering and interactions
- Edge cases and error handling

## Deployment

Deployed to GitHub Pages:

```bash
npm run deploy
```

## Project Structure

```
src/
├── services/
│   ├── Elevator.js
│   └── ElevatorController.js
├── components/
│   ├── BuildingView.js
│   ├── ElevatorCar.js
│   ├── LogPanel.js
│   └── ControlPanel.js
├── App.js
└── index.js
```

## License

MIT
