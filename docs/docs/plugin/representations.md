# Representations

Mol* provides a comprehensive system for visualizing molecular structures through various representation types. This document covers how to create, modify, and customize representations, including changing colors, sizes, and other visual properties.

## Overview

Representations in Mol* are visual interpretations of molecular data. Each representation type provides a different way to display structural information, from simple atomic spheres to complex molecular surfaces. The representation system is built around three key concepts:

1. **Representation Types** - The visual style (cartoon, spacefill, ball-and-stick, etc.)
2. **Color Themes** - How colors are assigned to different parts of the structure
3. **Size Themes** - How sizes are determined for visual elements

## Available Representation Types

### Structure Representations

Mol* provides 15+ built-in structure representation types:

#### Primary Representations

- **`cartoon`** - Ribbon/tube representation following polymer traces
  - Best for: Proteins, nucleic acids, polymer visualization
  - Default color: `chain-id`
  - Shows secondary structure elements

- **`spacefill`** - Van der Waals spheres representation
  - Best for: Atomic detail, packing visualization
  - Default color: `element-symbol`
  - Shows atomic volumes

- **`ball-and-stick`** - Atoms as spheres, bonds as cylinders
  - Best for: Chemical detail, small molecules
  - Default color: `element-symbol`
  - Shows connectivity clearly

- **`line`** - Linear bond representation
  - Best for: Chemical connectivity, wireframe view
  - Minimal visual clutter

- **`point`** - Point representation of atoms
  - Best for: Large structures, overview visualization
  - Very fast rendering

#### Specialized Representations

- **`backbone`** - Polymer backbone representation
- **`carbohydrate`** - 3D carbohydrate symbols (SNFG standard)
- **`molecular-surface`** - Solvent-accessible or molecular surface
- **`gaussian-surface`** - Smooth Gaussian-based surface
- **`gaussian-volume`** - Volume-based Gaussian representation
- **`label`** - Text labels for atoms/residues
- **`ellipsoid`** - Ellipsoidal representation for anisotropic data
- **`orientation`** - Directional indicators
- **`putty`** - Variable-radius tube representation
- **`plane`** - Planar geometric representations

### Volume Representations

For volumetric data (electron density, cryo-EM maps):

- **`direct-volume`** - Direct volume rendering
- **`isosurface`** - Mesh surface at specific threshold
- **`slice`** - 2D slices through volume
- **`segment`** - Segmented volume regions

## Creating and Modifying Representations

### Basic Representation Addition

The most common way to add representations is through the structure builder:

```typescript
// Add cartoon representation to a structure component
await plugin.builders.structure.representation.addRepresentation(structure, {
    type: 'cartoon'
});

// Add ball-and-stick with specific color
await plugin.builders.structure.representation.addRepresentation(structure, {
    type: 'ball-and-stick',
    color: 'element-symbol'
});
```

### Advanced Representation Configuration

```typescript
// Complex representation with multiple parameters
await plugin.builders.structure.representation.addRepresentation(structure, {
    type: 'spacefill',
    color: 'element-symbol',
    colorParams: {
        carbonColor: { name: 'chain-id', params: {} },
        saturation: 0.1,
        lightness: 0.3
    },
    size: 'physical',
    sizeParams: { scale: 0.8 },
    typeParams: {
        quality: 'high',
        ignoreHydrogens: true,
        sizeFactor: 1.2
    }
});
```

### Working with Selections and Loci

To apply representations to specific parts of a structure, you first create selections and then convert them into **components**. A **component** in Mol* is a structural unit that represents a subset of the original structure data. Components serve as the target for adding representations - you cannot directly add representations to raw structure data; they must be applied to components.

**Why Components are Needed:**
- Components provide a manageable way to organize different parts of a structure
- They enable independent control over different structural regions (e.g., different representations for protein vs. ligand)
- They maintain reference to the parent structure while allowing focused operations
- They support efficient rendering by grouping related structural elements

Here's how to create selections, convert them to components, and add representations:

