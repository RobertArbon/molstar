# Building Custom Mol* Libraries for NextJS

This guide provides comprehensive documentation for developers who want to create fully functional custom Mol* libraries for NextJS applications.

## Overview

Mol* provides a powerful React UI library approach using `PluginUIContext` that includes full-featured React components, making it perfect for NextJS applications with both App Router and Pages Router patterns.

The NextJS integration provides:
- Complete Mol* React components optimized for NextJS
- SSR-safe implementation with proper hydration
- App Router and Pages Router compatibility
- Dynamic imports to avoid server-side rendering issues
- TypeScript support with proper Next.js types

## Quick Start

### Prerequisites

- NextJS 13+ (App Router) or NextJS 12+ (Pages Router)
- React 18+
- Node.js 16+
- Basic knowledge of NextJS and TypeScript
- Understanding of molecular visualization concepts

### NextJS Project Setup

```bash
# Create NextJS application
npx create-next-app@latest my-molstar-app --typescript --tailwind --eslint --app

# Navigate to project
cd my-molstar-app

# Install Mol* dependencies
npm install molstar sass

# Install additional dev dependencies
npm install -D @types/node concurrently
```

## NextJS Configuration

### Next.js Config

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Handle WebAssembly modules for Mol*
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
        });

        // Exclude canvas from server-side rendering
        if (isServer) {
            config.externals.push('canvas');
        }

        // Optimize Mol* bundle splitting
        config.optimization.splitChunks.cacheGroups.molstar = {
            name: 'molstar',
            test: /[\\/]node_modules[\\/]molstar/,
            priority: 30,
            chunks: 'all',
        };

        return config;
    },
    experimental: {
        asyncWebAssembly: true,
    },
    transpilePackages: ['molstar'],
};

module.exports = nextConfig;
```

## Core Library Implementation

### Mol* Wrapper for NextJS

Create `lib/molstar.ts`:

```typescript
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { createPluginUI, renderReact18 } from 'molstar/lib/mol-plugin-ui';
import { DefaultPluginUISpec, PluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';

export interface MolstarConfig {
    showControls?: boolean;
    backgroundColor?: string;
    layout?: {
        isExpanded?: boolean;
        controlsDisplay?: 'reactive' | 'landscape' | 'portrait' | 'always' | 'none';
    };
}

export class MolstarWrapper {
    private plugin: PluginUIContext | null = null;

    async init(element: HTMLElement, config: MolstarConfig = {}): Promise<PluginUIContext> {
        if (this.plugin) {
            throw new Error('Mol* already initialized');
        }

        const spec: PluginUISpec = {
            ...DefaultPluginUISpec(),
            layout: {
                initial: {
                    isExpanded: config.layout?.isExpanded ?? false,
                    showControls: config.showControls ?? true,
                    controlsDisplay: config.layout?.controlsDisplay ?? 'reactive'
                },
                controls: {
                    top: 'none',
                    left: 'hierarchy',
                    right: 'selection',
                    bottom: 'none'
                }
            },
            components: {
                remoteState: 'none',
                viewport: {
                    canvas3d: {
                        renderer: {
                            backgroundColor: config.backgroundColor ?? 'white'
                        }
                    }
                }
            }
        };

        this.plugin = await createPluginUI({
            target: element,
            render: renderReact18,
            spec
        });

        return this.plugin;
    }

    async loadStructure(url: string, format: 'pdb' | 'mmcif' | 'sdf' = 'mmcif') {
        if (!this.plugin) {
            throw new Error('Mol* not initialized');
        }

        const data = await this.plugin.builders.data.download({
            url,
            isBinary: false
        });

        const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);
        return await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
    }

    async loadVolume(url: string, format: 'ccp4' | 'dsn6' = 'ccp4') {
        if (!this.plugin) {
            throw new Error('Mol* not initialized');
        }

        const data = await this.plugin.builders.data.download({
            url,
            isBinary: true
        });

        return await this.plugin.builders.volume.parseVolume(data, format);
    }

    getPlugin(): PluginUIContext | null {
        return this.plugin;
    }

    dispose() {
        if (this.plugin) {
            this.plugin.dispose();
            this.plugin = null;
        }
    }
}

// NextJS-specific error handling
export class NextJSMolstarError extends Error {
    constructor(message: string, public cause?: Error) {
        super(message);
        this.name = 'NextJSMolstarError';
    }
}

