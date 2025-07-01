# Selections


Assuming you have a model already loaded into the plugin (see [Creating Plugin Instance](./instance.md)), these are some of the following method you can select structural data.

### Selecting directly from the `hierarchy` manager

One can select a subcomponent's data directly from the plugin manager.

```typescript 
import { Structure } from '../mol-model/structure';

const ligandData = plugin.managers.structure.hierarchy.selection.structures[0]?.components[0]?.cell.obj?.data;
const ligandLoci = Structure.toStructureElementLoci(ligandData as any);

plugin.managers.camera.focusLoci(ligandLoci);
plugin.managers.interactivity.lociSelects.select({ loci: ligandLoci });
```

## Selection callbacks
If you want to subscribe to selection events (e.g. to change external state in your application based on a user selection), you can use: `plugin.behaviors.interaction.click.subscribe`

Here's an example of passing in a React "set" function to update selected residue positions.
```typescript
import {
  Structure,
  StructureProperties,
} from "molstar/lib/mol-model/structure"
// setSelected is assumed to be a "set" function returned by useState
// (selected: any[]) => void
plugin.behaviors.interaction.click.subscribe(
  (event: InteractivityManager.ClickEvent) => {
    const selections = Array.from(
      plugin.managers.structure.selection.entries.values()
    );
    // This bit can be customized to record any piece information you want
    const localSelected: any[] = [];
    for (const { structure } of selections) {
      if (!structure) continue;
      Structure.eachAtomicHierarchyElement(structure, {
        residue: (loc) => {
          const position = StructureProperties.residue.label_seq_id(loc);
          localSelected.push({ position });
        },
      });
    }
    setSelected(localSelected);
  }
)
```

### `Molscript` language

