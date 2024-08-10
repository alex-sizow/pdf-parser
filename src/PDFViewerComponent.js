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
          const contentArray = textContent.items.map(item => item.str);

          console.log('Full content array:', contentArray);

          // Функция для извлечения элементов массива между маркерами
          function extractElements(content) {
            const startMarker = '(From';
            const endMarker = 'Foreman Remarks';

            const startIndex = content.findIndex(item => item.includes(startMarker));
            const endIndex = content.findIndex(item => item.includes(endMarker));

            console.log('Start marker index:', startIndex, content[startIndex]);
            console.log('End marker index:', endIndex);

            if (startIndex === -1 || endIndex === -1) {
              console.log('One or both markers not found');
              return [];
            }

            return content.slice(startIndex + 1, endIndex);
          }

          const extractedContents = extractElements(contentArray);

          console.log('Extracted contents:', extractedContents);

          // Add page content to output
          output.pages.push({
            pageNumber: i,
            content: extractedContents
          });

          if (i === 1) {
            return;
          }
        }

        console.log(output)


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