export async function safeInitMolstar(
    element: HTMLElement,
    config: MolstarConfig = {}
): Promise<MolstarWrapper | null> {
    try {
        const wrapper = new MolstarWrapper();
        await wrapper.init(element, config);
        return wrapper;
    } catch (error) {
        throw new NextJSMolstarError(
            'Failed to initialize Mol* in NextJS',
            error instanceof Error ? error : new Error(String(error))
        );
    }
}

export { PluginUIContext, PluginUISpec };
```

### Styling for NextJS

Create `styles/molstar.css`:

```css
/* Mol* base styles import */
@import 'molstar/lib/mol-plugin-ui/skin/light.scss';

.molstar-viewer {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.molstar-viewer canvas {
    display: block;
}

.molstar-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 0.375rem;
}

.molstar-error {
    color: #dc3545;
    padding: 1rem;
    border: 1px solid #dc3545;
    border-radius: 0.375rem;
    background-color: #f8d7da;
}

/* Dark mode support for NextJS */
@media (prefers-color-scheme: dark) {
    .molstar-viewer {
        background-color: #1a1a1a;
    }
    
    .molstar-loading {
        background-color: #2d3748;
        border-color: #4a5568;
        color: #e2e8f0;
    }
}

/* Responsive design for NextJS */
@media (max-width: 768px) {
    .molstar-viewer {
        height: 50vh;
        min-height: 300px;
    }
}
```

## NextJS App Router Integration

### Dynamic Mol* Component

Create `components/MolstarViewer.tsx`:

```typescript
'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { MolstarWrapper, MolstarConfig, NextJSMolstarError } from '../lib/molstar';

// Dynamic import with SSR disabled
const MolstarViewerInner = dynamic(
    () => Promise.resolve(MolstarViewerComponent),
    { 
        ssr: false,
        loading: () => <div className="molstar-loading">Loading Mol* viewer...</div>
    }
);

interface MolstarViewerProps {
    structureUrl?: string;
    config?: MolstarConfig;
    className?: string;
    style?: React.CSSProperties;
    onInit?: (wrapper: MolstarWrapper) => void;
    onError?: (error: NextJSMolstarError) => void;
}

