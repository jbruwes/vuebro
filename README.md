# VueBro - Vue.js Web Editor

[![vuebro](https://snapcraft.io/vuebro/badge.svg)](https://snapcraft.io/vuebro)

VueBro is an open-source and free web editor for creating websites using Vue.js technology. It allows users to create static websites with Vue single-file components (SFCs) without installing or setting up a development environment like Node.js or Vite. The application runs directly in the browser with no need for server-side rendering.

## :globe_with_meridians: Project Website

[https://vuebro.github.io](https://vuebro.github.io)

## :rocket: Key Features

- **Runtime Vue SFC Compilation**: Create Vue single-file components (`.vue` files) without a preliminary build step. Compilation occurs in the browser at runtime.
- **WYSIWYG Mode**: Create static websites without HTML knowledge using the visual editor.
- **Monaco Editor**: Uses the same editor as Microsoft VS Code with Volar.js pre-installed for editing Vue components.
- **Tailwind CSS Support**: Out-of-the-box support for Tailwind CSS classes without additional configuration.
- **External Module Import**: Import external libraries and frameworks directly from services like jsDelivr and UNPKG.
- **Multiple Storage Options**: Edit websites locally or connect to S3 storage.
- **SEO Optimized**: Built-in mechanisms for search engine indexing of generated websites.
- **Composition API + TypeScript**: Full support for modern Vue.js development practices.
- **Cross-Platform**: Available for Windows, macOS, Linux as desktop application.

## :framed_picture: Screenshots

[<img src="https://vuebro.github.io/images/screenshots/1.png" alt="screenshot 1" width="250"/>](https://vuebro.github.io/images/screenshots/1.png)
[<img src="https://vuebro.github.io/images/screenshots/2.png" alt="screenshot 2" width="250"/>](https://vuebro.github.io/images/screenshots/2.png)
[<img src="https://vuebro.github.io/images/screenshots/3.png" alt="screenshot 3" width="250"/>](https://vuebro.github.io/images/screenshots/3.png)
[<img src="https://vuebro.github.io/images/screenshots/4.png" alt="screenshot 4" width="250"/>](https://vuebro.github.io/images/screenshots/4.png)
[<img src="https://vuebro.github.io/images/screenshots/5.png" alt="screenshot 5" width="250"/>](https://vuebro.github.io/images/screenshots/5.png)
[<img src="https://vuebro.github.io/images/screenshots/6.png" alt="screenshot 6" width="250"/>](https://vuebro.github.io/images/screenshots/6.png)

## :gear: Tech Stack

- **Framework**: Vue 3 with Quasar Framework
- **Build Tool**: Vite
- **Styling**: UnoCSS (with Tailwind CSS compatibility)
- **Editor**: Monaco Editor (VS Code's editor)
- **Language**: TypeScript
- **State Management**: VueUse composition utilities
- **Internationalization**: Vue I18n
- **Package Manager**: npm

## :floppy_disk: Download the Latest Version

[<kbd><br> Get exe for <br><br> <strong>Windows<strong> <br><br></kbd>](https://github.com/vuebro/vuebro/releases/latest)
[<kbd><br> Get dmg for <br><br> <strong>macOS<strong> <br><br></kbd>](https://github.com/vuebro/vuebro/releases/latest)
[<kbd><br> Get AppImage for <br><br> <strong>Linux<strong> <br><br></kbd>](https://github.com/vuebro/vuebro/releases/latest)
[<kbd><br> Get snap for <br><br> <strong>Linux<strong> <br><br></kbd>](https://snapcraft.io/vuebro)

Or access the web application at [vuebro.github.io/vuebro](https://vuebro.github.io/vuebro)

## :computer: Development Setup

### Prerequisites

- Node.js (latest LTS version recommended)
- npm package manager

### Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/vuebro/vuebro.git
   cd vuebro
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Running as Desktop Application

To run VueBro as a desktop application during development:

```bash
npm run dev:electron
```

### Building for Production

To build for web:

```bash
npm run build
```

To build for desktop:

```bash
npm run build:electron
```

## :wrench: Project Structure

```
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

## :building_construction: Architecture

VueBro follows a modern Vue 3 architecture with the following key components:

- **State Management**: Uses Vue's reactivity system with stores organized in `src/stores/` directory
- **Data Storage**: Supports both S3 storage and local file system access (FSA) API
- **Vue SFC Compilation**: Runtime compilation of Vue single-file components using @vuebro/monaco-sfc
- **SEO Support**: Generates proper meta tags, sitemaps, and JSON-LD for search engine optimization
- **Internationalization**: Built-in i18n support with language files in `src/i18n/`

### Main Stores

- `app.ts` - Application state management
- `io.ts` - Input/output operations (S3 and file system API)
- `s3.ts` - S3 storage integration
- `fsa.ts` - File System Access API integration
- `defaults.ts` - Shared constants and defaults

## :microscope: Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run dev:electron` - Development mode for Electron app
- `npm run build:electron` - Build Electron app
- `npm run lint` - Run ESLint for code linting

## :handshake: Contributing

We welcome contributions from the community! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use Pug template syntax throughout components
- Follow ESLint rules with custom configuration from `@vuebro/configs`
- Use UnoCSS for styling with Tailwind-like utility classes
- Maintain TypeScript strict mode configuration
- Organize components by feature/function in respective directories

## :lock: License

This project is licensed under the AGPL License - see the [LICENSE](LICENSE) file for details.

> [!NOTE]
>
> <img src="https://vuebro.github.io/images/drakkar.svg" alt="drakkar" width="250"/>
>
> Made on the shores of the Baltic Sea

## :mega: Special Notes

- VueBro is a non-commercial, open-source project
- No server-side rendering needed - all compilation happens in the browser
- Works with GitHub Pages as an excellent hosting option
- Special attention to search engine optimization mechanisms
- Supports external module imports from CDNs like jsDelivr and UNPKG
