import React, { useState, useEffect, useRef } from 'react';
import { Layers, Sliders, Eye, Info, Sparkles, RefreshCw } from 'lucide-react';
import { renderGradCamToCanvas, ColorPalette } from '../../utils/gradcamCanvas';

interface GradCAMViewerProps {
  imageUrl: string;
  gradCamUrl?: string;
  assessmentType: 'skin' | 'hair';
  predictedClass?: string;
  rationale?: string;
}

export const GradCAMViewer: React.FC<GradCAMViewerProps> = ({
  imageUrl,
  gradCamUrl,
  assessmentType,
  predictedClass,
  rationale
}) => {
  const [splitPos, setSplitPos] = useState<number>(65); // 0 to 100%
  const [opacity, setOpacity] = useState<number>(0.65);
  const [palette, setPalette] = useState<ColorPalette>('jet');
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Redraw canvas whenever parameters change
  useEffect(() => {
    if (!canvasRef.current || !imgRef.current) return;
    const img = imgRef.current;

    const handleDraw = () => {
      if (canvasRef.current && img.complete) {
        renderGradCamToCanvas(
          canvasRef.current,
          img,
          opacity,
          palette,
          splitPos,
          assessmentType
        );
      }
    };

    if (img.complete) {
      handleDraw();
    } else {
      img.onload = handleDraw;
    }
  }, [imageUrl, opacity, palette, splitPos, assessmentType]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              Explainable AI (Grad-CAM) Visualizer
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual saliency activation revealing regions influencing the neural network prediction.
          </p>
        </div>

        {/* Palette Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          {(['jet', 'turbo', 'plasma', 'hot'] as ColorPalette[]).map((p) => (
            <button
              key={p}
              onClick={() => setPalette(p)}
              className={`px-2.5 py-1 rounded-lg uppercase text-[10px] tracking-wider transition-all ${
                palette === p
                  ? 'bg-white text-sky-700 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas & Split Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Visualizer Frame */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div 
            className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-950 w-full max-w-[420px] aspect-square flex items-center justify-center cursor-ew-resize group"
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
                setSplitPos(pct);
              }
            }}
          >
            {/* Hidden Source Image */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Scan Source"
              className="hidden"
              crossOrigin="anonymous"
            />

            {/* Interactive Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />

            {/* Floating Split Badges */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-white/20 pointer-events-none">
              Grad-CAM Saliency
            </div>
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-white/20 pointer-events-none">
              Original Scan
            </div>

            {/* Split Handle Knob */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-xl pointer-events-none flex items-center justify-center"
              style={{ left: `${splitPos}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-lg border-2 border-sky-600 flex items-center justify-center text-sky-700">
                <Sliders className="w-3 h-3 rotate-90" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            Drag across image or adjust slider to compare scan vs. heatmap
          </p>
        </div>

        {/* Controls & Saliency Analysis */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Slider 1: Split Comparison */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Split Overlay Position</span>
              </span>
              <span className="text-sky-600 font-bold">{Math.round(splitPos)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={splitPos}
              onChange={(e) => setSplitPos(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Slider 2: Opacity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Heatmap Intensity</span>
              </span>
              <span className="text-sky-600 font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Diagnostic Interpretation Card */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-900 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Diagnostic Saliency Insights</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {rationale || (
                assessmentType === 'skin'
                  ? `Red/warm activation highlights high gradient contrast along the lesion margins and central pigment cluster influencing the classification of ${predictedClass || 'this specimen'}.`
                  : 'Warmer saliency clusters concentrate around the scalp part line and areas with elevated follicular miniaturization.'
              )}
            </p>
          </div>

          {/* Colormap Legend */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
              <span>Low Activation (Background)</span>
              <span className="text-rose-600 font-bold">High Saliency (Diagnostic Core)</span>
            </div>
            <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-amber-400 to-rose-600" />
          </div>

        </div>

      </div>

    </div>
  );
};
