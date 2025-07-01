# CLAUDE.md

This file provides guidance to Claude Code when working with the mol-model module, which provides the core data structures and algorithms for representing molecular data in Mol*.

## Overview

The `mol-model` module is the **fundamental data layer** of Mol* that defines data structures, algorithms, and operations for molecular data. It provides the building blocks for representing structures, volumes, sequences, and geometric shapes that all other Mol* modules depend on.

## Architecture

**Core Concept:**
- **Data-First Design**: Immutable, efficient data structures for molecular information
- **Layered Abstraction**: From raw coordinates to complex molecular structures
- **Query System**: Powerful selection and filtering capabilities
- **Custom Properties**: Extensible property system for computed data
- **Performance Optimized**: Designed for handling large molecular structures efficiently

## Key Files and Components

### Core Data Types

**Primary Exports:**
- `structure.ts`: Complete molecular structure representation system
- `volume.ts`: Volumetric data (density maps, electron density)
- `sequence.ts`: Sequence data and alignment algorithms
- `shape.ts`: Geometric shapes and shape providers
- `loci.ts`: Location and selection abstractions
- `location.ts`: Spatial location representations
- `custom-property.ts`: Extensible property system

### Structure System (`structure/`)

**Hierarchical Architecture:**
```
Trajectory (time series)
  ├── Model (single conformer/frame)
      ├── Structure (processed molecular structure)
          ├── Unit (atomic or coarse-grained units)
              ├── Element (individual atoms/residues)
```

**Core Components:**

**Trajectory** (`structure/trajectory.ts`):
- Time series of molecular conformations
- Multi-frame coordinate data
- Trajectory metadata and indexing

