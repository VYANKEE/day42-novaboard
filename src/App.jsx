import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  Heart, Hand, MapPin, MessageCircle, CheckCircle, 
  Sparkles, Filter, X, Zap, Activity, Shield, Users, Clock, ArrowRight, Send
} from 'lucide-react';
import { db } from './firebase';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, doc, updateDoc 
} from 'firebase/firestore';

// --- CONFIGURATION ---
const CATEGORIES = ["Food", "Transport", "Guidance", "Labor", "Emergency", "Misc"];

// --- UTILS ---
const getAvatarUrl = (name) => `https://api.dicebear.com/7.x/shapes/svg?seed=${name}&backgroundColor=0f172a`;

// --- COMPONENTS ---

// 1. BACKGROUND (Fixed)
const BackgroundEffects = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-blob mix-blend-screen"></div>
    <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"></div>
    <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
  </div>
);

// 2. TOAST NOTIFICATION
const Toast = ({ message, type, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 50, scale: 0.9 }}
    className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100] backdrop-blur-xl border border-white/10 ${
      type === 'success' 
      ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-900/40 text-emerald-400 border-emerald-500/30' 
      : 'bg-gradient-to-r from-red-500/10 to-red-900/40 text-red-400 border-red-500/30'
    }`}
  >
    {type === 'success' ? <CheckCircle size={22} /> : <X size={22} />}
    <span className="font-bold tracking-wide">{message}</span>
  </motion.div>
);

// 3. NAVBAR (Fixed: Full Width Glass Effect)
const Navbar = ({ setView, scrolled }) => (
  <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
    scrolled 
      ? 'bg-slate-900/80 backdrop-blur-lg border-b border-white/5 py-3 shadow-2xl' 
      : 'bg-transparent py-6'
  }`}>
    <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('feed')}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all duration-500 ${
          scrolled ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20' : 'bg-white/10 border border-white/10 group-hover:bg-white/20'
        }`}>
          <Sparkles size={20} fill="currentColor" className={scrolled ? 'text-white' : 'text-cyan-400'} />
        </div>
        <span className="font-bold text-2xl tracking-tight text-white drop-shadow-md font-sans">
          Nova<span className="text-cyan-400">Board</span>
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
          SYSTEM ONLINE
        </div>
      </div>
    </div>
  </nav>
);

// 4. STATS SECTION
const StatsSection = () => (
  <section className="py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm relative z-10">
    <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {[
        { label: "Community Members", value: "2,400+", icon: Users },
        { label: "Requests Solved", value: "850+", icon: CheckCircle },
        { label: "Avg Response Time", value: "12m", icon: Clock },
        { label: "Active Cities", value: "14", icon: MapPin },
      ].map((stat, index) => (
        <div key={index} className="flex flex-col items-center group cursor-default">
          <div className="mb-3 p-3 bg-white/5 rounded-full group-hover:bg-cyan-500/20 transition-colors duration-300">
            <stat.icon className="text-cyan-400 group-hover:scale-110 transition-transform" size={24} />
          </div>
          <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
);

// 5. HERO SECTION
const Hero = ({ scrollToForm }) => (
  <section className="relative pt-32 pb-20 px-4 flex flex-col items-center text-center z-10 min-h-[85vh] justify-center">
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
        <Activity size={14} /> Decentralized Assistance Protocol
      </div>

      <h1 className="text-6xl md:text-9xl font-black mb-6 text-white tracking-tighter leading-none drop-shadow-2xl">
        Ask. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Connect.</span> <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Solve.</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
        The future of anonymous community support. <br/> 
        Zero friction. <span className="text-white font-medium">100% Human Connection.</span>
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(244, 63, 94, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollToForm('need')}
          className="bg-gradient-to-br from-rose-500 to-red-600 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg border border-red-400/20"
        >
          <Heart size={22} fill="currentColor" className="text-white/90" /> I Need Help
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34, 211, 238, 0.2)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollToForm('offer')}
          className="glass text-cyan-300 border-cyan-500/30 px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-cyan-500/10 transition-all"
        >
          <Hand size={22} /> I Can Help
        </motion.button>
      </div>
    </motion.div>
  </section>
);

// 6. FORM MODAL (Fixed Close Button)
const PostForm = ({ type, onClose, showToast }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [city, setCity] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city || !desc || !name) return showToast("All fields are required", "error");
    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        type, name, category, city, description: desc,
        createdAt: serverTimestamp(), status: 'open'
      });
      showToast("Signal broadcasted successfully!", "success");
      onClose(); 
    } catch (err) {
      showToast("Transmission failed.", "error");
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.7)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        
        {/* FIXED CLOSE BUTTON - Increased z-index and size */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-white/5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-all"
        >
          <X size={28} />
        </button>

        <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3 mt-2">
          {type === 'need' ? <Heart className="text-rose-500" fill="currentColor"/> : <Hand className="text-cyan-400"/>}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{type === 'need' ? 'New Request' : 'New Offer'}</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Identity</label>
              <input type="text" placeholder="Display Name" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600" value={name} onChange={(e) => setName(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tag</label>
              <select className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-cyan-500 outline-none transition-all" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location</label>
            <input type="text" placeholder="e.g. Sector 4" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600" value={city} onChange={(e) => setCity(e.target.value)}/>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Details</label>
            <textarea placeholder="Describe situation..." className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-cyan-500 outline-none h-32 resize-none transition-all placeholder:text-slate-600" value={desc} onChange={(e) => setDesc(e.target.value)}/>
          </div>
          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-[0.98] ${type === 'need' ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-rose-500/25' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-cyan-500/25'}`}>{loading ? "Processing..." : "Deploy to Network"}</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// 7. POST CARD
