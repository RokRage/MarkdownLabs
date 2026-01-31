# <img src="public/pwa-192x192.png" alt="Markdown Lab Logo" height="45" style="vertical-align: middle;"> Markdown Labs

Markdown Lab is a modern, lightweight Markdown editor and PDF converter built with **Vanilla JavaScript** and **Vite**. 

It provides a distraction-free writing environment with real-time preview, high-quality PDF generation, and mobile optimization.

## Features

- **Real-time Preview**: Instantly see your Markdown rendered as you type.
- **PDF Export**: Convert your documents to PDF with a custom page selection modal.
- **Theme Customization**: 
    - Multiple font choices (Merriweather, Inter, Lora, Roboto, Open Sans).
    - Adjustable font size.
    - **Eco Mode**: High-contrast, ink-saving mode for printing.
- **Mobile Optimized**: Responsive design with a dedicated tabbed interface for editing on smaller screens.
- **Privacy Focused**: All processing happens locally in your browser.

## Technology Stack

- **Vite**: Ultra-fast build tool and dev server.
- **Vanilla JavaScript**: Zero-framework overhead for maximum performance.
- **Marked**: Fast markdown parser.
- **DOMPurify**: Security sanitation for HTML.
- **html2pdf.js** & **pdf-lib**: Powerful PDF generation and manipulation.
- **Google Material Symbols**: Modern, scalable UI icons.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd markdown-lab
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## License

MIT
