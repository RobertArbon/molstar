# NextJS Mol* Examples

Complete working examples for building custom Mol* libraries specifically for NextJS applications, covering both App Router and Pages Router patterns.

## NextJS App Router Examples

### Basic App Router Integration

#### Project Structure
```
my-molstar-nextjs/
├── app/
│   ├── viewer/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── MolstarViewer.tsx
│   └── MolstarErrorBoundary.tsx
├── lib/
│   └── molstar.ts
├── styles/
│   └── molstar.css
├── next.config.js
├── package.json
└── .env.local
```

#### NextJS Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer, dev }) => {
        // WebAssembly support for Mol*
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
    output: 'standalone',
};

module.exports = nextConfig;
```

#### Root Layout with Error Boundary

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { MolstarErrorBoundary } from '../components/MolstarErrorBoundary';
import './globals.css';
import '../styles/molstar.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'NextJS Mol* Viewer',
    description: 'Molecular visualization with NextJS and Mol*',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <MolstarErrorBoundary>
                    {children}
                </MolstarErrorBoundary>
            </body>
        </html>
    );
}
```

#### Simple Viewer Page

```typescript
// app/viewer/page.tsx
import MolstarViewer from '../../components/MolstarViewer';

export default function ViewerPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Mol* Molecular Viewer
                </h1>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
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
                            className="border border-gray-300 rounded"
                        />
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                        <p>Viewing: Trp RNA-binding attenuation protein (1TQN)</p>
                        <p>Use mouse to rotate, scroll to zoom, right-click and drag to pan.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

### Dynamic Structure Loading

#### Interactive Viewer Page

```typescript
// app/interactive/page.tsx
'use client';

import { useState, useCallback } from 'react';
import MolstarViewer from '../../components/MolstarViewer';
import { MolstarWrapper, NextJSMolstarError } from '../../lib/molstar';

const SAMPLE_STRUCTURES = [
    { id: '1tqn', name: 'Trp RNA-binding protein', url: 'https://files.rcsb.org/view/1tqn.cif' },
    { id: '4hhb', name: 'Hemoglobin', url: 'https://files.rcsb.org/view/4hhb.cif' },
    { id: '1crn', name: 'Crambin', url: 'https://files.rcsb.org/view/1crn.cif' },
];

