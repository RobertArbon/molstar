# CLAUDE.md

This file provides guidance to Claude Code when working with the mol-plugin-ui module, which provides the React-based user interface for the Mol* plugin system.

## Overview

The `mol-plugin-ui` module is the React-based user interface layer that sits on top of the Mol* plugin architecture. It provides a complete, customizable UI for molecular visualization and analysis, transforming the underlying plugin functionality into an interactive web application.

## Architecture

**Core Concept:**
- **PluginUIContext**: Extends PluginContext with UI-specific functionality
- **React Components**: Modular UI components using React Context pattern
- **Layout System**: Flexible, responsive layout with configurable panels
- **Event-Driven**: Uses RxJS observables for reactive state management

## Key Files and Components

### Core Infrastructure

**Entry Points:**
- `index.ts`: Main export with `createPluginUI()` function
- `plugin.tsx`: Root Plugin component and layout system
- `context.ts`: PluginUIContext class extending PluginContext
- `spec.ts`: PluginUISpec interface defining UI configuration

**Base Classes:**
- `base.tsx`: 
  - `PluginUIComponent`: Base class for all UI components with subscription management
  - `PurePluginUIComponent`: Pure component variant for performance
  - `CollapsableControls`: Abstract base for collapsible UI sections
  - `PluginReactContext`: React Context for plugin access

### Layout and Structure

**Main Layout (`plugin.tsx`):**
- `Layout`: Main layout component managing regions (top, left, right, bottom, main)
- `PluginInitWrapper`: Handles plugin initialization states
- `PluginContextContainer`: Provides plugin context to child components
- Drag-and-drop file loading support
- Responsive design with configurable visibility

**Panel Components:**
- `left-panel.tsx`: Data tree, snapshots, help, and settings tabs
- `viewport.tsx`: 3D viewport with controls and overlays
- `controls.tsx`: General control components and trajectory management
- `sequence.tsx`: Sequence viewer with polymer, hetero, and chain views

### UI Control Library (`controls/`)

**Common Controls:**
- `common.tsx`: Button, ControlGroup, IconButton, and other basic UI elements
- `parameters.tsx`: Parameter input controls for dynamic form generation
- `icons.tsx`: SVG icon components and icon management
- `color.tsx`: Color picker and color-related controls
- `slider.tsx`: Range slider component
- `action-menu.tsx`: Context menus and action buttons

**Specialized Controls:**
- `screenshot.tsx`: Screenshot and image export functionality
- `legend.tsx`: Legend display for visualizations
- `line-graph/`: Interactive line graph components

### Structural Analysis (`structure/`)

**Core Structure UI:**
- `components.tsx`: Structure component management and controls
- `selection.tsx`: Selection tools and granularity controls
- `source.tsx`: Structure data source management
- `measurements.tsx`: Distance, angle, and geometric measurements
- `superposition.tsx`: Structure alignment and superposition
- `quick-styles.tsx`: Rapid styling presets and themes
- `volume.tsx`: Volume data visualization controls
- `focus.tsx`: Camera focus and view management

### State Management (`state/`)

**State UI Components:**
- `tree.tsx`: Hierarchical state tree visualization
- `actions.tsx`: State action controls and execution
- `snapshots.tsx`: Session state saving and loading
- `animation.tsx`: Animation timeline and playback controls
- `update-transform.tsx`: Parameter updates and transformations

### Specialized Features

**Sequence Viewer (`sequence/`):**
- `sequence.tsx`: Main sequence display component
- `polymer.tsx`: Protein/nucleic acid sequence representation
- `hetero.tsx`: Small molecule and hetero group sequences
- `chain.tsx`: Chain-based sequence organization
- `element.tsx`: Element-specific sequence views
- `wrapper.ts`: Sequence wrapper abstractions

**Viewport Management (`viewport/`):**
- `canvas.tsx`: WebGL canvas integration and management
- `help.tsx`: Interactive help and documentation
- `screenshot.tsx`: Image capture and export
- `simple-settings.tsx`: Quick settings panel

**Custom Extensions (`custom/`):**
- `volume.tsx`: Custom volume streaming controls

### Styling System (`skin/`)

**Theme Architecture:**
- `base/`: Core SCSS foundations, variables, and mixins
- `light.scss`: Light theme implementation
- `dark.scss`: Dark theme variant
- `blue.scss`: Alternative blue theme
- Modular component-specific styles
- Responsive layout system

## Key Features

### React Integration

**Context System:**
- Uses React Context for plugin instance sharing
- Automatic subscription management for RxJS observables
- Component lifecycle integration with plugin events

**Component Architecture:**
- Extensible component system with base classes
- Pure components for performance optimization
- Consistent event handling and state management

### Layout Management

**Flexible Layout:**
- 5-region layout: top, left, right, bottom, main
- Collapsible/expandable panels
- Responsive design with mobile support
- Configurable visibility and component replacement

**Drag & Drop:**
- File drag-and-drop support with overlay
- Automatic format detection
- Session file (.molx/.molj) handling

### UI Specification System

**PluginUISpec:**
- Configurable component replacement
- Custom parameter editors
- Layout control customization
- Extension integration points

**Default Configuration:**
- Provides sensible defaults for all UI components
- Extensible through component replacement
- Theme and styling customization

### State Visualization

**Data Tree:**
- Interactive state tree with expand/collapse
- Action execution from UI
- Parameter editing with live updates
- Snapshot management

**Visual Controls:**
- Selection tools with granularity options
- Measurement tools for geometric analysis
- Animation controls for trajectories
- Camera and viewport management

### Sequence Analysis

**Multi-Mode Viewer:**
- Polymer sequences (proteins, nucleic acids)
- Hetero group sequences (ligands, ions)
- Chain-based organization
- Interactive selection and highlighting

**Features:**
- Sequence-structure mapping
- Conservation visualization
- Secondary structure overlay
- Customizable display modes

## Development Patterns

### Component Development

**Base Component Usage:**
```typescript
class MyComponent extends PluginUIComponent<Props, State> {
    componentDidMount() {
        // Subscribe to plugin events
        this.subscribe(this.plugin.events.someEvent, this.handleEvent);
    }
    
    render() {
        return <div>Component content</div>;
    }
}
```

**State Management:**
- Use plugin context for accessing plugin instance
- Subscribe to relevant observables in componentDidMount
- Automatic cleanup on component unmount

### Customization

**Component Replacement:**
- Replace default components via PluginUISpec
- Implement consistent interfaces
- Maintain React Context integration

**Theme Customization:**
- Extend base SCSS variables
- Override component-specific styles
- Support for custom color schemes

## Integration Points

### Plugin System Integration

**PluginUIContext:**
- Extends core PluginContext with UI features
- Manages custom parameter editors
- Provides layout management

**Command Integration:**
- UI components trigger plugin commands
- Reactive updates from plugin state changes
- Event-driven architecture

### Extension Support

**Custom Components:**
- Replace default UI components
- Add custom parameter editors
- Integrate with existing layout system

**Plugin Extensions:**
- UI components for plugin behaviors
- Custom visualization controls
- Specialized analysis tools

The mol-plugin-ui module provides a comprehensive, extensible React-based interface for molecular visualization, with strong separation of concerns, reactive state management, and extensive customization capabilities.