import { Assessment } from '../types/assessment';

export interface TimelapseOptions {
  fps?: number;          // frames per second (default 24)
  durationSec?: number;  // total video duration (default 5)
  width?: number;
  height?: number;
  type?: 'skin' | 'hair' | 'all';
}

export interface TimelapseProgress {
  stage: string;
  percent: number;
}

/**
 * Generates a 5-second timelapse .webm video from chronological assessment images.
 * Uses Canvas API + MediaRecorder. No external dependencies.
 */
export async function generateTimelapse(
  history: Assessment[],
  options: TimelapseOptions = {},
  onProgress?: (p: TimelapseProgress) => void
): Promise<Blob> {
  const {
    fps = 24,
    durationSec = 5,
    width = 640,
    height = 640,
    type = 'all',
  } = options;

  // Filter & sort
  const items = [...history]
    .filter((a) => type === 'all' || a.type === type)
    .filter((a) => a.image_url)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (items.length < 2) {
    throw new Error('Need at least 2 images to generate a timelapse. Run more scans first!');
  }

  onProgress?.({ stage: 'Loading images…', percent: 5 });

  // Load all images
  const images = await Promise.all(
    items.map(
      (a) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => {
            // On error, create a placeholder canvas image
            const ph = document.createElement('canvas');
            ph.width = width;
            ph.height = height;
            const ctx2 = ph.getContext('2d')!;
            ctx2.fillStyle = '#1e293b';
            ctx2.fillRect(0, 0, width, height);
            ctx2.fillStyle = '#64748b';
            ctx2.font = 'bold 24px sans-serif';
            ctx2.textAlign = 'center';
            ctx2.fillText('Image unavailable', width / 2, height / 2);
            const phImg = new Image();
            phImg.src = ph.toDataURL();
            phImg.onload = () => resolve(phImg);
          };
          img.src = a.image_url;
        })
    )
  );

  onProgress?.({ stage: 'Setting up canvas…', percent: 20 });

  // Canvas setup
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Video setup
  const stream = canvas.captureStream(fps);
  const chunks: Blob[] = [];
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 });
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const totalFrames = fps * durationSec;
  // How many frames each image occupies (with crossfade overlap of ~0.5s)
  const framesPerImg = totalFrames / (images.length - 1 || 1);
  const crossfadeFrames = Math.min(Math.floor(fps * 0.4), Math.floor(framesPerImg * 0.4));

  onProgress?.({ stage: 'Rendering timelapse frames…', percent: 30 });

  return new Promise((resolve, reject) => {
    recorder.start();

    let frame = 0;

    const drawFrame = () => {
      const progress = frame / totalFrames;
      const imgProgress = frame / framesPerImg;
      const imgIndex = Math.min(Math.floor(imgProgress), images.length - 2);
      const localFrame = frame - imgIndex * framesPerImg;
      const localProgress = localFrame / framesPerImg;

      // Draw current image
      ctx.globalAlpha = 1;
      ctx.drawImage(images[imgIndex], 0, 0, width, height);

      // Crossfade overlay to next image
      if (localProgress > 1 - crossfadeFrames / framesPerImg) {
        const blendAlpha = (localProgress - (1 - crossfadeFrames / framesPerImg)) / (crossfadeFrames / framesPerImg);
        const nextIdx = Math.min(imgIndex + 1, images.length - 1);
        ctx.globalAlpha = Math.min(1, blendAlpha);
        ctx.drawImage(images[nextIdx], 0, 0, width, height);
        ctx.globalAlpha = 1;
      }

      // Overlay: date label + scan number
      const item = items[imgIndex];
      const dateStr = new Date(item.created_at).toLocaleDateString('en-PK', {
        day: '2-digit', month: 'short', year: 'numeric',
      });

      // Bottom bar
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, height - 52, width, 52);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.type === 'skin' ? '🔬 Skin' : '💈 Scalp'} Assessment #${imgIndex + 1}`, 14, height - 30);

      ctx.font = '12px system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(dateStr, 14, height - 12);

      // Top right: frame counter
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(width - 80, 10, 68, 24);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${frame + 1} / ${totalFrames}`, width - 14, 26);
      ctx.textAlign = 'left';

      // Progress bar at bottom
      ctx.fillStyle = 'rgba(14, 165, 233, 0.7)';
      ctx.fillRect(0, height - 3, width * progress, 3);

      frame++;
      const pct = 30 + Math.round((frame / totalFrames) * 60);
      onProgress?.({ stage: `Rendering frame ${frame} of ${totalFrames}…`, percent: pct });

      if (frame < totalFrames) {
        setTimeout(drawFrame, 0);
      } else {
        // Last frame: hold on final image for 0.5s more
        ctx.globalAlpha = 1;
        ctx.drawImage(images[images.length - 1], 0, 0, width, height);
        ctx.fillStyle = 'rgba(14,165,233,0.15)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Dermalytics Journey', width / 2, height / 2 - 14);
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${items.length} assessments · ${durationSec}s timelapse`, width / 2, height / 2 + 14);
        ctx.textAlign = 'left';

        onProgress?.({ stage: 'Finalizing video…', percent: 95 });
        setTimeout(() => {
          recorder.stop();
        }, 600);
      }
    };

    recorder.onstop = () => {
      onProgress?.({ stage: 'Done!', percent: 100 });
      resolve(new Blob(chunks, { type: mimeType }));
    };

    recorder.onerror = (e) => reject(e);

    // Start rendering
    drawFrame();
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 1000);
}
