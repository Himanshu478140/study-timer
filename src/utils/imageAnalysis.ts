/**
 * Analyzes the brightness of an image URL.
 * Returns a Promise that resolves to a brightness value between 0 (black) and 255 (white).
 */
export const analyzeImageBrightness = (imageUrl: string): Promise<number> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Needed for external images, though ours are local assets
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(128); // Fallback to medium brightness
                return;
            }

            // Resize for performance - we don't need full res to get average brightness
            canvas.width = 100;
            canvas.height = 100;

            ctx.drawImage(img, 0, 0, 100, 100);

            try {
                const imageData = ctx.getImageData(0, 0, 100, 100);
                const data = imageData.data;
                let r, g, b, avg;
                let colorSum = 0;

                for (let x = 0, len = data.length; x < len; x += 4) {
                    r = data[x];
                    g = data[x + 1];
                    b = data[x + 2];

                    // Standard luminosity formula
                    avg = Math.floor((r * 0.299) + (g * 0.587) + (b * 0.114));
                    colorSum += avg;
                }

                const brightness = Math.floor(colorSum / (100 * 100));
                resolve(brightness);
            } catch (e) {
                console.warn('Error analyzing image data (CORS?):', e);
                resolve(128); // Fallback
            }
        };

        img.onerror = (err) => {
            console.warn('Error loading image for analysis:', err);
            resolve(128);
        };
    });
};