```typescript
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { StructureSelectionQuery } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';

// Example: Select basic amino acids (ARG, LYS, HIS) and create a component
const basicAminoAcids = MS.struct.generator.atomGroups({
    'residue-test': MS.core.set.has([
        MS.set(['ARG', 'LYS', 'HIS']),
        MS.struct.atomProperty.macromolecular.label_comp_id()
    ]),
    'group-by': MS.struct.atomProperty.macromolecular.residueKey()
});

// Create a selection query
const query = StructureSelectionQuery('basic_residues', basicAminoAcids);

// Create component from the selection query
const component = await plugin.builders.structure.tryCreateComponentFromExpression(
    structure, 
    basicAminoAcids, 
    'basic-amino-acids'  // Component label
);

// Add representation to the component
if (component) {
    await plugin.builders.structure.representation.addRepresentation(component, {
        type: 'ball-and-stick',
        color: 'residue-name',
        colorParams: { saturation: 0.5 }
    });
}
```

**Advanced Selection Example - Binding Site Analysis:**

```typescript
// Select ligands (non-polymer entities, excluding water)
const ligands = MS.struct.generator.atomGroups({
    'entity-test': MS.core.logic.and([
        MS.core.rel.eq([MS.struct.atomProperty.macromolecular.entityType(), 'non-polymer']),
        MS.core.logic.not([
            MS.core.set.has([
                MS.set(['HOH', 'WAT']), // Common water names
                MS.struct.atomProperty.macromolecular.auth_comp_id()
            ])
        ])
    ])
});

// Create binding site by including residues within 5Å of ligands
const bindingSite = MS.struct.modifier.includeSurroundings({
    0: ligands,
    radius: 5,
    'as-whole-residues': true
});

// Create components for different parts
const ligandComponent = await plugin.builders.structure.tryCreateComponentFromExpression(
    structure, 
    ligands, 
    'ligands'
);

const bindingSiteComponent = await plugin.builders.structure.tryCreateComponentFromExpression(
    structure, 
    bindingSite, 
    'binding-site'
);

// Add different representations to each component
if (ligandComponent) {
    // Highlight ligands with ball-and-stick
    await plugin.builders.structure.representation.addRepresentation(ligandComponent, {
        type: 'ball-and-stick',
        color: 'element-symbol',
        colorParams: { carbonColor: { name: 'entity-id', params: {} } }
    });
}

if (bindingSiteComponent) {
    // Show binding site residues with cartoon
    await plugin.builders.structure.representation.addRepresentation(bindingSiteComponent, {
        type: 'cartoon',
        color: 'chain-id',
        typeParams: { alpha: 0.8 } // Slightly transparent
    });
}
```

### Multiple Representations Example

```typescript
// Create different representations for different components
const polymer = await plugin.builders.structure.tryCreateComponentStatic(structure, 'polymer');
const ligand = await plugin.builders.structure.tryCreateComponentStatic(structure, 'ligand');
const water = await plugin.builders.structure.tryCreateComponentStatic(structure, 'water');

// Cartoon for protein
if (polymer) {
    await plugin.builders.structure.representation.addRepresentation(polymer, {
        type: 'cartoon',
        color: 'secondary-structure'
    });
}

// Ball-and-stick for ligand
if (ligand) {
    await plugin.builders.structure.representation.addRepresentation(ligand, {
        type: 'ball-and-stick',
        color: 'element-symbol',
        colorParams: { carbonColor: { name: 'entity-id', params: {} } }
    });
}

// Semi-transparent water
if (water) {
    await plugin.builders.structure.representation.addRepresentation(water, {
        type: 'ball-and-stick',
        color: 'uniform',
        colorParams: { value: ColorNames.lightblue },
        typeParams: { alpha: 0.6 }
    });
}
```

## Color Themes

Mol* provides 30+ built-in color themes organized by category:

### Atom Property Themes

