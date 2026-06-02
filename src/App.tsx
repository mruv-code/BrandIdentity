import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Zap, HelpCircle, ChevronRight, CheckCircle2, 
  XCircle, Loader2, Sparkles, AlertCircle, ArrowRight, ExternalLink, 
  Globe, UserCheck, Shield, Bookmark, ArrowUpRight, ChevronDown, RefreshCw, Mail,
  Menu, X
} from 'lucide-react';
import { PlatformResult, DomainResult, SuggestionResult } from './types';


const API_URL = (import.meta as any).env.VITE_API_URL || '';
console.log("API_URL =", import.meta.env.VITE_API_URL);

// Supported networks informational registry
const SOCIAL_NETWORKS_INFO = [
  { id: 'instagram', name: 'Instagram', desc: 'Verify @handles on the world\'s top visual network.', color: 'from-pink-600/10 to-purple-600/10 border-pink-500/10 hover:border-pink-500/30 text-pink-400' },
  { id: 'tiktok', name: 'TikTok', desc: 'Secure short-form handles for viral video content.', color: 'from-cyan-600/10 to-red-600/10 border-teal-500/10 hover:border-teal-500/30 text-teal-300' },
  { id: 'x', name: 'X / Twitter', desc: 'Claim namespaces on the global public town square.', color: 'from-zinc-800/10 to-zinc-700/10 border-zinc-700/30 hover:border-zinc-500/30 text-zinc-100' },
  { id: 'youtube', name: 'YouTube', desc: 'Protect handles for video creators & channels.', color: 'from-red-600/10 to-red-500/10 border-red-500/10 hover:border-red-500/30 text-red-500' },
  { id: 'facebook', name: 'Facebook', desc: 'Establish presence on the largest social graph.', color: 'from-blue-600/10 to-indigo-600/10 border-blue-500/10 hover:border-blue-500/30 text-blue-400' },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Secure corporate identities and team channels.', color: 'from-blue-700/10 to-sky-700/10 border-sky-600/10 hover:border-sky-600/30 text-sky-400' },
  { id: 'github', name: 'GitHub', desc: 'Register profiles and developer organizations.', color: 'from-neutral-800/10 to-neutral-700/10 border-neutral-700/30 hover:border-neutral-500/30 text-neutral-300' },
  { id: 'telegram', name: 'Telegram', desc: 'Anchor messaging channels and bot handles.', color: 'from-sky-500/10 to-blue-500/10 border-sky-400/10 hover:border-sky-400/30 text-sky-300' },
  { id: 'reddit', name: 'Reddit', desc: 'Safeguard identity in community discussion trees.', color: 'from-orange-600/10 to-orange-500/10 border-orange-500/10 hover:border-orange-500/30 text-orange-400' },
  { id: 'twitch', name: 'Twitch', desc: 'Claim handles for live-streaming channels.', color: 'from-purple-600/10 to-fuchsia-600/10 border-purple-500/10 hover:border-purple-500/30 text-purple-400' },
  { id: 'pinterest', name: 'Pinterest', desc: 'Consolidate visual boards and search curation sites.', color: 'from-red-700/10 to-pink-700/10 border-red-600/10 hover:border-red-600/30 text-red-400' },
  { id: 'medium', name: 'Medium', desc: 'Publish clean blogs with direct custom handles.', color: 'from-emerald-600/10 to-zinc-800/10 border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400' },
  { id: 'snapchat', name: 'Snapchat', desc: 'Lookup chat handles for casual messaging.', color: 'from-yellow-500/10 to-amber-500/10 border-yellow-400/10 hover:border-yellow-400/30 text-yellow-300' },
  { id: 'spotify', name: 'Spotify', desc: 'Protect artist and playlist creator profiles.', color: 'from-emerald-500/10 to-green-500/10 border-green-400/10 hover:border-green-400/30 text-green-400' },
  { id: 'behance', name: 'Behance', desc: 'Secure creative designer portfolios under one identity.', color: 'from-blue-600/10 to-blue-500/10 border-blue-500/10 hover:border-blue-500/30 text-blue-400' },
  { id: 'dribbble', name: 'Dribbble', desc: 'Confirm username on elite design showcase logs.', color: 'from-rose-500/10 to-rose-400/10 border-rose-400/10 hover:border-rose-400/30 text-rose-400' },
  { id: 'patreon', name: 'Patreon', desc: 'Safeguard member benefits and payment portals.', color: 'from-orange-500/10 to-red-500/10 border-orange-500/10 hover:border-orange-500/30 text-orange-400' },
  { id: 'substack', name: 'Substack', desc: 'Claim newsletter URLs and feed subscriptions.', color: 'from-orange-700/10 to-orange-600/10 border-orange-600/10 hover:border-orange-600/30 text-orange-500' },
  { id: 'devto', name: 'Dev.to', desc: 'Sync social handle on core developer blog sites.', color: 'from-zinc-800/10 to-zinc-900/10 border-zinc-700/20 hover:border-zinc-500/30 text-zinc-300' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [username, setUsername] = useState<string>('');
  const [isCheckingUser, setIsCheckingUser] = useState<boolean>(false);
  const [checkedUsername, setCheckedUsername] = useState<string>('');
  const [userResults, setUserResults] = useState<PlatformResult[] | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Domain search states
  const [domainQuery, setDomainQuery] = useState<string>('');
  const [isCheckingDomain, setIsCheckingDomain] = useState<boolean>(false);
  const [checkedDomain, setCheckedDomain] = useState<string>('');
  const [domainResults, setDomainResults] = useState<DomainResult[] | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  // Gemini AI state
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<SuggestionResult[]>([]);
  const [industry, setIndustry] = useState<string>('Software');
  const [keywords, setKeywords] = useState<string>('');
  const [aiError, setAiError] = useState<string | null>(null);

  // FAQ Accordion index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Form submission feedback
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [contactSubmitting, setContactSubmitting] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);

  // Sync state if initial path matches a specific query page
  useEffect(() => {
    const handlePathname = () => {
      const path = window.location.pathname;
      if (path === '/username-checker') {
        setActiveTab('username');
      } else if (path === '/domain-checker') {
        setActiveTab('domains');
      } else if (path === '/privacy') {
        setActiveTab('privacy');
      } else if (path === '/terms') {
        setActiveTab('terms');
      } else {
        setActiveTab('home');
      }
    };
    handlePathname();
    window.addEventListener('popstate', handlePathname);
    return () => window.removeEventListener('popstate', handlePathname);
  }, []);

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const formattedPath = tab === 'home' ? '/' : `/${tab}-checker`;
    window.history.pushState({}, '', formattedPath === '/privacy-checker' ? '/privacy' : formattedPath === '/terms-checker' ? '/terms' : formattedPath);
  };

  const handleHomeUsernameCheck = (e: React.FormEvent, targetUsername?: string) => {
    e.preventDefault();
    const query = targetUsername || username;
    if (!query.trim()) return;
    
    setUsername(query.trim());
    setActiveTab('username');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({}, '', '/username-checker');
    
    setTimeout(() => {
      setIsCheckingUser(true);
      setUserError(null);
      setUserResults(null);
      setAiSuggestions([]);
      setAiError(null);
      setCheckedUsername(query.trim());
      
      fetch(`${API_URL}/api/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: query.trim() }),
      })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned HTTP status ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.error) {
          setUserError(data.error);
        } else {
          setUserResults(data.results || []);
          const hasUnavailable = data.results?.some((r: any) => r.available === false);
          if (hasUnavailable) {
            triggerAiSuggestions(query.trim());
          }
        }
      })
      .catch(err => {
        setUserError(err.message || 'Underlying server communication failure.');
      })
      .finally(() => {
        setIsCheckingUser(false);
      });
    }, 100);
  };

  const handleUsernameCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsCheckingUser(true);
    setUserError(null);
    setUserResults(null);
    setAiSuggestions([]);
    setAiError(null);
    setCheckedUsername(username.trim());

    try {
      const response = await fetch(`${API_URL}/api/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        setUserError(data.error);
      } else {
        setUserResults(data.results || []);
        // Trigger AI suggestions in the background if there are unavailable entries
        const hasUnavailable = data.results?.some((r: PlatformResult) => r.available === false);
        if (hasUnavailable) {
          triggerAiSuggestions(username.trim());
        }
      }
    } catch (err: any) {
      setUserError(err.message || 'Underlying server communication failure. Re-verify service state.');
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleDomainCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainQuery.trim()) return;

    setIsCheckingDomain(true);
    setDomainError(null);
    setDomainResults(null);
    setCheckedDomain(domainQuery.trim());

    try {
      const response = await fetch(`${API_URL}/api/check-domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainname: domainQuery.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        setDomainError(data.error);
      } else {
        setDomainResults(data.domains || []);
      }
    } catch (err: any) {
      setDomainError(err.message || 'Unable to retrieve DNS records at this time.');
    } finally {
      setIsCheckingDomain(false);
    }
  };

  const triggerAiSuggestions = async (baseName: string) => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch(`${API_URL}/api/brand-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: baseName,
          industry,
          keywords
        }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      setAiError('Unable to generate AI recommendations.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const triggerContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSuccess(true);
      setContactEmail('');
      setContactMessage('');
    }, 1500);
  };

  const faqs = [
    {
      q: "How does the brand availability checker verify handles?",
      a: "BrandSync executes concurrent backend probing directly on the servers of major social networks (Instagram, TikTok, X, GitHub, Reddit, Twitch, and Pinterest). We query the direct REST nodes and public routes securely—providing you with instant, un-cached availability feedback."
    },
    {
      q: "Are my brand name and username searches logged or sold?",
      a: "Absolutely not. BrandSync operates with strict end-to-end privacy constraints. We maintain zero database logs of your searches, and we do not participate in domain broker speculation, squatting, or selling search records to third parties."
    },
    {
      q: "What domains and extensions are checked?",
      a: "We query live DNS lookups for the top five global extensions: .com, .net, .org, .co, and .io. Our backend runs robust standard resolution queries to verify whether root DNS records have been assigned, yielding near 100% resolution accuracy."
    },
    {
      q: "How does the Gemini AI Engine generate alternative handles?",
      a: "If your exact handle or domain is already claimed, the Gemini 3.5 model takes your core brand concept, target market parameters, and modifier lists to build unique brand names. These recommendations represent premium synonyms, phonetic variations, and prefix/suffix upgrades tailored specifically for SaaS ventures."
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans selection:bg-blue-600/30">
      
      {/* HEADER SECTION - FLOATED CAPSULE NAVBAR */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pointer-events-none">
        <nav className="border border-zinc-800/80 bg-[#09090B]/90 backdrop-blur-lg rounded-2xl shadow-xl shadow-black/60 pointer-events-auto transition-all overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14 sm:h-16 items-center">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
                <div className="h-9 w-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                </div>
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                  BrandSync
                </span>
              </div>
              
              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-1">
                <button 
                  onClick={() => navigateTo('home')} 
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'home' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => navigateTo('username')} 
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'username' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Username Checker
                </button>
                <button 
                  onClick={() => navigateTo('domains')} 
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'domains' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Domain Search
                </button>
              </div>

              {/* Action and Hamburger Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigateTo('username')} 
                  className="hidden sm:flex px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-lg transition-all shadow-md shadow-blue-600/15 items-center gap-1"
                >
                  <span>Launch Engine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Mobile hamburger toggle */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="flex md:hidden p-2 text-zinc-400 hover:text-white focus:outline-none focus:ring-0 rounded-xl hover:bg-zinc-900/60 transition-all"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Mobile Navigation drawer */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="md:hidden border-t border-zinc-900/50 bg-[#09090B]/95"
              >
                <div className="px-4 py-4 space-y-1.5">
                  <button
                    onClick={() => navigateTo('home')}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center ${activeTab === 'home' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => navigateTo('username')}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center ${activeTab === 'username' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Username Checker
                  </button>
                  <button
                    onClick={() => navigateTo('domains')}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center ${activeTab === 'domains' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Domain Search
                  </button>
                  <button
                    onClick={() => navigateTo('username')}
                    className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-center text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>

      {/* WORKSPACE APP CONTAINER */}
      <main className="flex-grow p-1 pt-24 sm:pt-28">
        <AnimatePresence mode="wait">
          
          {/* HOME VIEW */}
          {activeTab === 'home' && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24"
            >
              {/* HERO SECTION */}
              <div className="text-center max-w-4xl mx-auto space-y-6 pt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/60 border border-zinc-800 rounded-full text-[11px] font-medium text-blue-400 font-mono tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                  <span>Standalone Multi-Channel Registry Deployment ready</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Protect Your Identity Across the{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    Entire Web
                  </span>
                </h1>
                
                <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  Lock down matching social media accounts and verify domain registration status simultaneously. Build unified trade names secured with premium AI guidance.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button 
                    onClick={() => navigateTo('username')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl border border-zinc-800 hover:border-zinc-750 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <UserCheck className="w-4 h-4 text-blue-400" />
                    <span>Check Handles</span>
                  </button>
                  <button 
                    onClick={() => navigateTo('domains')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-600/15"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Search Domain Status</span>
                  </button>
                </div>
              </div>

              {/* DUAL LAUNCH BAR GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-6">
                
                {/* USERNAME BOX */}
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 hover:border-blue-500/20 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-blue-950/50 rounded-xl w-fit border border-blue-900/30 mb-5">
                      <UserCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-sans font-bold text-lg text-white mb-2">Username Availability Node</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                      Instantly query Instagram, TikTok, X, YouTube, Facebook, LinkedIn, GitHub, Reddit, Telegram, Twitch, Pinterest, Medium, and more concurrently. Verify handles against global namespaces.
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('username')}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white font-medium rounded-xl text-xs transition-colors border border-zinc-850 flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Username Engine</span>
                    <ChevronRight className="w-4.5 h-4.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* DOMAIN BOX */}
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 hover:border-indigo-500/20 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-indigo-950/50 rounded-xl w-fit border border-indigo-900/30 mb-5">
                      <Globe className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-sans font-bold text-lg text-white mb-2">Domain Extension DNS</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                      Initiate standard lookup connections to check .com, .net, .org, .co, and .io databases. No registration required.
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('domains')}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white font-medium rounded-xl text-xs transition-colors border border-zinc-850 flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Domain Engine</span>
                    <ChevronRight className="w-4.5 h-4.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* SOCIAL MEDIA QUICK DIRECTORY */}
              <div className="max-w-5xl mx-auto space-y-8 pt-4">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/30 border border-blue-900/35 rounded-full text-[10px] font-bold text-blue-400 font-mono tracking-wide">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>Cross-Platform Coverage Array</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Supported Networks & Registries
                  </h2>
                  <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                    Verify namespaces across any of our 19 built-in social engines. Put in a name below to check them all in one click — entirely tension-free.
                  </p>
                </div>

                {/* Direct Search Sub-Bar */}
                <form onSubmit={handleHomeUsernameCheck} className="max-w-2xl mx-auto">
                  <div className="flex bg-zinc-950/80 border border-zinc-850 rounded-2xl p-2 items-center focus-within:border-blue-500/50 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all gap-2">
                    <div className="pl-3 text-zinc-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter unified brand username (e.g. creativeflow)" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                      className="w-full bg-transparent border-0 outline-none focus:ring-0 text-white text-sm placeholder:text-zinc-500 font-medium py-2.5 px-1 font-sans"
                      required
                    />
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <span>Check All Socials</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Grid layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-6">
                  {SOCIAL_NETWORKS_INFO.map((net) => (
                    <div 
                      key={net.id}
                      onClick={(e) => {
                        if (username.trim()) {
                          handleHomeUsernameCheck(e, username);
                        } else {
                          setActiveTab('username');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          window.history.pushState({}, '', '/username-checker');
                        }
                      }}
                      className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-zinc-900/30 hover:border-zinc-800 hover:shadow-lg cursor-pointer group flex flex-col justify-between h-32"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                            {net.name}
                          </span>
                          <span className="text-[9px] font-mono font-bold tracking-wider text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded-md border border-emerald-900/35">
                            Live
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">
                          {net.desc}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[10px] text-blue-400 font-mono font-bold group-hover:underline pt-2">
                        <span>Scan handles</span>
                        <ArrowUpRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CORE SaaS FEATURES */}
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Full-Suite Security Protections</h2>
                  <p className="text-zinc-500 text-xs sm:text-sm">The complete technical features engineered directly within our ecosystem.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-zinc-950/20 border border-zinc-900/60 rounded-xl p-6 space-y-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <h4 className="font-bold text-white text-base">Antigravity Privacy</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Zero tracking logs are saved. Your desired names remain entirely unlogged and confidential to shield your operations.
                    </p>
                  </div>
                  <div className="bg-zinc-950/20 border border-zinc-900/60 rounded-xl p-6 space-y-3">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-bold text-white text-base">Concurrent Threading</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      We execute platform validation checks concurrently to provide true availability feedback in under 6 seconds.
                    </p>
                  </div>
                  <div className="bg-zinc-950/20 border border-zinc-900/60 rounded-xl p-6 space-y-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-white text-base">Gemini Pro Recommendations</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Generate intelligent suggestions based on semantic variants of your input name whenever standard targets are taken.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ ACCORDION SECTION */}
              <div className="max-w-4xl mx-auto space-y-8 pb-12">
                <div className="text-center space-y-2">
                  <div className="inline-flex py-1 px-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                    SaaS Reference
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div key={index} className="border border-zinc-900 bg-zinc-950/40 rounded-xl overflow-hidden transition-all">
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full px-5 py-4 flex items-center justify-between text-left text-white text-sm sm:text-base font-semibold"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 bg-black/10">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* USERNAME AVAILABILITY VIEW */}
          {activeTab === 'username' && (
            <motion.div 
              key="username" 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto px-4 py-16 space-y-12"
            >
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Username Verification Suite</h2>
                <p className="text-zinc-400 text-sm">
                  Run concurrent probes across modern social channels. Secure matching handles to consolidate your corporate or creative brand.
                </p>
              </div>

              {/* SEARCH USERNAME FORM */}
              <form onSubmit={handleUsernameCheck} className="space-y-4">
                <div className="flex bg-zinc-950/80 border border-zinc-800 rounded-xl p-2 items-center focus-within:border-blue-500/50 transition-all gap-2">
                  <div className="pl-3 text-zinc-500">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter brand name or username (e.g. creativeflow)" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 text-white text-sm placeholder:text-zinc-500 font-medium py-2.5 px-1"
                    disabled={isCheckingUser}
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isCheckingUser}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs px-5 py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isCheckingUser ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Hub</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* ERROR ALERT DISPLAY */}
              {userError && (
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-red-200">Checking Failure</h5>
                    <p className="text-[11px] text-red-300/80 leading-relaxed mt-0.5">{userError}</p>
                  </div>
                </div>
              )}

              {/* USER RESULTS RENDER GRID */}
              {userResults && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <h4 className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
                      Platform Reports for "{checkedUsername}"
                    </h4>
                    <span className="text-[11px] font-medium text-emerald-400">
                      {userResults.filter(r => r.available === true).length} Available / {userResults.length} Total Checked
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userResults.map((result) => (
                      <div 
                        key={result.platform} 
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all bg-zinc-950/30 ${result.available === true ? 'border-zinc-900 hover:border-emerald-500/20' : result.available === false ? 'border-zinc-900 hover:border-red-500/10' : 'border-zinc-900/50'}`}
                      >
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-white block">{result.platform}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {result.profileUrl ? (
                              <a href={result.profileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                                <span>Check handle link</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : 'No lookup link'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {result.available === true ? (
                            <span className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 text-[10px] font-bold border border-emerald-900/30 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Free</span>
                            </span>
                          ) : result.available === false ? (
                            <span className="px-2.5 py-1 bg-red-950/20 text-red-300 text-[10px] font-bold border border-red-900/20 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Claimed</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-zinc-900 text-zinc-500 text-[10px] font-bold border border-zinc-800 rounded-full">
                              Rate limited
                            </span>
                          )}

                          {result.available === true ? (
                            <a 
                              href={result.registerUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
                              title={`Secure brand on ${result.platform}`}
                            >
                              <ArrowUpRight className="w-4 h-4 text-blue-400" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SPECIALIST AI RECOMMENDATIONS PANEL */}
                  <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-950/40 rounded-lg text-blue-400 border border-blue-900/30">
                          <Sparkles className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-bold text-white">BrandSync Smart Brand Generator</h4>
                          <p className="text-[11px] text-zinc-500">Gemini 3.5 AI suggestions powered by your brand keywords</p>
                        </div>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => triggerAiSuggestions(checkedUsername)}
                        disabled={isAiLoading || !checkedUsername}
                        className="p-1 px-2.5 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin text-blue-400' : ''}`} />
                        <span>Regenerate</span>
                      </button>
                    </div>

                    {/* AI SECTOR SETTINGS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-900">
                      <div>
                        <label className="text-[10px] font-mono tracking-wider font-bold text-zinc-500 block mb-1">Target Sector Industry</label>
                        <input 
                          type="text" 
                          placeholder="e.g. AI SaaS, Fitness Studio, Agency" 
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full bg-transparent border border-zinc-800 rounded-lg p-2 text-xs text-white placeholder:text-zinc-650 focus:border-blue-500/30 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono tracking-wider font-bold text-zinc-500 block mb-1">Specific Mission Keywords</label>
                        <input 
                          type="text" 
                          placeholder="e.g. minimalist, clean, fast" 
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          className="w-full bg-transparent border border-zinc-800 rounded-lg p-2 text-xs text-white placeholder:text-zinc-650 focus:border-blue-500/30 outline-none"
                        />
                      </div>
                    </div>

                    {isAiLoading && (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="text-xs text-zinc-500">Retrieving Gemini intelligent suggestions...</span>
                      </div>
                    )}

                    {aiError && (
                      <span className="text-[11px] text-zinc-500 block">{aiError}</span>
                    )}

                    {!isAiLoading && aiSuggestions.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {aiSuggestions.map((sug) => (
                          <div 
                            key={sug.username} 
                            onClick={() => {
                              setUsername(sug.username);
                              navigateTo('username');
                            }}
                            className="bg-zinc-900/30 hover:bg-zinc-900/60 transition-all border border-zinc-900 hover:border-blue-500/30 p-3.5 rounded-xl cursor-pointer text-left space-y-1 group"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">
                                {sug.username}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <span className="text-[10px] text-zinc-500 block leading-relaxed">
                              {sug.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isAiLoading && aiSuggestions.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          Submit username query first to unlock bespoke brand choices.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* DOMAIN SEARCH VIEW */}
          {activeTab === 'domains' && (
            <motion.div 
              key="domains" 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto px-4 py-16 space-y-12"
            >
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Standard Domain Status Resolver</h2>
                <p className="text-zinc-400 text-sm">
                  Run DNS record lookups to test whether a root domain is claimed or available. Standard top-level extensions supported cleanly.
                </p>
              </div>

              {/* DOMAIN CHECK FORM */}
              <form onSubmit={handleDomainCheck} className="space-y-4">
                <div className="flex bg-zinc-950/80 border border-zinc-800 rounded-xl p-2 items-center focus-within:border-blue-500/50 transition-all gap-2">
                  <div className="pl-3 text-zinc-500">
                    <Globe className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter root domain or brand name (e.g. cloudwave)" 
                    value={domainQuery}
                    onChange={(e) => setDomainQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 text-white text-sm placeholder:text-zinc-500 font-medium py-2.5 px-1"
                    disabled={isCheckingDomain}
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isCheckingDomain}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs px-5 py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isCheckingDomain ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Probing DNS...</span>
                      </>
                    ) : (
                      <>
                        <span>Resolve DNS</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* ERROR DISPLAY */}
              {domainError && (
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-300/80 leading-relaxed mt-0.5">{domainError}</p>
                </div>
              )}

              {/* DOMAIN RESULTS CARDS */}
              {domainResults && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <h4 className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
                      DNS Resolution for "{checkedDomain}"
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {domainResults.map((dom) => (
                      <div 
                        key={dom.tld} 
                        className={`p-4 bg-zinc-950/30 border border-zinc-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-zinc-950/55`}
                      >
                        <div>
                          <span className="text-sm font-bold text-zinc-200 block">{dom.domain}</span>
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-mono">
                            Extension: {dom.tld}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 justify-end">
                          {dom.available === true ? (
                            <>
                              <span className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 text-[10px] font-bold border border-emerald-900/30 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Free to Register</span>
                              </span>
                              <a 
                                href={dom.registerUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/25 text-blue-400 hover:text-blue-300 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 border border-blue-900/20"
                              >
                                <span>Purchase</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          ) : dom.available === false ? (
                            <span className="px-2.5 py-1 bg-red-950/20 text-red-300 text-[10px] font-bold border border-red-900/20 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>Registered</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-zinc-900 text-zinc-500 text-[10px] font-bold border border-zinc-800 rounded-full">
                              Unknown query
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}



          {/* POLICY VIEW */}
          {activeTab === 'privacy' && (
            <motion.div 
              key="privacy" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-left"
            >
              <h2 className="text-3xl font-extrabold text-white">Privacy Protection Mandate</h2>
              <p className="text-zinc-500 text-xs font-mono">Last revised: June 2026</p>
              
              <div className="prose prose-invert text-zinc-300 text-xs sm:text-sm leading-relaxed space-y-5">
                <p>
                  BrandSync is committed to maintaining the absolute privacy of all users. Our check operations are constructed to minimize data recording footprints entirely.
                </p>
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">1. No Search Logging Architecture</h4>
                <p>
                  We guarantee that we do not record, store, or warehouse searched usernames or domain words within any permanent database index on backend load. We execute direct requests in volatile process RAM memory—discarding the search parameters immediately once the API response compiles.
                </p>
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">2. Cookie Policy</h4>
                <p>
                  Our web interface operates purely as an on-demand, static, cookie-less diagnostic platform. We do not place ad-tracking scripts, marketing pixels, or third party browser identifiers to capture user history.
                </p>
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">3. Information Security</h4>
                <p>
                  All payload exchanges processed between the customer's portal and our standalone Render backend are handled exclusively via TLS-encrypted tunnels. No non-HTTPS fallback routes are permitted.
                </p>
              </div>
            </motion.div>
          )}

          {/* TERMS VIEW */}
          {activeTab === 'terms' && (
            <motion.div 
              key="terms" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-left"
            >
              <h2 className="text-3xl font-extrabold text-white">SaaS Agreement Terms</h2>
              <p className="text-zinc-500 text-xs font-mono">Last revised: June 2026</p>
              
              <div className="prose prose-invert text-zinc-300 text-xs sm:text-sm leading-relaxed space-y-5">
                <p>
                  By accessing the BrandSync diagnostic dashboard and querying registries via our backend API endpoints, you consent to fulfill the following SaaS operating parameters.
                </p>
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">1. Safe Probing Usage</h4>
                <p>
                  You are authorized to query names for standard business, commercial, creative, or trademark validations. You are prohibited from automating rapid, malicious loops (spam querying) to crash or congest the social media endpoint networks. We reserve the right to throttle IPs generating suspicious transaction traffic.
                </p>
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">2. Intellectual Property Validation</h4>
                <p>
                  BrandSync acts as a diagnostics reporter, verifying publicly visible statuses across key registries. We do not guarantee trademark ownership, nor hold accountability for disputes occurring on the respective networks.
                </p>
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">3. Limitation of Warranty</h4>
                <p>
                  Platform registries routinely rate-limit or modify login walls without warning. As such, BrandSync cannot guarantee 100% real-time reporting uptime for blocked platform networks—results are delivered as-is and as available.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-zinc-900 bg-[#09090B] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left space-y-8 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <span className="font-extrabold text-base text-white">BrandSync</span>
            <p className="text-xs text-zinc-500">
              The unified username & domain consolidation architecture for SaaS creators.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button onClick={() => navigateTo('home')} className="text-zinc-500 hover:text-white transition-colors">Home</button>
            <button onClick={() => navigateTo('username')} className="text-zinc-500 hover:text-white transition-colors">Username</button>
            <button onClick={() => navigateTo('domains')} className="text-zinc-500 hover:text-white transition-colors">Domains</button>
            <button onClick={() => navigateTo('privacy')} className="text-zinc-500 hover:text-white transition-colors">Privacy</button>
            <button onClick={() => navigateTo('terms')} className="text-zinc-500 hover:text-white transition-colors">Terms Page</button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8 border-t border-zinc-950 pt-6">
          <p className="text-[10px] text-zinc-650 font-mono">
            &copy; {new Date().getFullYear()} BrandSync consolidated registry software. Fully deployment ready.
          </p>
        </div>
      </footer>
    </div>
  );
}
