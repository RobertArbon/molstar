/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */


import { PluginContext } from '../mol-plugin/context';
import { PluginUISpec } from './spec';
import { StateTransformParameters } from './state/common';

/**
 * Extended plugin context that adds React UI capabilities to the base PluginContext.
 * 
 * This class extends PluginContext with React-specific functionality, custom parameter
 * editors, and UI components. It's designed for applications that need the full
 * Mol* user interface with React components.
 * 
 * @example
 * ```typescript
 * import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
 * import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
 * 
 * const ctx = new PluginUIContext(DefaultPluginUISpec());
 * await ctx.init();
 * 
 * // Mount with React UI
 * ctx.mount(targetElement);
 * ```
 * 
 * @remarks
 * - Use this instead of PluginContext when building React-based applications
 * - Includes custom parameter editors for enhanced user interaction
 * - Compatible with React 18+ and NextJS applications
 * - Provides the same API as PluginContext with additional UI capabilities
 * 
 * @public
 */
export class PluginUIContext extends PluginContext {
    /**
     * Registry for custom parameter editor components.
     * 
     * Allows registration of React components that provide custom UI controls
     * for specific state transformers and actions. This enables advanced
     * customization of the plugin's parameter editing interface.
     * 
     * @example
     * ```typescript
     * // Custom editors are typically registered via the spec
     * const spec: PluginUISpec = {
     *   customParamEditors: [
     *     [MyCustomTransformer, MyCustomEditorComponent]
     *   ]
     * };
     * ```
     */
    readonly customParamEditors = new Map<string, StateTransformParameters.Class>();

    private initCustomParamEditors() {
        if (!this.spec.customParamEditors) return;

        for (const [t, e] of this.spec.customParamEditors) {
            this.customParamEditors.set(t.id, e);
        }
    }

    dispose(options?: { doNotForceWebGLContextLoss?: boolean }) {
        super.dispose(options);
        this.layout.dispose();
    }

    /**
     * Creates a new PluginUIContext instance with React UI capabilities.
     * 
     * @param spec - Plugin UI specification defining UI components, behaviors, and custom editors
     * 
     * @example
     * ```typescript
     * import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
     * 
     * const ctx = new PluginUIContext(DefaultPluginUISpec());
     * ```
     * 
     * @remarks
     * - Automatically registers custom parameter editors from the spec
     * - Inherits all capabilities from PluginContext
     * - Must call `init()` before using the context
     */
    constructor(public spec: PluginUISpec) {
        super(spec);

        this.initCustomParamEditors();
    }
}