Molscript is a domain-specific language for addressing crystallographic structures and is a core part of the Mol* library found at `https://github.com/molstar/molstar/tree/master/src/mol-script`. It can be used against the Molstar plugin as a query language and transpiled against multiple external molecular visualization libraries (see [here](https://github.com/molstar/molstar/tree/master/src/mol-script/transpilers)).

The MolScript language provides both simple string-based selections via `compileIdListSelection()` and complex programmatic queries via the `MolScriptBuilder`. This section covers comprehensive examples of both approaches.

#### Simple String-Based Selections

The `compileIdListSelection()` function provides a convenient way to create selections using simple string syntax:

```typescript
import { compileIdListSelection } from 'molstar/lib/mol-script/util/id-list'

// Basic chain and residue range selection
const query1 = compileIdListSelection('A 12-200', 'auth');
plugin.managers.structure.selection.fromCompiledQuery('add', query1);

// Multiple chains
const query2 = compileIdListSelection('A,B,C', 'auth');
plugin.managers.structure.selection.fromCompiledQuery('set', query2);

// Specific residues in multiple chains
const query3 = compileIdListSelection('A 10,15,20-25 B 5-10', 'auth');
plugin.managers.structure.selection.fromCompiledQuery('set', query3);

// Using label identifiers instead of author
const query4 = compileIdListSelection('A 100-150', 'label');
plugin.managers.structure.selection.fromCompiledQuery('set', query4);
```

#### Comprehensive Selection String Syntax

Mol* supports multiple selection string formats and languages, providing both simple ID-based selections and advanced query capabilities comparable to desktop molecular visualization software.

##### 1. ID List Selections (`compileIdListSelection`)

The `compileIdListSelection(selectionString, idType)` function supports four different ID types:

###### **Residue-Based Selections (`'auth'` and `'label'` modes)**

| Selection String | Description |
|------------------|-------------|
| **Basic Chain Selections** |
| `'A'` | All residues in chain A |
| `'A,B,C'` | All residues in chains A, B, and C |
| **Residue Range Selections** |
| `'A 100-150'` | Chain A residues 100 to 150 (inclusive) |
| `'A 10-20 B 30-40'` | Chain A residues 10-20 and chain B residues 30-40 |
| `'A,B 10-50'` | Residues 10-50 in both chains A and B |
| **Specific Residue Selections** |
| `'A 42'` | Chain A residue 42 only |
| `'A 10,20,30'` | Chain A residues 10, 20, and 30 |
| `'A 5,10-15,25'` | Chain A residues 5, 10-15 (range), and 25 |
| **Insertion Codes** |
| `'A 100:A'` | Chain A residue 100 with insertion code A |
| `'A 100:i,101:A'` | Chain A residues with specific insertion codes |
| `'A 100:A-100:Z'` | Range of residues with insertion codes |
| **Negative Residue Numbers** |
| `'A -10--1'` | Chain A residues -10 to -1 (negative numbering) |
| `'A -5,1-10'` | Chain A residue -5 and residues 1-10 |
| **Complex Multi-Chain Selections** |
| `'A 1-50,75-100,150 B 25-75 C 200-250'` | Mixed ranges and specific residues across chains |

###### **Atom ID Selections (`'atom-id'` mode)**

| Selection String | Description |
|------------------|-------------|
| `'1,5,10'` | Atoms with IDs 1, 5, and 10 |
| `'1-10'` | Atoms with IDs 1 through 10 |
| `'1-10,15-20'` | Atoms 1-10 and 15-20 |
| `'1,5-10,15'` | Mixed specific IDs and ranges |

###### **Element Selections (`'element-symbol'` mode)**

| Selection String | Description |
|------------------|-------------|
| `'C,N,O'` | Carbon, nitrogen, and oxygen atoms |
| `'C'` | All carbon atoms |
| `'6,7,8'` | Elements by atomic number (C, N, O) |
| `'6-8'` | Elements with atomic numbers 6-8 |

##### 2. External Language Support

Mol* includes transpilers for popular molecular visualization languages:

###### **PyMOL Syntax Support**

Mol* supports PyMOL selection syntax through `compileIdListSelection(selectionString, 'pymol')`:

| PyMOL Selection | Description |
|------------------|-------------|
| **Basic Patterns** |
| `'chain A'` | All atoms in chain A |
| `'resi 10-20'` | Residues 10 through 20 |
| `'name CA'` | All CA atoms |
| `'element C'` | All carbon atoms |
| **Range Extensions** |
| `'resi 10-20+25+30-35'` | Residues 10-20, plus 25, plus 30-35 |
| `'element O+N+C'` | Oxygen, nitrogen, and carbon atoms |
| **Logical Operators** |
| `'chain A and resi 10-20'` | Chain A residues 10-20 |
| `'name CA or name CB'` | CA or CB atoms |
| `'not chain A'` | Everything except chain A |
| **Secondary Structure** |
| `'ss H'` | Helical regions |
| `'ss S'` | Beta strand regions |
| `'ss L'` | Loop regions |
| `'ss H+S'` | Helices and strands |
| **Slash Notation** |
| `'/object/segi/chain/resi/name'` | PyMOL object hierarchy selection |
| **Distance Selections** |
| `'around 5.0 and chain A'` | Atoms within 5Å of chain A |
| `'neighbor chain A'` | Atoms bonded to chain A |

###### **VMD Syntax Support**

VMD selection language through `compileIdListSelection(selectionString, 'vmd')`:

| VMD Selection | Description |
|---------------|-------------|
| **Basic Properties** |
| `'name CA'` | Atoms named CA |
| `'resname ALA'` | Alanine residues |
| `'chain A'` | Chain A |
| `'residue 10'` | Residue number 10 |
| `'element N'` | Nitrogen atoms |
| `'index 5'` | Atom with index 5 |
| **Logical Operations** |
| `'name CA and chain A'` | CA atoms in chain A |
| `'resname ALA or resname GLY'` | Alanine or glycine residues |
| `'not water'` | Everything except water |
| **Spatial Selections** |
| `'within 5 of name FE'` | Atoms within 5Å of iron atoms |
| `'exwithin 5 of chain A'` | Exclusive within (not including chain A) |
| **Property Matching** |
| `'same resid as name FE'` | Same residue ID as iron atoms |
| `'same chain as index 100'` | Same chain as atom 100 |
| **Advanced Properties** |
| `'numbonds 4'` | Atoms with 4 bonds |
| `'occupancy > 0.8'` | High occupancy atoms |
| `'beta > 50'` | High B-factor atoms |

###### **Jmol Syntax Support**

Basic Jmol selection syntax through `compileIdListSelection(selectionString, 'jmol')`:

| Jmol Selection | Description |
|----------------|-------------|
| `'_A'` | Chain A |
| `'10-20'` | Residues 10-20 |
| `'ALA'` | Alanine residues |
| `'*.CA'` | All CA atoms |
| `'carbon'` | All carbon atoms |

##### 3. Usage Examples

```typescript
import { compileIdListSelection } from 'molstar/lib/mol-script/util/id-list'

// ID List selections with different types
const authResidues = compileIdListSelection('A 10-50,75 B 100-150', 'auth');
const labelResidues = compileIdListSelection('A 10-50,75 B 100-150', 'label');
const atomIds = compileIdListSelection('1-100,150,200-250', 'atom-id');
const elements = compileIdListSelection('C,N,O', 'element-symbol');

// PyMOL syntax
const pymolSel = compileIdListSelection('chain A and resi 10-20 and name CA', 'pymol');

// VMD syntax  
const vmdSel = compileIdListSelection('name CA and within 5 of resname FE', 'vmd');

// Jmol syntax
const jmolSel = compileIdListSelection('_A and 10-20 and *.CA', 'jmol');

// Apply selections
plugin.managers.structure.selection.fromCompiledQuery('set', authResidues);
plugin.managers.structure.selection.fromCompiledQuery('add', pymolSel);
```

##### 4. Advanced Features

**Insertion Code Handling:**
- Format: `residue:code` (e.g., `'A 100:A,100:B'`)
- Ranges: `'A 100:A-100:Z'` (all insertion codes from A to Z)

**Negative Residue Numbers:**
- Single: `'A -5'`
- Range: `'A -10--1'` (note double dash for negative ranges)
- Mixed: `'A -5,1-10,20'`

**Multi-Language Mixing:**
While each call to `compileIdListSelection` uses one syntax, you can combine selections:
```typescript
// Combine different selection types
const basic = compileIdListSelection('A 10-50', 'auth');
const pymol = compileIdListSelection('chain B and ss H', 'pymol');

plugin.managers.structure.selection.fromCompiledQuery('set', basic);
plugin.managers.structure.selection.fromCompiledQuery('add', pymol);
```

**Error Handling:**
The parser includes validation and will throw errors for invalid syntax:
- Invalid residue ranges
- Malformed insertion codes  
- Unrecognized properties or operators
- Syntax errors in complex expressions

This comprehensive selection system makes Mol* compatible with selection syntax from major molecular visualization tools while providing its own powerful native capabilities.

## Selection Queries

Another way to create a selection is via a `SelectionQuery` object. This is a more programmatic way to create a selection using the concept of `Expression` - an intermediate representation between a Molscript statement and a selection query.

The primary generator is `atomGroups` which supports hierarchical selection tests and various grouping options:

- **entity-test**: Filter entities (distinct molecular components like protein chains, ligands, water)
- **chain-test**: Filter chains
- **residue-test**: Filter residues
- **atom-test**: Filter individual atoms
- **group-by**: Property to group atoms into sets

#### What is an Entity?

An **entity** in Mol* represents a distinct molecular component within a macromolecular structure, following the mmCIF standard. Entities are organizational units that group atoms and residues belonging to the same molecular component.

**Entity Types:**
- `polymer` - Macromolecular chains (proteins, nucleic acids)
- `non-polymer` - Small molecules, ligands  
- `water` - Water molecules
- `branched` - Branched molecules (carbohydrates)
- `macrolide` - Large ring compounds
- `unknown` - Type not determined

**Entity Subtypes:**
- `polypeptide(L)` - L-amino acid protein
- `polypeptide(D)` - D-amino acid protein
- `polydeoxyribonucleotide` - DNA
- `polyribonucleotide` - RNA
- `polydeoxyribonucleotide/polyribonucleotide hybrid` - DNA/RNA hybrid
- `cyclic-pseudo-peptide` - Cyclic peptides
- `peptide nucleic acid` - PNA
- `oligosaccharide` - Carbohydrates
- `ion` - Ionic species
- `lipid` - Lipid molecules
- `peptide-like` - Peptide-like molecules
- `other` - Other types

### Basic Examples

#### Select Specific Chains

```typescript
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { StructureSelectionQuery } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';

export function select_chains() {
  // Select chains A and B
  const chainSelection = MS.struct.generator.atomGroups({
    'chain-test': MS.core.set.has([
      MS.set(['A', 'B']), 
      MS.struct.atomProperty.macromolecular.auth_asym_id()
    ])
  });
  
  const query = StructureSelectionQuery('chains_A_B', chainSelection);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### What does `fromSelectionQuery` do?

The `fromSelectionQuery` method applies a `StructureSelectionQuery` to all applicable structures in the current context and updates the visual selection. 

**Purpose:** 
- Executes the provided query as an asynchronous task
- Applies the query to all structures in the scene
- Converts query results to loci (regions of interest)
- Updates the visual selection with the specified modifier

**Parameters:**
- `modifier`: Selection operation - `'set'` (replace), `'add'` (union), `'remove'` (subtract), `'intersect'`
- `query`: The StructureSelectionQuery to execute
- `applyGranularity`: Whether to apply selection granularity settings (optional, default: true)

#### Selection Granularity Options

The `applyGranularity` parameter controls whether the selection is expanded beyond the exact atoms that match the query. When `true`, selections are expanded according to the current granularity level:

- **`'element'`** - Exact atoms/coarse elements (no expansion)
- **`'residue'`** - Extends to whole residues containing matched atoms
- **`'chain'`** - Extends to whole chains containing matched atoms  
- **`'entity'`** - Extends to whole entities containing matched atoms
- **`'model'`** - Extends to whole models containing matched atoms
- **`'operator'`** - Extends to whole symmetry operators containing matched atoms
- **`'structure'`** - Extends to entire structures containing matched atoms
- **`'elementInstances'`** - Extends to all symmetry instances of matched atoms
- **`'residueInstances'`** - Extends to all symmetry instances of whole residues
- **`'chainInstances'`** - Extends to all symmetry instances of whole chains

**Example:**
```typescript
// Select CA atoms - with granularity 'residue', entire residues are selected
const query = StructureSelectionQuery('CA_atoms', MS.struct.generator.atomGroups({
  'atom-test': MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_atom_id(), 'CA'])
}));