**Model** (`structure/model/`):
- **model.ts**: Single molecular model representation
- **properties/**: Atomic and coarse-grained properties
  - `atomic/`: Detailed atomic data (bonds, hierarchy, conformation)
  - `coarse/`: Coarse-grained representations
  - `sequence.ts`: Sequence information and mapping
  - `symmetry.ts`: Crystallographic symmetry operations
- **indexing.ts**: Efficient indexing systems for fast lookups
- **types/**: Molecular type classifications (ions, lipids, saccharides)

**Structure** (`structure/structure/`):
- **structure.ts**: High-level molecular structure representation
- **element/**: Structure element system
  - `element.ts`: Individual molecular elements
  - `location.ts`: Spatial locations within structures
  - `loci.ts`: Location collections and selections
  - `bundle.ts`: Element grouping and operations
- **unit/**: Structural units
  - `bonds/`: Inter- and intra-unit bond computation
  - `rings.ts`: Ring detection and analysis
  - `resonance.ts`: Resonance structure analysis
- **util/**: Structure utilities
  - `lookup3d.ts`: Spatial indexing for fast neighbor searches
  - `superposition.ts`: Structure alignment algorithms
  - `boundary.ts`: Molecular boundary calculations
  - `polymer.ts`: Polymer-specific operations
- **carbohydrates/**: Specialized carbohydrate analysis
- **symmetry.ts**: Symmetry operations and transformations
- **mapping.ts**: Structure-to-structure mappings
- **properties.ts**: Structure-level property accessors

### Query System (`structure/query/`)

**Powerful Selection Framework:**
- **query.ts**: Core query interface and execution
- **selection.ts**: Selection operations and management
- **context.ts**: Query execution context
- **predicates.ts**: Boolean predicates for filtering
- **queries/**: Comprehensive query library
  - `generators.ts`: Element generators (all atoms, residues, chains)
  - `filters.ts`: Filtering operations (by type, property, etc.)
  - `modifiers.ts`: Selection modifications (expand, include, etc.)
  - `combinators.ts`: Logical operations (union, intersection, etc.)
  - `atom-set.ts`: Atom set operations

**Query Examples:**
```typescript
// Select all alpha carbons
const alphaCarbons = StructureQuery.generators.atoms({
    atomTest: ctx => StructureProperties.atom.label_atom_id(ctx.element) === 'CA'
});

// Chain-specific selection
const chainA = StructureQuery.generators.chains({
    chainTest: ctx => StructureProperties.chain.label_asym_id(ctx.element) === 'A'
});

// Complex queries with combinators
const activesite = StructureQuery.combinators.merge([
    residueSelection,
    StructureQuery.modifiers.expandSpatially({ radius: 5 })
]);
```

### Volume System (`volume/`)

**Volumetric Data Support:**
- **volume.ts**: Volume data structure and operations
- **grid.ts**: 3D grid system for spatial data

**Volume Features:**
- Density map representation
- Isosurface computation
- Volume sampling and interpolation
- Custom volume properties
- Color volume support for multi-channel data

### Sequence System (`sequence/`)

**Sequence Analysis:**
- **sequence.ts**: Core sequence representation
- **alignment/**: Sequence alignment algorithms
  - `alignment.ts`: Pairwise and multiple sequence alignment
  - `substitution-matrix.ts`: Scoring matrices (BLOSUM, PAM)
- **constants.ts**: Amino acid and nucleotide constants

### Shape System (`shape/`)

**Geometric Representations:**
- **shape.ts**: Basic shape definitions
- **provider.ts**: Shape provider interface for complex geometries

### Location and Loci System

**Spatial Abstractions:**
- **loci.ts**: Location collections (sets of molecular positions)
- **location.ts**: Individual spatial locations
- Support for structure, bond, shape, and data loci
- Bounding sphere calculations
- Label generation for locations

### Custom Property System

**Extensible Properties:**
- **custom-property.ts**: Framework for computed properties
- Lazy evaluation and caching
- Type-safe property definitions
- Automatic dependency tracking

## Key Features

### Immutable Data Structures

**Performance and Safety:**
- Immutable data structures prevent accidental modifications
- Structural sharing for memory efficiency
- Safe concurrent access
- Predictable state management

### Efficient Indexing

**Fast Lookups:**
- Spatial indexing (3D lookup structures)
- Hierarchical indexing (chain → residue → atom)
- Bond indexing for connectivity queries
- Optimized for large molecular structures

### Comprehensive Query System

**Flexible Selections:**
- Composable query building blocks
- Type-safe query construction
- Efficient query execution
- Support for spatial, chemical, and topological queries

### Property System

**Computed Properties:**
- Lazy evaluation for expensive computations
- Caching with automatic invalidation
- Custom property registration
- Properties for models, structures, and elements

### Multi-Scale Representation

**Atomic to Coarse-Grained:**
- Full atomic detail representation
- Coarse-grained representations for large systems
- Seamless switching between representations
- Consistent interfaces across scales

### Bond and Connectivity

**Chemical Connectivity:**
- Inter- and intra-unit bond computation
- Chemical bond type detection
- Ring detection and analysis
- Resonance structure support

## Development Patterns

### Working with Structures

**Structure Access:**
```typescript
// Accessing structure hierarchy
const structure: Structure = ...;
for (const unit of structure.units) {
    if (Unit.isAtomic(unit)) {
        // Access atomic data
        const positions = unit.conformation.x;
        const elements = unit.elements;
    }
}

// Property access
const chainId = StructureProperties.chain.label_asym_id(location);
const atomType = StructureProperties.atom.type_symbol(location);
```

### Query Building

**Selection Queries:**
```typescript
// Building complex queries
const query = StructureQuery.combinators.merge([
    StructureQuery.generators.residues({
        residueTest: ctx => StructureProperties.residue.name(ctx.element) === 'ARG'
    }),
    StructureQuery.modifiers.wholeResidues()
]);

const selection = StructureQuery.run(query, structure);
```

### Custom Properties

**Property Definition:**
```typescript
const MyProperty = CustomProperty.create<Structure, number>({
    name: 'my-property',
    compute: (structure) => {
        // Compute property value
        return computeValue(structure);
    }
});

// Usage
const value = MyProperty.get(structure);
```

### Volume Operations

**Working with Volumes:**
```typescript
const volume: Volume = ...;
const grid = volume.grid;

// Sample volume at position
const value = Grid.sampleLinear(grid, position);

// Get volume statistics
const stats = Volume.computeStats(volume);
```

## Integration Points

### mol-io Integration

**Data Loading:**
- Structures created from parsed format data
- Volume data from density file formats
- Sequence data from alignment files

### mol-plugin-state Integration

**State Management:**
- Structures become state objects
- Transformations operate on model data
- Query results drive state selections

### mol-repr Integration

**Visualization:**
- Structure elements drive representation creation
- Volume data feeds isosurface generation
- Loci collections enable interactive highlighting

### mol-script Integration

**Scripting:**
- Query system integrates with mol-script expressions
- Structure properties available in scripts
- Programmable structure manipulation

The mol-model module provides the **foundational data structures** and **algorithms** that enable all molecular visualization and analysis in Mol*, designed for performance, extensibility, and type safety while handling the complexity of molecular data at multiple scales.