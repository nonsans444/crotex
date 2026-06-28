import React, { useState, useEffect, useRef } from 'react';
import { initialNodes } from '../data/graphData';
import { GraphNode, SuspendedSession, UserStats, CircadianPhase, CircadianConfig } from '../types';
import { 
  Network, Flame, Eye, Heart, BarChart2, ShieldAlert, BadgeCheck, CheckCircle2, 
  RotateCcw, Send, Sparkles, BookOpen, Clock, Sunset, AlertCircle, Save, History, PlusCircle
} from 'lucide-react';

// Circadian configuration map
const circadianConfigs: Record<CircadianPhase, CircadianConfig> = {
  morning_focus: {
    phase: 'morning_focus',
    label: 'Morning Focus',
    timeString: '08:00 AM',
    themeClass: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    bgHex: '#050507',
    accentColor: '#3b82f6',
    description: 'High cognitive prefrontal reserves. Optimal for analytical and abstract concepts.'
  },
  afternoon_deep: {
    phase: 'afternoon_deep',
    label: 'Afternoon Deep Work',
    timeString: '02:00 PM',
    themeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    bgHex: '#030805',
    accentColor: '#10b981',
    description: 'Sustained task focus. Optimized for synthesis and logical schema expansion.'
  },
  evening_reflection: {
    phase: 'evening_reflection',
    label: 'Evening Reflection',
    timeString: '10:00 PM',
    themeClass: 'bg-[#f59e0b]/10 border-[#f59e0b]/20 text-[#f59e0b]',
    bgHex: '#070503',
    accentColor: '#f59e0b',
    description: 'Melatonin safeguard active. Dynamic filters restrict intense nodes; encouraging philosophy and reflection.'
  }
};

