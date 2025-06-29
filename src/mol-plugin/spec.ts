/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { PartialCanvas3DProps } from '../mol-canvas3d/canvas3d';
import { AnimateAssemblyUnwind } from '../mol-plugin-state/animation/built-in/assembly-unwind';
import { AnimateCameraSpin } from '../mol-plugin-state/animation/built-in/camera-spin';
import { AnimateModelIndex } from '../mol-plugin-state/animation/built-in/model-index';
import { AnimateStateSnapshots } from '../mol-plugin-state/animation/built-in/state-snapshots';
import { PluginStateAnimation } from '../mol-plugin-state/animation/model';
import { DataFormatProvider } from '../mol-plugin-state/formats/provider';
import { StateAction, StateTransformer } from '../mol-state';
import { PluginBehaviors } from './behavior';
import { StructureFocusRepresentation } from './behavior/dynamic/selection/structure-focus-representation';
import { PluginConfigItem } from './config';
import { PluginLayoutStateProps } from './layout';
import { StateActions } from '../mol-plugin-state/actions';
import { AssignColorVolume } from '../mol-plugin-state/actions/volume';
import { StateTransforms } from '../mol-plugin-state/transforms';
import { BoxifyVolumeStreaming, CreateVolumeStreamingBehavior, InitVolumeStreaming } from '../mol-plugin/behavior/dynamic/volume-streaming/transformers';
import { AnimateStateInterpolation } from '../mol-plugin-state/animation/built-in/state-interpolation';
import { AnimateStructureSpin } from '../mol-plugin-state/animation/built-in/spin-structure';
import { AnimateCameraRock } from '../mol-plugin-state/animation/built-in/camera-rock';

export { PluginSpec };

/**
 * Configuration specification that defines the capabilities and behavior of a Mol* plugin instance.
 * 
 * The PluginSpec interface allows you to customize which features, behaviors, and data formats
 * are available in your plugin instance. This is essential for creating tailored molecular
 * visualization applications.
 * 
 * @example
 * ```typescript
 * const customSpec: PluginSpec = {
 *   behaviors: [
 *     PluginSpec.Behavior(PluginBehaviors.Representation.HighlightLoci),
 *     PluginSpec.Behavior(PluginBehaviors.Camera.FocusLoci)
 *   ],
 *   actions: [
 *     PluginSpec.Action(StateActions.Structure.DownloadStructure)
 *   ],
 *   canvas3d: {
 *     renderer: { backgroundColor: Color(0x000000) }
 *   }
 * };
 * ```
 * 
 * @public
 */
interface PluginSpec {
    /** Array of actions available in the plugin (data loading, structure operations, etc.) */
    actions?: PluginSpec.Action[],
    /** Array of behaviors that define plugin capabilities (selection, highlighting, camera controls, etc.) */
    behaviors: PluginSpec.Behavior[],
    /** Array of animation types supported by the plugin */
    animations?: PluginStateAnimation[],
    /** Custom data format providers for handling specialized file types */
    customFormats?: [string, DataFormatProvider][],
    /** 3D canvas configuration (renderer settings, camera, lighting, etc.) */
    canvas3d?: PartialCanvas3DProps,
    /** Layout configuration for the plugin interface */
    layout?: {
        /** Initial layout state for panels and components */
        initial?: Partial<PluginLayoutStateProps>,
    },
    /** Configuration items with their default values */
    config?: [PluginConfigItem, unknown][]
}

namespace PluginSpec {
    /**
     * Defines an action that can be performed within the plugin.
     * 
     * Actions represent operations like loading data, creating structures,
     * or applying transformations. They can have custom UI controls and
     * automatic update behavior.
     */
    export interface Action {
        /** The state action or transformer that defines the operation */
        action: StateAction | StateTransformer,
        /** Optional React component for custom parameter controls */
        customControl?: any,
        /** Whether the action should automatically update when dependencies change */
        autoUpdate?: boolean
    }

