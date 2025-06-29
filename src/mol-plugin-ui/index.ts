/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


import { createElement } from 'react';
import { Plugin } from './plugin';
import { PluginUIContext } from './context';
import { DefaultPluginUISpec, PluginUISpec } from './spec';

/**
 * Creates and initializes a complete Mol* plugin UI instance with React components.
 * 
 * This is the main entry point for creating full-featured molecular visualization
 * applications with the complete Mol* user interface. It handles plugin initialization,
 * React component setup, and canvas initialization.
 * 
 * @param options - Configuration options for plugin creation
 * @param options.target - DOM element to render the plugin into
 * @param options.render - React render function (use renderReact18 for React 18+)
 * @param options.spec - Optional plugin specification (uses DefaultPluginUISpec if not provided)
 * @param options.onBeforeUIRender - Optional callback executed after plugin init but before UI render
 * 
 * @returns Promise that resolves to the initialized PluginUIContext
 * 
 * @example
 * ```typescript
 * import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
 * import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
 * import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
 * 
 * const container = document.getElementById('molstar-container');
 * 
 * const plugin = await createPluginUI({
 *   target: container,
 *   render: renderReact18,
 *   spec: DefaultPluginUISpec(),
 *   onBeforeUIRender: async (ctx) => {
 *     // Perform any custom setup before UI renders
 *     console.log('Plugin initialized, about to render UI');
 *   }
 * });
 * 
 * // Plugin is now ready for use
 * console.log('Plugin created successfully:', plugin);
 * ```
 * 
 * @example
 * For NextJS applications:
 * ```typescript
 * import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
 * import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
 * 
 * useEffect(() => {
 *   let plugin: PluginUIContext | undefined;
 * 
 *   const initPlugin = async () => {
 *     if (containerRef.current) {
 *       plugin = await createPluginUI({
 *         target: containerRef.current,
 *         render: renderReact18
 *       });
 *     }
 *   };
 * 
 *   initPlugin();
 * 
 *   return () => {
 *     plugin?.dispose();
 *   };
 * }, []);
 * ```
 * 
 * @remarks
 * - Automatically initializes the plugin context and 3D canvas
 * - Handles React component mounting and setup
 * - Sets up complete UI with panels, controls, and interactions
 * - Compatible with React 18+ when using renderReact18
 * - For headless usage without UI, use PluginContext directly instead
 * - The target element should have explicit dimensions set via CSS
 * 
 * @throws Will throw an error if plugin initialization or canvas setup fails
 * 
 * @public
 */
export async function createPluginUI(options: { target: HTMLElement, render: (component: any, container: Element) => any, spec?: PluginUISpec, onBeforeUIRender?: (ctx: PluginUIContext) => (Promise<void> | void) }) {
    const { spec, target, onBeforeUIRender, render } = options;
    const ctx = new PluginUIContext(spec || DefaultPluginUISpec());
    await ctx.init();
    if (onBeforeUIRender) {
        await onBeforeUIRender(ctx);
    }
    render(createElement(Plugin, { plugin: ctx }), target);
    try {
        await ctx.canvas3dInitialized;
    } catch {
        // Error reported in UI/console elsewhere.
    }
    return ctx;
}