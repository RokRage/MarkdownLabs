import { marked } from 'marked';
import DOMPurify from 'dompurify';

export class Preview {
  constructor(container, initialContent, initialFont, initialFontSize) {
    this.container = container;
    
    this.element = document.createElement('div');
    this.element.className = 'preview-pane preview-container';
    
    this.markdownBody = document.createElement('div');
    this.markdownBody.className = 'markdown-body';
    
    this.updateStyle(initialFont, initialFontSize);
    this.updateContent(initialContent);
    
    this.element.appendChild(this.markdownBody);
    this.container.appendChild(this.element);
  }
  
  updateContent(markdown) {
    const rawMarkup = marked.parse(markdown);
    const cleanMarkup = DOMPurify.sanitize(rawMarkup);
    this.markdownBody.innerHTML = cleanMarkup;
  }
  
  updateStyle(fontFamily, fontSize) {
    this.markdownBody.style.fontFamily = fontFamily;
    this.markdownBody.style.fontSize = `${fontSize}px`;
  }
  
  getElement() {
    return this.markdownBody;
  }
  
  destroy() {
    this.container.removeChild(this.element);
  }
}
