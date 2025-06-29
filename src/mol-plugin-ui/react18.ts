/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { createRoot } from 'react-dom/client';

/**
 * React 18+ compatible render function for Mol* plugin UI components.
 * 
 * This function uses React 18's new createRoot API for rendering the plugin UI.
 * It should be used with createPluginUI when working with React 18 or later versions.
 * 
 * @param element - React element to render (typically the Plugin component)
 * @param target - DOM element to render into
 * 
 * @example
 * ```typescript
 * import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
 * import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
 * 
 * const plugin = await createPluginUI({
 *   target: document.getElementById('molstar-container'),
 *   render: renderReact18
 * });
 * ```
 * 
 * @example
 * For NextJS applications with React 18+:
 * ```typescript
 * import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
 * 
 * useEffect(() => {
 *   const initMolstar = async () => {
 *     const plugin = await createPluginUI({
 *       target: containerRef.current!,
 *       render: renderReact18,
 *       spec: DefaultPluginUISpec()
 *     });
 *     
 *     // Plugin ready for use
 *     setPluginContext(plugin);
 *   };
 *   
 *   initMolstar();
 * }, []);
 * ```
 * 
 * @remarks
 * - Required for React 18+ compatibility due to createRoot API
 * - Automatically handles React 18's concurrent features
 * - Replaces the legacy ReactDOM.render approach
 * - Ensures proper cleanup and memory management
 * - Compatible with NextJS 13+ and other modern React frameworks
 * 
 * @public
 */
export function renderReact18(element: any, target: Element) {
    createRoot(target).render(element);
}