document.addEventListener('DOMContentLoaded', () => {
    const htmlInput = document.getElementById('htmlInput');
    const generateBtn = document.getElementById('generateBtn');
    const previewCard = document.getElementById('previewCard');
    const previewGrid = document.getElementById('previewGrid');
    const downloadLink = document.getElementById('downloadLink');

    generateBtn.addEventListener('click', async () => {
        const html = htmlInput.value.trim();
        if (!html) {
            alert('Por favor, pega el código HTML primero.');
            return;
        }

        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        previewCard.classList.add('hidden');
        previewGrid.innerHTML = '';

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ html })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en la generación');
            }

            const data = await response.json();

            if (data.success) {
                // 1. Renderizar previsualizaciones
                data.images.forEach((base64, index) => {
                    const img = document.createElement('img');
                    img.src = base64;
                    img.alt = `Slide ${index + 1}`;
                    img.title = `Slide ${index + 1} (2160x2160)`;
                    previewGrid.appendChild(img);
                });

                // 2. Configurar descarga del ZIP (recibido como base64)
                const binaryString = window.atob(data.zip);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/zip' });
                const url = window.URL.createObjectURL(blob);
                
                downloadLink.href = url;
                downloadLink.download = `carousel-${Date.now()}.zip`;
                
                previewCard.classList.remove('hidden');
                previewCard.scrollIntoView({ behavior: 'smooth' });
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error: ' + error.message);
        } finally {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    });
});
