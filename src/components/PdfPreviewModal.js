import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export class PdfPreviewModal {
  constructor(container, onSave, onClose) {
    this.container = container;
    this.onSave = onSave;
    this.onClose = onClose;
    this.pdfBlob = null;
    this.pageCount = 0;
    this.selectedPages = new Set();
    this.thumbnails = {};
    
    this.element = this.createModalStructure();
    this.container.appendChild(this.element);
    
    // Bind methods
    this.handleClose = this.handleClose.bind(this);
    this.handleSave = this.handleSave.bind(this);
    
    // Attach Global Events (close on click outside)
    // this.element.addEventListener('click', (e) => {
    //   if (e.target === this.element) this.handleClose();
    // });
  }

  createModalStructure() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    // Hidden by default
    overlay.style.display = 'none';

    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Select Pages</h2>
          <button class="btn-close"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div class="modal-body">
           <div class="thumbnails-grid"></div>
        </div>
        <div class="modal-footer">
          <div class="selection-info">0 pages selected</div>
          <div class="modal-actions">
            <button class="btn-secondary btn-cancel">Cancel</button>
            <button class="btn-primary btn-save">Download PDF</button>
          </div>
        </div>
      </div>
    `;

    // Add Event Listeners
    overlay.querySelector('.btn-close').addEventListener('click', () => this.handleClose());
    overlay.querySelector('.btn-cancel').addEventListener('click', () => this.handleClose());
    overlay.querySelector('.btn-save').addEventListener('click', () => this.handleSave());

    return overlay;
  }

  async open(pdfBlob) {
    this.pdfBlob = pdfBlob;
    this.element.style.display = 'flex';
    this.renderLoadingState();
    
    try {
      await this.loadPdf(pdfBlob);
    } catch (err) {
      console.error("Error loading PDF preview:", err);
      this.renderErrorState(`Failed to load PDF preview: ${err.message}`);
    }
  }

  handleClose() {
    this.element.style.display = 'none';
    this.pdfBlob = null;
    this.selectedPages.clear();
    this.thumbnails = {};
    if (this.onClose) this.onClose();
  }

  renderLoadingState() {
     const grid = this.element.querySelector('.thumbnails-grid');
     grid.innerHTML = '<div class="loading-spinner"></div>';
  }

  renderErrorState(msg) {
    const body = this.element.querySelector('.modal-body');
    body.innerHTML = `
      <div style="color: red; textAlign: center; padding: 2rem">
        <h3>Error</h3>
        <p>${msg}</p>
      </div>
    `;
  }

  async loadPdf(pdfBlob) {
    const url = URL.createObjectURL(pdfBlob);
    try {
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      this.pageCount = pdf.numPages;

      // Reset selection
      this.selectedPages = new Set();
      for (let i = 1; i <= pdf.numPages; i++) {
        this.selectedPages.add(i);
      }

      // Render Grid Shell immediately
      this.renderGrid();
      this.updateSelectionInfo();

      // Generate Thumbnails
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            this.thumbnails[i] = canvas.toDataURL();
            this.updateThumbnail(i);
        } catch (pageErr) {
            console.error(`Error rendering page ${i}`, pageErr);
        }
      }

    } finally {
        URL.revokeObjectURL(url);
    }
  }

  renderGrid() {
      const body = this.element.querySelector('.modal-body');
      body.innerHTML = '<div class="thumbnails-grid"></div>';
      const grid = body.querySelector('.thumbnails-grid');

      for (let i = 1; i <= this.pageCount; i++) {
          const card = document.createElement('div');
          card.className = 'thumbnail-card selected'; // All selected initially
          card.dataset.page = i;
          
          card.innerHTML = `
            <div class="thumbnail-image-wrapper">
                <div class="loading-spinner"></div> 
                <div class="checkbox-overlay">
                    <input type="checkbox" checked readonly />
                </div>
            </div>
            <span class="page-number">Page ${i}</span>
          `;
          
          card.addEventListener('click', () => this.togglePage(i, card));
          grid.appendChild(card);
      }
  }

  updateThumbnail(pageIndex) {
      const card = this.element.querySelector(`.thumbnail-card[data-page="${pageIndex}"]`);
      if (card && this.thumbnails[pageIndex]) {
          const wrapper = card.querySelector('.thumbnail-image-wrapper');
          // Start with spinner removal if we want, but innerHTML replace works
          // Keep checkbox overlay
          const isSelected = this.selectedPages.has(pageIndex);
          wrapper.innerHTML = `
            <img src="${this.thumbnails[pageIndex]}" alt="Page ${pageIndex}" />
            <div class="checkbox-overlay">
                <input type="checkbox" ${isSelected ? 'checked' : ''} readonly />
            </div>
          `;
      }
  }

  togglePage(pageIndex, cardElement) {
      if (this.selectedPages.has(pageIndex)) {
          this.selectedPages.delete(pageIndex);
          cardElement.classList.remove('selected');
          cardElement.classList.add('deselected');
          cardElement.querySelector('input').checked = false;
      } else {
          this.selectedPages.add(pageIndex);
          cardElement.classList.add('selected');
          cardElement.classList.remove('deselected');
          cardElement.querySelector('input').checked = true;
      }
      this.updateSelectionInfo();
  }

  updateSelectionInfo() {
      const info = this.element.querySelector('.selection-info');
      info.textContent = `${this.selectedPages.size} of ${this.pageCount} pages selected`;
  }

  async handleSave() {
    if (this.selectedPages.size === 0) {
        alert("Please select at least one page.");
        return;
    }
    
    try {
        const pdfBytes = await this.pdfBlob.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const newPdf = await PDFDocument.create();
        
        const sortedPages = Array.from(this.selectedPages).sort((a,b) => a - b);
        const indicesToCopy = sortedPages.map(p => p - 1);
        
        const copiedPages = await newPdf.copyPages(pdfDoc, indicesToCopy);
        copiedPages.forEach(p => newPdf.addPage(p));
        
        const newPdfBytes = await newPdf.save();
        const newBlob = new Blob([newPdfBytes], { type: 'application/pdf' });
        
        this.onSave(newBlob);
        this.handleClose();
    } catch(err) {
        console.error("Error saving PDF:", err);
        alert("Failed to save PDF.");
    }
  }

  destroy() {
      this.container.removeChild(this.element);
  }
}
