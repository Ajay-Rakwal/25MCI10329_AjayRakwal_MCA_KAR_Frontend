import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Navigation, 
  History, 
  LogOut, 
  Search, 
  Share2, 
  Ruler, 
  ChevronRight,
  Map as MapIcon,
  BookOpen,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api';

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [nodes, setNodes] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(8);
  const [result, setResult] = useState(null);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [view, setView] = useState('map');
  const [activeTab, setActiveTab] = useState('path');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGraphData();
    if (user) fetchSavedRoutes();
  }, [user]);

  const fetchGraphData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/graph-data`);
      setNodes(Object.keys(res.data.positions).map(name => ({
        name,
        x: res.data.positions[name][0],
        y: res.data.positions[name][1]
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSavedRoutes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/routes/${user.username}`);
      setSavedRoutes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRoute = async (id) => {
    if (!window.confirm("Are you sure you want to delete this saved path?")) return;
    try {
      await axios.delete(`${API_BASE}/routes/${id}`);
      fetchSavedRoutes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const performAction = async (type) => {
    setIsLoading(true);
    try {
      let res;
      if (type === 'path') {
        if (!source || !destination) return;
        res = await axios.get(`${API_BASE}/path`, { params: { start: source, goal: destination } });
        setResult({ type: 'path', ...res.data });
      } else if (type === 'mst') {
        res = await axios.get(`${API_BASE}/mst`);
        setResult({ type: 'mst', ...res.data });
      } else if (type === 'budget') {
        if (!source) return;
        res = await axios.get(`${API_BASE}/budget`, { params: { start: source, budget } });
        setResult({ type: 'budget', ...res.data });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRoute = async () => {
    if (!result || result.type !== 'path') return;
    try {
      await axios.post(`${API_BASE}/routes`, {
        userId: user.userId,
        username: user.username,
        source,
        destination,
        path: result.path,
        cost: result.cost
      });
      fetchSavedRoutes();
      alert('Path saved successfully to your archive!');
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="h-screen flex flex-col bg-amber-50/20 text-orange-950">
      {/* Tinted Navbar */}
      <nav className="h-20 flex items-center justify-between px-8 bg-orange-100/80 border-b border-orange-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center shadow-sm">
            <BookOpen className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-orange-900">Campus Navigator</h1>
            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Educational Portal</p>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-orange-200/30 rounded-2xl">
          <button 
            onClick={() => setView('map')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'map' ? 'bg-orange-50 text-teal-800 shadow-sm' : 'text-orange-700/60'}`}
          >
            <MapIcon size={18} /> Map View
          </button>
          <button 
            onClick={() => setView('history')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'history' ? 'bg-orange-50 text-teal-800 shadow-sm' : 'text-orange-700/60'}`}
          >
            <History size={18} /> My Archive
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-orange-900">{user.username}</p>
            <button onClick={handleLogout} className="text-xs font-bold text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Tinted Sidebar */}
        <aside className="w-80 flex flex-col gap-6 overflow-y-auto">
          <div className="bg-orange-50/90 rounded-3xl border border-orange-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-6">Navigation Controls</h2>
            
            <div className="flex gap-1 p-1 bg-orange-200/20 rounded-xl mb-6 border border-orange-200/30">
              {['path', 'mst', 'budget'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setResult(null); }}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase ${activeTab === tab ? 'bg-orange-50 text-teal-800 shadow-sm' : 'text-orange-400'}`}
                >
                  {tab === 'path' ? 'Shortest' : tab === 'mst' ? 'MST' : 'Budget'}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {(activeTab === 'path' || activeTab === 'budget') && (
                <div>
                  <label className="text-xs font-bold text-orange-800/60 mb-2 block">Starting Location</label>
                  <select value={source} onChange={e => setSource(e.target.value)} className="w-full">
                    <option value="">Select...</option>
                    {nodes.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'path' && (
                <div>
                  <label className="text-xs font-bold text-orange-800/60 mb-2 block">Destination Location</label>
                  <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full">
                    <option value="">Select...</option>
                    {nodes.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'budget' && (
                <div>
                  <label className="text-xs font-bold text-orange-800/60 mb-2 block">Distance Limit ({budget})</label>
                  <input 
                    type="range" min="1" max="20" 
                    value={budget} 
                    onChange={e => setBudget(e.target.value)}
                    className="w-full h-2 bg-orange-200 rounded-full appearance-none cursor-pointer accent-teal-700"
                  />
                </div>
              )}

              <button 
                onClick={() => performAction(activeTab)}
                className="w-full btn-positive"
              >
                {isLoading ? 'Calculating...' : activeTab === 'path' ? 'Find Shortest Path' : activeTab === 'mst' ? 'Show Spanning Tree' : 'Show Reachable Area'}
              </button>
            </div>

            {result && result.type === 'path' && (
              <div className="mt-8 pt-8 border-t border-orange-200/50">
                <div className="bg-orange-100/50 rounded-2xl p-5 border border-orange-200/50 shadow-inner">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-orange-900/60 uppercase tracking-widest">Path Result</h3>
                    <CheckCircle2 size={16} className="text-teal-700" />
                  </div>
                  <p className="text-2xl font-bold text-orange-950 mb-4">{result.cost} <span className="text-xs font-medium text-orange-700 italic">units</span></p>
                  <button 
                    onClick={saveRoute} 
                    className="w-full py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 hover:bg-teal-800 shadow-md"
                  >
                    <Share2 size={14} /> Save Path to Archive
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            {view === 'map' ? (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full bg-orange-50/60 rounded-3xl border border-orange-200 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-orange-200 bg-orange-100/30 flex justify-between items-center">
                  <span className="text-xs font-bold text-orange-900/40 uppercase tracking-widest">Interactive Campus Grid</span>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-600 shadow-[0_0_8px_rgba(13,148,136,0.5)]"></div><span className="text-[10px] font-bold text-orange-800/60 uppercase">Path</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-700"></div><span className="text-[10px] font-bold text-orange-800/60 uppercase">MST</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-700"></div><span className="text-[10px] font-bold text-orange-800/60 uppercase">Budget</span></div>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-12">
                  <Map nodes={nodes} result={result} />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full overflow-y-auto"
              >
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-orange-950 mb-1">My Archive</h2>
                    <p className="text-sm font-medium text-orange-800/60">Total saved navigation paths: {savedRoutes.length}</p>
                  </div>
                </div>

                {savedRoutes.length === 0 ? (
                  <div className="bg-orange-50/80 p-20 rounded-[2rem] text-center border border-dashed border-orange-200">
                    <History size={48} className="mx-auto text-orange-200 mb-4" />
                    <p className="text-orange-400 font-bold">No paths saved yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {savedRoutes.map((route) => (
                      <div key={route._id} className="bg-orange-50/90 p-6 rounded-3xl border border-orange-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-700/10 text-teal-700 rounded-xl flex items-center justify-center">
                              <Navigation size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-orange-950">{route.source}</span>
                                <ChevronRight size={14} className="text-orange-400" />
                                <span className="font-bold text-orange-950">{route.destination}</span>
                              </div>
                              <p className="text-[10px] font-bold text-orange-400 uppercase mt-0.5">{new Date(route.savedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-teal-700/10 text-teal-800 px-3 py-1 rounded-lg font-bold text-xs">{route.cost} units</span>
                            <button 
                              onClick={() => deleteRoute(route._id)}
                              className="w-8 h-8 flex items-center justify-center text-orange-200 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="bg-orange-100/30 rounded-xl p-3 border border-orange-200/50">
                          <p className="text-[10px] font-medium text-orange-900/60 leading-relaxed italic overflow-hidden text-ellipsis whitespace-nowrap">
                            {route.path.join(' → ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

const Map = ({ nodes, result }) => {
  const getLineProps = (u, v) => {
    if (result?.type === 'path') {
      const idxU = result.path.indexOf(u);
      const idxV = result.path.indexOf(v);
      if (idxU !== -1 && idxV !== -1 && Math.abs(idxU - idxV) === 1) {
        return { stroke: '#0d9488', strokeWidth: 5, strokeLinecap: 'round', opacity: 1 };
      }
    }
    if (result?.type === 'mst') {
      if (result.mst.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u))) {
        return { stroke: '#b45309', strokeWidth: 5, strokeLinecap: 'round', opacity: 1 };
      }
    }
    if (result?.type === 'budget') {
      if (result.sptEdges.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u))) {
        return { stroke: '#b91c1c', strokeWidth: 5, strokeLinecap: 'round', opacity: 1 };
      }
    }
    return { stroke: '#fed7aa', strokeWidth: 2, strokeLinecap: 'round', opacity: 0.6 };
  };

  const isReachable = (nodeName) => {
    if (result?.type === 'budget') return result.reachable.some(r => r.node === nodeName);
    if (result?.type === 'path') return result.path.includes(nodeName);
    if (result?.type === 'mst') return result.mst.some(e => e.u === nodeName || e.v === nodeName);
    return false;
  };

  const edges = [
    ['Front Gate', 'Library'], ['Front Gate', 'Canteen'], ['Front Gate', 'Admin'],
    ['Admin', 'Library'], ['Admin', 'Auditorium'], ['Admin', 'Research Block'],
    ['Library', 'Hostel'], ['Library', 'Lab'], ['Library', 'Research Block'],
    ['Hostel', 'Lab'], ['Hostel', 'Sports Complex'], ['Hostel', 'Parking'],
    ['Canteen', 'Lab'], ['Canteen', 'Cultural Center'],
    ['Lab', 'Ground'], ['Lab', 'Auditorium'], ['Lab', 'Research Block'],
    ['Ground', 'Sports Complex'], ['Ground', 'Parking'], ['Ground', 'Back Gate'],
    ['Sports Complex', 'Parking'], ['Sports Complex', 'Back Gate'],
    ['Auditorium', 'Cultural Center'],
    ['Cultural Center', 'Parking'],
    ['Parking', 'Back Gate']
  ];

  return (
    <svg viewBox="0 0 800 400" className="w-full h-full max-w-4xl">
      {/* Edges */}
      {edges.map(([u, v], i) => {
        const n1 = nodes.find(n => n.name === u);
        const n2 = nodes.find(n => n.name === v);
        if (!n1 || !n2) return null;
        return (
          <line 
            key={i} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} 
            {...getLineProps(u, v)}
            className="transition-all duration-300"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(node => (
        <g key={node.name} transform={`translate(${node.x}, ${node.y})`} className="group/node">
          <circle 
            r={isReachable(node.name) ? 14 : 10} 
            fill={isReachable(node.name) ? (result?.type === 'mst' ? '#b45309' : result?.type === 'budget' ? '#b91c1c' : '#0d9488') : '#ffedd5'} 
            stroke="#fed7aa"
            strokeWidth="2"
            className="transition-all duration-300 shadow-sm"
          />
          <text 
            y="30" textAnchor="middle" 
            className={`text-[9px] font-black uppercase transition-all duration-300 ${isReachable(node.name) ? 'fill-orange-950' : 'fill-orange-300'}`}
          >
            {node.name}
          </text>
        </g>
      ))}
    </svg>
  );
};

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
        localStorage.setItem('user', JSON.stringify(res.data));
        onLogin(res.data);
      } else {
        await axios.post(`${API_BASE}/auth/signup`, { username, password });
        alert('Success! Now you can log in.');
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error: Please check your credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-orange-50">
      <div className="max-w-md w-full bg-orange-100/50 p-12 rounded-[2.5rem] shadow-xl border border-orange-200">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-teal-700/20">
            <BookOpen className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-black text-orange-900 tracking-tight">
            {isLogin ? 'Login' : 'Signup'}
          </h2>
          <p className="text-orange-400 text-sm mt-2 font-bold uppercase tracking-widest">Grid Portal Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-orange-400 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" required placeholder="IDENTIFY"
              className="w-full bg-orange-50 border-orange-200" value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-orange-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" required placeholder="••••••••"
              className="w-full bg-orange-50 border-orange-200" value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full btn-positive h-14 uppercase tracking-widest text-sm shadow-lg shadow-teal-700/20 font-black">
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black text-teal-700 uppercase tracking-widest hover:underline"
          >
            {isLogin ? "Generate New Node" : 'Return to Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
