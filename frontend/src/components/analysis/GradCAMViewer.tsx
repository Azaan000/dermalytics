import React, { useState, useEffect, useRef } from 'react';
import { Layers, Sliders, Eye, Info, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
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
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 text-base">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              AI Vision Map (See Where the AI Looked)
            </h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            This colorful overlay reveals the exact areas in your photo the AI analyzed to make its decision.
          </p>
        </div>

        {/* Palette Selector */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto text-xs font-bold">
          <span className="text-slate-500 px-2 text-xs">Colors:</span>
          {(['jet', 'turbo', 'plasma', 'hot'] as ColorPalette[]).map((p) => (
            <button
              key={p}
              onClick={() => setPalette(p)}
              className={`px-3 py-1.5 rounded-xl uppercase text-xs tracking-wider transition-all ${
                palette === p
                  ? 'bg-white text-sky-700 shadow-sm font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas & Split Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Visualizer Frame */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div 
            className="relative rounded-3xl overflow-hidden shadow-md border-2 border-slate-200 bg-slate-950 w-full max-w-[440px] aspect-square flex items-center justify-center cursor-ew-resize group"
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
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider border border-white/20 pointer-events-none">
              AI Focus Map
            </div>
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider border border-white/20 pointer-events-none">
              Your Real Photo
            </div>

            {/* Split Handle Knob */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-xl pointer-events-none flex items-center justify-center"
              style={{ left: `${splitPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-xl border-2 border-sky-600 flex items-center justify-center text-sky-700">
                <Sliders className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-3 font-medium text-center">
            👉 <strong>Slide left or right</strong> across the picture to see your real photo underneath!
          </p>
        </div>

        {/* Controls & Saliency Analysis */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Slider 1: Split Comparison */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-slate-800">
              <span className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Slider Position</span>
              </span>
              <span className="text-sky-600 font-extrabold">{Math.round(splitPos)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={splitPos}
              onChange={(e) => setSplitPos(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Slider 2: Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-slate-800">
              <span className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Color Map Brightness</span>
              </span>
              <span className="text-sky-600 font-extrabold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Plain English Meaning */}
          <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-black text-sky-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>What Caught the AI's Eye</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {rationale || (
                assessmentType === 'skin'
                  ? `The warm red and yellow zones show the primary texture and border clues the AI inspected when identifying this as ${predictedClass || 'this skin spot'}.`
                  : 'The warmer spots show where the AI checked scalp visibility, hair parting, and strand density.'
              )}
            </p>
          </div>

          {/* Easy Colormap Legend */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              How to Read the Colors:
            </p>
            <div className="h-3 rounded-full bg-gradient-to-r from-blue-600 via-emerald-400 via-amber-400 to-rose-600" />
            <div className="flex justify-between text-xs font-semibold pt-1">
              <span className="text-blue-700">🔵 Blue = Normal skin / hair</span>
              <span className="text-rose-700 font-bold">🔴 Red = Strongest AI focus</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
