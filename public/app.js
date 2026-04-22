document.addEventListener('DOMContentLoaded', () => {
    const htmlInput = document.getElementById('htmlInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultCard = document.getElementById('resultCard');
    const downloadLink = document.getElementById('downloadLink');
    const resultMsg = document.getElementById('resultMsg');

    generateBtn.addEventListener('click', async () => {
        const html = htmlInput.value.trim();
        if (!html) {
            alert('Por favor, pega el código HTML primero.');
            return;
        }

        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        resultCard.classList.add('hidden');

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

            // Recibir el ZIP como blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Configurar botón de descarga
            downloadLink.href = url;
            downloadLink.download = `carousel-${Date.now()}.zip`;
            
            resultMsg.textContent = `¡Éxito! Tu carrusel ha sido generado correctamente.`;
            resultCard.classList.remove('hidden');
            resultCard.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error: ' + error.message);
        } finally {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    });
});
