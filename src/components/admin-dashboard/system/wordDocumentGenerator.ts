
/**
 * Utility function to generate and download a Word document
 * This is a simple implementation using HTML to create a basic Word document
 */
export const generateWordDocument = async (
  title: string,
  contentSections: string[]
): Promise<void> => {
  try {
    // Create HTML content for Word document
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Calibri', sans-serif;
            margin: 1cm;
          }
          h1 {
            color: #2a4365;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
          }
          h2 {
            color: #3182ce;
            margin-top: 20px;
          }
          pre {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #e2e8f0;
            font-family: 'Courier New', monospace;
            overflow: auto;
          }
          .section {
            margin-bottom: 20px;
          }
          @page {
            size: A4;
            margin: 2cm;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="content">
          ${contentSections.map(section => `<div class="section">${
            section
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/```bash\n([\s\S]*?)```/g, '<pre>$1</pre>')
              .replace(/\n/g, '<br>')
          }</div>`).join('')}
        </div>
      </body>
      </html>
    `;

    // Create Blob from HTML content
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    
    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.doc`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error('Failed to generate document');
  }
};
