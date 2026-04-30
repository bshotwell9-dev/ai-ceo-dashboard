import { createClient } from '@supabase/supabase-js';
const API = process.env.NEXT_PUBLIC_API_URL;
const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE!== 'false';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo');

const MOCK = {
  genes: [
    {id:1,strategy:"Stop buying cheap desks",hook_type:"Problem-Solution",views:12450,revenue:48.2,affiliate_revenue:39.84,cost:0.6,profit:87.44,cpm:3.87,fitness_score:12450,status:"winner",variant:"A",ab_test_id:"t1"},
    {id:2,strategy:"Stop buying cheap desks",hook_type:"Problem-Solution",views:11800,revenue:41.3,affiliate_revenue:0,cost:0.6,profit:40.7,cpm:3.5,fitness_score:8900,status:"culled",variant:"B",ab_test_id:"t1"},
    {id:3,strategy:"Top 3 productivity hacks",hook_type:"Listicle",views:8900,revenue:22.1,affiliate_revenue:8,cost:0.6,profit:29.5,cpm:2.48,fitness_score:7200,status:"testing"}
  ],
  decisions: [
    {id:1,chosen_action:"evolve",expected_value:87,reason:"Clone winning A/B combo: desk",created_at:new Date().toISOString(),state_snapshot:{total_profit:165.64}},
    {id:2,chosen_action:"analyze_affiliate",expected_value:42,reason:"CTR below 3% threshold",created_at:new Date(Date.now()-60000).toISOString(),state_snapshot:{total_profit:123.20}}
  ],
  ab_tests: [{id:"t1",hook:"Stop buying cheap desks",status:"completed",total_profit_a:87.44,total_profit_b:40.7,confidence:0.68,winner:"A"}],
  state: {total_profit:165.64,affiliate_revenue:47.84,avg_cpm:3.28,affiliate_cr:0.042}
};

const fetchAPI = async (endpoint) => {
  if (DEMO) { await new Promise(r=>setTimeout(r,200)); const key = endpoint.split('/').pop().split('?')[0].replace('-',''); return MOCK[key] || MOCK.state; }
  const res = await fetch(`${API}/api${endpoint}`); return res.json();
};

export const api = {
  getGenes: () => fetchAPI('/genes'),
  getDecisions: () => fetchAPI('/decisions'),
  getAbTests: () => fetchAPI('/ab-tests'),
  getState: () => fetchAPI('/state'),
  getBrainStatus: () => DEMO? Promise.resolve({status:'running'}) : fetchAPI('/brain/status'),
  manualOverride: (action, params={}) => fetchAPI('/manual-override')
};

export const realtime = {
  subscribe: (channel, event, cb) => {
    if (DEMO) {
      const interval = setInterval(() => {
        if (channel === 'brain') cb({ chosen_action: 'evolve', expected_value: Math.random()*20+70, reason: 'Demo: clone winner', state_snapshot: { total_profit: MOCK.state.total_profit + Math.random()*5 }, created_at: new Date().toISOString() });
      }, 10000);
      return () => clearInterval(interval);
    }
    const ch = supabase.channel(channel); ch.on('broadcast', {event}, (p) => cb(p.payload)).subscribe(); return () => supabase.removeChannel(ch);
  }
};