    /**
     * Creates an Action specification for use in plugin specs.
     * 
     * @param action - The state action or transformer to wrap
     * @param params - Optional parameters for the action
     * @param params.customControl - React component for custom UI controls
     * @param params.autoUpdate - Whether to automatically update on dependency changes
     * @returns Action specification object
     * 
     * @example
     * ```typescript
     * const downloadAction = PluginSpec.Action(
     *   StateActions.Structure.DownloadStructure,
     *   { autoUpdate: true }
     * );
     * ```
     */
    export function Action(action: StateAction | StateTransformer, params?: { customControl?: any /* constructible react component with <action.customControl /> */, autoUpdate?: boolean }): Action {
        return { action, customControl: params && params.customControl, autoUpdate: params && params.autoUpdate };
    }

    /**
     * Defines a behavior that provides ongoing functionality to the plugin.
     * 
     * Behaviors are long-running capabilities like selection management,
     * highlighting, camera controls, or custom property calculations.
     */
    export interface Behavior {
        /** The state transformer that implements the behavior */
        transformer: StateTransformer,
        /** Default parameters for the behavior */
        defaultParams?: any
    }

    /**
     * Creates a Behavior specification for use in plugin specs.
     * 
     * @param transformer - The state transformer that implements the behavior
     * @param defaultParams - Default parameters for the behavior
     * @returns Behavior specification object
     * 
     * @example
     * ```typescript
     * const highlightBehavior = PluginSpec.Behavior(
     *   PluginBehaviors.Representation.HighlightLoci,
     *   { color: Color(0xFF0000) }
     * );
     * ```
     */
    export function Behavior<T extends StateTransformer>(transformer: T, defaultParams: Partial<StateTransformer.Params<T>> = {}): Behavior {
        return { transformer, defaultParams };
    }
}

/**
 * Creates a default plugin specification with standard molecular visualization capabilities.
 * 
 * This function returns a comprehensive plugin specification that includes:
 * - Structure loading and parsing (PDB, mmCIF, etc.)
 * - Volume data support (CCP4, DSN6, etc.)
 * - Standard representations (cartoon, ball-and-stick, surface, etc.)
 * - Basic behaviors (selection, highlighting, camera controls)
 * - Built-in animations and measurements
 * 
 * @returns A complete PluginSpec with default molecular visualization features
 * 
 * @example
 * ```typescript
 * import { DefaultPluginSpec } from 'molstar/lib/mol-plugin/spec';
 * import { PluginContext } from 'molstar/lib/mol-plugin/context';
 * 
 * const ctx = new PluginContext(DefaultPluginSpec());
 * await ctx.init();
 * ```
 * 
 * @remarks
 * - Suitable for most molecular visualization applications
 * - Can be extended or modified for custom requirements
 * - Includes all standard file format support
 * - Provides complete interaction and representation capabilities
 * 
 * @public
 */