export default function SimulatorView() {
  // State
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('dom_cog_psy');
  const [circadianPhase, setCircadianPhase] = useState<CircadianPhase>('morning_focus');
  const [activeTab, setActiveTab] = useState<'explorer' | 'creator' | 'preservation'>('explorer');
  
  // Cognitive Friction state
  const [intentionNeeded, setIntentionNeeded] = useState<boolean>(false);
  const [intentionInput, setIntentionInput] = useState<string>('');
  const [intentionError, setIntentionError] = useState<string>('');
  const [commitmentLog, setCommitmentLog] = useState<string>('');
  
  const [frictionTimer, setFrictionTimer] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [unlockedDeepDive, setUnlockedDeepDive] = useState<boolean>(false);
  
  const [showRecallPrompt, setShowRecallPrompt] = useState<boolean>(false);
  const [recallInput, setRecallInput] = useState<string>('');
  const [recallSuccess, setRecallSuccess] = useState<boolean>(false);
  const [recallError, setRecallError] = useState<string>('');
  
  // User Stats
  const [stats, setStats] = useState<UserStats>({
    cognitivePoints: 120,
    proofsOfEffort: 3,
    sessionsCompleted: 2,
    activeStreak: 4
  });

  // Preservation list
  const [suspendedSessions, setSuspendedSessions] = useState<SuspendedSession[]>([
    {
      id: 'session_1',
      nodeId: 'ins_cognitive_load',
      nodeTitle: 'Cognitive Load Theory (CLT)',
      suspendedAt: new Date(Date.now() - 3600 * 1000 * 4), // 4 hours ago
      scrollPercentage: 45,
      readingDurationSec: 142,
      userNotes: 'Reviewing the Sweller 1988 cognitive paper bounds.'
    }
  ]);
  
  // Creator form state
  const [creatorTitle, setCreatorTitle] = useState('');
  const [creatorSubject, setCreatorSubject] = useState('sub_attention');
  const [creatorCitations, setCreatorCitations] = useState('');
  const [creatorTakeaways, setCreatorTakeaways] = useState(['', '', '']);
  const [creatorContent, setCreatorContent] = useState('');
  const [creatorChecking, setCreatorChecking] = useState(false);
  const [creatorLog, setCreatorLog] = useState<string[]>([]);
  const [creatorError, setCreatorError] = useState('');

  // Rating state for current node
  const [ratedUtility, setRatedUtility] = useState<number | null>(null);
  const [ratedSignal, setRatedSignal] = useState<number | null>(null);

  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const config = circadianConfigs[circadianPhase];

  // Restrict high intensity nodes (>7 cognitive load) in Evening Reflection phase
  const isNodeRestrictedByCircadian = (node: GraphNode) => {
    return circadianPhase === 'evening_reflection' && node.cognitiveLoad >= 7;
  };

  // Node hierarchy lists
  const currentDomain = nodes.find(n => n.type === 'domain' && (n.id === selectedNodeId || n.id === activeNode.parentId || n.id === (nodes.find(sub => sub.id === activeNode.parentId)?.parentId))) || nodes[0];
  const subjectsOfDomain = nodes.filter(n => n.type === 'subject' && n.parentId === currentDomain.id);
  
  // Get active subject
  const currentSubject = nodes.find(n => n.type === 'subject' && (n.id === selectedNodeId || n.id === activeNode.parentId || n.id === activeNode.id)) || subjectsOfDomain[0];
  const insightsOfSubject = currentSubject ? nodes.filter(n => n.type === 'insight' && n.parentId === currentSubject.id) : [];
  
  // Get active insight
  const currentInsight = nodes.find(n => n.type === 'insight' && (n.id === selectedNodeId || n.id === activeNode.parentId)) || insightsOfSubject[0];
  const deepDivesOfInsight = currentInsight ? nodes.filter(n => n.type === 'deep_dive' && n.parentId === currentInsight.id) : [];

  // Forced focus countdown trigger
  const triggerDeepDiveUnlock = () => {
    setFrictionTimer(3);
    setTimerActive(true);
    setUnlockedDeepDive(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && frictionTimer > 0) {
      interval = setInterval(() => {
        setFrictionTimer(prev => prev - 1);
      }, 1000);
    } else if (timerActive && frictionTimer === 0) {
      setTimerActive(false);
      setUnlockedDeepDive(true);
    }
    return () => clearInterval(interval);
  }, [timerActive, frictionTimer]);

  // Handle active node select
  const handleNodeSelect = (node: GraphNode) => {
    // If the node is restricted, block selection with warning
    if (isNodeRestrictedByCircadian(node)) {
      alert(`[CIRCADIAN FILTER ACTIVE] "${node.title}" has a High Cognitive Load Index (${node.cognitiveLoad}/10) which is restricted during Evening Reflection to protect melatonin secretion and encourage restorative sleep.`);
      return;
    }

    setSelectedNodeId(node.id);
    setRatedUtility(null);
    setRatedSignal(null);

    // Intentionality checks triggers
    if (node.type === 'insight') {
      setIntentionNeeded(true);
      setIntentionInput('');
      setCommitmentLog('');
      setIntentionError('');
    } else if (node.type === 'deep_dive') {
      triggerDeepDiveUnlock();
    } else {
      setIntentionNeeded(false);
      setUnlockedDeepDive(false);
    }
  };

  // Intention Submit
  const handleIntentionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (intentionInput.trim().length < 8) {
      setIntentionError('Your educational intention statement must be at least 8 characters to trigger cognitive priming.');
      return;
    }
    setCommitmentLog(intentionInput);
    setIntentionNeeded(false);
    setStats(prev => ({
      ...prev,
      cognitivePoints: prev.cognitivePoints + 5
    }));
  };

  // Complete deep dive with active recall synthesis
  const handleDeepDiveCompletion = () => {
    setShowRecallPrompt(true);
    setRecallInput('');
    setRecallSuccess(false);
    setRecallError('');
  };

  const handleRecallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recallInput.trim().length < 20) {
      setRecallError('Synthesis check: Your recall statement must be at least 20 characters to demonstrate structural retention.');
      return;
    }
    
    // Success simulation
    setRecallSuccess(true);
    setShowRecallPrompt(false);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      cognitivePoints: prev.cognitivePoints + 25,
      proofsOfEffort: prev.proofsOfEffort + 1,
      sessionsCompleted: prev.sessionsCompleted + 1
    }));

    // Auto update nodes list so human verified reviews increment
    setNodes(prevNodes => prevNodes.map(n => {
      if (n.id === selectedNodeId) {
        return {
          ...n,
          humanVerifications: n.humanVerifications + 1
        };
      }
      return n;
    }));
  };

  // Suspend session state
  const handleSuspendSession = () => {
    const newSession: SuspendedSession = {
      id: `session_${Date.now()}`,
      nodeId: activeNode.id,
      nodeTitle: activeNode.title,
      suspendedAt: new Date(),
      scrollPercentage: 65, // simulated scroll position
      readingDurationSec: 42,
      userNotes: commitmentLog ? `Commitment: "${commitmentLog}"` : 'General traversal checkpoint.'
    };

    setSuspendedSessions([newSession, ...suspendedSessions]);
    alert(`[PREFRONTAL STATE PRESERVED]\nSaved session for "${activeNode.title}".\nYou can restore this state from the "Preservation Desk" tab to avoid re-orientation cognitive fatigue.`);
  };

  // Restore session state
  const handleRestoreSession = (session: SuspendedSession) => {
    setSelectedNodeId(session.nodeId);
    setCommitmentLog(session.userNotes.replace('Commitment: "', '').slice(0, -1));
    setActiveTab('explorer');
  };

  // Creator Submit
  const handleCreatorTakeawayChange = (index: number, val: string) => {
    const updated = [...creatorTakeaways];
    updated[index] = val;
    setCreatorTakeaways(updated);
  };

  const handlePublishCreatorNode = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatorError('');
    setCreatorLog([]);

    // Validations
    if (!creatorTitle.trim()) {
      setCreatorError('Node Title is required.');
      return;
    }
    if (creatorContent.trim().length < 100) {
      setCreatorError('Knowledge content must be at least 100 characters to ensure sufficient informational density.');
      return;
    }
    if (!creatorCitations.trim().includes('doi.org/') && !creatorCitations.trim().includes('arxiv.org/') && !creatorCitations.trim().includes('isbn')) {
      setCreatorError('Epistemic integrity check failed: Content must anchor to a verified DOI, ISBN, or ArXiv reference to verify human curation.');
      return;
    }
    if (creatorTakeaways.some(t => t.trim().length < 10)) {
      setCreatorError('You must provide 3 independent, high-density takeaways of at least 10 characters each.');
      return;
    }

    // Run structural checks
    setCreatorChecking(true);
    const logs = [
      'Initiating Proof of Effort validation pipeline...',
      'Analyzing syntax entropy to verify human provenance...',
      'Verifying external references against academic registers...',
      'Running structural completeness audit (Abstract, Takeaways)...',
      'Placing submission in "Liminal Ledger" for decentralized peer consensus...'
    ];

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setCreatorLog(prev => [...prev, log]);
        if (idx === logs.length - 1) {
          // Complete publishing simulation
          setCreatorChecking(false);
          const newNode: GraphNode = {
            id: `creator_node_${Date.now()}`,
            type: 'insight',
            parentId: creatorSubject,
            title: creatorTitle,
            subtitle: 'Human-curated community insight',
            content: creatorContent,
            readingTimeMin: Math.ceil(creatorContent.length / 800),
            cognitiveLoad: 6,
            signalScore: 95,
            utilityValue: 9.0,
            humanVerifications: 1,
            citations: [creatorCitations],
            takeaways: creatorTakeaways.filter(t => t.trim() !== '')
          };

          setNodes(prev => [...prev, newNode]);
          setStats(prev => ({ ...prev, proofsOfEffort: prev.proofsOfEffort + 1 }));
          
          // Reset form
          setCreatorTitle('');
          setCreatorCitations('');
          setCreatorTakeaways(['', '', '']);
          setCreatorContent('');
          
          alert(`[PROOF OF EFFORT PASSED]\nYour insight "${newNode.title}" was successfully audited and integrated into the global Cortex Knowledge Graph!`);
          setSelectedNodeId(newNode.id);
          setActiveTab('explorer');
        }
      }, (idx + 1) * 800);
    });
  };

  // Handle rating modifications
  const handleRateUtility = (val: number) => {
    setRatedUtility(val);
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNodeId) {
        return {
          ...n,
          utilityValue: parseFloat(((n.utilityValue * 49 + val) / 50).toFixed(1))
        };
      }
      return n;
    }));
  };

  const handleRateSignal = (val: number) => {
    setRatedSignal(val);
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNodeId) {
        return {
          ...n,
          signalScore: Math.round((n.signalScore * 49 + val) / 50)
        };
      }
      return n;
    }));
  };

  return (
    <div 
      className="flex flex-col h-full transition-colors duration-1000 overflow-hidden"
      style={{ backgroundColor: config.bgHex }}
    >
      {/* Top Status Bar */}
      <div className="px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Time */}
        <div className="flex items-center space-x-3">
          <Network className="w-5 h-5 text-[#f59e0b] animate-pulse" />
          <div>
            <span className="font-mono text-[9px] text-white/40 block tracking-widest uppercase leading-none">CORTEX PROTOCOL CLIENT v1.0</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="font-bold text-white font-sans text-xs uppercase tracking-wider">Node Ecosystem</span>
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            </div>
          </div>
        </div>

        {/* User Epistemic Stats */}
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono text-white/40 block tracking-widest leading-none">Cognitive Points</span>
            <span className="font-mono text-xs font-bold text-white">{stats.cognitivePoints} cp</span>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono text-white/40 block tracking-widest leading-none">Proofs of Effort</span>
            <span className="font-mono text-xs font-bold text-[#f59e0b]">{stats.proofsOfEffort} poe</span>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono text-white/40 block tracking-widest leading-none">Streak</span>
            <span className="font-mono text-xs font-bold text-emerald-400 flex items-center justify-end">
              <Flame className="w-3 h-3 mr-0.5 fill-current" />
              {stats.activeStreak} days
            </span>
          </div>
        </div>
      </div>

      {/* Circadian Panel */}
      <div className="px-6 py-3 border-b border-white/10 bg-black/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Sunset className="w-3.5 h-3.5 text-white/40" />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider font-sans">Circadian Alignment:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(circadianConfigs) as CircadianPhase[]).map((phase) => {
            const isSelected = circadianPhase === phase;
            return (
              <button
                key={phase}
                onClick={() => setCircadianPhase(phase)}
                className={`px-3 py-1.5 rounded border text-[10px] uppercase font-bold tracking-wider transition-all flex items-center space-x-1.5 ${
                  isSelected 
                    ? 'bg-[#f59e0b] text-black border-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                    : 'bg-white/5 hover:bg-white/10 text-white/60 border-white/10'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  phase === 'morning_focus' ? 'bg-blue-400' : phase === 'afternoon_deep' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span>{circadianConfigs[phase].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Circadian Explanation Banner */}
      <div className={`mx-6 mt-3 px-4 py-2 border rounded-xl text-xs font-sans ${config.themeClass} transition-all`}>
        <span className="font-bold">{config.label} Active:</span> {config.description}
      </div>

      {/* Main Tabs */}
      <div className="px-6 mt-3 flex border-b border-white/10 bg-black/10">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all mr-4 flex items-center space-x-1.5 ${
            activeTab === 'explorer' 
              ? 'border-[#f59e0b] text-[#f59e0b]' 
              : 'border-transparent text-white/40 hover:text-white/80'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Knowledge Graph</span>
        </button>
        <button
          onClick={() => setActiveTab('creator')}
          className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all mr-4 flex items-center space-x-1.5 ${
            activeTab === 'creator' 
              ? 'border-[#f59e0b] text-[#f59e0b]' 
              : 'border-transparent text-white/40 hover:text-white/80'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Effort Creator</span>
        </button>
        <button
          onClick={() => setActiveTab('preservation')}
          className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'preservation' 
              ? 'border-[#f59e0b] text-[#f59e0b]' 
              : 'border-transparent text-white/40 hover:text-white/80'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Preservation Desk ({suspendedSessions.length})</span>
        </button>
      </div>

      {/* Scrollable Panel Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* TAB 1: KNOWLEDGE GRAPH EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            
            {/* Visual Node Navigator Column */}
            <div className="lg:col-span-4 bg-black/40 border border-white/10 rounded-xl p-4 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-white/40 tracking-widest block">Hierarchy Trajectory</span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-1">Traverse Knowledge Path</h4>
                <p className="text-[11px] text-white/50 mt-1 leading-relaxed">Select a node below to traverse deep academic concepts under a strict hierarchical schema.</p>
              </div>

              {/* 1. Domains list */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-mono text-white/40 block tracking-wider font-bold">1. Select Domain</span>
                <div className="space-y-1">
                  {nodes.filter(n => n.type === 'domain').map(n => {
                    const isSelected = currentDomain.id === n.id;
                    const isRestricted = isNodeRestrictedByCircadian(n);
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNodeSelect(n)}
                        className={`w-full text-left p-2.5 rounded border text-[11px] transition-all flex items-start justify-between ${
                          isSelected
                            ? 'bg-[#f59e0b] text-black border-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.4)] font-bold'
                            : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                        } ${isRestricted ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="max-w-[85%]">
                          <span className="font-semibold block truncate">{n.title}</span>
                          <span className="text-[9px] opacity-70 block truncate mt-0.5">{n.subtitle}</span>
                        </div>
                        {isRestricted && <Clock className="w-3.5 h-3.5 text-[#f59e0b] mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Subjects list */}
              {currentDomain && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[9px] uppercase font-mono text-white/40 block tracking-wider font-bold">2. Select Subject</span>
                  <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                    {subjectsOfDomain.map(n => {
                      const isSelected = currentSubject?.id === n.id;
                      const isRestricted = isNodeRestrictedByCircadian(n);
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleNodeSelect(n)}
                          className={`w-full text-left p-2 rounded border text-[11px] transition-all flex items-start justify-between ${
                            isSelected
                              ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40 font-bold'
                              : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                          } ${isRestricted ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <span className="truncate font-medium">{n.title}</span>
                          {isRestricted && <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Insights list */}
              {currentSubject && insightsOfSubject.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-mono text-white/40 block tracking-wider font-bold">3. Select Insight</span>
                    <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 font-mono">Friction trigger</span>
                  </div>
                  <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                    {insightsOfSubject.map(n => {
                      const isSelected = currentInsight?.id === n.id;
                      const isRestricted = isNodeRestrictedByCircadian(n);
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleNodeSelect(n)}
                          className={`w-full text-left p-2 rounded border text-[11px] transition-all flex items-start justify-between ${
                            isSelected
                              ? 'bg-blue-600/30 text-blue-200 border-blue-500/40 font-bold'
                              : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                          } ${isRestricted ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <span className="truncate font-medium">{n.title}</span>
                          {isRestricted && <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Deep Dives list */}
              {currentInsight && deepDivesOfInsight.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-mono text-white/40 block tracking-wider font-bold">4. Select Deep Dive</span>
                    <span className="text-[9px] bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded text-rose-300 font-mono">Pause & Recall</span>
                  </div>
                  <div className="space-y-1">
                    {deepDivesOfInsight.map(n => {
                      const isSelected = selectedNodeId === n.id;
                      const isRestricted = isNodeRestrictedByCircadian(n);
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleNodeSelect(n)}
                          className={`w-full text-left p-2 rounded border text-[11px] transition-all flex items-start justify-between ${
                            isSelected
                              ? 'bg-rose-600/30 text-rose-200 border-rose-500/40 font-bold'
                              : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                          } ${isRestricted ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <span className="truncate font-medium">{n.title}</span>
                          {isRestricted && <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Central Main Content View */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Friction Overlay / Warning Cards depending on active actions */}
              {intentionNeeded ? (
                <div className="bg-blue-950/25 border border-blue-500/30 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="w-5 h-5 text-blue-400 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Cortex Intentionality check</h4>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">
                        Cortex mitigates mindless browsing by requiring active cognitive intentionality. Please state your educational commitment statement for reading: <span className="font-bold text-[#f59e0b]">"{activeNode.title}"</span>.
                      </p>
                      
                      <form onSubmit={handleIntentionSubmit} className="mt-4">
                        <div className="flex flex-col space-y-2">
                          <input
                            type="text"
                            placeholder="What do you hope to extract or analyze from this concept? (e.g. Understand Sweller limits)"
                            value={intentionInput}
                            onChange={(e) => setIntentionInput(e.target.value)}
                            className="w-full px-3 py-2 border border-white/10 rounded bg-black/60 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] focus:border-[#f59e0b] font-sans"
                          />
                          {intentionError && (
                            <p className="text-[11px] text-rose-400 font-sans flex items-center">
                              <AlertCircle className="w-3.5 h-3.5 mr-1" />
                              {intentionError}
                            </p>
                          )}
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Minimum 8 characters</span>
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-[#f59e0b] text-black rounded text-[10px] uppercase font-black hover:bg-amber-500 transition-colors shadow-sm flex items-center space-x-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Commit Intention</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              ) : timerActive ? (
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden min-h-[220px]">
                  {/* Calming expanding breathing visual */}
                  <div className="absolute w-24 h-24 bg-rose-500/10 rounded-full animate-ping opacity-30"></div>
                  <div className="absolute w-16 h-16 bg-rose-500/5 rounded-full animate-pulse opacity-40"></div>
                  
                  <Clock className="w-8 h-8 text-rose-400 mb-3 relative z-10" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider relative z-10">FORCED COGNITIVE FRICTION PAUSE</h4>
                  <p className="text-xs text-white/60 mt-1 max-w-sm leading-relaxed relative z-10">
                    Breathe slowly. Preparing neural pathways for high-complexity study.
                  </p>
                  <div className="text-3xl font-mono font-bold text-rose-400 mt-4 relative z-10">
                    00:0{frictionTimer}
                  </div>
                  <span className="text-[9px] uppercase font-mono text-white/40 mt-1 relative z-10">Seconds remaining</span>
                </div>
              ) : (
                /* Primary Active Node Reader Display */
                <div className="bg-black/30 border border-white/10 rounded-xl shadow-sm p-6 space-y-6">
                  
                  {/* Node Header & Epistemic Metrics */}
                  <div className="border-b border-white/10 pb-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                            activeNode.type === 'domain' ? 'bg-white/10 text-white/90 border-white/10' :
                            activeNode.type === 'subject' ? 'bg-amber-500/15 text-amber-300 border-amber-500/20' :
                            activeNode.type === 'insight' ? 'bg-blue-500/15 text-blue-300 border-blue-500/20' : 'bg-rose-500/15 text-rose-300 border-rose-500/20'
                          }`}>
                            {activeNode.type.replace('_', ' ')}
                          </span>
                          {commitmentLog && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-mono border border-emerald-500/20 flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Intention Committed
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight mt-2 leading-tight font-sans">
                          {activeNode.title}
                        </h3>
                        {activeNode.subtitle && (
                          <p className="text-[11px] text-white/50 font-sans mt-0.5">
                            {activeNode.subtitle}
                          </p>
                        )}
                      </div>

                      {/* State Preservation Save Trigger */}
                      <button
                        onClick={handleSuspendSession}
                        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/80 text-[10px] uppercase font-bold tracking-wider border border-white/10 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Suspend Session</span>
                      </button>
                    </div>

                    {/* Integrated Effort/Gain Metric Matrix */}
                    <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-white/40 font-mono block uppercase">Cognitive Load</span>
                          <span className="text-xs font-semibold text-white font-mono">
                            {activeNode.cognitiveLoad}/10
                            <span className="text-[10px] text-white/40 font-normal ml-1">
                              ({activeNode.cognitiveLoad >= 8 ? 'Extreme' : activeNode.cognitiveLoad >= 6 ? 'Medium' : 'Light'})
                            </span>
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-white/40 font-mono block uppercase">Reading Time</span>
                          <span className="text-xs font-semibold text-white font-mono flex items-center">
                            <Clock className="w-3.5 h-3.5 text-white/40 mr-1" />
                            {activeNode.readingTimeMin} min
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-white/40 font-mono block uppercase">Signal Score</span>
                          <span className="text-xs font-semibold text-[#f59e0b] font-mono">
                            {activeNode.signalScore}%
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-white/40 font-mono block uppercase">Utility Rating</span>
                          <span className="text-xs font-semibold text-blue-400 font-mono">
                            {activeNode.utilityValue}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Node Content Body */}
                  <div className="text-white/80 font-sans leading-relaxed text-xs">
                    {commitmentLog && (
                      <div className="mb-4 text-xs italic text-blue-300 bg-blue-500/10 p-2.5 rounded border border-blue-500/20 flex items-start">
                        <span className="font-bold font-mono uppercase text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded mr-2 mt-0.5 shrink-0">Target Intent</span>
                        "{commitmentLog}"
                      </div>
                    )}
                    
                    <p className="whitespace-pre-wrap leading-relaxed">{activeNode.content}</p>

                    {/* Show deep dive sub-button or block warnings */}
                    {activeNode.type === 'insight' && deepDivesOfInsight.length > 0 && (
                      <div className="mt-6 p-4 border border-rose-500/30 bg-rose-500/5 rounded-xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-rose-800 uppercase font-sans tracking-wide">Deep Analytical Terminal Available</span>
                          <p className="text-xs text-rose-900 leading-normal">Requires 3s focus pause to calibrate attention channels before opening.</p>
                        </div>
                        <button
                          onClick={() => handleNodeSelect(deepDivesOfInsight[0])}
                          className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500/30 transition-all"
                        >
                          Unlock Deep Dive
                        </button>
                      </div>
                    )}

                    {/* Show Key Takeaways for Insights & Deep Dives */}
                    {activeNode.takeaways && activeNode.takeaways.length > 0 && (
                      <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider block">
                          Epistemic Key Takeaways
                        </span>
                        <div className="space-y-2">
                          {activeNode.takeaways.map((takeaway, tIdx) => (
                            <div key={tIdx} className="flex items-start space-x-2 text-xs text-white/70 bg-white/5 p-2.5 rounded border border-white/5">
                              <BadgeCheck className="w-4 h-4 text-[#f59e0b] mt-0.5 shrink-0" />
                              <span>{takeaway}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Academic Citations Section */}
                    {activeNode.citations && activeNode.citations.length > 0 && (
                      <div className="mt-6 space-y-2 pt-6 border-t border-white/10">
                        <span className="text-[9px] uppercase font-mono text-white/40 block tracking-widest font-bold">
                          Epistemic Foundations (Citations)
                        </span>
                        <ul className="space-y-1.5">
                          {activeNode.citations.map((cite, cIdx) => (
                            <li key={cIdx} className="text-xs text-blue-300 font-mono leading-relaxed bg-blue-500/5 px-2.5 py-1.5 rounded border border-blue-500/10">
                              📘 {cite}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Rating / Interactive Feedback Widgets */}
                  <div className="border-t border-white/10 pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Evaluate Information Purity</span>
                      <span className="text-[9px] text-white/40 uppercase font-mono">Adjusts node weightings</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Utility Rating Widget */}
                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                        <span className="text-[9px] text-white/40 font-mono block uppercase">How actionable is this concept?</span>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-1">
                            {[2, 4, 6, 8, 10].map((val) => (
                              <button
                                key={val}
                                onClick={() => handleRateUtility(val)}
                                className={`w-8 py-1 rounded text-xs font-mono font-bold transition-all border ${
                                  ratedUtility === val
                                    ? 'bg-[#f59e0b] text-black border-[#f59e0b] shadow-sm scale-105'
                                    : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-white/60">Utility</span>
                        </div>
                      </div>

                      {/* Signal Score Widget */}
                      <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                        <span className="text-[9px] text-white/40 font-mono block uppercase">Syntactic density of content?</span>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-1">
                            {[70, 80, 90, 95, 100].map((val) => (
                              <button
                                key={val}
                                onClick={() => handleRateSignal(val)}
                                className={`w-10 py-1 rounded text-xs font-mono font-bold transition-all border ${
                                  ratedSignal === val
                                    ? 'bg-[#f59e0b] text-black border-[#f59e0b] shadow-sm scale-105'
                                    : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                                }`}
                              >
                                {val}%
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-white/60">Signal</span>
                        </div>
                      </div>
                    </div>

                    {/* Complete Active Recall Trigger (Only for Deep Dives) */}
                    {activeNode.type === 'deep_dive' && (
                      <div className="mt-4 pt-4 border-t border-dashed border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                          <BadgeCheck className="w-5 h-5 text-emerald-400" />
                          <span className="text-xs text-white/70 leading-normal">
                            Ready to consolidate this deep dive into your neural index?
                          </span>
                        </div>
                        <button
                          onClick={handleDeepDiveCompletion}
                          className="px-4 py-2 bg-[#f59e0b] text-black rounded text-[10px] uppercase font-black tracking-wider hover:bg-amber-500 transition-all flex items-center space-x-1"
                        >
                          <span>Execute Active Recall check</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Active Recall Modal-Like Input Prompt */}
              {showRecallPrompt && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Active Recall consolidation</h4>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">
                        To lock this knowledge node permanently and earn <span className="font-bold text-emerald-400">+25 cp</span>, write a 1-sentence synthesis of what you just studied. This forces synaptic retrieval and fights forgetfulness.
                      </p>
                      
                      <form onSubmit={handleRecallSubmit} className="mt-4 space-y-3">
                        <textarea
                          placeholder="Synthesize the core takeaway... (e.g. Working memory limits force split attention which depletes prefrontal oxygen reserves)"
                          rows={3}
                          value={recallInput}
                          onChange={(e) => setRecallInput(e.target.value)}
                          className="w-full px-3 py-2 border border-emerald-500/20 rounded bg-black/60 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-sans"
                        />
                        {recallError && (
                          <p className="text-[11px] text-rose-400 font-sans flex items-center">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            {recallError}
                          </p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-mono">Minimum 20 characters required</span>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowRecallPrompt(false)}
                              className="px-3 py-1.5 bg-white/5 text-white/80 rounded text-[10px] uppercase font-bold border border-white/10 hover:bg-white/10 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-emerald-500 text-black rounded text-[10px] uppercase font-black hover:bg-emerald-400 transition-colors shadow-sm"
                            >
                              Consolidate Node
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Show Recall Success feedback */}
              {recallSuccess && (
                <div className="bg-emerald-500/15 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-full">✓</span>
                    <span><strong>Consolidation complete!</strong> Synaptic index refreshed. +25 cp awarded.</span>
                  </div>
                  <button 
                    onClick={() => setRecallSuccess(false)}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PROOF OF EFFORT CREATOR */}
        {activeTab === 'creator' && (
          <div className="max-w-2xl mx-auto bg-black/30 border border-white/10 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] uppercase font-mono text-white/40 tracking-widest">Epistemic Publishing Terminal</span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1">Submit Proof of Effort (PoE)</h3>
              <p className="text-xs text-white/50 mt-0.5 leading-relaxed font-sans">
                Publishing content on Cortex requires structural and empirical validation. Low-density opinion posts or AI generated slop are blocked by a mandatory citation anchor check.
              </p>
            </div>

            <form onSubmit={handlePublishCreatorNode} className="space-y-4">
              
              {/* Parent Subject Select */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-white/40 block font-bold tracking-wider">1. Assign Parent Subject</label>
                <select
                  value={creatorSubject}
                  onChange={(e) => setCreatorSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded bg-black/60 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#f59e0b] font-sans"
                >
                  {nodes.filter(n => n.type === 'subject').map(sub => (
                    <option key={sub.id} value={sub.id} className="bg-neutral-900 text-white">{sub.title}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-white/40 block font-bold tracking-wider">2. Node Title</label>
                <input
                  type="text"
                  placeholder="The impact of cognitive friction on decision structures..."
                  value={creatorTitle}
                  onChange={(e) => setCreatorTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded bg-black/60 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] font-sans"
                />
              </div>

              {/* Citations Check */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-mono text-white/40 block font-bold tracking-wider">3. Academic Citation Anchor</label>
                  <span className="text-[9px] bg-blue-500/15 border border-blue-500/25 px-1.5 py-0.5 rounded text-blue-300 font-mono">DOI / ArXiv Required</span>
                </div>
                <input
                  type="text"
                  placeholder="doi.org/10.1016/j.cognitive.2024.12"
                  value={creatorCitations}
                  onChange={(e) => setCreatorCitations(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded bg-black/60 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] font-sans font-mono"
                />
                <p className="text-[10px] text-white/40 leading-normal font-sans">
                  Cortex verifies that every article anchors to real, peer-reviewed human research. Format must contain a doi.org, arxiv.org, or isbn registry tag.
                </p>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-white/40 block font-bold tracking-wider">4. Epistemic Syntheses (3 Mandatory Key Takeaways)</label>
                <div className="space-y-2">
                  {[0, 1, 2].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Key Takeaway ${idx + 1} (Minimum 10 chars)...`}
                      value={creatorTakeaways[idx]}
                      onChange={(e) => handleCreatorTakeawayChange(idx, e.target.value)}
                      className="w-full px-3 py-1.5 border border-white/10 rounded bg-black/60 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] font-sans"
                    />
                  ))}
                </div>
              </div>

              {/* Content Body */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono text-white/40 block font-bold tracking-wider">5. Knowledge Synthesis (Content Body)</label>
                <textarea
                  placeholder="Provide high-density analytical text detailing the empirical insights... (Minimum 100 characters)"
                  rows={5}
                  value={creatorContent}
                  onChange={(e) => setCreatorContent(e.target.value)}
                  className="w-full px-3 py-2 border border-white/10 rounded bg-black/60 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] font-sans"
                />
                <div className="flex justify-between text-[10px] text-white/40 font-mono">
                  <span>Minimum 100 characters</span>
                  <span>{creatorContent.length} characters entered</span>
                </div>
              </div>

              {creatorError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-sans flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {creatorError}
                </div>
              )}

              {/* Verification logs output */}
              {creatorLog.length > 0 && (
                <div className="p-3 bg-black/80 text-green-400 rounded-xl font-mono text-[10px] space-y-1 leading-relaxed border border-white/10">
                  {creatorLog.map((log, lIdx) => (
                    <div key={lIdx} className="flex items-center space-x-2">
                      <span className="text-white/30">[{lIdx + 1}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {creatorChecking && (
                    <div className="animate-pulse text-blue-400 font-bold">⚡ Simulating peer review validators...</div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={creatorChecking}
                className="w-full py-2.5 bg-[#f59e0b] text-black rounded uppercase font-black text-xs hover:bg-amber-500 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {creatorChecking ? (
                  <span>Executing Verification...</span>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-black" />
                    <span>Validate and Publish Node</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: STATE PRESERVATION DESK */}
        {activeTab === 'preservation' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <span className="text-[10px] uppercase font-mono text-white/40 tracking-widest">Prefrontal Restructuring Console</span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1">Prefrontal State Preservation Desk</h3>
              <p className="text-xs text-white/50 mt-0.5 leading-relaxed font-sans">
                Instead of bombarding returning users with novel content spikes, Cortex saves your precise focus checkpoints. Restore any suspended context below to pick up exactly where you left off.
              </p>
            </div>

            <div className="space-y-3">
              {suspendedSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="bg-black/30 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#f59e0b]/45 transition-all"
                >
                  <div className="space-y-1 max-w-[75%]">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] bg-blue-500/15 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                        Saved Capsule
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {new Date(session.suspendedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-sans truncate">{session.nodeTitle}</h4>
                    <p className="text-xs text-white/50 font-sans italic leading-relaxed truncate">
                      {session.userNotes || 'No notes taken during suspension.'}
                    </p>
                    <div className="flex items-center space-x-4 pt-1">
                      <span className="text-[10px] text-white/40 font-mono">Reading: {session.readingDurationSec}s</span>
                      <span className="text-[10px] text-white/40 font-mono">Scroll Depth: {session.scrollPercentage}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreSession(session)}
                    className="px-3 py-1.5 bg-[#f59e0b] text-black rounded text-[10px] uppercase font-bold tracking-wider hover:bg-amber-500 transition-colors shadow-sm flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resume Focus</span>
                  </button>
                </div>
              ))}

              {suspendedSessions.length === 0 && (
                <div className="text-center py-12 bg-black/20 border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs text-white/50 font-sans">No saved sessions in your prefrontal desk yet.</p>
                  <p className="text-[10px] text-white/40 mt-1 font-sans">Click "Suspend Session" on any reading node to save your progress.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
