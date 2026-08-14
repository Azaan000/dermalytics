// High performance HTML5 Canvas Grad-CAM rendering engine
export type ColorPalette = 'jet' | 'turbo' | 'plasma' | 'hot';

export function getColormapColor(val: number, palette: ColorPalette = 'jet'): [number, number, number] {
  // val is 0.0 to 1.0
  const clamped = Math.max(0, Math.min(1, val));
  
  if (palette === 'jet') {
    const r = Math.max(0, Math.min(1, 1.5 - Math.abs(clamped * 4 - 3)));
    const g = Math.max(0, Math.min(1, 1.5 - Math.abs(clamped * 4 - 2)));
    const b = Math.max(0, Math.min(1, 1.5 - Math.abs(clamped * 4 - 1)));
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  } else if (palette === 'turbo') {
    const r = Math.sin(clamped * Math.PI * 0.9) * 255;
    const g = Math.sin(clamped * Math.PI * 1.1) * 220;
    const b = Math.cos(clamped * Math.PI * 0.7) * 255;
    return [Math.round(Math.max(0, r)), Math.round(Math.max(0, g)), Math.round(Math.max(0, b))];
  } else if (palette === 'plasma') {
    const r = (0.5 + 0.5 * Math.sin(clamped * 3.14 - 0.5)) * 255;
    const g = (0.2 + 0.8 * Math.sin(clamped * 2.8)) * 255;
    const b = (1.0 - clamped) * 240;
    return [Math.round(r), Math.round(g), Math.round(b)];
  } else {
    // Hot
    const r = Math.min(255, clamped * 3 * 255);
    const g = Math.max(0, Math.min(255, (clamped - 0.33) * 3 * 255));
    const b = Math.max(0, Math.min(255, (clamped - 0.66) * 3 * 255));
    return [Math.round(r), Math.round(g), Math.round(b)];
  }
}

export function renderGradCamToCanvas(
  canvas: HTMLCanvasElement,
  imageElement: HTMLImageElement,
  opacity: number = 0.6,
  palette: ColorPalette = 'jet',
  splitPosition: number = 100, // 0 to 100%
  assessmentType: 'skin' | 'hair' = 'skin'
) {
  const ctx = canvas.getContext('2d');
  if (!ctx || !imageElement.complete) return;

  const w = (canvas.width = imageElement.naturalWidth || 400);
  const h = (canvas.height = imageElement.naturalHeight || 400);

  // 1. Draw base image
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(imageElement, 0, 0, w, h);

  if (opacity <= 0 || splitPosition <= 0) return;

  // 2. Generate simulated Grad-CAM saliency layer
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Saliency computation based on image luminance gradients and central weight
  const splitPx = (splitPosition / 100) * w;

  const cx = w / 2;
  const cy = assessmentType === 'skin' ? h / 2 : h * 0.42;
  const sigmaX = w / (assessmentType === 'skin' ? 3.2 : 2.5);
  const sigmaY = h / (assessmentType === 'skin' ? 3.2 : 2.8);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x > splitPx) continue; // Respect split slider

      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Spatial Gaussian falloff
      const dx = x - cx;
      const dy = y - cy;
      const gaussian = Math.exp(-((dx * dx) / (2 * sigmaX * sigmaX) + (dy * dy) / (2 * sigmaY * sigmaY)));

      // Contrast weighting
      const contrast = assessmentType === 'skin' ? (255 - lum) / 255 : (Math.abs(lum - 128) / 128);
      let saliency = 0.65 * gaussian + 0.35 * contrast;
      saliency = Math.max(0, Math.min(1, saliency));

      // Color mapping
      const [hmR, hmG, hmB] = getColormapColor(saliency, palette);

      // Alpha blend
      const effAlpha = opacity * Math.pow(saliency, 1.4);
      data[idx] = Math.round(r * (1 - effAlpha) + hmR * effAlpha);
      data[idx + 1] = Math.round(g * (1 - effAlpha) + hmG * effAlpha);
      data[idx + 2] = Math.round(b * (1 - effAlpha) + hmB * effAlpha);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // 3. Draw split indicator line if slider is active
  if (splitPosition < 99 && splitPosition > 1) {
    ctx.beginPath();
    ctx.moveTo(splitPx, 0);
    ctx.lineTo(splitPx, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.stroke();
  }
}
