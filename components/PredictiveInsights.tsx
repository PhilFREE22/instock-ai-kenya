import React, { useState } from 'react';
import { InventoryItem, Job, Prediction } from '../types';
import { predictInventoryNeeds } from '../services/geminiService';
import { Sparkles, ArrowRight, CalendarClock, AlertOctagon, Loader2, RefreshCw, BrainCircuit } from 'lucide-react';

interface PredictiveInsightsProps {
  inventory: InventoryItem[];
  jobs: Job[];
  predictions: Prediction[];
  setPredictions: (preds: Prediction[]) => void;
}

export const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ inventory, jobs, predictions, setPredictions }) => {
  const [loading, setLoading] = useState(false);

  const handleGeneratePredictions = async () => {
    setLoading(true);
    try {
      const results = await predictInventoryNeeds(inventory, jobs);
      setPredictions(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center">
            Stock Forecast
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-brand-500 ml-2" />
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Detect potential shortages or suspicious usage patterns.</p>
        </div>
        <button 
          onClick={handleGeneratePredictions}
          disabled={loading}
          className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white px-6 py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-900/10 transition-all transform active:scale-95"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          <span>{loading ? 'Analyzing Usage...' : 'Update Forecast'}</span>
        </button>
      </div>

      {predictions.length === 0 && !loading && (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No forecast generated</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm md:text-base">
            Use AI to analyze your inventory against upcoming jobs to see if you have enough supplies or if usage is suspiciously high.
          </p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white h-48 rounded-xl shadow-sm p-6 animate-pulse border border-slate-100">
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-slate-100 rounded w-1/2 mb-8"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && predictions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {predictions.map((pred) => (
            <div 
              key={pred.itemId} 
              className={`bg-white rounded-xl p-5 md:p-6 shadow-sm border-l-4 relative overflow-hidden group transition-all hover:shadow-md ${
                pred.status === 'Critical' ? 'border-red-500' : 
                pred.status === 'Low' ? 'border-amber-500' : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{pred.itemName}</h3>
                  <p className={`text-sm font-medium mt-1 ${
                    pred.status === 'Critical' ? 'text-red-600' : 
                    pred.status === 'Low' ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {pred.status.toUpperCase()}
                  </p>
                </div>
                {pred.status === 'Critical' && <AlertOctagon className="w-6 h-6 text-red-500" />}
              </div>
              
              <div className="mb-4">
                 <div className="flex items-center text-slate-600 text-sm mb-2">
                    <CalendarClock className="w-4 h-4 mr-2" />
                    Est. Run out: <span className="font-semibold ml-1">{pred.runOutDate}</span>
                 </div>
                 <p className="text-slate-500 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
                   {pred.recommendation}
                 </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">
                  {pred.daysRemaining} Days Supply
                </span>
                <button className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center">
                  Restock <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};