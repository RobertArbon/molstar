# CLAUDE.md

This file provides guidance to Claude Code when working with the Mol* project, a comprehensive macromolecular visualization library.

## Commands

**Development:**
- `npm run dev` - Start development server with all apps
- `npm run dev:viewer` - Start development server for viewer app only
- `npm run dev:apps` - Build all apps in development mode
- `npm run dev:examples` - Build all examples in development mode
- `npm run build` - Build for production (apps and library)
- `npm run build:apps` - Build apps for production
- `npm run build:lib` - Build library for production
- `npm run clean` - Clean build directories
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (install gl, lint, and jest)
- `npm run serve` - Serve files on port 1338

**Servers:**
- `npm run model-server` - Start model data server
- `npm run volume-server-test` - Start test volume server
- `npm run plugin-state` - Start plugin state server

## Architecture

Mol* is a comprehensive macromolecular library for 3D visualization and analysis of biomolecular structures. The project serves as the foundation for next-generation data delivery and analysis tools.

**Core Philosophy:**
Mol* combines the strengths of LiteMol (PDBe) and NGL (RCSB PDB) viewers to provide a modern, extensible platform for molecular visualization. It's designed as a modular system that can be used as a standalone viewer, embedded component, or library for building custom applications.

**Project Structure:**

The core modules under `src/` include:

- **mol-task**: Computation abstraction with progress tracking and cancellation
- **mol-data**: Collections (integer-based sets, tables, columns interface)
- **mol-math**: Mathematical algorithms and data structures
- **mol-io**: Format parsers for coordinate, experimental, and annotation data
- **mol-model**: Molecular data structures and querying algorithms
- **mol-model-formats**: Data format parsers for mol-model
- **mol-model-props**: Common custom properties
- **mol-script**: Scripting language including MolQL query language
- **mol-geo**: Molecular geometry creation
- **mol-theme**: Theming for structure, volume, and shape representations
- **mol-repr**: Molecular representations
- **mol-gl**: WebGL wrapper
- **mol-canvas3d**: Low-level 3D view component
- **mol-state**: State representation tree with auto-updates
- **mol-plugin**: Modular plugin instances
- **mol-plugin-state**: State transformations and builders
- **mol-plugin-ui**: React-based user interface
- **mol-util**: Utility functions

**Apps Structure:**

- **viewer** (`src/apps/viewer/`): Main Mol* viewer application
  - `app.ts`: Core Viewer class with extension management
  - `index.ts`: Entry point with imports and exports
  - Supports comprehensive plugin extensions and customization
  - Built as standalone viewer accessible at `/build/viewer/`

- **docking-viewer**: Specialized viewer for docking visualization
- **mesoscale-explorer**: Application for mesoscale molecular exploration
- **mvs-stories**: MolViewSpec story viewer

**Key Dependencies:**
- **Core**: TypeScript 5.8+, React 18, RxJS 7
- **Build**: esbuild, sass, concurrently
- **Graphics**: WebGL-based rendering with Canvas3D
- **Data**: Support for mmCIF, PDB, CCP4, and many other formats
- **UI**: React components with modular design
- **Testing**: Jest with TypeScript support

**Extension System:**
The viewer app includes comprehensive extensions:
- Backgrounds, DNATCO, Assembly Symmetry
- Quality Assessment, Model Export, Geometry Export
- Volume streaming, PDB/EMDB data providers
- MVS (MolViewSpec) support for reproducible views
- Custom format support (G3D, etc.)

**Data Flow:**
1. Plugin initialization with configurable spec and extensions
2. Data loading through builders (download → parse → transform)
3. State management through mol-state with automatic updates
4. Rendering via mol-canvas3d and mol-gl
5. User interactions through React UI components

**Build System:**
- Uses esbuild for fast compilation and bundling
- Supports development mode with live reloading
- Production builds with minification
- Modular build system supporting apps, examples, and tests
- SASS compilation for styling
- File loading for assets (HTML, images, icons)

**Configuration:**
- Plugin specs define behavior, extensions, and UI layout
- Config system for customizing rendering, data sources, etc.
- Support for custom themes and layouts
- Environment-specific configurations (dev vs production)

**Usage Patterns:**

1. **Viewer Class**: High-level wrapper for simple integration
2. **PluginUIContext**: Full React UI with customization options
3. **PluginContext**: Headless usage without default UI
4. **Canvas3D**: Direct rendering without state management

The Mol* viewer app provides a complete, production-ready molecular visualization solution with extensive customization capabilities and modern web technologies.

## Viewer App Specifics

**Entry Points:**
- `src/apps/viewer/index.ts`: Main entry with exports and asset imports
- `src/apps/viewer/app.ts`: Core Viewer class implementation

**Key Features:**
- Comprehensive extension system with 15+ built-in extensions
- Multiple data source support (PDB, EMDB, AlphaFold, ModelArchive)
- Advanced visualization options (quality assessment, symmetry, backgrounds)
- State management and sharing capabilities
- Export functionality (models, geometry, videos)
- Volume streaming and lazy loading support

**Viewer Class Methods:**
- `loadPdb(id)`, `loadEmdb(id)`, `loadAlphaFoldDb(id)`
- `loadStructureFromUrl()`, `loadTrajectory()`
- `loadVolumeFromUrl()`, `loadMvsFromUrl()`
- `setRemoteSnapshot()`, `loadSnapshotFromUrl()`

**Extension Map:**
The viewer includes extensions for backgrounds, quality assessment, structure analysis, data export, and specialized file format support. Extensions can be selectively enabled/disabled via configuration.

**Development Workflow:**
1. Use `npm run dev:viewer` for viewer-specific development
2. Built files appear in `build/viewer/`
3. Access viewer at `http://localhost:1338/build/viewer/`
4. Hot reloading supported in development mode

This architecture provides a robust foundation for molecular visualization applications with excellent performance, extensibility, and modern web standards compliance.