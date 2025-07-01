# CLAUDE.md

This file provides guidance to Claude Code when working with the mol-plugin-state module, which provides state management, transformations, and data processing for the Mol* plugin system.

## Overview

The `mol-plugin-state` module is the **state management and data processing engine** of Mol*. It provides the framework for loading, transforming, and managing molecular data through a tree-based state system with composable transformations and builders.

## Architecture

**Core Concept:**
- **State Objects**: Typed data containers representing different types of molecular data
- **State Transformers**: Composable operations that transform data from one type to another
- **Builders**: High-level APIs for common data operations and workflows
- **Managers**: Specialized systems for managing hierarchical molecular data
- **Actions**: High-level operations combining multiple transformations

## Key Files and Components

### Core Infrastructure

**Foundation:**
- `objects.ts`: **PluginStateObject** - Type definitions for all state object types
- `transforms.ts`: **StateTransforms** - Registry of all transformation operations
- `actions.ts`: **StateActions** - High-level action definitions
- `component.ts`: Base component class for plugin components

### State Object System (`objects.ts`)

**Object Hierarchy:**
```typescript
PluginStateObject = {
    Root
    Group
    Data: { Binary, String, Blob }
    Molecule: { 
        Trajectory, Model, Structure, 
        Coordinates, Topology 
    }
    Volume: { 
        Data, Lazy, Streaming 
    }
    Shape: { 
        Provider, Representation 
    }
    Representation3D: {
        Structure, Volume, Shape
    }
    Behavior
}
```

**Type System:**
- **Strongly Typed**: Each object type has specific data and metadata
- **Type Classes**: Organizational categories (Root, Group, Data, Object, Representation3D, Behavior)
- **Data Validation**: Runtime type checking and validation
- **Serialization**: Support for state persistence and snapshots

### Transformation System (`transforms/`)

**Transform Categories:**
- **Data**: File I/O, parsing, format conversion (`transforms/data.ts`)
- **Model**: Trajectory and structure processing (`transforms/model.ts`)
- **Volume**: Volumetric data processing (`transforms/volume.ts`)
- **Representation**: 3D visualization creation (`transforms/representation.ts`)
- **Shape**: Geometric shape processing (`transforms/shape.ts`)
- **Misc**: Utility transformations (`transforms/misc.ts`)

**Key Transformations:**
```typescript
Data: { Download, ParseCif, ParseCcp4, RawData, ReadFile }
Model: { 
    TrajectoryFromMmCif, TrajectoryFromPDB, 
    ModelFromTrajectory, StructureFromModel,
    StructureSelectionFromScript 
}
Volume: { VolumeFromCcp4, VolumeFromDsn6, VolumeFromCube }
Representation: { 
    StructureRepresentation3D, VolumeRepresentation3D,
    StructureSelectionsDistance3D, StructureSelectionsAngle3D
}
```

### Builder System (`builder/`)

**High-Level APIs:**
- **DataBuilder** (`builder/data.ts`): File downloads, data loading, format detection
- **StructureBuilder** (`builder/structure.ts`): Structure processing, trajectory parsing
- **Hierarchy Builders**: Complex molecular hierarchy construction
- **Representation Builders**: 3D visualization pipeline management

**Builder Features:**
```typescript
DataBuilder: {
    download(url), rawData(data), readFile(file)
    downloadBlob(blob), format detection
}

StructureBuilder: {
    parseTrajectory(data, format)
    createModel(trajectory), createStructure(model)
    hierarchy: TrajectoryHierarchyBuilder
    representation: StructureRepresentationBuilder
}
```

### Manager System (`manager/`)

**Specialized Managers:**
- **StructureHierarchyManager**: Complex molecular structure organization
- **StructureComponentManager**: Structure component lifecycle management
- **StructureSelectionManager**: Selection state and operations
- **StructureMeasurementManager**: Geometric measurements and analysis
- **VolumeHierarchyManager**: Volumetric data organization
- **CameraManager**: Camera state and animation management
- **InteractivityManager**: User interaction handling

**Hierarchy Management:**
```typescript
StructureHierarchyManager: {
    // Hierarchical organization
    trajectories, models, structures, components
    
    // Selection management
    selection: { trajectories, models, structures }
    
    // Operations
    remove(refs), update(refs), toggle(refs)
}
```

### Action System (`actions/`)

**High-Level Actions:**
- **Structure Actions** (`actions/structure.ts`): Loading structures from various sources
- **Volume Actions** (`actions/volume.ts`): Loading volumetric data and density maps
- **File Actions** (`actions/file.ts`): File operations and format handling