export const DefaultPluginSpec = (): PluginSpec => ({
    actions: [
        PluginSpec.Action(StateActions.Structure.DownloadStructure),
        PluginSpec.Action(StateActions.Volume.DownloadDensity),
        PluginSpec.Action(StateActions.DataFormat.DownloadFile),
        PluginSpec.Action(StateActions.DataFormat.OpenFiles),
        PluginSpec.Action(StateActions.Structure.LoadTrajectory),
        PluginSpec.Action(StateActions.Structure.EnableModelCustomProps),
        PluginSpec.Action(StateActions.Structure.EnableStructureCustomProps),

        // Volume streaming
        PluginSpec.Action(InitVolumeStreaming),
        PluginSpec.Action(BoxifyVolumeStreaming),
        PluginSpec.Action(CreateVolumeStreamingBehavior),

        PluginSpec.Action(StateTransforms.Data.Download),
        PluginSpec.Action(StateTransforms.Data.ParseCif),
        PluginSpec.Action(StateTransforms.Data.ParseCcp4),
        PluginSpec.Action(StateTransforms.Data.ParseDsn6),

        PluginSpec.Action(StateTransforms.Model.TrajectoryFromMmCif),
        PluginSpec.Action(StateTransforms.Model.TrajectoryFromCifCore),
        PluginSpec.Action(StateTransforms.Model.TrajectoryFromPDB),
        PluginSpec.Action(StateTransforms.Model.TransformStructureConformation),
        PluginSpec.Action(StateTransforms.Model.StructureFromModel),
        PluginSpec.Action(StateTransforms.Model.StructureFromTrajectory),
        PluginSpec.Action(StateTransforms.Model.ModelFromTrajectory),
        PluginSpec.Action(StateTransforms.Model.StructureSelectionFromScript),
        PluginSpec.Action(StateTransforms.Representation.StructureRepresentation3D),
        PluginSpec.Action(StateTransforms.Representation.StructureSelectionsDistance3D),
        PluginSpec.Action(StateTransforms.Representation.StructureSelectionsAngle3D),
        PluginSpec.Action(StateTransforms.Representation.StructureSelectionsDihedral3D),
        PluginSpec.Action(StateTransforms.Representation.StructureSelectionsLabel3D),
        PluginSpec.Action(StateTransforms.Representation.StructureSelectionsOrientation3D),
        PluginSpec.Action(StateTransforms.Representation.ModelUnitcell3D),
        PluginSpec.Action(StateTransforms.Representation.StructureBoundingBox3D),
        PluginSpec.Action(StateTransforms.Representation.ExplodeStructureRepresentation3D),
        PluginSpec.Action(StateTransforms.Representation.SpinStructureRepresentation3D),
        PluginSpec.Action(StateTransforms.Representation.UnwindStructureAssemblyRepresentation3D),
        PluginSpec.Action(StateTransforms.Representation.OverpaintStructureRepresentation3DFromScript),
        PluginSpec.Action(StateTransforms.Representation.TransparencyStructureRepresentation3DFromScript),
        PluginSpec.Action(StateTransforms.Representation.ClippingStructureRepresentation3DFromScript),
        PluginSpec.Action(StateTransforms.Representation.SubstanceStructureRepresentation3DFromScript),
        PluginSpec.Action(StateTransforms.Representation.ThemeStrengthRepresentation3D),

        PluginSpec.Action(AssignColorVolume),
        PluginSpec.Action(StateTransforms.Volume.VolumeFromCcp4),
        PluginSpec.Action(StateTransforms.Volume.VolumeFromDsn6),
        PluginSpec.Action(StateTransforms.Volume.VolumeFromCube),
        PluginSpec.Action(StateTransforms.Volume.VolumeFromDx),
        PluginSpec.Action(StateTransforms.Representation.VolumeRepresentation3D),
    ],
    behaviors: [
        PluginSpec.Behavior(PluginBehaviors.Representation.HighlightLoci),
        PluginSpec.Behavior(PluginBehaviors.Representation.SelectLoci),
        PluginSpec.Behavior(PluginBehaviors.Representation.DefaultLociLabelProvider),
        PluginSpec.Behavior(PluginBehaviors.Representation.FocusLoci),
        PluginSpec.Behavior(PluginBehaviors.Camera.FocusLoci),
        PluginSpec.Behavior(PluginBehaviors.Camera.CameraAxisHelper),
        PluginSpec.Behavior(PluginBehaviors.Camera.CameraControls),
        PluginSpec.Behavior(StructureFocusRepresentation),

        PluginSpec.Behavior(PluginBehaviors.CustomProps.StructureInfo),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.AccessibleSurfaceArea),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.BestDatabaseSequenceMapping),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.Interactions),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.SecondaryStructure),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.ValenceModel),
        PluginSpec.Behavior(PluginBehaviors.CustomProps.CrossLinkRestraint),
    ],
    animations: [
        AnimateModelIndex,
        AnimateCameraSpin,
        AnimateCameraRock,
        AnimateStateSnapshots,
        AnimateAssemblyUnwind,
        AnimateStructureSpin,
        AnimateStateInterpolation
    ]
});