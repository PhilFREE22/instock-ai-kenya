import React from 'react';
import { InventoryItem, Prediction, AppView } from '../types';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Activity, ScanLine, Plus, CalendarDays, Share2, Coins, ShoppingCart } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DashboardProps {
  inventory: InventoryItem[];
  predictions: Prediction[];
  onNavigate: (view: AppView) => void;
}

const data = [
  { name: 'Mon', usage: 12 },
  { name: 'Tue', usage: 19 },
  { name: 'Wed', usage: 15 },
  { name: 'Thu', usage: 25 },
  { name: 'Fri', usage: 32 },
  { name: 'Sat', usage: 40 },
  { name: 'Sun', usage: 10 },
];

export const Dashboard: React.FC<DashboardProps> = ({ inventory, predictions, onNavigate }) => {
  const lowStockCount = inventory.filter(i => i.quantity <= i.minThreshold).length;
  const criticalPredictions = predictions.filter(p => p.status === 'Critical').length;
  const healthyItems = inventory.length - lowStockCount;
  
  const totalAssetValue = inventory.reduce((sum, item) => sum + (item.quantity * (item.unitCost || 0)), 0);

  const handleShareReport = () => {
    const lowStock = inventory.filter(i => i.quantity <= i.minThreshold);
    const critical = predictions.filter(p => p.status === 'Critical');
    const date = new Date().toLocaleDateString();

    let message = `📋 *Stock Report - ${date}*\n\n`;

    if (lowStock.length > 0) {
      message += `⚠️ *Running Low (Action Needed):*\n`;
      lowStock.forEach(i => {
        message += `- ${i.name}: ${i.quantity} ${i.unit} (Min: ${i.minThreshold})\n`;
      });
      message += `\n`;
    } else {
       message += `✅ Stock levels look good.\n\n`;
    }

    if (critical.length > 0) {
      message += `🚨 *Theft/Critical Alerts:*\n`;
      critical.forEach(p => {
        message += `- ${p.itemName}: ${p.recommendation}\n`;
      });
      message += `\n`;
    }

    message += `_Generated via InStockAI_`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleOrderSupplies = () => {
    const lowStock = inventory.filter(i => i.quantity <= i.minThreshold);
    if (lowStock.length === 0) {
        alert("No items are currently low on stock.");
        return;
    }

    let message = `🛒 *Supplier Order Request*\n\nPlease deliver the following:\n\n`;
    lowStock.forEach(i => {
        const amountToOrder = (i.minThreshold * 3) - i.quantity;
        message += `- ${i.name}: ${amountToOrder} ${i.unit}\n`;
    });
    message += `\nDate Needed: As soon as possible.\nAddress: [Your Office Location]`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Overview</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Track your supplies and catch missing items.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
           <button 
            onClick={handleOrderSupplies}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold shadow-lg shadow-slate-900/10 transition-transform active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Order Supplies
          </button>
           <button 
            onClick={handleShareReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-bold shadow-lg shadow-green-900/10 transition-transform active:scale-95"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex md:block items-center justify-between md:justify-start relative overflow-hidden group">
          <div className="flex-1 relative z-10">
            <div className="flex items-center justify-between mb-2 md:mb-0">
              <p className="text-sm font-medium text-slate-500">Total Asset Value</p>
              <div className="md:hidden w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                 <Coins className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600 md:mt-2 truncate">KES {totalAssetValue.toLocaleString()}</p>
            <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm text-emerald-700 bg-emerald-50 w-fit px-2 py-1 rounded-full">
              <Coins className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span>Cash in Store</span>
            </div>
          </div>
          <div className="hidden md:flex w-12 h-12 bg-emerald-50 rounded-full items-center justify-center absolute top-6 right-6 group-hover:scale-110 transition-transform">
            <Coins className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex md:block items-center justify-between md:justify-start relative">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2 md:mb-0">
              <p className="text-sm font-medium text-slate-500">Total Stock Items</p>
              <div className="md:hidden w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                 <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 md:mt-2">{inventory.length}</p>
            <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span>{healthyItems} Safe</span>
            </div>
          </div>
          <div className="hidden md:flex w-12 h-12 bg-blue-50 rounded-full items-center justify-center absolute top-6 right-6">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex md:block items-center justify-between md:justify-start relative">
          <div className="flex-1">
             <div className="flex items-center justify-between mb-2 md:mb-0">
              <p className="text-sm font-medium text-slate-500">Reorder Needed</p>
               <div className="md:hidden w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center">
                 <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600 md:mt-2">{lowStockCount}</p>
            <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm text-amber-700 bg-amber-50 w-fit px-2 py-1 rounded-full">
              <span>Running Low</span>
            </div>
          </div>
          <div className="hidden md:flex w-12 h-12 bg-amber-50 rounded-full items-center justify-center absolute top-6 right-6">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex md:block items-center justify-between md:justify-start relative">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2 md:mb-0">
               <p className="text-sm font-medium text-slate-500">Critical / Missing?</p>
               <div className="md:hidden w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                 <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600 md:mt-2">{criticalPredictions}</p>
            <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm text-red-700 bg-red-50 w-fit px-2 py-1 rounded-full">
              <span>Action Required</span>
            </div>
          </div>
          <div className="hidden md:flex w-12 h-12 bg-red-50 rounded-full items-center justify-center absolute top-6 right-6">
            <Activity className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button 
            onClick={() => onNavigate(AppView.SCANNER)}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center group-hover:bg-brand-100 transition-colors">
              <ScanLine className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-700 text-sm">Scan Item</span>
          </button>

          <button 
            onClick={() => onNavigate(AppView.INVENTORY)}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-slate-100 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-700 text-sm">Add Stock</span>
          </button>

          <button 
            onClick={() => onNavigate(AppView.PREDICTIONS)}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-700 text-sm">Check Forecast</span>
          </button>

           <button 
            onClick={() => onNavigate(AppView.SCHEDULE)}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-2 hover:bg-slate-50 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <CalendarDays className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-700 text-sm">View Schedule</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Weekly Usage & Waste Trends</h2>
        <div className="h-60 md:h-80 w-full -ml-4 md:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="usage" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};