**Structure Actions:**
```typescript
DownloadStructure: {
    // Data sources
    pdb, pdb-ihm, alphafolddb, modelarchive
    // Options
    format, isBinary, representationParams
}

LoadTrajectory: {
    // Multi-file support
    model: url/data, coordinates: url/data
    // Format handling
    autoDetection, custom parsers
}
```

### Format System (`formats/`)

**Format Support:**
- **Trajectory Formats** (`formats/trajectory.ts`): mmCIF, PDB, GRO, XTC, DCD
- **Volume Formats** (`formats/volume.ts`): CCP4, DSN6, Cube, DX
- **Coordinate Formats** (`formats/coordinates.ts`): XTC, DCD, coordinate trajectories
- **Topology Formats** (`formats/topology.ts`): PSF, PRMTOP, TOP
- **Registry** (`formats/registry.ts`): Format detection and provider management

### Helper System (`helpers/`)

**Specialized Helpers:**
- **Structure Helpers**: Component processing, selection queries, representation parameters
- **Volume Helpers**: Volume representation parameters and processing
- **Visual Helpers**: Overpaint, transparency, clipping, emissive properties
- **Query Helpers**: Structure selection query processing

## Key Features

### State Tree Management

**Hierarchical State:**
- Tree-based state organization with parent-child relationships
- Automatic dependency tracking and update propagation
- Transaction support for complex multi-step operations
- Snapshot support for session persistence

**Data Flow:**
```
Raw Data → Parse → Trajectory → Model → Structure → Representation
         ↓
      Volume Data → Volume → Volume Representation
```

### Transform Composition

**Pipeline Architecture:**
- Composable transformations with type safety
- Automatic dependency resolution
- Error handling and rollback support
- Parallel execution where possible

**Example Pipeline:**
```typescript
// Structure loading pipeline
data.download(url)
  .apply(ParseCif)
  .apply(TrajectoryFromMmCif)
  .apply(ModelFromTrajectory)
  .apply(StructureFromModel)
  .apply(StructureRepresentation3D)
```

### Builder Abstractions

**High-Level APIs:**
- Simplified interfaces for complex operations
- Error handling and validation
- Progress tracking and cancellation
- Preset and template support

### Format Extensibility

**Plugin Architecture:**
- Custom format providers
- Automatic format detection
- Streaming support for large files
- Binary and text format support

### Animation Support

**Built-in Animations:**
- **Model Index**: Frame-by-frame trajectory playback
- **Camera Animations**: Spin, rock, focus transitions
- **State Snapshots**: Animated transitions between states
- **Assembly Unwind**: Biological assembly animations
- **Structure Spin**: Rotation animations
- **State Interpolation**: Smooth state transitions

## Development Patterns

### Creating Custom Transformers

**Transform Definition:**
```typescript
const MyTransform = StateTransformer.builderFactory('namespace')({
    name: 'my-transform',
    from: PluginStateObject.Data.String,
    to: PluginStateObject.Molecule.Structure,
    params: { /* parameter definition */ }
})({
    apply({ a, params }) {
        // Transform implementation
        return new PluginStateObject.Molecule.Structure(result);
    }
});
```

### Using Builders

**Common Patterns:**
```typescript
// Data loading
const data = await plugin.builders.data.download({ url });
const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');

// Structure processing
const model = await plugin.builders.structure.createModel(trajectory);
const structure = await plugin.builders.structure.createStructure(model);

// Representation creation
await plugin.builders.structure.representation.addRepresentation(structure, 'cartoon');
```

### Manager Integration

**Hierarchy Management:**
```typescript
// Structure hierarchy access
const manager = plugin.managers.structure.hierarchy;
const structures = manager.selection.structures;
const components = manager.currentComponentGroups;

// Operations
await manager.toggleVisibility(structures);
await manager.remove(components);
```

## Integration Points

### Plugin Core Integration

**Context Integration:**
- Provides builders and managers to PluginContext
- Integrates with command system for operations
- Coordinates with behavior system for reactive updates

### UI Integration

**State Visualization:**
- Tree structure maps to UI hierarchy display
- Transform parameters become form controls
- Manager state drives UI component visibility

### Canvas3D Integration

**Representation Pipeline:**
- State transformations create 3D representations
- Automatic updates propagate to canvas
- Performance optimization through state caching

The mol-plugin-state module provides the **data processing engine** and **state management framework** that transforms raw molecular data into interactive 3D visualizations while maintaining a clear, composable, and extensible architecture.