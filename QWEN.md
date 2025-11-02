# VueBro Project Context

## Project Overview

VueBro is an open-source web editor for creating websites using Vue.js technology. It allows users to create static websites with Vue single-file components (SFCs) without installing or setting up a development environment like Node.js or Vite. The application runs directly in the browser with no need for server-side rendering.

**Key Features:**

- Runtime compilation of Vue SFCs in the browser
- WYSIWYG mode for users without HTML knowledge
- Monaco editor (same as VS Code) with Volar.js pre-installed for editing Vue components
- Built-in Tailwind CSS support
- Import of external modules directly from services like jsDelivr and UNPKG
- S3 storage integration for saving websites
- SEO mechanisms for search engine indexing
- Support for Composition API with TypeScript
- Multiple deployment options (Windows, macOS, Linux, web)

## Technology Stack

- **Framework**: Vue 3 with Quasar Framework
- **Build Tool**: Vite
- **Styling**: UnoCSS (with Tailwind CSS support)
- **Editor**: Monaco Editor (VS Code's editor)
- **Language**: TypeScript
- **State Management**: VueUse composition utilities
- **Internationalization**: Vue I18n
- **Package Manager**: npm

## Project Structure

```text
vuebro/
├── src/
│   ├── assets/          # Static assets
│   ├── boot/           # Application boot files
│   ├── components/     # Vue components
│   ├── css/           # CSS styles
│   ├── i18n/          # Internationalization files
│   ├── pages/         # Route components
│   ├── router/        # Routing configuration
│   ├── stores/        # State management (VueUse/Pinia stores)
│   ├── App.vue        # Main application component
│   ├── env.d.ts       # TypeScript declaration file
│   └── global.d.ts    # Global TypeScript declarations
├── public/            # Public assets
├── package.json       # Dependencies and scripts
├── quasar.config.ts   # Quasar framework configuration
├── uno.config.ts      # UnoCSS configuration
├── tsconfig.json      # TypeScript configuration
└── index.html         # Main HTML entry point
```

## Key Components

### Main Stores

- `app.ts` - Application state management
- `io.ts` - Input/output operations (S3 and file system API)
- `s3.ts` - S3 storage integration
- `fsa.ts` - File System Access API integration
- `defaults.ts` - Shared constants and defaults

### UI Components

- `VWysiwyg.vue` - WYSIWYG editor component
- `VSourceCode.vue` - Source code editing component
- `VInteractiveTree.vue` - Interactive tree component
- `dialogs/` - Various dialog components for different functions

## Build & Development Commands

The project uses Quasar CLI for development and building:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run dev:electron` - Development mode for Electron app
- `npm run build:electron` - Build Electron app
- `npm run lint` - Run ESLint for code linting

## Architecture Notes

1. **State Management**: Uses Vue's reactivity system with stores organized in the `src/stores/` directory.
2. **Data Storage**: Supports both S3 storage and local file system access (FSA) API for saving projects.
3. **Vue SFC Compilation**: Runtime compilation of Vue single-file components using monaco-sfc.
4. **SEO Support**: Generates proper meta tags, sitemaps, and JSON-LD for search engine optimization.
5. **Internationalization**: Built-in i18n support with language files in `src/i18n/`.

## Development Conventions

- Uses Pug template syntax throughout components
- ESLint with custom configuration from `@vuebro/configs`
- UnoCSS for styling with Tailwind-like utility classes
- TypeScript strict mode configuration
- Component organization by feature/function in respective directories

## Key Dependencies

- Vue 3.x with Composition API
- Quasar Framework 2.x
- Monaco Editor for code editing
- UnoCSS for styling
- @vuebro/runtime - Runtime compilation of Vue SFCs
- AWS SDK for S3 integration
- VueUse for utility functions
- Electron for desktop application support

## Development Workflow

1. The application starts with the `App.vue` component
2. Boot files in `src/boot/` initialize different parts of the application
3. Routing is handled through `src/router/`
4. State is managed through reactive stores in `src/stores/`
5. UI components are in `src/components/`
6. Internationalization is managed in `src/i18n/`