- **`element-symbol`** - Colors by chemical element (CPK/Jmol colors)
- **`atom-id`** - Colors by atom identifier
- **`occupancy`** - Colors by crystallographic occupancy values
- **`formal-charge`** - Colors by formal atomic charge
- **`partial-charge`** - Colors by partial charge (red-white-blue scale)

### Chain and Entity Themes

- **`chain-id`** - Colors by chain identifier
- **`entity-id`** - Colors by molecular entity
- **`entity-source`** - Colors by entity source organism

### Residue Property Themes

- **`residue-name`** - Colors by residue type (amino acids, nucleotides)
- **`secondary-structure`** - Colors by secondary structure elements
  - α-helix: red, β-strand: yellow, coil: white, DNA: purple, RNA: pink
- **`sequence-id`** - Colors by sequence position

### Scientific Themes

- **`molecule-type`** - Colors by molecule type (protein/DNA/RNA)
- **`carbohydrate-symbol`** - Special coloring for carbohydrates
- **`hydrophobicity`** - Colors by amino acid hydrophobicity
- **`uncertainty`** - Colors by B-factors/temperature factors

### Utility Themes

- **`uniform`** - Single color for all elements
- **`illustrative`** - Special illustrative coloring scheme

### Color Theme Parameters

Most color themes accept these common parameters:

```typescript
// Element-based themes
{
    carbonColor: { name: 'chain-id', params: {} },  // Sub-theme for carbon atoms
    saturation: 0.1,    // -6 to 6, adjusts color saturation
    lightness: 0.3      // -6 to 6, adjusts color lightness
}

// Uniform theme
{
    value: Color(0xFF0000),  // Base color
    saturation: -1,          // Saturation adjustment
    lightness: 0.5           // Lightness adjustment
}

// Scale-based themes (occupancy, partial-charge)
{
    domain: [0, 1],          // Value range
    list: 'red-white-blue'   // Color scale name
}
```

## Size Themes

Mol* provides 5 built-in size themes:

- **`uniform`** - Same size for all elements
  - Parameters: `value` (0-20, step 0.1)
- **`physical`** - Van der Waals radii
  - Parameters: `scale` (0.1-5, multiplier)
- **`uncertainty`** - Size based on B-factors
  - Parameters: `bfactorFactor`, `rmsfFactor`, `baseSize`
- **`shape-group`** - Size by shape group
- **`volume-value`** - Size by volume data values

## Dynamic Theme Updates

You can change themes for existing representations:

```typescript
// Update color theme for all representations
plugin.dataTransaction(async () => {
    for (const s of plugin.managers.structure.hierarchy.current.structures) {
        await plugin.managers.structure.component.updateRepresentationsTheme(
            s.components,
            { color: 'secondary-structure' }
        );
    }
});

// Update with parameters
await plugin.managers.structure.component.updateRepresentationsTheme(
    components,
    {
        color: 'element-symbol',
        colorParams: { saturation: -0.5, lightness: 0.2 }
    }
);
```

## Representation Parameters

### Common Type Parameters

All representations support these common parameters:

- **`quality`** - Rendering quality: `'auto'`, `'medium'`, `'high'`, `'low'`, `'custom'`
- **`ignoreHydrogens`** - Whether to exclude hydrogen atoms
- **`sizeFactor`** - Scale factor for visual elements (0.1-3)
- **`alpha`** - Transparency (0-1)
- **`pickable`** - Whether elements can be selected
- **`colorSmoothing`** - Smooth color transitions

### Representation-Specific Parameters

#### Cartoon Parameters
```typescript
{
    detail: 1,              // Level of geometric detail
    linearSegments: 8,      // Segments for curved sections
    radialSegments: 16,     // Cross-sectional segments
    aspectRatio: 5,         // Width/height ratio
    arrowFactor: 1.5        // Arrow size for β-strands
}
```

#### Ball-and-Stick Parameters
```typescript
{
    unitKinds: ['atomic', 'spheres'],  // What to include
    sizeFactor: 0.15,                  // Bond thickness
    sizeAspectRatio: 2,               // Bond length/width ratio
    ignoreHydrogens: false,           // Include hydrogens
    includeParent: true               // Include parent atoms
}
```