export default function InteractivePage() {
    const [customUrl, setCustomUrl] = useState('');
    const [wrapper, setWrapper] = useState<MolstarWrapper | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInit = useCallback((molstarWrapper: MolstarWrapper) => {
        setWrapper(molstarWrapper);
    }, []);

    const handleError = useCallback((error: NextJSMolstarError) => {
        setError(error.message);
        console.error('NextJS Mol* Error:', error);
    }, []);

    const loadStructure = async (url: string) => {
        if (!wrapper) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            await wrapper.loadStructure(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load structure');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomLoad = () => {
        if (customUrl.trim()) {
            loadStructure(customUrl.trim());
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Interactive Mol* Viewer
                </h1>

                {/* Controls Panel */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Load Structure</h2>
                    
                    {/* Sample Structures */}
                    <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">Sample Structures</h3>
                        <div className="flex flex-wrap gap-2">
                            {SAMPLE_STRUCTURES.map((structure) => (
                                <button
                                    key={structure.id}
                                    onClick={() => loadStructure(structure.url)}
                                    disabled={!wrapper || isLoading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {structure.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom URL */}
                    <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">Custom Structure URL</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="Enter structure URL (e.g., https://files.rcsb.org/view/1xyz.cif)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleCustomLoad}
                                disabled={!wrapper || !customUrl.trim() || isLoading}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Load
                            </button>
                        </div>
                    </div>

                    {/* Status */}
                    {isLoading && (
                        <div className="flex items-center text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Loading structure...
                        </div>
                    )}

                    {error && (
                        <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">
                            Error: {error}
                        </div>
                    )}
                </div>

                {/* Viewer */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="w-full h-[700px]">
                        <MolstarViewer 
                            onInit={handleInit}
                            onError={handleError}
                            config={{
                                showControls: true,
                                backgroundColor: 'white',
                                layout: {
                                    isExpanded: true,
                                    controlsDisplay: 'always'
                                }
                            }}
                            className="border border-gray-300 rounded"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

### API Route Integration

#### Structure Proxy API Route

```typescript
// app/api/structure/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PDB_BASE_URL = 'https://files.rcsb.org/view';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        
        // Validate PDB ID format
        if (!/^[1-9][A-Za-z0-9]{3}$/i.test(id)) {
            return NextResponse.json(
                { error: 'Invalid PDB ID format' },
                { status: 400 }
            );
        }

        const structureUrl = `${PDB_BASE_URL}/${id.toLowerCase()}.cif`;
        
        // Fetch structure with proper headers
        const response = await fetch(structureUrl, {
            headers: {
                'User-Agent': 'NextJS-Molstar-App/1.0',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Structure ${id} not found` },
                { status: response.status }
            );
        }

        const data = await response.text();

        return new NextResponse(data, {
            headers: {
                'Content-Type': 'chemical/x-cif',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### Using API Routes in Components

```typescript
// app/api-example/page.tsx
'use client';

import { useState } from 'react';
import MolstarViewer from '../../components/MolstarViewer';
import { MolstarWrapper } from '../../lib/molstar';

export default function APIExamplePage() {
    const [pdbId, setPdbId] = useState('1tqn');
    const [wrapper, setWrapper] = useState<MolstarWrapper | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadFromAPI = async () => {
        if (!wrapper || !pdbId) return;
        
        setIsLoading(true);
        try {
            // Use NextJS API route
            await wrapper.loadStructure(`/api/structure/${pdbId.toLowerCase()}`);
        } catch (error) {
            console.error('Failed to load via API:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">NextJS API Integration</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={pdbId}
                            onChange={(e) => setPdbId(e.target.value)}
                            placeholder="Enter PDB ID (e.g., 1tqn)"
                            className="px-3 py-2 border border-gray-300 rounded-md"
                            maxLength={4}
                        />
                        <button
                            onClick={loadFromAPI}
                            disabled={!wrapper || isLoading}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isLoading ? 'Loading...' : 'Load via API'}
                        </button>
                    </div>
                </div>

                <div className="w-full h-[600px]">
                    <MolstarViewer 
                        onInit={setWrapper}
                        config={{ showControls: true }}
                    />
                </div>
            </div>
        </div>
    );
}
```

## NextJS Pages Router Examples

### Basic Pages Router Setup

#### Custom App Component

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { MolstarErrorBoundary } from '../components/MolstarErrorBoundary';
import '../styles/globals.css';
import '../styles/molstar.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <MolstarErrorBoundary>
            <Component {...pageProps} />
        </MolstarErrorBoundary>
    );
}
```

#### Static Viewer Page

```typescript
// pages/viewer.tsx
import type { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import MolstarViewer from '../components/MolstarViewer';
import { MolstarWrapper } from '../lib/molstar';

interface Props {
    defaultStructure: string;
    structureName: string;
}

const ViewerPage: NextPage<Props> = ({ defaultStructure, structureName }) => {
    const [wrapper, setWrapper] = useState<MolstarWrapper | null>(null);

    return (
        <>
            <Head>
                <title>Mol* Viewer - {structureName}</title>
                <meta name="description" content={`Viewing ${structureName} with Mol*`} />
            </Head>

            <div style={{ minHeight: '100vh', padding: '1rem', backgroundColor: '#f5f5f5' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: 'bold' }}>
                        Mol* Viewer - {structureName}
                    </h1>
                    
                    <div style={{ 
                        backgroundColor: 'white', 
                        borderRadius: '8px', 
                        padding: '1rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ width: '100%', height: '600px' }}>
                            <MolstarViewer 
                                structureUrl={defaultStructure}
                                onInit={setWrapper}
                                config={{
                                    showControls: true,
                                    backgroundColor: '#ffffff'
                                }}
                            />
                        </div>
                        
                        {wrapper && (
                            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                                <p>Structure loaded: {structureName}</p>
                                <p>Controls: Mouse to rotate, scroll to zoom, right-click to pan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
    return {
        props: {
            defaultStructure: 'https://files.rcsb.org/view/1tqn.cif',
            structureName: 'Trp RNA-binding attenuation protein',
        },
        revalidate: 3600, // Revalidate every hour
    };
};

export default ViewerPage;
```

#### Dynamic Structure Pages

```typescript
// pages/structure/[id].tsx
import type { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import MolstarViewer from '../../components/MolstarViewer';
import { MolstarWrapper } from '../../lib/molstar';

interface Structure {
    id: string;
    name: string;
    description: string;
    url: string;
}

interface Props {
    structure: Structure;
}

const StructurePage: NextPage<Props> = ({ structure }) => {
    const router = useRouter();
    const [wrapper, setWrapper] = useState<MolstarWrapper | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (router.isFallback) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [router.isFallback]);

    if (router.isFallback) {
        return <div>Loading structure...</div>;
    }

    return (
        <>
            <Head>
                <title>{structure.name} - Mol* Viewer</title>
                <meta name="description" content={structure.description} />
            </Head>

            <div style={{ minHeight: '100vh', padding: '1rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>
                        {structure.name}
                    </h1>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        {structure.description}
                    </p>
                    
                    <div style={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '1rem'
                    }}>
                        <div style={{ width: '100%', height: '700px' }}>
                            <MolstarViewer 
                                structureUrl={structure.url}
                                onInit={setWrapper}
                                config={{
                                    showControls: true,
                                    layout: {
                                        isExpanded: true,
                                        controlsDisplay: 'always'
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    // Pre-generate pages for common structures
    const commonStructures = ['1tqn', '4hhb', '1crn', '2lyz'];
    
    const paths = commonStructures.map((id) => ({
        params: { id },
    }));

    return {
        paths,
        fallback: true, // Enable ISR for other structures
    };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
    const id = params?.id as string;
    
    // Simulate fetching structure metadata
    const structures: Record<string, Omit<Structure, 'id'>> = {
        '1tqn': {
            name: 'Trp RNA-binding attenuation protein',
            description: 'A protein that regulates tryptophan biosynthesis',
            url: 'https://files.rcsb.org/view/1tqn.cif',
        },
        '4hhb': {
            name: 'Human Hemoglobin',
            description: 'Oxygen-carrying protein in red blood cells',
            url: 'https://files.rcsb.org/view/4hhb.cif',
        },
        '1crn': {
            name: 'Crambin',
            description: 'Small plant seed protein, commonly used in crystallography',
            url: 'https://files.rcsb.org/view/1crn.cif',
        },
    };

    const structure = structures[id.toLowerCase()];
    
    if (!structure) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            structure: {
                id,
                ...structure,
            },
        },
        revalidate: 86400, // Revalidate daily
    };
};

export default StructurePage;
```

## Advanced NextJS Patterns

### Server Components with Client Boundaries

#### Server Component Layout

```typescript
// app/advanced/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Advanced Mol* Viewer',
    description: 'Advanced molecular visualization with NextJS Server Components',
};

// Server Component - can fetch data
async function getStructureList() {
    // This runs on the server
    return [
        { id: '1tqn', name: 'Trp RNA-binding protein' },
        { id: '4hhb', name: 'Hemoglobin' },
        { id: '1crn', name: 'Crambin' },
    ];
}

export default async function AdvancedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const structures = await getStructureList();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">
                                Advanced Mol* Viewer
                            </h1>
                        </div>
                        <nav className="flex items-center space-x-4">
                            {structures.map((structure) => (
                                <a
                                    key={structure.id}
                                    href={`/advanced/${structure.id}`}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    {structure.name}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}
```

#### Client Component with useMolstar Hook

```typescript
// app/advanced/[id]/ClientViewer.tsx
'use client';

import { useMolstar } from '../../../hooks/useMolstar';
import { useEffect } from 'react';

interface Props {
    structureUrl: string;
    structureName: string;
}

export default function ClientViewer({ structureUrl, structureName }: Props) {
    const { 
        containerRef, 
        wrapper, 
        isLoading, 
        error, 
        loadStructure 
    } = useMolstar({
        autoInit: true,
        showControls: true,
        backgroundColor: 'white',
    });

    useEffect(() => {
        if (wrapper && structureUrl) {
            loadStructure(structureUrl);
        }
    }, [wrapper, structureUrl, loadStructure]);

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="text-red-800 font-medium">Error loading structure</h3>
                <p className="text-red-600">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-2">{structureName}</h2>
                {isLoading && (
                    <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Loading molecular structure...
                    </div>
                )}
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
                <div 
                    ref={containerRef}
                    className="w-full h-[600px] border border-gray-300 rounded"
                />
            </div>
        </div>
    );
}
```

#### Server Component Page

```typescript
// app/advanced/[id]/page.tsx
import { notFound } from 'next/navigation';
import ClientViewer from './ClientViewer';

interface Props {
    params: { id: string };
}

// Server Component - can be async and fetch data
async function getStructureData(id: string) {
    const structures: Record<string, any> = {
        '1tqn': {
            name: 'Trp RNA-binding attenuation protein',
            url: 'https://files.rcsb.org/view/1tqn.cif',
            description: 'A protein that regulates tryptophan biosynthesis in bacteria.',
        },
        '4hhb': {
            name: 'Human Hemoglobin',
            url: 'https://files.rcsb.org/view/4hhb.cif',
            description: 'The oxygen-carrying protein found in red blood cells.',
        },
    };

    return structures[id.toLowerCase()] || null;
}

export default async function AdvancedStructurePage({ params }: Props) {
    const structure = await getStructureData(params.id);

    if (!structure) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {structure.name}
                </h1>
                <p className="text-gray-600 mt-2">
                    {structure.description}
                </p>
            </div>

            <ClientViewer 
                structureUrl={structure.url}
                structureName={structure.name}
            />
        </div>
    );
}

export async function generateStaticParams() {
    return [
        { id: '1tqn' },
        { id: '4hhb' },
        { id: '1crn' },
    ];
}
```

### Streaming and Suspense

#### Streaming Viewer Component

```typescript
// app/streaming/page.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const StreamingViewer = dynamic(
    () => import('./StreamingViewer'),
    { 
        ssr: false,
        loading: () => (
            <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading Mol* viewer...</p>
                </div>
            </div>
        )
    }
);

export default function StreamingPage() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Streaming Mol* Viewer</h1>
            
            <Suspense 
                fallback={
                    <div className="w-full h-[600px] bg-gray-50 rounded-lg animate-pulse" />
                }
            >
                <StreamingViewer />
            </Suspense>
        </div>
    );
}
```

### Production Deployment Example

#### Dockerfile for NextJS with Mol*

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build with optimizations for Mol*
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Package.json with Mol* Optimizations

```json
{
    "name": "nextjs-molstar-app",
    "version": "1.0.0",
    "private": true,
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "analyze": "ANALYZE=true next build"
    },
    "dependencies": {
        "next": "14.0.0",
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "molstar": "^4.0.0",
        "sass": "^1.69.0"
    },
    "devDependencies": {
        "@types/node": "^20.0.0",
        "@types/react": "^18.0.0",
        "@types/react-dom": "^18.0.0",
        "eslint": "^8.0.0",
        "eslint-config-next": "14.0.0",
        "typescript": "^5.0.0",
        "@next/bundle-analyzer": "^14.0.0"
    }
}
```

These examples provide complete, production-ready patterns for integrating Mol* into NextJS applications, covering both App Router and Pages Router approaches with proper SSR handling, error boundaries, and performance optimizations.