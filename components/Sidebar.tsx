
import React from 'react';
import { LayoutDashboard, Package, ScanLine, BrainCircuit, CalendarDays, LogOut, X, TrendingUp } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.INVENTORY, label: 'Stock Room', icon: Package },
    { id: AppView.SCHEDULE, label: 'Job Schedule', icon: CalendarDays },
    { id: AppView.PREDICTIONS, label: 'Stock Forecast', icon: TrendingUp },
    { id: AppView.SCANNER, label: 'Quick Scan', icon: ScanLine },
  ];

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all demo data? This will clear all inventory items and scheduled jobs.")) {
      localStorage.removeItem('instock_ai_data_v1');
      localStorage.removeItem('instock_ai_jobs_v1');
      window.location.reload();
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 text-white shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">InStockAI</span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                    onChangeView(item.id);
                    onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 mb-safe">
          <button 
            onClick={handleReset}
            className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800"
          >
            <LogOut className="w-5 h-5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
