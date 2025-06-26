# CLAUDE.md

This file provides guidance to Claude Code when working with the mol-plugin module, which provides the core plugin architecture and runtime for Mol*.

## Overview

The `mol-plugin` module is the **core engine** of Mol* that orchestrates all molecular visualization functionality. It provides the foundational plugin architecture, context management, behavior system, and command framework that powers the entire Mol* ecosystem.

## Architecture

**Core Concept:**
- **PluginContext**: Central orchestrator managing all plugin subsystems
- **Behavior System**: Extensible behavior/plugin architecture
- **Command Framework**: Centralized command dispatch and execution
- **Configuration Management**: Runtime configuration and settings
- **State Management**: Unified state coordination across all systems

## Key Files and Components

### Core Infrastructure

**Primary Classes:**
- `context.ts`: **PluginContext** - Main plugin orchestrator and API surface
- `spec.ts`: **PluginSpec** - Plugin configuration and behavioral specifications
- `commands.ts`: **PluginCommands** - Centralized command registry and dispatch
- `config.ts**: **PluginConfig** - Configuration management system
- `state.ts**: **PluginState** - High-level state coordination

### Context Management (`context.ts`)

**PluginContext Responsibilities:**
- **System Orchestration**: Coordinates all plugin subsystems (canvas3d, state, managers)
- **Lifecycle Management**: Initialization, mounting, unmounting, disposal
- **Event Management**: Central event hub using RxJS observables
- **Task Execution**: Centralized task running with progress tracking
- **Builder Access**: Provides data and structure builders
- **Manager Access**: Coordinates specialized managers (structure, volume, camera, etc.)

**Key Subsystems:**
```typescript
// Core systems
readonly state: PluginState
readonly config: PluginConfigManager
readonly commands: PluginCommandManager
readonly layout: PluginLayout

// 3D rendering
readonly canvas3d: Canvas3D
readonly canvas3dContext: Canvas3DContext

// Managers for specialized functionality
readonly managers: {
    structure: { hierarchy, component, measurement, selection, focus }
    volume: { hierarchy }
    interactivity, camera, animation, snapshot, lociLabels, toast, asset, task, dragAndDrop
}

// Builders for data operations
readonly builders: {
    data: DataBuilder
    structure: StructureBuilder
}
```

### Behavior System (`behavior/`)

**Behavioral Architecture:**
- **Static Behaviors**: Built-in behaviors (state, representation, camera, misc)
- **Dynamic Behaviors**: Runtime behaviors (representation, camera, custom properties)
- **Custom Properties**: Extensible property system for structures and models
- **Volume Streaming**: Dynamic volume loading and streaming

**Behavior Categories:**
- **Representation**: Visual representation management and interaction
- **Camera**: Camera controls, focus, and animation
- **Custom Props**: Computed properties (interactions, secondary structure, etc.)
- **Selection**: Structure selection and focus representation

### Command System (`commands.ts`)

**Command Architecture:**
- **Centralized Dispatch**: Single entry point for all plugin operations
- **Type Safety**: Strongly typed command parameters and execution
- **State Commands**: Object manipulation, snapshots, visibility control
- **Interactivity Commands**: Highlighting, selection, camera control
- **Canvas Commands**: Rendering settings, screenshot capture

**Command Categories:**
```typescript
PluginCommands = {
    State: { SetCurrentObject, ApplyAction, Update, RemoveObject, ToggleExpanded, Snapshots: {...} }
    Interactivity: { Object: {...}, Loci: {...} }
    Camera: { Reset, SetSnapshot, Orient, Focus, Viewport }
    Canvas3D: { SetSettings }
    Toast: { Show, Hide }
}
```

### Configuration System (`config.ts`)

**Configuration Management:**
- **Typed Configuration**: Strongly typed configuration items with defaults
- **Runtime Configuration**: Dynamic configuration updates
- **Feature Detection**: Automatic capability detection and defaults
- **Provider Configuration**: Data source and service provider settings

**Configuration Categories:**
- **General**: Rendering settings, performance options, transparency
- **State**: State server configuration and history management  
- **Volume Streaming**: Volume server settings and streaming capabilities
- **Downloads**: PDB/EMDB provider configuration
- **Viewport**: Camera and viewport behavior settings
- **Structure**: Representation defaults and preprocessing options

### Plugin Specification (`spec.ts`)

**PluginSpec Structure:**
- **Actions**: Available state actions and transformers
- **Behaviors**: Plugin behaviors and their default parameters
- **Animations**: Built-in animation definitions
- **Custom Formats**: Data format providers and parsers
- **Canvas3D**: 3D rendering configuration
- **Layout**: Initial layout configuration

**Default Specification:**
Provides comprehensive defaults for molecular visualization including:
- Data download and parsing actions
- Structure and volume representation
- Built-in behaviors for interaction and visualization
- Animation support (model index, camera, snapshots, assembly)

## Key Features

### Plugin Orchestration

**System Integration:**
- Coordinates all Mol* subsystems through single context
- Manages lifecycle of 3D canvas, state trees, and managers
- Provides unified API surface for all plugin operations
- Handles cross-system event coordination

**Extensibility:**
- Behavior-based plugin architecture
- Custom property system for extending data models
- Configurable data format support
- Replaceable component system

### Task Management

**Execution Framework:**
- Centralized task execution with progress tracking
- Async operation coordination
- Error handling and reporting
- Background task management with overlay support

### Event System

**Reactive Architecture:**
- RxJS-based event system for reactive updates
- Behavior subjects for state observation
- Cross-system event coordination
- Subscription management with automatic cleanup

### Canvas Integration

**3D Rendering Integration:**
- WebGL context management and configuration
- Canvas lifecycle management (resize, dispose)
- Input event coordination (mouse, keyboard, touch)
- Animation loop coordination

### State Coordination

**Unified State Management:**
- Coordinates data state and behavior state
- Provides transaction support for complex operations
- Snapshot management for session persistence
- Cross-system state synchronization

## Development Patterns

### Plugin Development

**Creating Plugin Behaviors:**
```typescript
const MyBehavior = PluginBehavior.create<{ param: number }>({
    name: 'my-behavior',
    category: 'custom',
    ctor: class extends PluginBehavior.Handler {
        register() {
            // Register behavior functionality
        }
    }
});
```

**Custom Configuration:**
```typescript
const MyConfig = item('my-config.setting', defaultValue);
```

**Command Registration:**
```typescript
const MyCommand = PluginCommand<{ param: string }>();
```

### Context Usage

**Accessing Plugin Systems:**
```typescript
// Via plugin context
plugin.managers.structure.hierarchy
plugin.builders.data.download()
plugin.runTask(someTask)
plugin.dataTransaction(async () => { /* operations */ })
```

**Event Subscription:**
```typescript
plugin.behaviors.interaction.hover.subscribe(event => {
    // Handle hover events
});
```

## Integration Points

### State System Integration

**State Coordination:**
- Manages data state tree for loaded structures/volumes
- Coordinates behavior state for plugin behaviors
- Provides transaction support for complex state operations
- Snapshot management for session persistence

### Canvas3D Integration

**Rendering System:**
- Manages WebGL context and canvas lifecycle
- Coordinates input events from canvas
- Provides animation loop integration
- Handles viewport management and screenshots

### UI Integration

**Plugin-UI Coordination:**
- Provides context for React UI components
- Manages layout state and panel visibility
- Coordinates command execution from UI
- Provides event streams for reactive UI updates

The mol-plugin module serves as the **foundational engine** that makes Mol* work, providing the architecture, coordination, and runtime systems that enable all molecular visualization functionality while maintaining extensibility and performance.