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

Molscript is a language for addressing crystallographic structures and is a part of the Mol* library found at `https://github.com/molstar/molstar/tree/master/src/mol-script`. It can be used against the Molstar plugin as a query language and transpiled against multiple external molecular visualization libraries(see [here](https://github.com/molstar/molstar/tree/master/src/mol-script/transpilers)).

### Querying a structure for a specific chain and residue range (select residues with 12<res_id<200 of chain with auth_asym_id==A) :

```typescript
import { compileIdListSelection } from 'molstar/lib/mol-script/util/id-list'

const query = compileIdListSelection('A 12-200', 'auth');
window.molstar?.managers.structure.selection.fromCompiledQuery('add',query);
```

## Selection Queries

Another way to create a selection is via a `SelectionQuery` object. This is a more programmatic way to create a selection using the concept of `Expression` - an intermediate representation between a Molscript statement and a selection query.

The primary generator is `atomGroups` which supports hierarchical selection tests and various grouping options:

- **entity-test**: Filter entities  
- **chain-test**: Filter chains
- **residue-test**: Filter residues
- **atom-test**: Filter individual atoms
- **group-by**: Property to group atoms into sets

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
  
  // Macromolecular properties
  const byResidue = MS.struct.atomProperty.macromolecular.residueKey();     // Group by residue
  const byChain = MS.struct.atomProperty.macromolecular.chainKey();         // Group by chain
  const byEntity = MS.struct.atomProperty.macromolecular.entityKey();       // Group by entity
  const byCompId = MS.struct.atomProperty.macromolecular.label_comp_id();   // Group by residue name
  const byAuthChain = MS.struct.atomProperty.macromolecular.auth_asym_id(); // Group by author chain ID
  const bySecStruct = MS.struct.atomProperty.macromolecular.secondaryStructureKey(); // Group by secondary structure
  
  // Example: Group carbons by residue
  const carbonsByResidue = MS.struct.generator.atomGroups({
    'atom-test': MS.core.rel.eq([MS.struct.atomProperty.core.elementSymbol(), 'C']),
    'group-by': byResidue
  });
  
  const query = StructureSelectionQuery('carbons_by_residue', carbonsByResidue);
  plugin.managers.structure.selection.fromSelectionQuery('set', query);
}
```

Complex queries can be constructed by combining primitive queries at the level of [`chain-test`, `residue-test`, `entity-test`, etc] (https://github.com/molstar/molstar/blob/6edbae80db340134341631f669eec86543a0f1a8/src/mol-script/language/symbol-table/structure-query.ts#L88C4-L94C112) by combining them via logical connectives provided in the `MolscriptBuilder.core.rel` as above.

Inspect these examples to get a better feeling for this syntax: `https://github.com/molstar/molstar/blob/6edbae80db340134341631f669eec86543a0f1a8/src/mol-plugin-state/helpers/structure-selection-query.ts#L88-L580`


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