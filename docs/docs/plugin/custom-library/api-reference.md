# NextJS Mol* API Reference

Complete API documentation for building custom Mol* libraries specifically for NextJS applications.

## NextJS-Specific Classes

### MolstarWrapper

The main wrapper class designed for NextJS applications with proper SSR handling and NextJS lifecycle management.

**Source:** Custom wrapper for NextJS integration

#### Constructor

```typescript
new MolstarWrapper()
```

Creates a new MolstarWrapper instance optimized for NextJS applications.

#### Methods

##### async init(element: HTMLElement, config?: MolstarConfig): Promise<PluginUIContext>

Initializes the Mol* viewer within a NextJS application context.

**Parameters:**
- `element: HTMLElement` - DOM element to mount the viewer (must be client-side)
- `config?: MolstarConfig` - NextJS-optimized configuration options

**Returns:** Promise resolving to initialized `PluginUIContext`

**NextJS Usage:**
```typescript
// In a 'use client' component
const wrapper = new MolstarWrapper();
const plugin = await wrapper.init(containerRef.current, {
    showControls: true,
    backgroundColor: '#f8f9fa',
    layout: {
        isExpanded: false,
        controlsDisplay: 'reactive'
    }
});
```

##### async loadStructure(url: string, format?: 'pdb' | 'mmcif' | 'sdf'): Promise<any>

Loads a molecular structure with NextJS-optimized error handling.

**Parameters:**
- `url: string` - Structure file URL (must be accessible from browser)
- `format?: 'pdb' | 'mmcif' | 'sdf'` - File format (auto-detected if not specified)

**NextJS Considerations:**
- URLs must be accessible from client-side
- Consider using NextJS API routes for proxy if needed
- Handles CORS issues common in NextJS deployments

##### async loadVolume(url: string, format?: 'ccp4' | 'dsn6'): Promise<any>

Loads volume data optimized for NextJS applications.

##### getPlugin(): PluginUIContext | null

Returns the current plugin instance or null if not initialized.

##### dispose(): void

Properly disposes of all resources with NextJS cleanup considerations.

---

### NextJSMolstarError

Custom error class for NextJS-specific Mol* errors.

**Source:** Custom error handling for NextJS

#### Constructor

```typescript
new NextJSMolstarError(message: string, cause?: Error)
```

**Properties:**
- `message: string` - Human-readable error message
- `cause?: Error` - Original error that caused this NextJS error
- `name: string` - Always "NextJSMolstarError"

**Usage in NextJS:**
```typescript
try {
    await wrapper.init(element);
} catch (error) {
    if (error instanceof NextJSMolstarError) {
        console.error('NextJS Mol* Error:', error.message);
        console.error('Caused by:', error.cause);
    }
}
```

---

## NextJS Configuration Interfaces

### MolstarConfig

Configuration interface optimized for NextJS applications.

```typescript
interface MolstarConfig {
    showControls?: boolean;
    backgroundColor?: string;
    layout?: {
        isExpanded?: boolean;
        controlsDisplay?: 'reactive' | 'landscape' | 'portrait' | 'always' | 'none';
    };
}
```

**Properties:**
- `showControls?: boolean` - Show UI controls (default: true)
- `backgroundColor?: string` - Canvas background color (default: 'white')
- `layout?.isExpanded?: boolean` - Initial expanded state (default: false for NextJS)
- `layout?.controlsDisplay?: string` - Control display mode optimized for responsive NextJS layouts

**NextJS Responsive Recommendations:**
- Use `'reactive'` for responsive NextJS layouts
- Use `'none'` for embedded viewers in mobile-first NextJS apps
- Use `'always'` for desktop-only NextJS applications

---

## NextJS Component Interfaces

### MolstarViewerProps

Props interface for the main NextJS Mol* viewer component.

```typescript
interface MolstarViewerProps {
    structureUrl?: string;
    config?: MolstarConfig;
    className?: string;
    style?: React.CSSProperties;
    onInit?: (wrapper: MolstarWrapper) => void;
    onError?: (error: NextJSMolstarError) => void;
}
```

