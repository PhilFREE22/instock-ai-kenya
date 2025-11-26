import React, { useState } from 'react';
import { InventoryItem, CATEGORIES } from '../types';
import { Search, Plus, Filter, MoreHorizontal, AlertCircle, Package, Minus } from 'lucide-react';

interface InventoryListProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, onAddItem, onUpdateItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: CATEGORIES[0],
    quantity: 0,
    unit: 'units',
    unitCost: 0,
    minThreshold: 5
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(newItem);
    setIsAddModalOpen(false);
    setNewItem({ name: '', category: CATEGORIES[0], quantity: 0, unit: 'units', unitCost: 0, minThreshold: 5 });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 md:top-0 bg-slate-50 z-10 py-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Manage your stock levels and supplies.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-900/20 transition-colors active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </button>
      </div>

      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search supplies..."
            className="w-full pl-10 pr-4 py-3 md:py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-slate-50 md:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
          <Filter className="w-5 h-5 text-slate-400 flex-shrink-0 hidden md:block" />
          <button 
            onClick={() => setFilterCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filterCategory === 'All' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filterCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filteredItems.map((item) => {
          const isLow = item.quantity <= item.minThreshold;
          const percentage = Math.min((item.quantity / (item.minThreshold * 3)) * 100, 100);
          const totalValue = (item.quantity * (item.unitCost || 0)).toLocaleString();
          
          return (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 active:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isLow ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.name}</h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {item.category}
                    </span>
                  </div>
                </div>
                <button className="text-slate-400 p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Stock Level</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl font-bold text-slate-900">{item.quantity}</span>
                      <span className="text-sm text-slate-500">{item.unit}</span>
                    </div>
                  </div>
                  <div className={`text-sm font-medium flex items-center ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                    {isLow ? (
                      <>
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Low Stock
                      </>
                    ) : 'In Stock'}
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-brand-500'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                     <div className="flex flex-col">
                        <span className="text-xs text-slate-400">Total Value</span>
                        <span className="font-bold text-slate-900 text-sm">KES {totalValue}</span>
                     </div>
                     <div className="flex items-center bg-slate-50 rounded-lg p-1">
                        <button 
                            onClick={() => onUpdateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 active:scale-95"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                         <span className="text-xs font-medium text-slate-500 px-2">Adjust</span>
                         <button 
                             onClick={() => onUpdateItem(item.id, { quantity: item.quantity + 1 })}
                             className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-brand-600 active:scale-95"
                         >
                             <Plus className="w-4 h-4" />
                         </button>
                     </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Cost (KES)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.quantity <= item.minThreshold;
                const totalValue = (item.quantity * (item.unitCost || 0)).toLocaleString();
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-400">ID: {item.id.slice(0,8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-900 font-medium">{item.quantity}</span>
                        <span className="text-slate-500 text-sm">{item.unit}</span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-brand-500'}`}
                          style={{ width: `${Math.min((item.quantity / (item.minThreshold * 3)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg w-24 px-2 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent">
                            <span className="text-slate-400 text-xs mr-1">KES</span>
                            <input 
                                type="number" 
                                className="w-full bg-transparent border-none outline-none text-sm py-1.5 font-medium text-slate-700"
                                value={item.unitCost || ''}
                                onChange={(e) => onUpdateItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                                placeholder="0"
                            />
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                            KES {totalValue}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isLow ? (
                        <div className="flex items-center text-red-600 text-sm font-medium">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          Low Stock
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                          In Stock
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-slate-400 mb-2 font-medium">No items found</div>
          <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-md animate-slide-up md:animate-scale-in overflow-hidden h-[85vh] md:h-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex-shrink-0">
               <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4 md:hidden"></div>
               <h2 className="text-xl font-bold text-slate-900">Add New Item</h2>
               <p className="text-sm text-slate-500 mt-1">Manually add stock to your inventory</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="add-item-form" onSubmit={handleAddItem} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-base" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none text-base bg-white" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity</label>
                    <input required type="number" className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none text-base" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                    <input required type="text" className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none text-base" placeholder="e.g. 20L Jerrycan, 5L Bottle, Pcs" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
                  </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Cost (KES)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">KES</span>
                        <input required type="number" className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none text-base" value={newItem.unitCost} onChange={e => setNewItem({...newItem, unitCost: Number(e.target.value)})} />
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Threshold</label>
                  <input required type="number" className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none text-base" value={newItem.minThreshold} onChange={e => setNewItem({...newItem, minThreshold: Number(e.target.value)})} />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-100 flex space-x-3 flex-shrink-0 bg-white pb-8 md:pb-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-3.5 rounded-xl hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" form="add-item-form" className="flex-1 bg-brand-600 text-white py-3.5 rounded-xl hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/20">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};