// With applyGranularity = true (default), selection expands to entire residues
plugin.managers.structure.selection.fromSelectionQuery('set', query, true);

// With applyGranularity = false, selection stays at CA atoms only  
plugin.managers.structure.selection.fromSelectionQuery('set', query, false);

```typescript
```

#### Select Specific Residues

```typescript
export function select_residues() {
  // Select residues 10-50 in any chain
  const residueSelection = MS.struct.generator.atomGroups({
    'residue-test': MS.core.rel.inRange([
      MS.struct.atomProperty.macromolecular.label_seq_id(), 
      10, 50
    ])
  });
  
  const query = StructureSelectionQuery('residues_10_50', residueSelection);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### Select Specific Atoms

```typescript
export function select_atoms() {
  // Select only CA atoms
  const atomSelection = MS.struct.generator.atomGroups({
    'atom-test': MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.label_atom_id(), 
      'CA'
    ])
  });
  
  const query = StructureSelectionQuery('CA_atoms', atomSelection);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

### Grouping Examples

When you create grouped selections, you can iterate through each group and apply different operations to them - such as different colors, representations, or highlighting. Unlike basic selections that return all atoms as a single unit, grouped selections return multiple structures that you can process independently.

**What you can do with grouped selections:**
- Apply different colors to each group (e.g., color each chain differently)
- Use different representations for each group (e.g., cartoon for helices, surface for loops)
- Apply different themes or visual properties to each structural unit
- Process each group separately for analysis or highlighting
- Focus or highlight individual groups independently

**Basic workflow:**
1. Create a grouped selection using `group-by`
2. Iterate through each group using `StructureSelection.forEach`
3. Convert each group to `Loci` using `StructureSelection.toLociWithCurrentUnits`
4. Apply visual operations (coloring, representation, etc.) to each group's Loci

#### Group by Chain