**NextJS-Specific Usage:**
```typescript
// App Router
<MolstarViewer 
    structureUrl={process.env.NEXT_PUBLIC_DEFAULT_STRUCTURE_URL}
    config={{ showControls: true }}
    className="w-full h-96"
    onInit={(wrapper) => setMolstarWrapper(wrapper)}
    onError={(error) => setError(error)}
/>
```

### UseMolstarOptions

Options interface for the NextJS useMolstar hook.

```typescript
interface UseMolstarOptions extends MolstarConfig {
    autoInit?: boolean;
    onError?: (error: NextJSMolstarError) => void;
}
```

**NextJS Hook Usage:**
```typescript
const { containerRef, wrapper, isLoading, error, init, loadStructure } = useMolstar({
    autoInit: true,
    showControls: true,
    onError: (error) => toast.error(error.message)
});
```

---

## NextJS Utility Functions

### safeInitMolstar

Safe initialization function with NextJS-specific error handling.

```typescript
async function safeInitMolstar(
    element: HTMLElement,
    config?: MolstarConfig
): Promise<MolstarWrapper | null>
```

**NextJS Error Handling:**
```typescript
const wrapper = await safeInitMolstar(containerRef.current, config);
if (!wrapper) {
    // Handle initialization failure in NextJS
    router.push('/error?type=molstar-init');
}
```

### monitorMolstarPerformance

Performance monitoring function for NextJS applications.

```typescript
function monitorMolstarPerformance(): void
```

**NextJS Integration:**
```typescript
// In app/layout.tsx or pages/_app.tsx
useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
        monitorMolstarPerformance();
    }
}, []);
```

---

## NextJS Hook API

### useMolstar Hook

Custom React hook optimized for NextJS applications.

```typescript
function useMolstar(options?: UseMolstarOptions): {
    containerRef: React.RefObject<HTMLDivElement>;
    wrapper: MolstarWrapper | undefined;
    isLoading: boolean;
    error: NextJSMolstarError | null;
    init: () => Promise<void>;
    loadStructure: (url: string, format?: 'pdb' | 'mmcif' | 'sdf') => Promise<any>;
    dispose: () => void;
}
```

**Return Values:**
- `containerRef` - Ref to attach to DOM element
- `wrapper` - Current MolstarWrapper instance
- `isLoading` - Loading state for NextJS UI updates
- `error` - NextJS-specific error state
- `init` - Manual initialization function
- `loadStructure` - Structure loading function
- `dispose` - Cleanup function for NextJS component unmounting

**NextJS App Router Example:**
```typescript
'use client';

export default function ViewerPage() {
    const { containerRef, wrapper, isLoading, loadStructure } = useMolstar({
        autoInit: true,
        showControls: true
    });

    return (
        <div>
            {isLoading && <div>Loading Mol* viewer...</div>}
            <div ref={containerRef} className="w-full h-96" />
            <button onClick={() => loadStructure('/api/structures/sample.cif')}>
                Load Structure
            </button>
        </div>
    );
}
```

---

## NextJS Dynamic Import Functions

### Dynamic Component Loading

NextJS-optimized dynamic imports for Mol* components.

```typescript
// Recommended pattern for NextJS
const MolstarViewer = dynamic(
    () => import('../components/MolstarViewer'),
    { 
        ssr: false,
        loading: () => <div>Loading Mol* viewer...</div>
    }
);
```

**NextJS App Router:**
```typescript
// app/viewer/page.tsx
import dynamic from 'next/dynamic';

const MolstarViewer = dynamic(
    () => import('../../components/MolstarViewer'),
    { ssr: false }
);

export default function Page() {
    return <MolstarViewer />;
}
```

**NextJS Pages Router:**
```typescript
// pages/viewer.tsx
import dynamic from 'next/dynamic';
import type { NextPage } from 'next';

const MolstarViewer = dynamic(
    () => import('../components/MolstarViewer'),
    { ssr: false }
);

const ViewerPage: NextPage = () => {
    return <MolstarViewer />;
};

export default ViewerPage;
```

---

## NextJS Configuration API

### NextJS webpack Configuration

Required webpack configuration for NextJS applications.

