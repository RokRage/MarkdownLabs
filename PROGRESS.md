# Project Progress & Structure

## Project Overview
**Markdown Lab** (formerly Markdown2PDF) is a lightweight, Vanilla JS-based Markdown editor and PDF converter. It has been migrated from a React codebase to a pure DOM-based architecture using Vite for improved performance and simplicity.

## Current Status
- **Status**: ✅ Active / Stable
- **Version**: 1.0.0 (Migration Complete)
- **Last Update**: Rebranding & Mobile Optimization

## Project Structure

```text
/
├── public/
│   └── logo.svg             # Application Icon (Vector)
├── src/
│   ├── components/
│   │   ├── Editor.js        # Markdown editing logic (Textarea)
│   │   ├── Preview.js       # Markdown rendering (Marked + DOMPurify)
│   │   └── PdfPreviewModal.js # PDF generation & page selection (html2pdf + pdf-lib)
│   ├── main.js              # Entry point: State management, Layout, Event handling
│   └── index.css            # Global styles (Tailored CSS, Mobile Responsive)
├── index.html               # Main HTML entry point
├── package.json             # Dependencies (No React, only Utils)
└── vite.config.js           # Build configuration
```

## Recent Progress

### 1. Migration to Vanilla JS
- [x] **Removed React Dependencies**: Eliminated `react`, `react-dom`, and build plugins.
- [x] **Ported Components**: Converted JSX components to ES6 Classes (`Editor`, `Preview`, `PdfPreviewModal`).
- [x] **State Management**: Implemented centralized state in `main.js` (Markdown content, Fonts, Eco Mode).

### 2. Mobile Optimization
- [x] **Responsive Layout**: Added CSS media queries for `<768px` devices.
- [x] **Tabs**: Implemented Editor/Preview toggle tabs for mobile view.
- [x] **Header Redesign**: Stacked controls and full-width branding on smaller screens.
- [x] **Touch Targets**: Standardized control heights to `38px` for better touch usability.

### 3. Branding (Markdown Lab)
- [x] **Rebrand**: Updated App Name and Metallic/Lab aesthetic.
- [x] **Visual Identity**: Created custom "Science Flask" SVG logo in Indigo/Purple gradient.
- [x] **Icons**: Integrated Google Material Symbols for a modern, consistent look.
- [x] **Documentation**: Updated README with accurate tech stack and feature list.

### 4. Offline Support (PWA)
- [x] **Service Worker**: Implemented caching for offline access.
- [x] **Installable**: Added Web App Manifest with custom icons.
- [x] **Assets**: Generated homescreen icons (192px/512px).

## Next Steps
- [ ] Syntax highlighting improvements.
- [ ] Export to other formats (HTML, Plain Text).