#### Surface Parameters
```typescript
{
    probeRadius: 1.4,       // Solvent probe radius
    resolution: 2,          // Surface resolution
    smoothness: 10          // Surface smoothing iterations
}
```

## Advanced Examples

### Focus on Binding Site

```typescript
// Create binding site selection
const bindingSite = Script.getStructureSelection(Q => 
    Q.struct.modifier.includeSurroundings({
        0: Q.struct.generator.atomGroups({
            'residue-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_comp_id(), 'ATP'])
        }),
        radius: 5,
        'as-whole-residues': true
    }), structure);

// Create focused component
const focus = await plugin.builders.structure.tryCreateComponentFromExpression(
    structure, bindingSite.expression, 'binding-site'
);

if (focus) {
    // Add detailed representation
    await plugin.builders.structure.representation.addRepresentation(focus, {
        type: 'ball-and-stick',
        color: 'element-symbol'
    });
    
    // Add labels
    await plugin.builders.structure.representation.addRepresentation(focus, {
        type: 'label',
        typeParams: { level: 'residue' }
    });
}
```

### Multi-Chain Coloring

```typescript
// Color each chain differently in cartoon representation
await plugin.builders.structure.representation.addRepresentation(structure, {
    type: 'cartoon',
    color: 'chain-id',
    colorParams: {
        asymId: 'auth',  // Use author chain IDs
        palette: { name: 'many-distinct' }
    }
});
```

### Quality Assessment Visualization

```typescript
// Color by B-factors to show flexibility
await plugin.builders.structure.representation.addRepresentation(structure, {
    type: 'cartoon',
    color: 'uncertainty',
    colorParams: {
        domain: [10, 80],           // B-factor range
        list: 'blue-white-red'      // Color scale
    },
    typeParams: {
        quality: 'high'
    }
});

// Size by B-factors
await plugin.builders.structure.representation.addRepresentation(structure, {
    type: 'spacefill',
    color: 'element-symbol',
    size: 'uncertainty',
    sizeParams: {
        bfactorFactor: 0.01,
        baseSize: 0.5
    }
});
```

## Custom Color Themes

You can create custom color themes for specific applications:

```typescript
import { ColorTheme } from 'mol-theme/color';
import { ParamDefinition as PD } from 'mol-util/param-definition';
import { Color } from 'mol-util/color';

// Define theme parameters
const MyThemeParams = {
    intensity: PD.Numeric(1.0, { min: 0, max: 2, step: 0.1 }),
    baseColor: PD.Color(Color(0xFF0000))
};

// Create theme function
function MyColorTheme(ctx: ThemeDataContext, props: PD.Values<typeof MyThemeParams>): ColorTheme<typeof MyThemeParams> {
    function color(location: Location): Color {
        if (StructureElement.Location.is(location)) {
            const element = location.element;
            // Custom coloring logic here
            return Color.interpolate(props.baseColor, Color(0x00FF00), props.intensity);
        }
        return props.baseColor;
    }

    return {
        factory: MyColorTheme,
        granularity: 'group',
        color,
        props,
        description: 'Custom color theme'
    };
}

// Create provider
const MyColorThemeProvider: ColorTheme.Provider<typeof MyThemeParams, 'my-theme'> = {
    name: 'my-theme',
    label: 'My Custom Theme',
    category: 'Custom',
    factory: MyColorTheme,
    getParams: () => MyThemeParams,
    defaultValues: PD.getDefaultValues(MyThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};

// Register theme
plugin.representation.structure.themes.colorThemeRegistry.add(MyColorThemeProvider);
```

## Best Practices

- Use `'auto'` quality for interactive work, `'high'` for final images
- Consider `ignoreHydrogens: true` for large structures
- Use `point` or `line` representations for very large structures
- Limit the number of simultaneous representations