const PostCard = ({ post, onHelp }) => {
  const isClosed = post.status === 'closed';
  let timeAgo = post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now';

  return (
    <motion.div 
      layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -5, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)" }}
      className={`group relative p-6 rounded-2xl border transition-all duration-300 ${isClosed ? 'border-slate-800 bg-slate-900/30 opacity-50 grayscale' : 'glass-card hover:border-cyan-500/30'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-0.5 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full">
            <img src={getAvatarUrl(post.name)} alt="avatar" className="w-10 h-10 rounded-full bg-slate-900" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{post.name}</h3>
            <span className="text-xs text-slate-400 font-mono">{timeAgo}</span>
          </div>
        </div>
        
        {isClosed ? (
           <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-500 border border-slate-700 flex gap-1 items-center"><CheckCircle size={10} /> Resolved</span>
        ) : (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${post.type === 'need' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]'}`}><Zap size={10} fill="currentColor" /> {post.type}</span>
        )}
      </div>

      <div className="mb-5 pl-2 border-l-2 border-slate-700 group-hover:border-cyan-500/50 transition-colors">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">{post.category}</h4>
        <p className="text-slate-200 leading-relaxed font-light">{post.description}</p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><MapPin size={14} className="text-purple-400" /> {post.city}</div>
        {!isClosed && (
          <button onClick={() => onHelp(post.id)} className="text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2 group-hover:bg-cyan-500 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"><MessageCircle size={14} /> CONNECT</button>
        )}
      </div>
    </motion.div>
  );
};

// 8. NEWSLETTER COMPONENT (Fixed)
const Newsletter = ({ showToast }) => {
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if(email && email.includes('@')) {
      showToast("Welcome to the Nova Network!", "success");
      setEmail('');
    } else {
      showToast("Please enter a valid email.", "error");
    }
  }

  return (
    <section className="py-24 border-t border-white/5 bg-gradient-to-b from-slate-900 to-black relative z-10">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Join the Nova Network</h2>
        <p className="text-slate-400 mb-10 text-lg">Get weekly updates on how we are building the future of community support.</p>
        
        <form onSubmit={handleSubscribe} className="flex gap-4 max-w-lg mx-auto">
          <input 
            type="email" 
            placeholder="Enter your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 outline-none transition-all focus:bg-white/10" 
          />
          <button type="submit" className="bg-cyan-500 text-slate-900 font-bold px-8 rounded-2xl hover:bg-cyan-400 transition-all hover:scale-105 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <ArrowRight size={24} />
          </button>
        </form>
        
        <p className="text-slate-600 text-xs mt-12">© 2026 NovaBoard Protocol. Decentralized & Open Source.</p>
      </div>
    </section>
  );
};

// 9. MAIN APP
function App() {
  const [view, setView] = useState('feed'); 
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [toast, setToast] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleHelp = async (id) => {
    if (window.confirm("Mark this signal as resolved?")) {
      try {
        await updateDoc(doc(db, "posts", id), { status: 'closed' });
        showToast("Signal closed successfully.", "success");
      } catch (err) { showToast("Error updating.", "error"); }
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredPosts = filter === 'All' ? posts : posts.filter(p => p.category === filter);

  return (
    <div className="min-h-screen font-sans text-slate-100 selection:bg-cyan-500 selection:text-black relative">
      <BackgroundEffects />
      
      <Navbar setView={setView} scrolled={scrolled} />

      {/* CONTENT */}
      <div className="relative z-10">
        {view === 'feed' ? (
          <>
            <Hero scrollToForm={setView} />
            <StatsSection />
            
            {/* LIVE FEED SECTION */}
            <main className="max-w-6xl mx-auto px-4 pb-20 pt-10" id="feed">
              <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-4xl font-black flex items-center gap-3 text-white mb-2">
                    <Filter size={32} className="text-cyan-400"/> Live Signals
                  </h2>
                  <p className="text-slate-400">Real-time assistance requests from your area.</p>
                </div>
                <select 
                  className="bg-slate-900 border border-slate-700 text-slate-300 py-3 px-6 rounded-xl text-sm focus:border-cyan-500 outline-none mt-4 md:mt-0"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="All">All Frequencies</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredPosts.map(post => (
                    <PostCard key={post.id} post={post} onHelp={handleHelp} />
                  ))}
                </AnimatePresence>
              </div>
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-32 opacity-50 border-2 border-dashed border-slate-800 rounded-3xl mt-10">
                  <p className="text-2xl font-bold text-slate-600">No active signals in this sector.</p>
                  <button onClick={() => setView('need')} className="text-cyan-400 mt-4 font-bold hover:underline">Transmit a signal</button>
                </div>
              )}
            </main>

            <Newsletter showToast={showToast} />
          </>
        ) : (
          <PostForm type={view} onClose={() => setView('feed')} showToast={showToast} />
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;