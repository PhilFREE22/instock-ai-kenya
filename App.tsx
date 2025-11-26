
import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { PredictiveInsights } from './components/PredictiveInsights';
import { Scanner } from './components/Scanner';
import { AppView, InventoryItem, Job, Prediction, JOB_TYPES } from './types';
import { CalendarDays, BrainCircuit, Menu, WifiOff, Plus, X } from 'lucide-react';

const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Industrial Bleach/Jik', category: 'Chemicals', quantity: 4, unit: '20L Jerrycan', unitCost: 3500, minThreshold: 2, lastUpdated: '2023-10-01' },
  { id: '2', name: 'Microfiber Cloths', category: 'Tools', quantity: 45, unit: 'Pcs', unitCost: 150, minThreshold: 50, lastUpdated: '2023-10-02' },
  { id: '3', name: 'Heavy Duty Floor Polish', category: 'Chemicals', quantity: 2, unit: '20L Jerrycan', unitCost: 4800, minThreshold: 1, lastUpdated: '2023-10-03' },
  { id: '4', name: 'Hand Tissues', category: 'Paper Products', quantity: 120, unit: 'Rolls', unitCost: 45, minThreshold: 30, lastUpdated: '2023-10-05' },
  { id: '5', name: 'Glass Cleaner', category: 'Chemicals', quantity: 8, unit: '5L Bottle', unitCost: 850, minThreshold: 5, lastUpdated: '2023-10-01' },
];

const MOCK_JOBS: Job[] = [
  { id: 'j1', clientName: 'Tech Corp Office', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], type: 'Office', estimatedSupplyUsage: {} },
  { id: 'j2', clientName: 'Restaurant Deep Clean', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], type: 'Deep Clean', estimatedSupplyUsage: {} },
];

const INVENTORY_STORAGE_KEY = 'instock_ai_data_v1';
const JOBS_STORAGE_KEY = 'instock_ai_jobs_v1';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          unitCost: item.unitCost || 0
        }));
      } catch (e) {
        console.error("Failed to parse saved inventory", e);
        return MOCK_INVENTORY;
      }
    }
    return MOCK_INVENTORY;
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem(JOBS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_JOBS;
      }
    }
    return MOCK_JOBS;
  });

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Add Job Modal State
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Standard Clean'
  });

  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAddItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const existingItemIndex = inventory.findIndex(
      (i) => i.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingItemIndex >= 0) {
      const updatedInventory = [...inventory];
      const existingItem = updatedInventory[existingItemIndex];
      const newQuantity = existingItem.quantity + item.quantity;
      
      updatedInventory[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      setInventory(updatedInventory);
      alert(`Stock Updated: Added ${item.quantity} to ${existingItem.name}. New Total: ${newQuantity}`);
    } else {
      const newItem: InventoryItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setInventory([...inventory, newItem]);
      alert(`New Item Added: ${newItem.name}`);
    }

    if (currentView === AppView.SCANNER) {
      setCurrentView(AppView.INVENTORY);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.clientName || !newJob.date || !newJob.type) return;

    const jobToAdd: Job = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: newJob.clientName,
      date: newJob.date,
      type: newJob.type as any,
      estimatedSupplyUsage: {}
    };

    setJobs(prev => [...prev, jobToAdd].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsAddJobModalOpen(false);
    setNewJob({
      clientName: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Standard Clean'
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard inventory={inventory} predictions={predictions} onNavigate={setCurrentView} />;
      case AppView.INVENTORY:
        return <InventoryList items={inventory} onAddItem={handleAddItem} onUpdateItem={handleUpdateItem} />;
      case AppView.PREDICTIONS:
        return <PredictiveInsights inventory={inventory} jobs={jobs} predictions={predictions} setPredictions={setPredictions} />;
      case AppView.SCANNER:
        return <Scanner onScanComplete={(data) => handleAddItem(data)} />;
      case AppView.SCHEDULE:
        return (
            <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Upcoming Schedule</h1>
                        <p className="text-sm md:text-base text-slate-500 mt-1">Plan your jobs to predict accurate supply needs.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddJobModalOpen(true)}
                      className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/10 transition-transform active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Schedule Job</span>
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
                    {jobs.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No jobs scheduled. Add a job to start forecasting.
                        </div>
                    ) : (
                        jobs.map(job => (
                            <div key={job.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 bg-brand-50 rounded-xl flex flex-col items-center justify-center text-brand-700 border border-brand-100 shrink-0">
                                        <span className="text-xs font-bold uppercase">{new Date(job.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-xl font-bold leading-none">{new Date(job.date).getDate()}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{job.clientName}</h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 mt-1">
                                            {job.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center text-slate-500 text-sm bg-white border border-slate-200 md:border-transparent md:bg-transparent p-3 md:p-0 rounded-lg w-full md:w-auto justify-center md:justify-start">
                                    <CalendarDays className="w-4 h-4 mr-2" />
                                    {new Date(job.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Job Modal */}
                {isAddJobModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
                        <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-md animate-slide-up md:animate-scale-in overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Schedule New Job</h2>
                                    <p className="text-sm text-slate-500 mt-1">Add details for inventory forecasting</p>
                                </div>
                                <button onClick={() => setIsAddJobModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6">
                                <form id="add-job-form" onSubmit={handleAddJob} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Client / Site Name</label>
                                        <input 
                                            required 
                                            type="text" 
                                            placeholder="e.g. Westlands Office Tower"
                                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-base" 
                                            value={newJob.clientName} 
                                            onChange={e => setNewJob({...newJob, clientName: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Type</label>
                                        <select 
                                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none text-base bg-white" 
                                            value={newJob.type} 
                                            onChange={e => setNewJob({...newJob, type: e.target.value as any})}
                                        >
                                            {JOB_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                                        <input 
                                            required 
                                            type="date" 
                                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none text-base" 
                                            value={newJob.date} 
                                            onChange={e => setNewJob({...newJob, date: e.target.value})} 
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="p-4 border-t border-slate-100 flex space-x-3 bg-white pb-8 md:pb-4">
                                <button type="button" onClick={() => setIsAddJobModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-3.5 rounded-xl hover:bg-slate-50 font-bold">Cancel</button>
                                <button type="submit" form="add-job-form" className="flex-1 bg-brand-600 text-white py-3.5 rounded-xl hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/20">Schedule Job</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
      default:
        return <Dashboard inventory={inventory} predictions={predictions} onNavigate={setCurrentView} />;
    }
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans relative">
        {!isOnline && (
          <div className="fixed top-16 md:top-0 left-0 right-0 bg-amber-500 text-white text-center py-1 z-[60] text-sm font-medium flex items-center justify-center">
            <WifiOff className="w-4 h-4 mr-2" />
            You are offline. Data is saved to your device.
          </div>
        )}

        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-30 px-4 flex items-center justify-between shadow-lg shadow-slate-900/10">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
               <BrainCircuit className="w-5 h-5 text-white" />
             </div>
             <span className="font-bold text-lg tracking-tight">InStockAI</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <Sidebar 
          currentView={currentView} 
          onChangeView={(view) => {
            setCurrentView(view);
            setIsMobileMenuOpen(false);
          }}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 w-full md:ml-72 min-h-screen transition-all duration-300">
          <div className={`pt-20 pb-8 px-4 md:pt-8 md:px-8 max-w-7xl mx-auto ${!isOnline ? 'md:mt-6' : ''}`}>
            {renderContent()}
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