```typescript
// next.config.js
const nextConfig = {
    webpack: (config, { isServer }) => {
        // WebAssembly support for Mol*
        config.experiments = { ...config.experiments, asyncWebAssembly: true };
        
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'webassembly/async',
        });

        // Exclude server-side modules
        if (isServer) {
            config.externals.push('canvas');
        }

        // Optimize bundle splitting
        config.optimization.splitChunks.cacheGroups.molstar = {
            name: 'molstar',
            test: /[\\/]node_modules[\\/]molstar/,
            priority: 30,
            chunks: 'all',
        };

        return config;
    },
    transpilePackages: ['molstar'],
};
```

### Environment Variables for NextJS

Recommended environment variables for NextJS Mol* applications.

```bash
# .env.local
NEXT_PUBLIC_MOLSTAR_CDN_URL=https://cdn.jsdelivr.net/npm/molstar@latest
NEXT_PUBLIC_DEFAULT_STRUCTURE_URL=https://files.rcsb.org/view/1tqn.cif
NEXT_PUBLIC_ENABLE_MOLSTAR_DEBUG=false
```

**Usage in NextJS:**
```typescript
const structureUrl = process.env.NEXT_PUBLIC_DEFAULT_STRUCTURE_URL;
const debugMode = process.env.NEXT_PUBLIC_ENABLE_MOLSTAR_DEBUG === 'true';
```

---

## NextJS Error Handling API

### MolstarErrorBoundary Component

React Error Boundary optimized for NextJS applications.

```typescript
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: NextJSMolstarError;
}

class MolstarErrorBoundary extends Component<Props, State>
```

**NextJS Usage:**
```typescript
// app/layout.tsx
export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html>
            <body>
                <MolstarErrorBoundary>
                    {children}
                </MolstarErrorBoundary>
            </body>
        </html>
    );
}
```

### Error Recovery Patterns

NextJS-specific error recovery patterns.

```typescript
// Automatic retry pattern for NextJS
const handleError = useCallback((error: NextJSMolstarError) => {
    if (error.cause?.name === 'NetworkError') {
        // Retry with NextJS API route
        loadStructure('/api/proxy-structure?url=' + encodeURIComponent(originalUrl));
    }
}, []);
```

---

## NextJS Performance API

### Bundle Size Optimization

NextJS-specific bundle optimization techniques.

```typescript
// Dynamic imports with chunking
const loadMolstarComponents = async () => {
    const [
        { MolstarWrapper },
        { createPluginUI },
        { renderReact18 }
    ] = await Promise.all([
        import('../lib/molstar'),
        import('molstar/lib/mol-plugin-ui'),
        import('molstar/lib/mol-plugin-ui/react18')
    ]);
    
    return { MolstarWrapper, createPluginUI, renderReact18 };
};
```

### Memory Management for NextJS

NextJS-specific memory management patterns.

```typescript
// App Router cleanup
useEffect(() => {
    return () => {
        wrapper?.dispose();
        // Force garbage collection hint for NextJS
        if ('gc' in window) {
            (window as any).gc();
        }
    };
}, [wrapper]);
```

---

## NextJS Deployment API

### Vercel Configuration

Optimized configuration for Vercel deployment.

```json
// vercel.json
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

### Static Generation Considerations

NextJS static generation compatibility notes.

```typescript
// For ISR pages with Mol*
export const revalidate = 60; // Revalidate every minute

export async function generateStaticParams() {
    // Pre-generate common structure pages
    return [
        { structureId: '1tqn' },
        { structureId: '4hhb' },
    ];
}
```

---

## TypeScript Definitions for NextJS

### NextJS-Specific Type Exports

```typescript
// Main NextJS types
export type { MolstarConfig, NextJSMolstarError };
export type { MolstarViewerProps, UseMolstarOptions };

// NextJS component types
export type { MolstarErrorBoundaryProps };

// NextJS hook return types
export type { UseMolstarReturn };
```

### NextJS Page Component Types

```typescript
// App Router page props
interface PageProps {
    params: { structureId: string };
    searchParams: { [key: string]: string | string[] | undefined };
}

// Pages Router page props
interface ViewerPageProps {
    structureId: string;
    initialStructureUrl?: string;
}
```

This API reference provides all the NextJS-specific interfaces and functions needed to build custom Mol* libraries optimized for NextJS applications, including both App Router and Pages Router patterns.