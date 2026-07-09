/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Cycles make the editor architecture hard to change safely.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment: 'Imports must resolve through TypeScript or package metadata.',
      from: {},
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment: 'Domain code must stay independent from React, browser APIs, Vite, and outer layers.',
      from: {
        path: '^src/domain/',
      },
      to: {
        pathNot: '^src/domain/',
      },
    },
    {
      name: 'application-depends-only-inward',
      severity: 'error',
      comment: 'Application use cases may depend on domain and shared utilities, not UI or infrastructure.',
      from: {
        path: '^src/application/',
      },
      to: {
        pathNot: '^src/(application|domain|shared)/',
      },
    },
    {
      name: 'infrastructure-does-not-reach-ui',
      severity: 'error',
      comment: 'Infrastructure adapters can use domain/shared contracts, but must not depend on UI or use cases.',
      from: {
        path: '^src/infrastructure/',
      },
      to: {
        pathNot: '^src/(infrastructure|domain|shared)/',
      },
    },
    {
      name: 'shared-stays-low-level',
      severity: 'error',
      comment: 'Shared utilities must stay reusable and avoid depending on product layers.',
      from: {
        path: '^src/shared/',
      },
      to: {
        pathNot: '^src/(shared|domain)/',
      },
    },
    {
      name: 'lower-layers-do-not-import-presentation',
      severity: 'error',
      comment: 'Presentation is an outer adapter; lower layers must not import React UI modules.',
      from: {
        path: '^src/(domain|application|infrastructure|shared)/',
      },
      to: {
        path: '^src/presentation/',
      },
    },
    {
      name: 'presentation-does-not-import-app-shell',
      severity: 'error',
      comment: 'Editor UI should not depend on the app shell or route bootstrap.',
      from: {
        path: '^src/presentation/',
      },
      to: {
        path: '^src/app/',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: ['node_modules'],
    },
    includeOnly: ['^src'],
    moduleSystems: ['es6'],
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
  },
};
