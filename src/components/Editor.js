export class Editor {
  constructor(container, initialValue, onChange) {
    this.container = container;
    this.onChange = onChange;
    
    this.element = document.createElement('div');
    this.element.className = 'editor-pane no-print';
    
    this.textarea = document.createElement('textarea');
    this.textarea.className = 'editor-textarea';
    this.textarea.value = initialValue;
    this.textarea.placeholder = '# Start writing your story here...';
    this.textarea.spellcheck = false;
    
    this.textarea.addEventListener('input', (e) => {
      this.onChange(e.target.value);
    });
    
    this.element.appendChild(this.textarea);
    this.container.appendChild(this.element);
  }
  
  updateValue(newValue) {
    if (this.textarea.value !== newValue) {
      this.textarea.value = newValue;
    }
  }
  
  destroy() {
    this.container.removeChild(this.element);
  }
}
