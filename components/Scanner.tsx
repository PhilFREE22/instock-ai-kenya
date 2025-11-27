import React, { useRef, useState, useEffect } from 'react';
import { identifyItemFromImage } from '../services/geminiService';
import { Check, Loader2, RefreshCw } from 'lucide-react';

interface ScannerProps {
  onScanComplete: (data: any) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [manualQuantity, setManualQuantity] = useState<number>(1);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Calculate scale to fit within max dimensions (e.g., 1024x1024) to reduce payload size
        const MAX_SIZE = 1024;
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw scaled image
        context.drawImage(video, 0, 0, width, height);
        
        // Compress to JPEG with 0.8 quality to significantly reduce file size
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        setCapturedImage(dataUrl);
        stopCamera();
        // Remove the data:image/jpeg;base64, prefix
        analyzeImage(dataUrl.split(',')[1]);
      }
    }
  };

  const analyzeImage = async (base64Data: string) => {
    setAnalyzing(true);
    try {
      const data = await identifyItemFromImage(base64Data);
      if (data) {
        setResult(data);
        setManualQuantity(1); 
      } else {
        setResult({ error: "Could not identify item. Try again." });
      }
    } catch (e) {
      setResult({ error: "AI Service Error" });
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setManualQuantity(1);
    startCamera();
  };

  const confirmAdd = () => {
    if (result && !result.error) {
      onScanComplete({
        name: result.name,
        category: result.category,
        quantity: manualQuantity,
        unit: 'units',
        minThreshold: 5
      });
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-900 rounded-xl overflow-hidden relative">
      
      {!capturedImage && (
        <>
           <div className="relative w-full max-w-lg aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-2 border-white/20 m-8 rounded-lg flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 absolute top-1/2 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button 
                onClick={capture}
                className="w-16 h-16 rounded-full bg-white/20 border-4 border-white flex items-center justify-center hover:bg-white/40 transition-all active:scale-95"
              >
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
          <p className="text-slate-400 mt-6 text-center px-4">Point at the supply item. Ensure good lighting.</p>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {capturedImage && (
        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
          <div className="relative h-48 rounded-lg overflow-hidden bg-slate-100 mb-6 shrink-0">
             <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
          </div>
          
          <div className="space-y-4">
            {analyzing ? (
               <div className="text-center py-8">
                 <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
                 <p className="text-slate-600 font-medium">AI is identifying product...</p>
                 <p className="text-slate-400 text-sm">Analyzing label and packaging</p>
               </div>
            ) : result ? (
                result.error ? (
                    <div className="text-center text-red-500 font-medium py-4">
                        {result.error}
                        <button onClick={reset} className="flex items-center justify-center w-full mt-4 py-3 bg-slate-100 rounded-lg text-slate-700 font-medium">
                           <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <h3 className="font-bold text-green-900 text-lg flex items-center">
                                <Check className="w-5 h-5 mr-2" />
                                Identified: {result.name}
                            </h3>
                            <div className="mt-2 text-sm text-green-800">
                                <p>Category: {result.category}</p>
                                <p className="mt-1 text-green-700/70 text-xs">Confidence: {result.confidence}</p>
                            </div>
                        </div>

                        <div className="pt-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Quantity on Shelf (Count them)
                          </label>
                          <div className="flex items-center space-x-3">
                             <button 
                                onClick={() => setManualQuantity(Math.max(1, manualQuantity - 1))}
                                className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 hover:bg-slate-50"
                             >
                               -
                             </button>
                             <input 
                                type="number" 
                                value={manualQuantity}
                                onChange={(e) => setManualQuantity(parseInt(e.target.value) || 0)}
                                className="flex-1 h-12 text-center border border-slate-300 rounded-xl text-xl font-bold text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                             />
                             <button 
                                onClick={() => setManualQuantity(manualQuantity + 1)}
                                className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 hover:bg-slate-50"
                             >
                               +
                             </button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button onClick={reset} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50">
                                Retake
                            </button>
                            <button onClick={confirmAdd} className="flex-1 py-3 bg-brand-600 rounded-xl text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20">
                                Add {manualQuantity} Items
                            </button>
                        </div>
                    </>
                )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