function MolstarViewerComponent({ 
    structureUrl, 
    config, 
    className, 
    style,
    onInit,
    onError
}: MolstarViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<MolstarWrapper>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<NextJSMolstarError | null>(null);

    useEffect(() => {
        const initViewer = async () => {
            if (!containerRef.current) return;

            try {
                const { MolstarWrapper } = await import('../lib/molstar');
                const wrapper = new MolstarWrapper();
                wrapperRef.current = wrapper;
                
                await wrapper.init(containerRef.current, config);
                onInit?.(wrapper);

                if (structureUrl) {
                    await wrapper.loadStructure(structureUrl);
                }
            } catch (err) {
                const molstarError = err instanceof NextJSMolstarError 
                    ? err 
                    : new NextJSMolstarError('NextJS Mol* initialization failed', err as Error);
                setError(molstarError);
                onError?.(molstarError);
            } finally {
                setIsLoading(false);
            }
        };

        initViewer();

        return () => {
            wrapperRef.current?.dispose();
        };
    }, [structureUrl, config, onInit, onError]);

    if (error) {
        return (
            <div className="molstar-error">
                <h3>Mol* Viewer Error</h3>
                <p>{error.message}</p>
                <button onClick={() => window.location.reload()}>
                    Reload Page
                </button>
            </div>
        );
    }

    return (
        <div className={`molstar-viewer ${className || ''}`} style={style}>
            {isLoading && <div className="molstar-loading">Initializing viewer...</div>}
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}

export default function MolstarViewer(props: MolstarViewerProps) {
    return <MolstarViewerInner {...props} />;
}
```

### NextJS Hook for Mol*

Create `hooks/useMolstar.ts`:

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { MolstarWrapper, MolstarConfig, NextJSMolstarError } from '../lib/molstar';

export interface UseMolstarOptions extends MolstarConfig {
    autoInit?: boolean;
    onError?: (error: NextJSMolstarError) => void;
}

export function useMolstar(options: UseMolstarOptions = {}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<MolstarWrapper>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<NextJSMolstarError | null>(null);

    const init = useCallback(async () => {
        if (!containerRef.current || wrapperRef.current) return;

        setIsLoading(true);
        setError(null);

        try {
            const { MolstarWrapper } = await import('../lib/molstar');
            const wrapper = new MolstarWrapper();
            wrapperRef.current = wrapper;
            
            await wrapper.init(containerRef.current, {
                showControls: options.showControls,
                backgroundColor: options.backgroundColor,
                layout: options.layout
            });
        } catch (err) {
            const molstarError = err instanceof NextJSMolstarError 
                ? err 
                : new NextJSMolstarError('NextJS hook initialization failed', err as Error);
            setError(molstarError);
            options.onError?.(molstarError);
        } finally {
            setIsLoading(false);
        }
    }, [options]);

    const loadStructure = useCallback(async (url: string, format: 'pdb' | 'mmcif' | 'sdf' = 'mmcif') => {
        if (!wrapperRef.current) {
            throw new NextJSMolstarError('Mol* not initialized in NextJS hook');
        }
        return await wrapperRef.current.loadStructure(url, format);
    }, []);

    const dispose = useCallback(() => {
        if (wrapperRef.current) {
            wrapperRef.current.dispose();
            wrapperRef.current = undefined;
        }
    }, []);

    useEffect(() => {
        if (options.autoInit) {
            init();
        }

        return () => {
            dispose();
        };
    }, [options.autoInit, init, dispose]);

    return {
        containerRef,
        wrapper: wrapperRef.current,
        isLoading,
        error,
        init,
        loadStructure,
        dispose
    };
}
```

## NextJS App Router Usage

### Basic Page Implementation

Create `app/viewer/page.tsx`:

```typescript
import MolstarViewer from '../../components/MolstarViewer';

export default function ViewerPage() {
    return (
        <div className="min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Mol* Viewer</h1>
            <div className="w-full h-[600px]">
                <MolstarViewer 
                    structureUrl="https://files.rcsb.org/view/1tqn.cif"
                    config={{
                        showControls: true,
                        backgroundColor: '#f8f9fa',
                        layout: {
                            isExpanded: false,
                            controlsDisplay: 'reactive'
                        }
                    }}
                />
            </div>
        </div>
    );
}
```

### Advanced Page with Dynamic Loading

Create `app/advanced-viewer/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import MolstarViewer from '../../components/MolstarViewer';
import { MolstarWrapper } from '../../lib/molstar';

export default function AdvancedViewerPage() {
    const [structureUrl, setStructureUrl] = useState('');
    const [wrapper, setWrapper] = useState<MolstarWrapper | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleInit = (molstarWrapper: MolstarWrapper) => {
        setWrapper(molstarWrapper);
    };

    const handleLoadStructure = async () => {
        if (!wrapper || !structureUrl) return;
        
        setIsLoading(true);
        try {
            await wrapper.loadStructure(structureUrl);
        } catch (error) {
            console.error('Failed to load structure:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Advanced Mol* Viewer</h1>
            
            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={structureUrl}
                    onChange={(e) => setStructureUrl(e.target.value)}
                    placeholder="Enter structure URL (e.g., https://files.rcsb.org/view/1tqn.cif)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                    onClick={handleLoadStructure}
                    disabled={!wrapper || !structureUrl || isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                >
                    {isLoading ? 'Loading...' : 'Load Structure'}
                </button>
            </div>

            <div className="w-full h-[700px] border border-gray-300 rounded-lg">
                <MolstarViewer 
                    onInit={handleInit}
                    config={{
                        showControls: true,
                        backgroundColor: 'white',
                        layout: {
                            isExpanded: true,
                            controlsDisplay: 'always'
                        }
                    }}
                />
            </div>
        </div>
    );
}
```

## NextJS Pages Router Integration

### Pages Router Component

Create `pages/viewer.tsx`:

```typescript
import type { NextPage } from 'next';
import { useState } from 'react';
import MolstarViewer from '../components/MolstarViewer';
import { MolstarWrapper } from '../lib/molstar';

const ViewerPage: NextPage = () => {
    const [wrapper, setWrapper] = useState<MolstarWrapper | null>(null);

    const handleInit = (molstarWrapper: MolstarWrapper) => {
        setWrapper(molstarWrapper);
    };

    return (
        <div style={{ padding: '1rem', minHeight: '100vh' }}>
            <h1>NextJS Pages Router - Mol* Viewer</h1>
            <div style={{ width: '100%', height: '600px', marginTop: '1rem' }}>
                <MolstarViewer 
                    structureUrl="https://files.rcsb.org/view/4hhb.cif"
                    onInit={handleInit}
                    config={{
                        showControls: true,
                        backgroundColor: '#ffffff'
                    }}
                />
            </div>
        </div>
    );
};

export default ViewerPage;
```

## Error Handling for NextJS

### Error Boundary Component

Create `components/MolstarErrorBoundary.tsx`:

```typescript
'use client';

import React, { Component, ReactNode } from 'react';
import { NextJSMolstarError } from '../lib/molstar';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: NextJSMolstarError;
}

export class MolstarErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { 
            hasError: true, 
            error: error instanceof NextJSMolstarError ? error : new NextJSMolstarError('Unknown NextJS error', error)
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('NextJS Mol* Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="molstar-error">
                    <h2>NextJS Mol* Viewer Error</h2>
                    <p>Something went wrong with the molecular viewer in your NextJS application.</p>
                    <details className="mt-2">
                        <summary className="cursor-pointer">Error Details</summary>
                        <pre className="mt-2 text-sm overflow-auto">
                            {this.state.error?.stack}
                        </pre>
                    </details>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
```

## Production Optimization

### NextJS Bundle Optimization

Update `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer, dev }) => {
        // Mol* WebAssembly support
        config.experiments = { ...config.experiments, asyncWebAssembly: true };
        
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
        });

        // Server-side exclusions
        if (isServer) {
            config.externals.push('canvas');
        }

        // Production optimizations
        if (!dev) {
            config.optimization.splitChunks.cacheGroups = {
                ...config.optimization.splitChunks.cacheGroups,
                molstar: {
                    name: 'molstar',
                    test: /[\\/]node_modules[\\/]molstar/,
                    priority: 30,
                    chunks: 'all',
                    enforce: true,
                },
            };
        }

        return config;
    },
    transpilePackages: ['molstar'],
    // Enable static optimization where possible
    output: 'standalone',
};

module.exports = nextConfig;
```

### Performance Monitoring

Create `lib/performance.ts`:

```typescript
export function monitorMolstarPerformance() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name.includes('molstar')) {
                console.log('Mol* performance:', entry.name, entry.duration);
            }
        }
    });
    
    observer.observe({ entryTypes: ['navigation', 'resource'] });
    
    // Memory monitoring for NextJS
    if ('memory' in performance) {
        setInterval(() => {
            const memory = (performance as any).memory;
            console.log('NextJS Mol* Memory:', {
                used: Math.round(memory.usedJSHeapSize / 1048576),
                total: Math.round(memory.totalJSHeapSize / 1048576),
                limit: Math.round(memory.jsHeapSizeLimit / 1048576)
            });
        }, 30000);
    }
}
```

## Deployment

### Vercel Deployment

Create `vercel.json`:

```json
{
    "functions": {
        "app/api/**/*.ts": {
            "maxDuration": 10
        }
    },
    "headers": [
        {
            "source": "/(.*)",
            "headers": [
                {
                    "key": "Cross-Origin-Embedder-Policy",
                    "value": "require-corp"
                },
                {
                    "key": "Cross-Origin-Opener-Policy",
                    "value": "same-origin"
                }
            ]
        }
    ]
}
```

### Environment Variables

Create `.env.local`:

```bash
# NextJS Mol* Configuration
NEXT_PUBLIC_MOLSTAR_CDN_URL=https://cdn.jsdelivr.net/npm/molstar@latest
NEXT_PUBLIC_DEFAULT_STRUCTURE_URL=https://files.rcsb.org/view/1tqn.cif
```

## Best Practices for NextJS

1. **Always use dynamic imports** with `ssr: false` for Mol* components
2. **Implement proper error boundaries** for graceful failure handling
3. **Use NextJS Image optimization** for loading screens and fallbacks
4. **Configure proper CSP headers** for WebGL and WebAssembly
5. **Monitor bundle sizes** and implement code splitting
6. **Use TypeScript strictly** for better NextJS integration
7. **Test SSR compatibility** thoroughly before deployment

## Further Reading

- [NextJS API Reference](api-reference.md) - Complete NextJS-specific API documentation
- [NextJS Examples](examples.md) - Working NextJS application examples