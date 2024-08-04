import { resolvePDFJS } from 'pdfjs-serverless'

export class PDFViewerComponent extends HTMLElement {
  constructor () {
    super();
    this.attachShadow({ mode: 'open' });
    this.pdfjs = null;
  }

  async connectedCallback() {
    this.render();
    this.setupFileInput();
  }

  async logPDFInfo(pdf) {
    console.log('PDF Information:');
    console.log('Number of pages:', pdf.numPages);
    console.log('PDF Version:', pdf.version);
    console.log('Is Encrypted:', pdf.isEncrypted);


  }



  setupFileInput() {
    const fileInput = this.shadowRoot.getElementById('file-input');
    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file && file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        this.pdfjs = await resolvePDFJS();
        const pdf = await this.pdfjs.getDocument({ data: arrayBuffer }).promise;


        const metadata = await pdf.getMetadata()

        const output = {
          metadata,
          pages: []
        }

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const contentArray = [];
          for (let i = 0, len = textContent.items.length; i < len; i++) {
            contentArray.push(textContent.items[i].str);
          }
          const contents = contentArray.join(' ');

          // Add page content to output
          console.log(contents)
          output.pages.push({
            pageNumber: i,
            content: contents
          })
        }

        //console.log(output)


        // Вызываем метод для вывода информации о PDF
        this.logPDFInfo(pdf);

        // Остальной код для отображения PDF...
      }
    });
  }


  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        #pdf-content {
          border: 1px solid #ccc;
          padding: 10px;
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.5;
          max-height: 500px;
          overflow-y: auto;
        }
        #pdf-canvas {
          border: 1px solid #ccc;
          margin-top: 10px;
        }
      </style>
      <div>
        <input type="file" accept=".pdf" id="file-input">
        <div id="pdf-content"></div>
        <canvas id="pdf-canvas"></canvas>
      </div>
    `;
  }


}

customElements.define('pdf-viewer', PDFViewerComponent);
