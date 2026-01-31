import './index.css';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import html2pdf from 'html2pdf.js';

const FONTS = [
  { name: 'Merriweather', value: "'Merriweather', serif" },
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Lora', value: "'Lora', serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
];

const DEFAULT_MARKDOWN = `# Welcome to Your Beautiful Editor

This is a simple, elegant Markdown editor. 

## Features
- **Live Preview**: See your changes instantly.
- **Print Friendly**: Just click the print button to get a clean PDF.
- **Lovely Design**: Crafted for focus and readability.

> "Simplicity is the ultimate sophistication." - Leonardo da Vinci

Try writing some code:

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

Or a list:
1. Write 
2. Print
3. Enjoy
`;

// Import Service Worker registration (only available if using vite-plugin-pwa)
import { registerSW } from 'virtual:pwa-register'

class App {
    constructor() {
        this.root = document.getElementById('app');
        this.state = {
            markdown: localStorage.getItem('markdown-content') || DEFAULT_MARKDOWN,
            fontFamily: localStorage.getItem('font-family') || 'Inter',
            fontSize: parseInt(localStorage.getItem('font-size') || '16', 10),
            isEcoMode: localStorage.getItem('eco-mode') === 'true',
            viewMode: 'split' // 'split', 'editor', 'preview' (for mobile)
        };

        this.init();
        
        // Register Service Worker for PWA
        this.updateSW = registerSW({
            onNeedRefresh() {
                // Show a prompt to user if a new version is available
                if (confirm('New content available. Reload?')) {
                    this.updateSW(true);
                }
            },
            onOfflineReady() {
                console.log('App ready to work offline');
            },
        });
    }

    init() {
        this.renderLayout();
        this.initComponents();
        this.attachHeaderListeners();
        this.applyTheme();
    }

    renderLayout() {
        this.root.innerHTML = `
            <div class="app-container" id="main-container">
                <header class="app-header no-print">
                    <div class="header-row-1">
                        <div class="brand">
                            <img src="/pwa-192x192.png" alt="Logo" class="brand-logo" />
                            <h1>Markdown Labs</h1>
                        </div>
                        <div class="header-actions">
                            <button class="btn-secondary" id="btn-print" title="Print">
                                <span class="material-symbols-outlined">print</span>
                                <span class="text">Print</span>
                            </button>
                            <button class="btn-print" id="btn-save-pdf" title="Save PDF">
                                <span class="material-symbols-outlined">picture_as_pdf</span>
                                <span class="text">Save</span>
                            </button>
                        </div>
                    </div>
                    <div class="header-row-2">
                        <div class="header-controls">
                            <select class="control-select" id="font-select">
                                ${FONTS.map(f => `<option value="${f.value}" ${f.value === this.state.fontFamily ? 'selected' : ''}>${f.name}</option>`).join('')}
                            </select>
                            <div class="control-group">
                                <button class="btn-icon" id="btn-scale-down"><span class="material-symbols-outlined">remove</span></button>
                                <span class="control-value" id="font-size-display">${this.state.fontSize}px</span>
                                <button class="btn-icon" id="btn-scale-up"><span class="material-symbols-outlined">add</span></button>
                            </div>
                            <label class="toggle-label">
                                <input type="checkbox" id="eco-mode-toggle" ${this.state.isEcoMode ? 'checked' : ''} />
                                <span>Eco Mode</span>
                            </label>
                        </div>
                    </div>
                </header>

                <div class="mobile-tabs no-print">
                    <button class="mobile-tab active" data-view="editor">Editor</button>
                    <button class="mobile-tab" data-view="preview">Preview</button>
                </div>

                <main class="main-content mobile-view-editor" id="main-content"></main>
                <div id="modal-root"></div>
            </div>
        `;
    }

    initComponents() {
        const mainContent = document.getElementById('main-content');
        
        // Editor
        this.editor = new Editor(mainContent, this.state.markdown, (newVal) => {
            this.state.markdown = newVal;
            localStorage.setItem('markdown-content', newVal);
            this.preview.updateContent(newVal);
        });

        // Preview
        this.preview = new Preview(mainContent, this.state.markdown, this.state.fontFamily, this.state.fontSize);

        // Modal
        const modalRoot = document.getElementById('modal-root');
        this.pdfModal = new PdfPreviewModal(
            modalRoot, 
            (blob) => this.handleFinalSave(blob),
            () => {} // onClose callback if needed
        );
    }

    attachHeaderListeners() {
        // Mobile Tab Listeners
        const tabs = document.querySelectorAll('.mobile-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update UI state
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update Main Content Class
                const view = tab.dataset.view;
                const mainContent = document.getElementById('main-content');
                mainContent.classList.remove('mobile-view-editor', 'mobile-view-preview');
                mainContent.classList.add(`mobile-view-${view}`);
            });
        });

        // Font Family
        // Font Family
        document.getElementById('font-select').addEventListener('change', (e) => {
            this.state.fontFamily = e.target.value;
            localStorage.setItem('font-family', this.state.fontFamily);
            this.preview.updateStyle(this.state.fontFamily, this.state.fontSize);
        });

        // Font Size
        document.getElementById('btn-scale-down').addEventListener('click', () => {
            this.state.fontSize = Math.max(12, this.state.fontSize - 1);
            this.updateFontSize();
        });

        document.getElementById('btn-scale-up').addEventListener('click', () => {
             this.state.fontSize = Math.min(24, this.state.fontSize + 1);
             this.updateFontSize();
        });

        // Eco Mode
        document.getElementById('eco-mode-toggle').addEventListener('change', (e) => {
            this.state.isEcoMode = e.target.checked;
            this.applyTheme();
        });

        // Actions
        document.getElementById('btn-print').addEventListener('click', () => window.print());
        document.getElementById('btn-save-pdf').addEventListener('click', () => this.handleSaveAsPDF());
    }
    
    updateFontSize() {
        document.getElementById('font-size-display').textContent = `${this.state.fontSize}px`;
        localStorage.setItem('font-size', this.state.fontSize);
        this.preview.updateStyle(this.state.fontFamily, this.state.fontSize);
    }

    applyTheme() {
        const container = document.getElementById('main-container');
        if (this.state.isEcoMode) {
            container.classList.add('eco-mode');
        } else {
            container.classList.remove('eco-mode');
        }
    }

    handleSaveAsPDF() {
        // We target the markdown body specifically
        const element = document.querySelector('.markdown-body');
        
        const opt = {
          margin:       [10, 10],
          filename:     'document.pdf', 
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
            const blob = pdf.output('blob');
            this.pdfModal.open(blob);
        });
    }

    handleFinalSave(finalBlob) {
        const url = URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.pdf';
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Debug Error Handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.background = 'red';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.textContent = `Error: ${msg} at ${lineNo}:${columnNo}`;
  document.body.appendChild(errorDiv);
  return false;
};

// Start App
try {
    new App();
} catch (e) {
    console.error(e);
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '50px';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.background = 'darkred';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.zIndex = '9999';
    errorDiv.innerText = `Init Error: ${e.message}\n${e.stack}`;
    document.body.appendChild(errorDiv);
}
