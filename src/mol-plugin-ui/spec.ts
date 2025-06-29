/**
 * Copyright (c) 2018-2025 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Ventura Rivera <venturaxrivera@gmail.com>
 */


import { StateTransformParameters } from '../mol-plugin-ui/state/common';
import { CreateVolumeStreamingBehavior } from '../mol-plugin/behavior/dynamic/volume-streaming/transformers';
import { DefaultPluginSpec, PluginSpec } from '../mol-plugin/spec';
import { StateAction, StateTransformer } from '../mol-state';
import { VolumeStreamingCustomControls } from './custom/volume';
import { Loci } from '../mol-model/loci';
import { SequenceViewMode } from './sequence';

/**
 * Extended plugin specification that adds React UI component definitions and customization options.
 * 
 * PluginUISpec extends the base PluginSpec with React-specific configuration for UI components,
 * custom parameter editors, and layout controls. This is used when creating plugin instances
 * with the full Mol* user interface.
 * 
 * @example
 * ```typescript
 * import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
 * 
 * const customSpec: PluginUISpec = {
 *   ...DefaultPluginUISpec(),
 *   components: {
 *     viewport: {
 *       view: CustomViewportComponent
 *     },
 *     controls: {
 *       top: CustomTopPanel,
 *       left: 'none' // Hide left panel
 *     }
 *   }
 * };
 * ```
 * 
 * @public
 */
export interface PluginUISpec extends PluginSpec {
    /** Custom React components for editing parameters of specific actions and transformers */
    customParamEditors?: [StateAction | StateTransformer, StateTransformParameters.Class][],
    /**
     * Configuration for React UI components and layout.
     * 
     * Allows customization of various plugin UI elements including panels,
     * viewport controls, selection tools, and overlay behavior.
     */
    components?: {
        /** Layout control components for different panel positions */
        controls?: PluginUISpec.LayoutControls
        /** Remote state synchronization mode */
        remoteState?: 'none' | 'default',
        /** Custom component for structure analysis tools */
        structureTools?: React.ComponentClass | React.FC,
        /** Viewport-related component customizations */
        viewport?: {
            /** Custom viewport view component */
            view?: React.ComponentClass | React.FC,
            /** Custom viewport controls component */
            controls?: React.ComponentClass | React.FC,
            /** Custom snapshot description component */
            snapshotDescription?: React.ComponentClass | React.FC,
        },
        /** Sequence viewer customization options */
        sequenceViewer?: {
            /** Custom sequence viewer component */
            view?: React.ComponentClass | React.FC
            /** Available sequence view modes */
            modeOptions?: SequenceViewMode[],
            /** Default sequence view mode */
            defaultMode?: SequenceViewMode,
        }
        /** Whether to hide the task progress overlay */
        hideTaskOverlay?: boolean,
        /** Whether to disable drag-and-drop file overlay */
        disableDragOverlay?: boolean,
        /** Selection tools customization */
        selectionTools?: {
            /** Custom selection controls component */
            controls?: React.ComponentClass | React.FC,
            /** Available selection granularity options */
            granularityOptions?: Loci.Granularity[],
            /** Options to hide specific selection tool buttons */
            hide?: {
                granularity?: boolean,
                union?: boolean,
                subtract?: boolean,
                intersect?: boolean,
                set?: boolean,
                theme?: boolean,
                componentAdd?: boolean,
                componentRemove?: boolean,
                undo?: boolean,
                help?: boolean,
                cancel?: boolean,
            },
        },
    },
}

export namespace PluginUISpec {
    /**
     * Configuration for layout control components in different panel positions.
     * 
     * Each position can have a custom React component or be set to 'none' to hide that panel.
     */
    export interface LayoutControls {
        /** Component for the top panel (typically toolbar or menu) */
        top?: React.ComponentClass | React.FC | 'none',
        /** Component for the left panel (typically structure tree and controls) */
        left?: React.ComponentClass | React.FC | 'none',
        /** Component for the right panel (typically selection and analysis tools) */
        right?: React.ComponentClass | React.FC | 'none',
        /** Component for the bottom panel (typically log and status) */
        bottom?: React.ComponentClass | React.FC | 'none'
    }
}

/**
 * Creates a default plugin UI specification with standard React components and layout.
 * 
 * This function returns a comprehensive plugin UI specification that extends the base
 * DefaultPluginSpec with React UI components, custom parameter editors, and standard
 * layout configuration suitable for most molecular visualization applications.
 * 
 * @returns A complete PluginUISpec with default React UI components and behaviors
 * 
 * @example
 * ```typescript
 * import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
 * import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
 * 
 * const ctx = new PluginUIContext(DefaultPluginUISpec());
 * await ctx.init();
 * ```
 * 
 * @remarks
 * - Includes all capabilities from DefaultPluginSpec
 * - Adds React UI components for parameter editing
 * - Provides standard layout with panels for structure tree, controls, and tools
 * - Compatible with React 18+ and NextJS applications
 * - Can be customized by merging with additional options
 * 
 * @public
 */
export const DefaultPluginUISpec = (): PluginUISpec => ({
    ...DefaultPluginSpec(),
    /** Default custom parameter editors for specialized transformers */
    customParamEditors: [
        [CreateVolumeStreamingBehavior, VolumeStreamingCustomControls]
    ],
});