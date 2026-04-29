'use client';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Brain, DollarSign, Zap, TestTube, TrendingUp, Wifi } from 'lucide-react';
import { api, realtime } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Page() {
  const [genes, setGenes] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [abTests, setAbTests] = useState([]);
  const [state, setState] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [g,d,a,s] = await Promise.all([api.getGenes(),api.getDecisions(),api.getAbTests(),api.getState()]);
      setGenes(g); setDecisions(d); setAbTests(a); setState(s); setLoading(false);
    })();
    const unsub = realtime.subscribe('brain','new_decision',p=>{
      toast.success(`🧠 ${p.chosen_action}`);
      setDecisions(prev=>[p,...prev.slice(0,49)]);
      setState(prev=>({...prev,...p.state_snapshot}));
    });
    return () => unsub();
  }, []);

  const profitHistory = decisions.slice(0,20).reverse().map((d,i)=>({name:i,profit:d.state_snapshot?.total_profit||0}));

  if (loading) return <div className="bg-black text-white min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-black text-white min-h-screen p-4 font-mono">
      <Toaster position="top-right"/>
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="text-purple-400"/>AI CEO<Wifi size={16} className="text-green-400"/></h1>
          <div className="px-3 py-1 rounded text-sm bg-green-900 text-green-400">Brain: running</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[[`Total Profit`,`$${state.total_profit?.toFixed(2)}`,'text-green-400',DollarSign],[`Affiliate`,`$${state.affiliate_revenue?.toFixed(2)}`,'text-yellow-400',TrendingUp],[`Avg CPM`,`$${state.avg_cpm?.toFixed(2)}`,'text-blue-400',Zap],[`Conv Rate`,`${(state.affiliate_cr*100)?.toFixed(1)}%`,'text-purple-400',TestTube]].map(([t,v,c,I])=>(
            <div key={t} className="bg-zinc-900 border border-zinc-800 rounded p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1"><I size={14}/>{t}</div>
              <div className={`text-2xl font-bold ${c}`}>{v}</div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
          <div className="font-bold mb-2">💰 Profit Over Time</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={profitHistory}><XAxis dataKey="name" stroke="#666"/><YAxis stroke="#666"/><Tooltip contentStyle={{background:'#111',border:'1px solid #333'}}/><Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false}/></LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
          <div className="font-bold mb-2">🧬 Gene Pool</div>
          <table className="w-full text-sm"><thead className="text-gray-400 text-xs"><tr><th className="text-left p-2">Hook</th><th>Profit</th><th>Status</th></tr></thead><tbody>{genes.map(g=><tr key={g.id} className="border-t border-zinc-800"><td className="p-2">{g.strategy}</td><td className="text-right text-green-400">${g.profit?.toFixed(2)}</td><td className="text-center"><span className={`px-2 py-1 rounded text-xs ${g.status==='winner'?'bg-green-900 text-green-400':'bg-blue-900 text-blue-400'}`}>{g.status}</span></td></tr>)}</tbody></table>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
          <div className="font-bold mb-2">🧠 AI Thought Log</div>
          <div className="space-y-1 text-xs max-h-64 overflow-auto">{decisions.slice(0,10).map(d=><div key={d.id} className="flex gap-4 border-b border-zinc-800 py-1"><span className="text-gray-500">{new Date(d.created_at).toLocaleTimeString()}</span><span className="text-purple-400">{d.chosen_action}</span><span className="text-gray-300 flex-1">{d.reason}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
}
