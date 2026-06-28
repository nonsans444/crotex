import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ShieldAlert, Award, Play, RotateCcw, Check, CheckCircle2, 
  HelpCircle, AlertCircle, Edit3, Code, Palette, BookOpen, Volume2, 
  VolumeX, CheckSquare, Compass, Cpu, HelpCircle as HelpIcon, ArrowRight
} from 'lucide-react';

// --- AUDITORY FEEDBACK UTILITY ---
const playTone = (freq: number, type: OscillatorType = 'sine', duration: number = 0.15) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio feedback blocked by browser policies:', e);
  }
};

// =========================================================================
// FEATURE 1: REFLEX & FOCUS GRID GAME
// =========================================================================
interface ReflexGridGameProps {
  onEarnPoints: (points: number) => void;
}

export function ReflexGridGame({ onEarnPoints }: ReflexGridGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<boolean[]>(Array(16).fill(false));
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('reflex_high_score') || 0));
  const [timeLeft, setTimeLeft] = useState(30);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cellTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startReflexGame = () => {
    playTone(523.25, 'sine', 0.2); // C5
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    triggerNextCell();

    // Game duration countdown
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endReflexGame(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerNextCell = () => {
    const newIdx = Math.floor(Math.random() * 16);
    setActiveIdx(newIdx);
    setGrid(prev => {
      const next = Array(16).fill(false);
      next[newIdx] = true;
      return next;
    });

    // Reset cell timer (shorter as score increases to ramp difficulty!)
    if (cellTimerRef.current) clearTimeout(cellTimerRef.current);
    const speed = Math.max(450, 950 - score * 15);
    cellTimerRef.current = setTimeout(() => {
      if (isPlaying) triggerNextCell();
    }, speed);
  };

  const handleCellClick = (idx: number) => {
    if (!isPlaying) return;
    if (idx === activeIdx) {
      // Correct click
      playTone(659.25, 'sine', 0.08); // E5
      setScore(prev => {
        const next = prev + 1;
        if (next > highScore) {
          setHighScore(next);
          localStorage.setItem('reflex_high_score', String(next));
        }
        return next;
      });
      triggerNextCell();
    } else {
      // Incorrect penalty
      playTone(220, 'sawtooth', 0.15); // Low buzz
      setScore(prev => Math.max(0, prev - 1));
    }
  };

  const endReflexGame = (finishedNormally = false) => {
    setIsPlaying(false);
    setActiveIdx(null);
    setGrid(Array(16).fill(false));
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (cellTimerRef.current) clearTimeout(cellTimerRef.current);

    if (finishedNormally && score > 0) {
      playTone(880, 'sine', 0.3); // High pitch success
      const pts = score * 4;
      onEarnPoints(pts);
    }
  };

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (cellTimerRef.current) clearTimeout(cellTimerRef.current);
    };
  }, []);

  return (
    <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-5 flex flex-col justify-between h-[510px]">
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-[#879b90]">
          <span>CONCENTRATION CHALLENGE</span>
          <span className="text-[#dfb15b] font-bold">REWARD: 4 CP per HIT</span>
        </div>
        <h2 className="text-md font-bold text-[#f1ede2] mt-1 flex items-center gap-2">
          ⚡ Focus & Reflex Grid
        </h2>
        <p className="text-[11px] text-[#879b90] mt-1 leading-relaxed">
          Tap the illuminated target as fast as possible. This speed increases as your score scales, testing prefrontal action suppression and cognitive spatial reflexes.
        </p>
      </div>

      {/* 4x4 Interactive Grid */}
      <div className="flex-1 flex items-center justify-center my-4 select-none">
        {isPlaying ? (
          <div className="grid grid-cols-4 gap-2 w-56 h-56 p-2 bg-black/40 border border-[#2c3a32] rounded-xl">
            {grid.map((isActive, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`w-full h-full rounded-lg transition-all duration-100 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#dfb15b] to-emerald-400 border border-[#dfb15b] shadow-[0_0_15px_rgba(223,177,91,0.5)] scale-102' 
                    : 'bg-[#1c2420] hover:bg-[#25302a] border border-[#2c3931]'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1c2420] border border-[#2c3931] flex items-center justify-center mx-auto text-[#dfb15b] font-mono font-bold text-lg animate-pulse">
              30s
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#f1ede2] font-bold">Focus Reflex Training</p>
              <p className="text-[10px] text-[#879b90]">High score: {highScore} hits</p>
            </div>
            <button
              onClick={startReflexGame}
              className="px-5 py-2.5 bg-[#dfb15b] hover:bg-[#e6c17e] text-[#0c100e] text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              Start Speed Test
            </button>
          </div>
        )}
      </div>

      {/* Game State & Stats */}
      <div className="pt-2 border-t border-[#222d26] flex items-center justify-between text-[10px] text-[#879b90] font-mono">
        <div>
          SCORE: <span className="text-[#dfb15b] font-bold">{score}</span>
        </div>
        <div>
          {isPlaying ? (
            <span className="text-rose-400 font-bold">TIME LEFT: {timeLeft}s</span>
          ) : score > 0 ? (
            <span className="text-emerald-400 font-bold">✓ Earned +{score * 4} CP!</span>
          ) : (
            <span>Ready to engage</span>
          )}
        </div>
        <div>
          BEST: <span className="text-white font-bold">{highScore}</span>
        </div>
      </div>
    </div>
  );
}


// =========================================================================
// FEATURE 2: PHILOSOPHY & SOCRATIC INQUIRY
// =========================================================================
interface SocraticInquiryProps {
  onEarnPoints: (points: number) => void;
}

interface SocraticResponse {
  dilemmaTitle: string;
  response: string;
  feedback: string;
  timestamp: string;
}

const SOCRATIC_DILEMMAS = [
  {
    title: "The Neuro-Theseus Conundrum",
    quote: "If adult neurogenesis and synaptic pruning eventually replace every physical connection in your brain over a decade, does your personal identity and conscious agency persist, or is a new self born?",
    context: "Epistemic Humility & Mind-Body Dualism.",
    suggestedKeywords: ["connection", "identity", "memory", "continuity", "synapse"]
  },
  {
    title: "The Attention Tragedy of the Commons",
    quote: "In a hyper-capitalist economy where human focus is mined, synthesized, and sold for corporate profit, is personal attention span a private commodity, or a public intellectual resource that requires constitutional defense?",
    context: "Socio-Cognitive Ethics.",
    suggestedKeywords: ["sovereignty", "addiction", "choice", "reclaim", "regulation"]
  },
  {
    title: "Nozick’s Digital Experience Machine",
    quote: "Suppose a neural simulator could give you lifetime experiences of absolute pleasure, achievement, and discovery with zero physical effort or risk. Would you permanently plug in, knowing it is synthetic?",
    context: "Active Construction vs Passive Consumption.",
    suggestedKeywords: ["reality", "virtue", "effort", "illusion", "meaning"]
  }
];

export function SocraticInquiry({ onEarnPoints }: SocraticInquiryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [essay, setEssay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archive, setArchive] = useState<SocraticResponse[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('socratic_archive') || '[]');
    } catch {
      return [];
    }
  });
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

  const activeDilemma = SOCRATIC_DILEMMAS[selectedIdx];

  const handlePhilosophySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (essay.trim().length < 40) {
      alert("Cortex requires a structured philosophical response of at least 40 characters to ensure active cognitive labor.");
      return;
    }

    setIsSubmitting(true);
    playTone(392, 'sine', 0.1); // Warm chord start

    setTimeout(() => {
      // Analyze response for educational validation
      const lowerEssay = essay.toLowerCase();
      const length = essay.length;
      const matchedKeywords = activeDilemma.suggestedKeywords.filter(kw => lowerEssay.includes(kw));
      
      let feedback = `Your philosophical defense displays robust analytical construction (${length} characters). `;
      if (matchedKeywords.length > 0) {
        feedback += `You integrated key cognitive anchors: "${matchedKeywords.join(', ')}". `;
      } else {
        feedback += `Your thesis provides an interesting alternative perspective, though incorporating core conceptual pillars like "${activeDilemma.suggestedKeywords[0]}" would anchor your logic further. `;
      }

      feedback += `Cortex has indexed this reflection in your saved Mind Vault. This act of active contemplation strengthens prefrontal synapse networks.`;

      const newRecord: SocraticResponse = {
        dilemmaTitle: activeDilemma.title,
        response: essay,
        feedback,
        timestamp: new Date().toLocaleDateString()
      };

      const nextArchive = [newRecord, ...archive];
      setArchive(nextArchive);
      localStorage.setItem('socratic_archive', JSON.stringify(nextArchive));

      setActiveFeedback(feedback);
      onEarnPoints(50);
      playTone(523.25, 'sine', 0.25); // Success tone C5
      setEssay('');
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-6 space-y-5">
      
      {/* Tab select header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#222d26] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#dfb15b] font-bold uppercase tracking-widest">💡 SECTION 5: PHILOSOPHY</span>
          <h2 className="text-md font-bold text-[#f1ede2] mt-0.5">Socratic Inquiry & Ethical Contemplation</h2>
        </div>

        {/* Dynamic dilemma tabs */}
        <div className="flex gap-1.5 bg-black/30 p-1 border border-[#222d26] rounded-lg">
          {SOCRATIC_DILEMMAS.map((dil, idx) => (
            <button
              key={dil.title}
              onClick={() => { playTone(330, 'sine', 0.05); setSelectedIdx(idx); setActiveFeedback(null); }}
              className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded cursor-pointer transition-all ${
                selectedIdx === idx ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90] hover:text-[#f1ede2]'
              }`}
            >
              Case {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main dilemma display */}
      <div className="p-5 bg-black/25 border border-[#232f26] rounded-xl space-y-2">
        <span className="text-[9px] font-mono text-[#879b90] uppercase tracking-wider block">CURRENT ENQUIRY: {activeDilemma.title}</span>
        <blockquote className="text-xs md:text-sm font-serif italic text-[#f1ede2]/90 leading-relaxed border-l-2 border-[#dfb15b] pl-3.5 py-1">
          "{activeDilemma.quote}"
        </blockquote>
        <div className="flex justify-between text-[10px] font-mono text-[#879b90] pt-2">
          <span>COGNITIVE CORE: {activeDilemma.context}</span>
          <span>ANALYTICAL ANCHORS: {activeDilemma.suggestedKeywords.join(', ')}</span>
        </div>
      </div>

      {/* Active Form Submission */}
      {activeFeedback ? (
        <div className="bg-emerald-950/20 border border-emerald-900/40 p-5 rounded-xl space-y-4">
          <div className="flex items-start gap-3 text-emerald-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider">contemplation accepted! (+50 CP)</h4>
              <p className="text-xs leading-relaxed text-[#a4ceb5]">{activeFeedback}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveFeedback(null)}
            className="px-3.5 py-1.5 bg-[#1c2420] hover:bg-[#25302a] text-[#dfb15b] text-[10px] font-bold uppercase tracking-wider border border-[#34443a] rounded-lg cursor-pointer"
          >
            Reflect on another case
          </button>
        </div>
      ) : (
        <form onSubmit={handlePhilosophySubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-[#879b90] uppercase block">Construct your logical defense or thoughtful summary</label>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Flesh out your thesis here. Be deliberate, critical, and rigorous... (minimum 40 characters)"
              className="w-full bg-black/40 border border-[#2c3a32] focus:border-[#dfb15b]/70 focus:ring-1 focus:ring-[#dfb15b]/30 rounded-xl p-4 text-xs text-[#f1ede2] placeholder-[#879b90]/40 focus:outline-none min-h-[110px] font-sans transition-all leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#879b90]">
              Character count: <span className={essay.length >= 40 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{essay.length}</span> / 40 min
            </span>

            <button
              type="submit"
              disabled={isSubmitting || essay.length < 40}
              className="px-5 py-2.5 bg-[#dfb15b] hover:bg-[#e6c17e] disabled:opacity-40 text-[#0c100e] text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? 'Evaluating...' : 'Submit to Mind Vault'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* Socratic archive list */}
      {archive.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#222d26]">
          <span className="text-[9px] font-mono text-[#879b90] uppercase tracking-wider block">Your Saved Socratic Reflections ({archive.length})</span>
          <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {archive.map((entry, idx) => (
              <div key={idx} className="p-3 bg-black/25 border border-[#222d26] rounded-lg text-[11px] space-y-1 leading-relaxed">
                <div className="flex justify-between text-[9px] font-mono text-[#879b90]">
                  <span className="font-bold text-emerald-400">{entry.dilemmaTitle}</span>
                  <span>{entry.timestamp}</span>
                </div>
                <p className="text-[#f1ede2]/80 italic">"{entry.response}"</p>
                <p className="text-[#879b90] text-[10px] border-t border-[#222d26]/40 pt-1 mt-1">CORTEX METRIC: {entry.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}


// =========================================================================
// FEATURE 3: SKILL SWAP & PRACTICAL MASTERY
// =========================================================================
interface SkillSwapProps {
  onEarnPoints: (points: number) => void;
}

const PRACTICAL_SKILLS = [
  {
    id: "knot",
    title: "🔧 Practical Skill 1: The Bowline Knot",
    category: "SURVIVAL & UTILITY",
    description: "Known as the 'King of Knots,' the Bowline forms a secure, fixed loop at the end of a line. Crucially, it never slips under heavy tension, yet is exceptionally easy to untie even after holding massive weight.",
    steps: [
      "Form a small loop in the standing line, leaving plenty of working end.",
      "Pass the working end up through the loop (like a rabbit coming out of its hole).",
      "Bring the working end behind and around the standing line (around the tree).",
      "Pass the working end back down through the original loop (back down the hole).",
      "Pull tight on both the working end and the standing line to set the knot."
    ],
    ascii: `
        [Standing Line]
              |
              ()  <-- Loop (The Hole)
             /  \\
     /-->---/    \\
    |   [Rabbit]  |
     \\___<_______/
    `,
    question: "Why is the Bowline knot highly preferred over other loop knots in rescue operations?",
    options: [
      "It dissolves chemically when exposed to water.",
      "It forms a totally fixed loop that does not jam under load, allowing easy untying afterwards.",
      "It requires special synthetic polymer ropes to hold itself."
    ],
    correctIdx: 1,
    explanation: "Correct! The Bowline's unique structural mechanical geometry prevents it from tightening onto itself under extreme tension, ensuring immediate manual release when needed."
  },
  {
    id: "electrical",
    title: "🔧 Practical Skill 2: Diagnosing Outlets with a Multimeter",
    category: "ELECTRICAL ENGINEERING",
    description: "Safely diagnosing a residential wall outlet determines if power is active and correctly phased without touching live bare copper terminals.",
    steps: [
      "Ensure hands and floor are fully dry. Never stand on damp surfaces.",
      "Set your digital multimeter dial to AC Voltage (usually marked as V~, VAC, or 750V / 200V).",
      "Insert the black probe into the common port (COM) and red probe into the Voltage port (V).",
      "Insert the black probe tip into the neutral slot (longer vertical slot) of the outlet.",
      "Insert the red probe tip into the hot slot (shorter vertical slot).",
      "Read display: It should hover around 110V-120V (or 220V-240V internationally). Redundant lines confirm active service."
    ],
    ascii: `
     [Neutral (Long)]  [Hot (Short)]
           |               |
         | | |           | | |
         |   |           |   |
          \\_/             \\_/
           o <-- Ground (Round)
    `,
    question: "Which dial setting must you explicitly use on your multimeter to measure standard home wall outlets?",
    options: [
      "DC Current (marked as A⎓ or ADC) to measure continuous high amperage flow.",
      "AC Voltage (marked as V~ or VAC) set to a range higher than the expected 110V/220V voltage.",
      "Resistance (marked as Ω) to check if the insulation is copper."
    ],
    correctIdx: 1,
    explanation: "Correct! Standard household sockets deliver Alternating Current (AC) voltage. Selecting DC or Resistance will fail, blowing the internal multimeter fuse or damaging the device."
  },
  {
    id: "gardening",
    title: "🔧 Practical Skill 3: Stem Cuttings & Horticultural Cloning",
    category: "PRACTICAL HORTICULTURE",
    description: "Cloning plants via asexual stem cuttings allows you to propagate valuable garden plants, herbs, and indoor vegetation completely free and indefinitely.",
    steps: [
      "Locate a healthy, non-flowering shoot on the parent plant.",
      "Make a clean, diagonal 45° cut precisely 1/4 inch below a leaf node (the swollen spot where leaves emerge).",
      "Gently strip away the lower 2-3 sets of leaves, leaving only 2-3 leaves at the very top of the cutting.",
      "Optional: Dip the freshly cut stem base in organic rooting hormone or pure honey.",
      "Insert the cut stem into a container of pre-moistened, loose potting soil or coarse sand.",
      "Maintain a humid environment under indirect light. Roots typically emerge in 2-4 weeks."
    ],
    ascii: `
        \\  /  <-- Top Leaves Remaining
         ||
         ||  <-- Bare Stem Internode
        /||\\ <-- Leaf Node (CUT HERE!)
       / ||
    `,
    question: "Why must the rooting cut be positioned precisely below a leaf node?",
    options: [
      "Leaf nodes have dense concentrations of auxins (growth hormones) and undifferentiated cells that trigger root formation.",
      "Leaf nodes contain hard wooden fibers that hold soil moisture.",
      "Leaf nodes are the only parts of a stem that can absorb atmospheric oxygen."
    ],
    correctIdx: 0,
    explanation: "Correct! The nodes of a plant stem contain meristematic tissues with highly active cell division and natural root-promoting hormones (auxins) that facilitate rapid cloning."
  }
];

export function SkillSwap({ onEarnPoints }: SkillSwapProps) {
  const [activeSkillIdx, setActiveSkillIdx] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizStatus, setQuizStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [solvedSkills, setSolvedSkills] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('solved_skills_swap') || '[]');
    } catch {
      return [];
    }
  });

  const skill = PRACTICAL_SKILLS[activeSkillIdx];

  const handleStepToggle = (stepKey: string) => {
    playTone(493.88, 'sine', 0.05);
    setCheckedSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const verifyAnswer = () => {
    if (selectedAnswer === null) return;
    if (selectedAnswer === skill.correctIdx) {
      setQuizStatus('correct');
      playTone(523.25, 'sine', 0.25); // C5
      if (!solvedSkills.includes(skill.id)) {
        const nextSolved = [...solvedSkills, skill.id];
        setSolvedSkills(nextSolved);
        localStorage.setItem('solved_skills_swap', JSON.stringify(nextSolved));
        onEarnPoints(40);
      }
    } else {
      setQuizStatus('incorrect');
      playTone(220, 'triangle', 0.2); // Low buzz
    }
  };

  const handleSkillReset = (idx: number) => {
    playTone(330, 'sine', 0.05);
    setActiveSkillIdx(idx);
    setCheckedSteps({});
    setSelectedAnswer(null);
    setQuizStatus('idle');
  };

  return (
    <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-6 space-y-5">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#222d26] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#dfb15b] font-bold uppercase tracking-widest">🔧 SECTION 7: SKILL SWAP</span>
          <h2 className="text-md font-bold text-[#f1ede2] mt-0.5">Practical Mastery & Real-World Dexterity</h2>
        </div>

        {/* Categories togglers */}
        <div className="flex gap-1.5 bg-black/30 p-1 border border-[#222d26] rounded-lg">
          {PRACTICAL_SKILLS.map((sk, idx) => (
            <button
              key={sk.id}
              onClick={() => handleSkillReset(idx)}
              className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded cursor-pointer transition-all ${
                activeSkillIdx === idx ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90] hover:text-[#f1ede2]'
              }`}
            >
              {sk.id === 'knot' ? 'Knot' : sk.id === 'electrical' ? 'Circuit' : 'Propagation'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: INSTRUCTIONS GUIDE (cols-span-7) */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-full">
              {skill.category}
            </span>
            <h3 className="text-sm font-bold text-[#f1ede2] mt-1.5">{skill.title}</h3>
            <p className="text-xs text-[#879b90] leading-relaxed">{skill.description}</p>
          </div>

          {/* ASCII visual */}
          {skill.ascii && (
            <pre className="text-[10px] text-emerald-500 font-mono bg-black/35 border border-[#222d26] rounded-xl p-3 select-none leading-none overflow-x-auto text-center">
              {skill.ascii}
            </pre>
          )}

          {/* Checklist steps */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-[#879b90] uppercase tracking-wider block">Hands-on Checklist (Do this physically!)</span>
            <div className="space-y-1.5">
              {skill.steps.map((step, idx) => {
                const stepKey = `${skill.id}_step_${idx}`;
                const isChecked = !!checkedSteps[stepKey];
                return (
                  <button
                    key={idx}
                    onClick={() => handleStepToggle(stepKey)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center gap-3 cursor-pointer select-none ${
                      isChecked
                        ? 'bg-[#1c2420]/30 border-emerald-800/40 text-[#a4ceb5]'
                        : 'bg-black/20 border-[#222d26] text-[#879b90] hover:border-[#2c3a32]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isChecked ? 'bg-emerald-500 border-emerald-500 text-[#0c100e]' : 'border-[#2c3a32] text-transparent'
                    }`}>
                      ✓
                    </div>
                    <span>
                      <strong className="font-mono text-[10px] text-[#dfb15b] mr-1">STEP {idx + 1}:</strong>
                      {step}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: COGNITIVE EVALUATION (cols-span-5) */}
        <div className="md:col-span-5 bg-black/15 border border-[#222d26] rounded-xl p-4 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#879b90]">
              <HelpCircle className="w-3.5 h-3.5 text-[#dfb15b]" />
              <span>COGNITIVE VERIFICATION</span>
            </div>
            <h4 className="text-xs font-bold text-[#f1ede2] leading-relaxed">{skill.question}</h4>

            {/* Answers radio buttons */}
            <div className="space-y-2 pt-1.5">
              {skill.options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => { playTone(392, 'sine', 0.04); setSelectedAnswer(oIdx); setQuizStatus('idle'); }}
                  className={`w-full text-left p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all cursor-pointer ${
                    selectedAnswer === oIdx
                      ? 'bg-[#dfb15b]/10 border-[#dfb15b] text-[#f1ede2]'
                      : 'bg-black/25 border-[#222d26] text-[#879b90] hover:border-[#2c3a32] hover:text-[#f1ede2]'
                  }`}
                >
                  <span className="font-mono text-[9px] text-[#dfb15b] font-black mr-1.5">[{String.fromCharCode(65 + oIdx)}]</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Status alerts */}
            {quizStatus === 'correct' && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 rounded-lg text-[10px] font-sans space-y-1">
                <span className="font-bold font-mono uppercase text-[9px] flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> CORRECT! UNLOCKED +40 CP
                </span>
                <p className="leading-relaxed">{skill.explanation}</p>
              </div>
            )}

            {quizStatus === 'incorrect' && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 text-rose-300 rounded-lg text-[10px] font-sans">
                <span className="font-bold font-mono uppercase text-[9px] flex items-center gap-1 text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> INCORRECT DEDUCTION
                </span>
                <p className="leading-relaxed mt-0.5">Evaluate the physical steps again. Real-world physics yields only one logical conclusion.</p>
              </div>
            )}

            <button
              onClick={verifyAnswer}
              disabled={selectedAnswer === null}
              className="w-full py-2.5 bg-[#dfb15b] hover:bg-[#e6c17e] disabled:opacity-40 text-[#0c100e] text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              Verify Active Mastery
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}


// =========================================================================
// FEATURE 4: THE SANDBOX (CREATIVE CONSTRUCTION)
// =========================================================================
interface CreativeSandboxProps {
  onEarnPoints: (points: number) => void;
}

const CODING_CHALLENGES = [
  {
    title: "1. Sum from 1 to N",
    description: "Write a JavaScript function named `sum` that returns the total sum of all integers from 1 up to N (inclusive).",
    initialCode: `// Write your function below
function sum(n) {
  // Let's create output...
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}`,
    validate: (codeStr: string) => {
      try {
        // Safe evaluation context
        const testFn = new Function(codeStr + "; return sum;");
        const sumFn = testFn();
        if (typeof sumFn !== 'function') throw new Error("Function 'sum' is not defined.");
        const t1 = sumFn(5) === 15;
        const t2 = sumFn(10) === 55;
        if (t1 && t2) return { ok: true, msg: "✓ Perfect logic! sum(5) = 15, sum(10) = 55." };
        return { ok: false, msg: `✘ Validation failed. Expected sum(5) to yield 15, got ${sumFn(5)}.` };
      } catch (err: any) {
        return { ok: false, msg: `✘ Compiler Error: ${err.message}` };
      }
    }
  },
  {
    title: "2. Reverse a String",
    description: "Write a JavaScript function named `reverse` that takes a string and returns its exact character characters in reverse order.",
    initialCode: `function reverse(str) {
  // Return the reverse string
  return str.split('').reverse().join('');
}`,
    validate: (codeStr: string) => {
      try {
        const testFn = new Function(codeStr + "; return reverse;");
        const revFn = testFn();
        if (typeof revFn !== 'function') throw new Error("Function 'reverse' is not defined.");
        const t1 = revFn("cortex") === "xetroc";
        const t2 = revFn("hello") === "olleh";
        if (t1 && t2) return { ok: true, msg: "✓ Perfect logic! reverse('cortex') = 'xetroc'." };
        return { ok: false, msg: `✘ Validation failed. Expected reverse('cortex') to yield 'xetroc', got '${revFn("cortex")}'.` };
      } catch (err: any) {
        return { ok: false, msg: `✘ Compiler Error: ${err.message}` };
      }
    }
  },
  {
    title: "3. Factorial of N",
    description: "Write a JavaScript function named `factorial` that returns the factorial mathematical product of an integer N (N!).",
    initialCode: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
    validate: (codeStr: string) => {
      try {
        const testFn = new Function(codeStr + "; return factorial;");
        const factFn = testFn();
        if (typeof factFn !== 'function') throw new Error("Function 'factorial' is not defined.");
        const t1 = factFn(5) === 120;
        const t2 = factFn(3) === 6;
        if (t1 && t2) return { ok: true, msg: "✓ Perfect logic! factorial(5) = 120." };
        return { ok: false, msg: `✘ Validation failed. Expected factorial(5) to yield 120, got ${factFn(5)}.` };
      } catch (err: any) {
        return { ok: false, msg: `✘ Compiler Error: ${err.message}` };
      }
    }
  }
];

export function CreativeSandbox({ onEarnPoints }: CreativeSandboxProps) {
  const [sandboxTab, setSandboxTab] = useState<'coding' | 'writing' | 'sketchpad'>('coding');

  // --- CODING STATE ---
  const [codeIdx, setCodeIdx] = useState(0);
  const [codeContent, setCodeContent] = useState(CODING_CHALLENGES[0].initialCode);
  const [codeResult, setCodeResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleChallengeChange = (idx: number) => {
    playTone(330, 'sine', 0.05);
    setCodeIdx(idx);
    setCodeContent(CODING_CHALLENGES[idx].initialCode);
    setCodeResult(null);
  };

  const runCodeValidation = () => {
    playTone(440, 'sine', 0.1);
    const validation = CODING_CHALLENGES[codeIdx].validate(codeContent);
    setCodeResult(validation);
    if (validation.ok) {
      playTone(523.25, 'sine', 0.2); // C5
      onEarnPoints(60);
    } else {
      playTone(220, 'triangle', 0.15);
    }
  };

  // --- WRITING STATE ---
  const [writingPrompt, setWritingPrompt] = useState("Explain how the selective attention filter prevents sensory overwhelm during high-work load scenarios.");
  const [writingContent, setWritingContent] = useState('');
  const [journal, setJournal] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sandbox_journal') || '[]');
    } catch {
      return [];
    }
  });
  const [writingSaved, setWritingSaved] = useState(false);

  const saveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (writingContent.trim().length < 30) {
      alert("Please write a meaningful reflection of at least 30 characters.");
      return;
    }
    const entry = `[Prompt: ${writingPrompt}]\n${writingContent}\n(Saved ${new Date().toLocaleDateString()})`;
    const nextJournal = [entry, ...journal];
    setJournal(nextJournal);
    localStorage.setItem('sandbox_journal', JSON.stringify(nextJournal));
    setWritingSaved(true);
    onEarnPoints(40);
    playTone(523.25, 'sine', 0.25);
    setWritingContent('');
    setTimeout(() => setWritingSaved(false), 3000);
  };

  // --- SKETCHPAD STATE ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokeColor, setStrokeColor] = useState('#dfb15b'); // Gold default

  useEffect(() => {
    if (sandboxTab === 'sketchpad' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0a0d0b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [sandboxTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse or touch coordinates
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = strokeColor;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playTone(220, 'sine', 0.1);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0d0b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-6 space-y-5">
      
      {/* Tab select header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#222d26] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#dfb15b] font-bold uppercase tracking-widest">🛠️ SECTION 4: THE SANDBOX</span>
          <h2 className="text-md font-bold text-[#f1ede2] mt-0.5">Creative Construction Zone</h2>
        </div>

        {/* Sandbox modes */}
        <div className="flex gap-1.5 bg-black/30 p-1 border border-[#222d26] rounded-lg">
          <button
            onClick={() => { playTone(330, 'sine', 0.05); setSandboxTab('coding'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded cursor-pointer transition-all ${
              sandboxTab === 'coding' ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90] hover:text-[#f1ede2]'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>Mini-Coding</span>
          </button>
          <button
            onClick={() => { playTone(330, 'sine', 0.05); setSandboxTab('writing'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded cursor-pointer transition-all ${
              sandboxTab === 'writing' ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90] hover:text-[#f1ede2]'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Contemplative Writing</span>
          </button>
          <button
            onClick={() => { playTone(330, 'sine', 0.05); setSandboxTab('sketchpad'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded cursor-pointer transition-all ${
              sandboxTab === 'sketchpad' ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90] hover:text-[#f1ede2]'
            }`}
          >
            <Palette className="w-3 h-3" />
            <span>Creative Sketchpad</span>
          </button>
        </div>
      </div>

      {/* =======================================================
          SANDBOX MODULE A: MINI-CODING COMPILER PLAYGROUND
          ======================================================= */}
      {sandboxTab === 'coding' && (
        <div className="space-y-4">
          <div className="p-4 bg-black/25 border border-[#232f26] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-[#879b90] uppercase tracking-wider block">ALGORITHMIC LABS (+60 CP)</span>
              <p className="text-xs text-[#f1ede2] font-semibold">Develop programmatic prefrontal pathways with micro coding blocks.</p>
            </div>
            
            {/* Quick selectors */}
            <div className="flex gap-1.5">
              {CODING_CHALLENGES.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChallengeChange(idx)}
                  className={`px-2 py-1 text-[9px] font-mono rounded cursor-pointer border ${
                    codeIdx === idx 
                      ? 'bg-[#1c2420] border-[#dfb15b] text-[#dfb15b] font-bold' 
                      : 'bg-black/30 border-[#222d26] text-[#879b90]'
                  }`}
                >
                  Lab {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Challenge description */}
            <div className="lg:col-span-5 bg-black/15 border border-[#222d26] rounded-xl p-4 flex flex-col justify-between h-[300px]">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#dfb15b] uppercase font-bold">CHALLENGE DESCRIPTION</span>
                <h4 className="text-xs font-bold text-[#f1ede2]">{CODING_CHALLENGES[codeIdx].title}</h4>
                <p className="text-xs text-[#879b90] leading-relaxed">{CODING_CHALLENGES[codeIdx].description}</p>
              </div>

              {/* Status alerts */}
              {codeResult && (
                <div className={`p-3 rounded-lg text-[10px] font-mono ${
                  codeResult.ok 
                    ? 'bg-emerald-950/20 border border-emerald-900/40 text-emerald-300' 
                    : 'bg-rose-950/20 border border-rose-900/40 text-rose-300'
                }`}>
                  <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5">
                    {codeResult.ok ? '✓ VERIFICATION PERFECT (+60 CP)' : '✘ COMPILE FAIL'}
                  </span>
                  {codeResult.msg}
                </div>
              )}

              <button
                onClick={runCodeValidation}
                className="w-full py-2.5 bg-[#dfb15b] hover:bg-[#e6c17e] text-[#0c100e] text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Compile & Validate Node
              </button>
            </div>

            {/* Code input text area */}
            <div className="lg:col-span-7 bg-black/45 border border-[#222d26] rounded-xl overflow-hidden h-[300px] flex flex-col justify-between p-1">
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="w-full flex-1 bg-[#0a0d0b] text-[#dfb15b] p-4 text-xs font-mono rounded-lg focus:outline-none resize-none overflow-y-auto leading-relaxed border border-transparent focus:border-[#222d26]"
                spellCheck="false"
              />
              <div className="px-3 py-1 bg-[#141a17] text-[8px] font-mono text-[#879b90] flex justify-between items-center rounded-b-lg border-t border-[#222d26]/40 select-none">
                <span>LANGUAGE: ES6 JAVASCRIPT</span>
                <span>COMPLEXITY: LIGHTWEIGHT</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          SANDBOX MODULE B: DAILY CONTEMPLATIVE WRITING
          ======================================================= */}
      {sandboxTab === 'writing' && (
        <form onSubmit={saveJournal} className="space-y-4">
          <div className="p-4 bg-black/25 border border-[#232f26] rounded-xl space-y-2">
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">DAILY ACTIVE CONTEMPLATIVE FOCUS</span>
            <p className="text-xs text-[#f1ede2]/90 leading-relaxed italic">
              "How can we deliberately construct healthy analog micro-routines to insulate our nervous systems from sensory screen decay?"
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-[#879b90] uppercase block">Construct your 30-word minimum analytical synthesis</label>
            <textarea
              value={writingContent}
              onChange={(e) => setWritingContent(e.target.value)}
              placeholder="Deliberate creation over immediate consumption. Describe concrete analog rituals you commit to..."
              className="w-full bg-black/40 border border-[#2c3a32] focus:border-[#dfb15b]/70 focus:ring-1 focus:ring-[#dfb15b]/30 rounded-xl p-4 text-xs text-[#f1ede2] placeholder-[#879b90]/40 focus:outline-none min-h-[140px] font-sans transition-all leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-[#879b90]">
            <div>
              Character count: <span className={writingContent.length >= 30 ? 'text-emerald-400 font-bold' : 'text-[#879b90]'}>{writingContent.length}</span> / 30 min
            </div>

            {writingSaved ? (
              <span className="text-emerald-400 font-bold font-mono">✓ SYNTHESIS INDEXED IN SAVED VAULT! +40 CP</span>
            ) : (
              <button
                type="submit"
                disabled={writingContent.length < 30}
                className="px-5 py-2 bg-[#dfb15b] hover:bg-[#e6c17e] disabled:opacity-45 text-[#0c100e] text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Index Journal Node
              </button>
            )}
          </div>

          {/* Journal history list */}
          {journal.length > 0 && (
            <div className="pt-2 border-t border-[#222d26] space-y-2">
              <span className="text-[9px] font-mono text-[#879b90] uppercase tracking-wider block">Your Saved Constructive Journals ({journal.length})</span>
              <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {journal.map((j, idx) => (
                  <pre key={idx} className="p-3 bg-black/25 border border-[#222d26] rounded-lg text-[10px] text-[#879b90] font-sans leading-relaxed whitespace-pre-wrap">
                    {j}
                  </pre>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {/* =======================================================
          SANDBOX MODULE C: TACTILE SKETCHPAD CANVAS
          ======================================================= */}
      {sandboxTab === 'sketchpad' && (
        <div className="space-y-4">
          <div className="p-4 bg-black/25 border border-[#232f26] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-[#879b90] uppercase block">TACTILE VISUALIZATIONS</span>
              <p className="text-xs text-[#f1ede2] font-semibold">Diagram ideas, connections, or structural networks on the black slate.</p>
            </div>

            {/* Canvas controls */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => { playTone(330, 'sine', 0.05); setStrokeWidth(2); }}
                className={`px-2.5 py-1 text-[9px] font-mono uppercase rounded-md border ${
                  strokeWidth === 2 ? 'bg-[#1c2420] border-[#dfb15b] text-[#dfb15b]' : 'bg-black/30 border-[#222d26] text-[#879b90]'
                }`}
              >
                Thin
              </button>
              <button
                onClick={() => { playTone(330, 'sine', 0.05); setStrokeWidth(4); }}
                className={`px-2.5 py-1 text-[9px] font-mono uppercase rounded-md border ${
                  strokeWidth === 4 ? 'bg-[#1c2420] border-[#dfb15b] text-[#dfb15b]' : 'bg-black/30 border-[#222d26] text-[#879b90]'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => { playTone(330, 'sine', 0.05); setStrokeWidth(8); }}
                className={`px-2.5 py-1 text-[9px] font-mono uppercase rounded-md border ${
                  strokeWidth === 8 ? 'bg-[#1c2420] border-[#dfb15b] text-[#dfb15b]' : 'bg-black/30 border-[#222d26] text-[#879b90]'
                }`}
              >
                Thick
              </button>

              <div className="h-5 w-px bg-[#222d26]" />

              <button
                onClick={clearCanvas}
                className="px-2.5 py-1 text-[9px] font-mono uppercase rounded-md border border-[#341113] text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 cursor-pointer"
              >
                Clear Slate
              </button>
            </div>
          </div>

          {/* Sketchpad canvas element */}
          <div className="w-full flex justify-center">
            <div className="relative border-2 border-[#2c3931] rounded-2xl overflow-hidden shadow-inner bg-[#0a0d0b]">
              <canvas
                ref={canvasRef}
                width={550}
                height={260}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair w-full block bg-[#0a0d0b]"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// =========================================================================
// FEATURE 5: THE QUIET ROOM (MENTAL DECOMPRESSION)
// =========================================================================
export function QuietRoomGuide() {
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Breathing Guide States (Inhale 4s, Hold 4s, Exhale 4s)
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);

  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathSeconds(prev => {
        if (prev <= 1) {
          // Cycle phase
          setBreathPhase(curr => {
            if (curr === 'inhale') return 'hold';
            if (curr === 'hold') return 'exhale';
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(breathInterval);
  }, []);

  const toggleAmbientNoise = () => {
    try {
      if (isPlayingNoise) {
        // Stop
        if (noiseNodeRef.current) {
          noiseNodeRef.current.disconnect();
          noiseNodeRef.current = null;
        }
        setIsPlayingNoise(false);
        playTone(330, 'sine', 0.1);
      } else {
        // Synthesize pure calming pink noise
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const bufferSize = 4 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Filter white noise to create soothing Pink Noise spectrum
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11; // Softer volume output
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 550; // Extra soft cut-off

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        whiteNoise.start();
        noiseNodeRef.current = whiteNoise;
        setIsPlayingNoise(true);
        playTone(440, 'sine', 0.1);
      }
    } catch (e) {
      console.warn("Autoplay / Audio synth blocked:", e);
    }
  };

  useEffect(() => {
    return () => {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[440px] space-y-6 select-none">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center text-[10px] font-mono text-[#879b90] border-b border-[#222d26] pb-3">
        <span className="text-[#dfb15b] font-bold">🧘 SECTION 8: THE QUIET ROOM</span>
        <span>AUTONOMIC EQUILIBRIUM ACTIVE</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-md font-bold text-[#f1ede2]">Mental Decompression Sanctuary</h3>
        <p className="text-xs text-[#879b90] max-w-md mx-auto leading-relaxed">
          Clear residual attention clutter. Synergize your breathing rhythm with the expanding gold focal point to down-regulate nervous tension.
        </p>
      </div>

      {/* Breathing guided animation */}
      <div className="relative flex items-center justify-center w-48 h-48 my-2">
        
        {/* Pulsating golden backdrop ring */}
        <div className={`absolute rounded-full bg-[#dfb15b]/5 border border-[#dfb15b]/20 transition-all duration-1000 ${
          breathPhase === 'inhale' ? 'w-44 h-44 opacity-80 scale-100' :
          breathPhase === 'hold' ? 'w-48 h-48 opacity-100 scale-102 animate-pulse' :
          'w-24 h-24 opacity-40 scale-95'
        }`} />

        {/* Core focus sphere */}
        <div className={`rounded-full transition-all duration-1000 flex flex-col items-center justify-center border shadow-2xl ${
          breathPhase === 'inhale' ? 'w-36 h-36 bg-gradient-to-tr from-[#dfb15b]/30 to-emerald-800/20 border-[#dfb15b]/45' :
          breathPhase === 'hold' ? 'w-40 h-40 bg-gradient-to-tr from-[#dfb15b]/45 to-amber-600/30 border-[#dfb15b] scale-101' :
          'w-20 h-20 bg-gradient-to-tr from-emerald-950/40 to-[#1c2420]/50 border-emerald-900/30'
        }`}>
          <span className="text-[10px] font-mono tracking-widest text-[#dfb15b] font-black uppercase">
            {breathPhase}
          </span>
          <span className="text-xl font-mono font-bold text-white mt-1">
            {breathSeconds}s
          </span>
        </div>
      </div>

      {/* Control chimes / noises */}
      <div className="space-y-4 w-full">
        <div className="text-center">
          <p className="text-xs text-[#f1ede2] font-semibold uppercase tracking-wider">
            {breathPhase === 'inhale' ? '🌬️ Inhale deeply... fill your lungs' :
             breathPhase === 'hold' ? '🛑 Hold... stabilize autonomic balance' :
             '💨 Exhale slowly... melt residual cognitive friction'}
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={toggleAmbientNoise}
            className={`px-5 py-2.5 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              isPlayingNoise
                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 font-black animate-pulse'
                : 'bg-[#1c2420] border-[#34443a] hover:border-[#dfb15b]/50 text-[#dfb15b]'
            }`}
          >
            {isPlayingNoise ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Mute Pink Noise</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-[#dfb15b]" />
                <span>Play Calm Pink Noise</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
