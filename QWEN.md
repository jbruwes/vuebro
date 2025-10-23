# VueBro Project Context

## Project Overview

VueBro is an open-source, free web editor for creating websites built with the Quasar framework and Vue.js. It allows users to create dynamic Vue-based websites with runtime compilation of Vue single-file components (SFCs) without a development environment setup. The application supports both web-based usage and desktop distribution via an Electron app.

Key features include:
- Runtime compilation of Vue SFCs directly in the browser
- Monaco editor (VS Code's editor) with Volar.js for Vue component editing
- Built-in Tailwind CSS support
- S3 cloud storage integration for saving websites
- WYSIWYG mode for HTML-free static page creation
- SEO optimization for search engine indexing
- Import map support for external libraries
- AI integration with Mistral API support

## Architecture

The project is built using:
- **Vue.js 3**: Progressive JavaScript framework with Composition API and TypeScript
- **Quasar Framework**: Cross-platform Vue.js framework for building responsive applications
- **UnoCSS**: On-demand atomic CSS engine
- **Monaco Editor**: VS Code's editor component for code editing
- **Electron**: For desktop application packaging
- **AWS SDK**: For S3 storage integration
- **TypeScript**: For enhanced type safety and development experience

The project follows a Quasar application structure with:
- `src/` - Main application source code
- `src-electron/` - Electron-specific main process code
- Component-based architecture with Pug templates
- Stores for state management using Quasar's store system
- Internationalization support (i18n)

## Directory Structure

```
vuebro/
├── src/                    # Main application source
│   ├── assets/            # Static assets
│   ├── boot/              # Application boot files
│   ├── components/        # Vue components
│   ├── css/               # CSS styles
│   ├── i18n/              # Internationalization files
│   ├── pages/             # Route components
│   ├── router/            # Router configuration
│   ├── stores/            # State management stores
│   ├── App.vue            # Main application component
│   └── ...                # Other core files
├── src-electron/          # Electron-specific code
├── quasar.config.ts       # Quasar build configuration
├── uno.config.ts          # UnoCSS configuration
├── package.json           # Project dependencies and scripts
└── ...                    # Other configuration files
```

## Building and Running

### Development
```bash
# Install dependencies
npm install

# Start web development server
npm run dev

# Start Electron development server
npm run dev:electron
```

### Production Builds
```bash
# Build for web
npm run build

# Build for Electron
npm run build:electron
```

### Additional Commands
```bash
# Lint code
npm run lint
```

## Development Conventions

- **Code Style**: The project uses Prettier and ESLint for code formatting and linting
- **Templates**: Pug is used as the template engine for Vue components
- **Styling**: UnoCSS is used for atomic CSS with custom presets
- **State Management**: Quasar stores are used for state management
- **Internationalization**: Vue I18n is integrated for translation support
- **Type Safety**: Strict TypeScript configuration is enforced

## Key Dependencies

- **Core**: Vue 3, Quasar, TypeScript
- **Editors**: Monaco Editor, @vuebro/monaco-sfc
- **Styling**: UnoCSS, Tailwind CSS
- **Cloud**: AWS SDK (S3), @smithy/fetch-http-handler
- **Utilities**: VueUse, DOMPurify, Shiki (syntax highlighting)
- **AI**: ai, @ai-sdk/mistral
- **Electron**: electron, @electron/remote

## Special Features

- **Runtime SFC Compilation**: Vue components are compiled at runtime in the browser
- **Direct S3 Integration**: Projects can be saved and loaded directly from S3 storage
- **AI Assistance**: Integration with Mistral AI for code assistance
- **WYSIWYG Editing**: Visual editor mode for users without HTML knowledge
- **Cross-Platform**: Available as web app and desktop application
- **SEO Ready**: Built-in support for search engine optimization

## Project Notes

- License: AGPL-3.0-or-later
- The project uses virtual UnoCSS styles via `virtual:uno.css`
- The runtime is copied to the `dist` folder during the build process
- Browser support targets modern browsers (ES2022+)
- The app supports both web and desktop deployment through the same codebase

## Quick Start for Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Prepare the Quasar app: `npm run postinstall`
4. Start development: `npm run dev` for web or `npm run dev:electron` for desktop
5. The application will be available at the URL displayed in the terminal

This context should help with understanding the VueBro project for any future development, debugging, or feature implementation tasks.