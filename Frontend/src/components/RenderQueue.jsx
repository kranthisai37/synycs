import React, { useEffect, useState } from 'react';
import { API_API_URL } from '../utils/apiConfig';

export default function RenderQueue() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchQueue = () => {
      fetch(`${API_API_URL}/videos/queue/`)
        .then(res => res.json())
        .then(data => setItems(data))
        .catch(err => console.error("Queue fetch error", err));
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 opacity-50 glass-card rounded-[3rem] border border-white/5">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">⏳</span>
        </div>
        <h3 className="text-xl font-black text-white mb-2">No Active Renders</h3>
        <p className="text-slate-500 text-sm">Your rendering queue is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-white">Active Renders</h2>
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="glass-card p-6 rounded-3xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/20 rounded-xl flex items-center justify-center animate-pulse">
                <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h4 className="font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">Status: {item.status} • {item.progress}%</p>
              </div>
            </div>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand transition-all duration-500" style={{ width: `${item.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