```typescript
export function select_by_chain() {
  // Select all atoms but group them by chain
  const chainGrouping = MS.struct.generator.atomGroups({
    'group-by': MS.struct.atomProperty.macromolecular.chainKey()
  });
  
  const query = StructureSelectionQuery('grouped_by_chain', chainGrouping);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### Group by Residue

```typescript
export function select_by_residue() {
  // Select atoms grouped by residue
  const residueGrouping = MS.struct.generator.atomGroups({
    'group-by': MS.struct.atomProperty.macromolecular.residueKey()
  });
  
  const query = StructureSelectionQuery('grouped_by_residue', residueGrouping);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### Group by Element

```typescript
export function select_by_element() {
  // Group atoms by chemical element
  const elementGrouping = MS.struct.generator.atomGroups({
    'group-by': MS.struct.atomProperty.core.elementSymbol()
  });
  
  const query = StructureSelectionQuery('grouped_by_element', elementGrouping);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### Group by Secondary Structure

```typescript
export function select_by_secondary_structure() {
  // Group atoms by secondary structure
  const ssGrouping = MS.struct.generator.atomGroups({
    'group-by': MS.struct.atomProperty.macromolecular.secondaryStructureKey()
  });
  
  const query = StructureSelectionQuery('grouped_by_ss', ssGrouping);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### Processing Grouped Selections - Practical Example

```typescript
import { StructureSelection, QueryContext } from 'molstar/lib/mol-model/structure';

export function color_chains_differently() {
  // 1. Create grouped selection by chain
  const chainGrouping = MS.struct.generator.atomGroups({
    'group-by': MS.struct.atomProperty.macromolecular.chainKey()
  });
  
  // 2. Execute the query to get grouped selection
  const structure = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
  if (!structure) return;
  
  const ctx = new QueryContext(structure);
  const groupedSelection = chainGrouping(ctx);
  
  // Why are lines 290-294 needed?
  // Line 290: Gets the current molecular structure from the plugin's hierarchy
  // Line 291: Safety check to prevent errors if no structure is loaded
  // Line 293: Creates a QueryContext - the execution environment for selection queries
  // Line 294: Executes the grouping query to get the actual grouped selection results
  // This pattern is necessary because queries need a structure context to operate on
  
  // 3. Define colors for each chain
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]; // Red, Green, Blue, Yellow, Magenta
  
  // 4. Iterate through each group (chain) and apply different colors
  let groupIndex = 0;
  StructureSelection.forEach(groupedSelection, (chainStructure, index) => {
    // Convert this group to Loci
    const chainLoci = StructureSelection.toLociWithCurrentUnits(
      StructureSelection.Singletons(structure, chainStructure)
    );
    
    // Apply different color to this chain
    const color = colors[groupIndex % colors.length];
    plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: chainLoci });
    
    // You could also apply different representations, themes, etc. here
    // plugin.managers.structure.component.setColor(chainLoci, color);
    
    groupIndex++;
  });
}
```

### Complex Multi-Level Selections

#### Select Multiple Chain/Residue Ranges (Enhanced)

```typescript
export function select_multiple() {
  // Original example enhanced with more grouping options
  const args = [['A', 10, 15], ['F', 10, 15]];
  const groups: Expression[] = [];
  
  for (const chain of args) {
    groups.push(MS.struct.generator.atomGroups({
      'chain-test': MS.core.rel.eq([
        MS.struct.atomProperty.macromolecular.auth_asym_id(), 
        chain[0]
      ]),
      'residue-test': MS.core.rel.inRange([
        MS.struct.atomProperty.macromolecular.label_seq_id(), 
        chain[1], chain[2]
      ]),
      'group-by': MS.struct.atomProperty.macromolecular.residueKey()
    }));
  }
  
  const query = StructureSelectionQuery(
    'residue_range_10_15_in_A_and_F', 
    MS.struct.combinator.merge(groups)
  );
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### Select Specific Residue Types

```typescript
export function select_amino_acids() {
  // Select specific amino acid types (ARG, LYS, HIS - positively charged)
  const aminoAcids = MS.struct.generator.atomGroups({
    'residue-test': MS.core.set.has([
      MS.set(['ARG', 'LYS', 'HIS']),
      MS.struct.atomProperty.macromolecular.label_comp_id()
    ]),
    'group-by': MS.struct.atomProperty.macromolecular.residueKey()
  });
  
  const query = StructureSelectionQuery('positive_residues', aminoAcids);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### Select by Entity Type

```typescript
export function select_by_entity_type() {
  // Select only protein entities
  const proteinEntities = MS.struct.generator.atomGroups({
    'entity-test': MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.entityType(), 
      'polymer'
    ]),
    'chain-test': MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.entitySubtype(), 
      'polypeptide(L)'
    ]),
    'group-by': MS.struct.atomProperty.macromolecular.entityKey()
  });
  
  const query = StructureSelectionQuery('protein_entities', proteinEntities);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### Select Ligands and Binding Sites

```typescript
export function select_ligands_and_binding_site() {
  // First select non-polymer entities (ligands)
  const ligands = MS.struct.generator.atomGroups({
    'entity-test': MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.entityType(), 
      'non-polymer'
    ])
  });
  
  // Then select residues within 5Å of ligands
  const bindingSite = MS.struct.modifier.includeSurroundings({
    0: ligands,
    radius: 5,
    'as-whole-residues': true
  });
  
  const query = StructureSelectionQuery('ligands_and_binding_site', bindingSite);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

#### Select by B-factor Range

```typescript
export function select_by_bfactor() {
  // Select atoms with high B-factors (> 50)
  const highBFactor = MS.struct.generator.atomGroups({
    'atom-test': MS.core.rel.gr([
      MS.struct.atomProperty.macromolecular.B_iso_or_equiv(), 
      50
    ]),
    'group-by': MS.struct.atomProperty.macromolecular.residueKey()
  });
  
  const query = StructureSelectionQuery('high_bfactor', highBFactor);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

### Advanced Grouping Properties

```typescript
export function demonstrate_grouping_properties() {
  // Available grouping properties:
  
  // Core properties
  const byAtom = MS.struct.atomProperty.core.atomKey();           // Each atom individually
  const byElement = MS.struct.atomProperty.core.elementSymbol();  // Group by element (C, N, O, etc.)
  const byModel = MS.struct.atomProperty.core.modelIndex();       // Group by model (multi-model structures)
  
  // Macromolecular structural properties
  const byResidue = MS.struct.atomProperty.macromolecular.residueKey();     // Group by residue
  const byChain = MS.struct.atomProperty.macromolecular.chainKey();         // Group by chain
  const byEntity = MS.struct.atomProperty.macromolecular.entityKey();       // Group by entity
  const bySecStruct = MS.struct.atomProperty.macromolecular.secondaryStructureKey(); // Group by secondary structure
  const byConnectedComponent = MS.struct.atomProperty.macromolecular.connectedComponentKey(); // Group by connected components
  const byOperator = MS.struct.atomProperty.core.operatorKey();             // Group by symmetry operators
  
  // Chemical properties
  const byCompId = MS.struct.atomProperty.macromolecular.label_comp_id();   // Group by component identifier
  const byAuthCompId = MS.struct.atomProperty.macromolecular.auth_comp_id(); // Group by author component ID
  const byEntityType = MS.struct.atomProperty.macromolecular.entityType();  // Group by entity type
  const byEntitySubtype = MS.struct.atomProperty.macromolecular.entitySubtype(); // Group by entity subtype
  const byChemCompType = MS.struct.atomProperty.macromolecular.chemCompType(); // Group by chemical component type
  
  // Coordinate properties
  const byAuthChain = MS.struct.atomProperty.macromolecular.auth_asym_id(); // Group by author chain ID
  const byLabelChain = MS.struct.atomProperty.macromolecular.label_asym_id(); // Group by label chain ID  
  const byAuthSeq = MS.struct.atomProperty.macromolecular.auth_seq_id();    // Group by author sequence number
  const byLabelSeq = MS.struct.atomProperty.macromolecular.label_seq_id();  // Group by label sequence number
  
  // Special properties
  const byIsHet = MS.struct.atomProperty.macromolecular.isHet();            // Group by HETATM vs ATOM
  const byIsModified = MS.struct.atomProperty.macromolecular.isModified();  // Group by modified residues
  const byIsNonStandard = MS.struct.atomProperty.macromolecular.isNonStandard(); // Group by non-standard residues
  const byObjectPrimitive = MS.struct.atomProperty.core.objectPrimitive();  // Group by representation type
  
  // Example: Group carbons by residue
  const carbonsByResidue = MS.struct.generator.atomGroups({
    'atom-test': MS.core.rel.eq([MS.struct.atomProperty.core.elementSymbol(), 'C']),
    'group-by': byResidue
  });
  
  const query = StructureSelectionQuery('carbons_by_residue', carbonsByResidue);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

Complex queries can be constructed by combining primitive queries at the level of [`chain-test`, `residue-test`, `entity-test`, etc] by combining them via logical connectives provided in the `MolscriptBuilder.core.rel` as above.

### atomGroups Generator Definition

The `atomGroups` generator is defined in `/mol-script/language/symbol-table/structure-query.ts` as:

```typescript
atomGroups: symbol(Arguments.Dictionary({
    'entity-test': Argument(Type.Bool, { 
        isOptional: true, 
        defaultValue: true, 
        description: 'Test for the 1st atom of every entity' 
    }),
    'chain-test': Argument(Type.Bool, { 
        isOptional: true, 
        defaultValue: true, 
        description: 'Test for the 1st atom of every chain' 
    }),
    'residue-test': Argument(Type.Bool, { 
        isOptional: true, 
        defaultValue: true, 
        description: 'Test for the 1st atom every residue' 
    }),
    'atom-test': Argument(Type.Bool, { 
        isOptional: true, 
        defaultValue: true 
    }),
    'group-by': Argument(Type.Any, { 
        isOptional: true, 
        defaultValue: `atom-key`, 
        description: 'Group atoms to sets based on this property. Default: each atom has its own set' 
    }),
}), Types.ElementSelectionQuery, 'Return all atoms for which the tests are satisfied, grouped into sets.')
```

This defines the hierarchical filtering system where each test operates on the first atom of its respective level (entity, chain, residue) to determine inclusion, with customizable grouping strategies.

### Built-in Selection Query Examples

From `/mol-plugin-state/helpers/structure-selection-query.ts`, here are some practical built-in queries:

#### Polymer Selection
```typescript
const polymer = StructureSelectionQuery('Polymer', MS.struct.modifier.union([
    MS.struct.generator.atomGroups({
        'entity-test': MS.core.logic.and([
            MS.core.rel.eq([MS.ammp('entityType'), 'polymer']),
            MS.core.str.match([
                MS.re('(polypeptide|cyclic-pseudo-peptide|peptide-like|nucleotide|peptide nucleic acid)', 'i'),
                MS.ammp('entitySubtype')
            ])
        ])
    })
]), { category: StructureSelectionCategory.Type });
```

#### Protein Entity Test
```typescript
const _proteinEntityTest = MS.core.logic.and([
    MS.core.rel.eq([MS.ammp('entityType'), 'polymer']),
    MS.core.str.match([
        MS.re('(polypeptide|cyclic-pseudo-peptide|peptide-like)', 'i'),
        MS.ammp('entitySubtype')
    ])
]);

const protein = StructureSelectionQuery('Protein', MS.struct.generator.atomGroups({
    'entity-test': _proteinEntityTest
}), { category: StructureSelectionCategory.Type });
```

#### Ligand Selection
```typescript
const ligand = StructureSelectionQuery('Ligand', MS.struct.modifier.union([
    MS.struct.generator.atomGroups({
        'entity-test': MS.core.logic.and([
            MS.core.rel.eq([MS.ammp('entityType'), 'non-polymer']),
            MS.core.logic.not([
                MS.core.set.has([
                    MS.set(...SetUtils.toArray(WaterNames)), 
                    MS.ammp('auth_comp_id')
                ])
            ])
        ])
    })
]), { category: StructureSelectionCategory.Type });
```

#### Nucleic Acid Selection
```typescript
const nucleic = StructureSelectionQuery('Nucleic', MS.struct.generator.atomGroups({
    'entity-test': MS.core.logic.and([
        MS.core.rel.eq([MS.ammp('entityType'), 'polymer']),
        MS.core.str.match([
            MS.re('(nucleotide)', 'i'),
            MS.ammp('entitySubtype')
        ])
    ])
}), { category: StructureSelectionCategory.Type });
```

#### Water Selection
```typescript
const water = StructureSelectionQuery('Water', MS.struct.generator.atomGroups({
    'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'water'])
}), { category: StructureSelectionCategory.Type });
```

#### Ion Selection
```typescript
const ion = StructureSelectionQuery('Ion', MS.struct.generator.atomGroups({
    'entity-test': MS.core.logic.and([
        MS.core.rel.eq([MS.ammp('entityType'), 'non-polymer']),
        MS.core.rel.eq([MS.ammp('entitySubtype'), 'ion'])
    ])
}), { category: StructureSelectionCategory.Type });
```

#### Secondary Structure Selections
```typescript
const helix = StructureSelectionQuery('Helix', MS.struct.generator.atomGroups({
    'entity-test': _proteinEntityTest,
    'residue-test': MS.core.flags.hasAny([
        MS.ammp('secondaryStructureFlags'),
        MS.core.type.bitflags([SecondaryStructureType.Flag.Helix])
    ])
}), { category: StructureSelectionCategory.Type });

const beta = StructureSelectionQuery('Beta Strand', MS.struct.generator.atomGroups({
    'entity-test': _proteinEntityTest,
    'residue-test': MS.core.flags.hasAny([
        MS.ammp('secondaryStructureFlags'),
        MS.core.type.bitflags([SecondaryStructureType.Flag.Beta])
    ])
}), { category: StructureSelectionCategory.Type });
```

These examples demonstrate the power and flexibility of the selection system, showing how complex biological concepts (proteins, ligands, secondary structures) are encoded as logical combinations of entity, chain, residue, and atom tests.

## MS.core Operators Reference

The following operators and methods are available in the `MS.core` namespace for building complex selection queries:

### MolScript Builder Shorthand Functions

The MolScript Builder provides several shorthand functions to make selection queries more concise and readable:

| Function | Full Name | Purpose | Example | Equivalent Full Path |
|----------|-----------|---------|---------|---------------------|
| **Core Atom Properties** |
| `MS.acp('elementSymbol')` | Atom Core Property | Chemical element symbol | `MS.acp('elementSymbol')` | `MS.struct.atomProperty.core.elementSymbol()` |
| `MS.acp('atomKey')` | Atom Core Property | Unique atom identifier | `MS.acp('atomKey')` | `MS.struct.atomProperty.core.atomKey()` |
| `MS.acp('x')` | Atom Core Property | X coordinate | `MS.acp('x')` | `MS.struct.atomProperty.core.x()` |
| `MS.acp('y')` | Atom Core Property | Y coordinate | `MS.acp('y')` | `MS.struct.atomProperty.core.y()` |
| `MS.acp('z')` | Atom Core Property | Z coordinate | `MS.acp('z')` | `MS.struct.atomProperty.core.z()` |
| `MS.acp('vdw')` | Atom Core Property | Van der Waals radius | `MS.acp('vdw')` | `MS.struct.atomProperty.core.vdw()` |
| `MS.acp('mass')` | Atom Core Property | Atomic mass | `MS.acp('mass')` | `MS.struct.atomProperty.core.mass()` |
| `MS.acp('atomicNumber')` | Atom Core Property | Atomic number | `MS.acp('atomicNumber')` | `MS.struct.atomProperty.core.atomicNumber()` |
| `MS.acp('bondCount')` | Atom Core Property | Number of bonds | `MS.acp('bondCount')` | `MS.struct.atomProperty.core.bondCount()` |
| `MS.acp('modelIndex')` | Atom Core Property | Model number | `MS.acp('modelIndex')` | `MS.struct.atomProperty.core.modelIndex()` |
| `MS.acp('operatorKey')` | Atom Core Property | Symmetry operator key | `MS.acp('operatorKey')` | `MS.struct.atomProperty.core.operatorKey()` |
| **Macromolecular Properties** |
| `MS.ammp('residueKey')` | Atom Macromolecular Property | Unique residue identifier | `MS.ammp('residueKey')` | `MS.struct.atomProperty.macromolecular.residueKey()` |
| `MS.ammp('chainKey')` | Atom Macromolecular Property | Unique chain identifier | `MS.ammp('chainKey')` | `MS.struct.atomProperty.macromolecular.chainKey()` |
| `MS.ammp('entityKey')` | Atom Macromolecular Property | Unique entity identifier | `MS.ammp('entityKey')` | `MS.struct.atomProperty.macromolecular.entityKey()` |
| `MS.ammp('label_atom_id')` | Atom Macromolecular Property | Atom name (PDB standard) | `MS.ammp('label_atom_id')` | `MS.struct.atomProperty.macromolecular.label_atom_id()` |
| `MS.ammp('auth_atom_id')` | Atom Macromolecular Property | Author atom name | `MS.ammp('auth_atom_id')` | `MS.struct.atomProperty.macromolecular.auth_atom_id()` |
| `MS.ammp('label_comp_id')` | Atom Macromolecular Property | Component/residue name | `MS.ammp('label_comp_id')` | `MS.struct.atomProperty.macromolecular.label_comp_id()` |
| `MS.ammp('auth_comp_id')` | Atom Macromolecular Property | Author component name | `MS.ammp('auth_comp_id')` | `MS.struct.atomProperty.macromolecular.auth_comp_id()` |
| `MS.ammp('label_asym_id')` | Atom Macromolecular Property | Asymmetric unit ID | `MS.ammp('label_asym_id')` | `MS.struct.atomProperty.macromolecular.label_asym_id()` |
| `MS.ammp('auth_asym_id')` | Atom Macromolecular Property | Author chain ID | `MS.ammp('auth_asym_id')` | `MS.struct.atomProperty.macromolecular.auth_asym_id()` |
| `MS.ammp('label_seq_id')` | Atom Macromolecular Property | Sequence number | `MS.ammp('label_seq_id')` | `MS.struct.atomProperty.macromolecular.label_seq_id()` |
| `MS.ammp('auth_seq_id')` | Atom Macromolecular Property | Author sequence number | `MS.ammp('auth_seq_id')` | `MS.struct.atomProperty.macromolecular.auth_seq_id()` |
| `MS.ammp('entityType')` | Atom Macromolecular Property | Entity type (polymer, etc.) | `MS.ammp('entityType')` | `MS.struct.atomProperty.macromolecular.entityType()` |
| `MS.ammp('entitySubtype')` | Atom Macromolecular Property | Entity subtype | `MS.ammp('entitySubtype')` | `MS.struct.atomProperty.macromolecular.entitySubtype()` |
| `MS.ammp('occupancy')` | Atom Macromolecular Property | Occupancy factor | `MS.ammp('occupancy')` | `MS.struct.atomProperty.macromolecular.occupancy()` |
| `MS.ammp('B_iso_or_equiv')` | Atom Macromolecular Property | B-factor (temperature factor) | `MS.ammp('B_iso_or_equiv')` | `MS.struct.atomProperty.macromolecular.B_iso_or_equiv()` |
| `MS.ammp('secondaryStructureKey')` | Atom Macromolecular Property | Secondary structure identifier | `MS.ammp('secondaryStructureKey')` | `MS.struct.atomProperty.macromolecular.secondaryStructureKey()` |
| `MS.ammp('secondaryStructureFlags')` | Atom Macromolecular Property | Secondary structure flags | `MS.ammp('secondaryStructureFlags')` | `MS.struct.atomProperty.macromolecular.secondaryStructureFlags()` |
| `MS.ammp('isHet')` | Atom Macromolecular Property | HETATM vs ATOM record | `MS.ammp('isHet')` | `MS.struct.atomProperty.macromolecular.isHet()` |
| `MS.ammp('isModified')` | Atom Macromolecular Property | Modified residue flag | `MS.ammp('isModified')` | `MS.struct.atomProperty.macromolecular.isModified()` |
| `MS.ammp('isNonStandard')` | Atom Macromolecular Property | Non-standard residue flag | `MS.ammp('isNonStandard')` | `MS.struct.atomProperty.macromolecular.isNonStandard()` |
| `MS.ammp('chemCompType')` | Atom Macromolecular Property | Chemical component type | `MS.ammp('chemCompType')` | `MS.struct.atomProperty.macromolecular.chemCompType()` |
| **Topology Properties** |
| `MS.atp('connectedComponentKey')` | Atom Topology Property | Connected component ID | `MS.atp('connectedComponentKey')` | `MS.struct.atomProperty.topology.connectedComponentKey()` |
| **Utility Functions** |
| `MS.atomName('CA')` | Atom Name Constructor | Create atom name expression | `MS.atomName('CA')` | Direct constructor for atom names |
| `MS.es('C')` | Element Symbol Constructor | Create element symbol expression | `MS.es('C')` | Direct constructor for element symbols |
| `MS.list(...)` | List Constructor | Create list expression | `MS.list(item1, item2)` | Direct constructor for lists |
| `MS.set(...)` | Set Constructor | Create set expression | `MS.set('ARG', 'LYS')` | Direct constructor for sets |
| `MS.re('pattern')` | RegEx Constructor | Create regex expression | `MS.re('polypeptide', 'i')` | Direct constructor for regex patterns |
| `MS.fn(expr)` | Function Constructor | Create function expression | `MS.fn(expression)` | Direct constructor for functions |

These shorthand functions make selection queries much more readable and concise, avoiding the need to write the full nested property paths repeatedly.

### MS.core.rel (Relational Operators)

| Operator | Description | Example | Selects |
|----------|-------------|---------|---------|
| `MS.core.rel.eq([a, b])` | Equals | `MS.core.rel.eq([MS.ammp('auth_asym_id'), 'A'])` | Atoms in chain A |
| `MS.core.rel.neq([a, b])` | Not equals | `MS.core.rel.neq([MS.ammp('entityType'), 'water'])` | All non-water atoms |
| `MS.core.rel.lt([a, b])` | Less than | `MS.core.rel.lt([MS.ammp('label_seq_id'), 50])` | Residues with sequence number < 50 |
| `MS.core.rel.lte([a, b])` | Less than or equal | `MS.core.rel.lte([MS.ammp('B_iso_or_equiv'), 30])` | Atoms with B-factor ≤ 30 |
| `MS.core.rel.gr([a, b])` | Greater than | `MS.core.rel.gr([MS.ammp('label_seq_id'), 10])` | Residues with sequence number > 10 |
| `MS.core.rel.gre([a, b])` | Greater than or equal | `MS.core.rel.gre([MS.ammp('occupancy'), 0.5])` | Atoms with occupancy ≥ 0.5 |
| `MS.core.rel.inRange([value, min, max])` | In range (min ≤ value ≤ max) | `MS.core.rel.inRange([MS.ammp('label_seq_id'), 10, 50])` | Residues 10-50 |

### MS.core.logic (Logical Operators)

| Operator | Description | Example | Selects |
|----------|-------------|---------|---------|
| `MS.core.logic.not([condition])` | Logical NOT | `MS.core.logic.not([MS.core.rel.eq([MS.ammp('entityType'), 'water'])])` | Everything except water |
| `MS.core.logic.and([cond1, cond2, ...])` | Logical AND | `MS.core.logic.and([chainTest, residueTest])` | Items matching all conditions |
| `MS.core.logic.or([cond1, cond2, ...])` | Logical OR | `MS.core.logic.or([helixTest, sheetTest])` | Items in helices or sheets |

### MS.core.set (Set Operations)

| Operator | Description | Example | Selects |
|----------|-------------|---------|---------|
| `MS.core.set.has([set, value])` | Check if set contains value | `MS.core.set.has([MS.set(['ARG', 'LYS', 'HIS']), MS.ammp('label_comp_id')])` | Basic amino acid residues |
| `MS.core.set.isSubset([set1, set2])` | Check if set1 ⊆ set2 | `MS.core.set.isSubset([selection1, selection2])` | Items where first selection is subset of second |

### MS.core.str (String Operations)

| Operator | Description | Example | Selects |
|----------|-------------|---------|---------|
| `MS.core.str.concat([str1, str2, ...])` | Concatenate strings | `MS.core.str.concat([MS.ammp('auth_asym_id'), '_', MS.ammp('label_seq_id')])` | Creates combined chain_residue identifiers |
| `MS.core.str.match([regex, string])` | Test regex match | `MS.core.str.match([MS.re('polypeptide', 'i'), MS.ammp('entitySubtype')])` | Protein entities (polypeptide subtypes) |

### MS.core.type (Type Operations)

| Operator | Description | Example | Selects |
|----------|-------------|---------|---------|
| `MS.core.type.bool([value])` | Convert to boolean | `MS.core.type.bool([condition])` | Converts value to true/false for logic |
| `MS.core.type.num([value])` | Convert to number | `MS.core.type.num([stringValue])` | Converts strings to numbers for math |
| `MS.core.type.str([value])` | Convert to string | `MS.core.type.str([numericValue])` | Converts numbers to strings for text ops |
| `MS.core.type.regex([pattern, flags])` | Create regex | `MS.core.type.regex(['polypeptide', 'i'])` | Creates pattern for protein matching |
| `MS.core.type.list([items...])` | Create list | `MS.core.type.list([item1, item2, item3])` | Creates ordered collection of items |
| `MS.core.type.set([items...])` | Create set | `MS.core.type.set(['ARG', 'LYS', 'HIS'])` | Creates set for membership testing |
| `MS.core.type.bitflags([number])` | Interpret as bitflags | `MS.core.type.bitflags([SecondaryStructureType.Flag.Helix])` | Creates flags for helix detection |

### MS.core.flags (Flag Operations)

| Operator | Description | Example | Selects |
|----------|-------------|---------|---------|
| `MS.core.flags.hasAny([flags1, flags2])` | Check if any flags match | `MS.core.flags.hasAny([MS.ammp('secondaryStructureFlags'), helixFlags])` | Residues with any helix flags |
| `MS.core.flags.hasAll([flags1, flags2])` | Check if all flags match | `MS.core.flags.hasAll([MS.ammp('secondaryStructureFlags'), combinedFlags])` | Residues with all specified flags |

### MS.core.math (Mathematical Operations)

| Category | Operator | Description | Example | Used For |
|----------|----------|-------------|---------|----------|
| **Arithmetic** | `MS.core.math.add([nums...])` | Addition | `MS.core.math.add([MS.ammp('x'), offset])` | Coordinate calculations |
| | `MS.core.math.sub([nums...])` | Subtraction | `MS.core.math.sub([maxVal, MS.ammp('B_iso_or_equiv')])` | B-factor threshold calculations |
| | `MS.core.math.mult([nums...])` | Multiplication | `MS.core.math.mult([MS.ammp('occupancy'), 100])` | Converting occupancy to percentage |
| | `MS.core.math.div([a, b])` | Division | `MS.core.math.div([MS.ammp('B_iso_or_equiv'), 2])` | Normalizing B-factors |
| | `MS.core.math.pow([base, exp])` | Power | `MS.core.math.pow([MS.ammp('distance'), 2])` | Distance squared calculations |
| | `MS.core.math.mod([a, b])` | Modulo | `MS.core.math.mod([MS.ammp('label_seq_id'), 10])` | Every 10th residue selection |
| **Min/Max** | `MS.core.math.min([nums...])` | Minimum | `MS.core.math.min([MS.ammp('B_iso_or_equiv'), threshold])` | Capping B-factor values |
| | `MS.core.math.max([nums...])` | Maximum | `MS.core.math.max([MS.ammp('occupancy'), minOcc])` | Ensuring minimum occupancy |
| **Functions** | `MS.core.math.floor([n])` | Floor function | `MS.core.math.floor([MS.ammp('B_iso_or_equiv')])` | Rounding B-factors down |
| | `MS.core.math.ceil([n])` | Ceiling function | `MS.core.math.ceil([MS.ammp('distance')])` | Rounding distances up |
| | `MS.core.math.abs([n])` | Absolute value | `MS.core.math.abs([MS.ammp('charge')])` | Getting magnitude of charge |
| | `MS.core.math.sqrt([n])` | Square root | `MS.core.math.sqrt([MS.ammp('distanceSquared')])` | Converting distance squared to distance |

### MS.core.list (List Operations)

| Operator | Description | Example | Used For |
|----------|-------------|---------|----------|
| `MS.core.list.getAt([list, index])` | Get element at index | `MS.core.list.getAt([chainList, 0])` | Accessing first chain in list |
| `MS.core.list.equal([list1, list2])` | Check list equality | `MS.core.list.equal([selection1, selection2])` | Comparing selection lists |

### MS.core.ctrl (Control Flow)

| Operator | Description | Example | Used For |
|----------|-------------|---------|----------|
| `MS.core.ctrl.if([condition, ifTrue, ifFalse])` | Conditional expression | `MS.core.ctrl.if([isProtein, proteinColor, ligandColor])` | Conditional property assignment |
| `MS.core.ctrl.eval([function])` | Evaluate function | `MS.core.ctrl.eval([complexCalculation])` | Lazy evaluation of expressions |

### Complex Example Using Multiple Operators

```typescript
// Select basic amino acids (ARG, LYS, HIS) in helical regions with high B-factors
const complexQuery = MS.struct.generator.atomGroups({
  'entity-test': MS.core.logic.and([
    MS.core.rel.eq([MS.ammp('entityType'), 'polymer']),
    MS.core.str.match([
      MS.core.type.regex(['polypeptide', 'i']), 
      MS.ammp('entitySubtype')
    ])
  ]),
  'residue-test': MS.core.logic.and([
    MS.core.set.has([
      MS.core.type.set(['ARG', 'LYS', 'HIS']),
      MS.ammp('label_comp_id')
    ]),
    MS.core.flags.hasAny([
      MS.ammp('secondaryStructureFlags'),
      MS.core.type.bitflags([SecondaryStructureType.Flag.Helix])
    ])
  ]),
  'atom-test': MS.core.rel.gr([
    MS.ammp('B_iso_or_equiv'),
    MS.core.math.mult([2, 25])  // B-factor > 50
  ]),
  'group-by': MS.ammp('residueKey')
});
```

This comprehensive operator reference enables building sophisticated molecular selection queries that combine structural, chemical, mathematical, and logical criteria.


Furthermore, a query made this way can be converted to a `Loci` object which is important in many parts of the libary:
```typescript
// Select residue 124 of chain A and convert to Loci
const Q = MolScriptBuilder;
var sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
  'chain-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.auth_asym_id(), A]),
  'residue-test': Q.core.rel.eq([Q.struct.atomProperty.macromolecular.label_seq_id(), 124]),
}), objdata)

let loci = StructureSelection.toLociWithSourceUnits(sel);
```

## Query Functions

Instead of building expressions, query functions can be created directly, e.g.:

```ts
import { atoms } from 'mol-model/structure/query/queries/generators';

const query = atoms({
  residueTest: ctx => {
    const seqId = StructureProperties.residue.label_seq_id(ctx.element);
    return seqId > 10 && seqId < 25;
  },
});

const selection = query(new QueryContext(structure));
// ...
```

## Selection Schema

For simple selections, the `StructureElement.Schema` can be used to reference elements within a protein structure using mmCIF `atom_site` field names, e.g.:

```ts
const ala121: StructureElement.Schema = { label_asym_id: 'A', label_seq_id: 121 };
const residues: StructureElement.Schema = { 
  items: {
    auth_asym_id: ['A', 'B'],
    auth_seq_id: [10, 11],
  }
};

const loci = StructureElement.Loci.fromSchema(structure, residues);
```

Usually, a code editor such as VS Code will auto-suggest all the available field names.

## Helper Functions

Given an `Expression`, `QueryFn`, or `StructureElement.Schema` it is possible to use `fromExpression/Query/Schema` functions on `StructureElement.Loci` and `StructureElement.Bundle`.