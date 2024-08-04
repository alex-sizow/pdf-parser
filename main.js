import './style.css'
import { PDFViewerComponent } from './src/PDFViewerComponent.js'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>PDF Viewer</h1>
    <pdf-viewer></pdf-viewer>
  </div>
`