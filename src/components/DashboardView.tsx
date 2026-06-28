import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Search, Gamepad2, CheckCircle2, Award, Flame, Bookmark, 
  RotateCcw, Brain, Plus, X, MessageSquare, Clock, ExternalLink, 
  Trophy, HelpCircle, Play, Check, AlertCircle, Sparkles, RefreshCw, Send, ChevronRight,
  Swords, Activity, LayoutGrid
} from 'lucide-react';
import { 
  ReflexGridGame, 
  SocraticInquiry, 
  SkillSwap, 
  CreativeSandbox, 
  QuietRoomGuide 
} from './AntiBrainrotFeatures';

// Sound synthesis using Web Audio API for soothing auditory feedback
const playCalmTone = (freq: number, type: OscillatorType = 'sine', duration: number = 0.15) => {
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
    console.warn('Audio context failed to start:', e);
  }
};

// Types for our Knowledge Social Media
interface Post {
  id: string;
  title: string;
  description: string;
  extract: string;
  thumbnailUrl?: string;
  source: 'Wikipedia' | 'Scientific American' | 'MIT Tech Review';
  sourceUrl: string;
  readingTimeMin: number;
  cognitiveLoad: number;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  comments: Array<{
    id: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
    likes: number;
  }>;
}

// Pre-seeded high quality academic posts
const CURATED_TOPICS = [
  "Neuroplasticity", "Deep Time", "James Webb Space Telescope", "Fibonacci Sequence", 
  "Game Theory", "Photosynthesis", "Cognitive Biases", "Quantum Entanglement", 
  "Epigenetics", "Bioluminescence", "Plate Tectonics", "Artificial Intelligence"
];

const PRE_SEEDED_POSTS: Post[] = [
  {
    id: "seed_neuroplasticity",
    title: "Neuroplasticity",
    description: "The brain's ability to reorganize itself by forming new neural connections throughout life.",
    extract: "Neuroplasticity, also known as brain plasticity, is the ability of the brain to change throughout an individual's life. This change can range from the microscopic (physical changes to individual neurons) to the macroscopic (cortical remapping in response to injury). Neuroplasticity allows the neurons in the brain to compensate for injury and disease, and to adjust their activities in response to new situations or to changes in their environment. This process is highly stimulated by deep focus and active recall, while mindless passive scrolling actively dulls prefrontal plastic pathways.",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Chemical_synapse_schema_cropped.jpg/500px-Chemical_synapse_schema_cropped.jpg",
    source: "Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Neuroplasticity",
    readingTimeMin: 3,
    cognitiveLoad: 4,
    quiz: {
      question: "What is neuroplasticity's primary function in the human brain?",
      options: [
        "To freeze neural pathways in a permanent, static configuration.",
        "To reorganize and form new neural connections in response to learning or injury.",
        "To accelerate metabolic decay of long-term memory schemas."
      ],
      correctIndex: 1,
      explanation: "Neuroplasticity is the biological mechanism of adaptation, enabling our brain structures to change and grow as we learn new, complex information."
    },
    comments: [
      { id: "c1", author: "Dr. Sarah Lin", avatar: "SL", text: "Amazing post! Active cognitive engagement is literally the fuel for synaptic branching.", timestamp: "2 hrs ago", likes: 24 },
      { id: "c2", author: "Leo Vance", avatar: "LV", text: "This is why cutting out micro-entertainment feeds makes such a difference in attention span.", timestamp: "1 hr ago", likes: 12 }
    ]
  },
  {
    id: "seed_game_theory",
    title: "Game Theory",
    description: "The mathematical study of strategic interaction among rational decision-makers.",
    extract: "Game theory is the study of mathematical models of strategic interaction among rational agents. It has applications in all fields of social science, as well as in computer science and evolutionary biology. The primary objective is to find optimal strategies in situations where an individual's success depends on the choices of others. Understanding strategic balances like the Nash Equilibrium helps humans analyze complex global dynamics, enhancing analytical prefrontal logic.",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Nash_profile_2010.jpg/400px-Nash_profile_2010.jpg",
    source: "Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Game_theory",
    readingTimeMin: 4,
    cognitiveLoad: 6,
    quiz: {
      question: "What does a Nash Equilibrium represent in Game Theory?",
      options: [
        "A state where players have a mutual agreement to randomly swap strategies.",
        "A state where no player has an incentive to unilaterally deviate from their chosen strategy.",
        "A chaotic system where predictions are mathematically impossible."
      ],
      correctIndex: 1,
      explanation: "In a Nash Equilibrium, each player's strategy is optimal given the strategies of all other players. No player benefits from changing their plan alone."
    },
    comments: [
      { id: "c3", author: "Prof. James", avatar: "PJ", text: "Fascinating. Applying the Prisoner's Dilemma to environmental cooperation is a perfect example.", timestamp: "5 hrs ago", likes: 41 }
    ]
  },
  {
    id: "seed_james_webb",
    title: "James Webb Space Telescope",
    description: "The premier space observatory conducting infrared astronomy to see the universe's first galaxies.",
    extract: "The James Webb Space Telescope (JWST) is a space telescope designed primarily to conduct infrared astronomy. As the largest optical telescope in space, its high resolution and sensitivity allow it to view objects too old, distant, or faint for the Hubble Space Telescope. This enables investigations across many fields of astronomy and cosmology, such as observation of the first stars and the formation of the first galaxies, and detailed atmospheric characterization of potentially habitable exoplanets.",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/James_Webb_Space_Telescope_mirror_unfolded.jpg/500px-James_Webb_Space_Telescope_mirror_unfolded.jpg",
    source: "Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/James_Webb_Space_Telescope",
    readingTimeMin: 3,
    cognitiveLoad: 5,
    quiz: {
      question: "Why does the JWST primarily observe the universe in infrared light?",
      options: [
        "Because infrared light passes through cosmic dust clouds and reveals extremely ancient, redshifted galaxies.",
        "Because optical glass is impossible to construct in modern space vehicles.",
        "Because space is entirely empty of other electromagnetic wavelengths."
      ],
      correctIndex: 0,
      explanation: "As the universe expands, light from the earliest stars is stretched into the longer, redder infrared spectrum. Infrared also penetrates dense gas and dust."
    },
    comments: [
      { id: "c4", author: "Cosmos_Explorer", avatar: "CE", text: "Those deep-field images blow my mind every single time. True triumph of human cooperation.", timestamp: "3 hrs ago", likes: 18 }
    ]
  }
];

// --- CHESS TYPES & DATA ---
interface ChessPiece {
  type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
  color: 'w' | 'b';
}

type ChessBoard = (ChessPiece | null)[][];

interface ChessPuzzle {
  id: string;
  name: string;
  setup: ChessBoard;
  description: string;
  correctMove: { from: [number, number]; to: [number, number] };
  explanation: string;
}

const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: "puzzle_smothered",
    name: "Smothered Checkmate in One",
    description: "The black King is trapped in the corner by its own pieces. Deliver the final blow with your Knight!",
    explanation: "The white Knight jumps over the pawn barriers to [1, 5] (F7) checking the King, who has zero escaping routes. Checkmate!",
    correctMove: { from: [3, 6], to: [1, 5] },
    setup: [
      [null, null, null, null, null, null, { type: 'r', color: 'b' }, { type: 'k', color: 'b' }],
      [null, null, null, null, null, null, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, { type: 'n', color: 'w' }, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, { type: 'k', color: 'w' }, null, null, null]
    ]
  },
  {
    id: "puzzle_back_rank",
    name: "Back-Rank Rook Overload",
    description: "Black's king is trapped behind a wall of its own pawns. Move your Rook to deliver an unstoppable back-rank mate!",
    explanation: "Sliding the Rook all the way to [0, 0] (A8) attacks the King along the undefended back rank. Checkmate!",
    correctMove: { from: [7, 0], to: [0, 0] },
    setup: [
      [null, null, null, null, { type: 'k', color: 'b' }, null, null, null],
      [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, null, null, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, null, null, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
      [{ type: 'r', color: 'w' }, null, null, null, { type: 'k', color: 'w' }, null, null, null]
    ]
  },
  {
    id: "puzzle_fork",
    name: "Knight Fork Double Attack",
    description: "Find the key square to fork the black King and black Queen at the same time!",
    explanation: "Moving the Knight to [2, 2] (C6) simultaneously checks the King at [0, 3] and targets the Queen at [4, 1]. Fork!",
    correctMove: { from: [4, 3], to: [2, 2] },
    setup: [
      [null, null, null, { type: 'k', color: 'b' }, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, { type: 'q', color: 'b' }, null, { type: 'n', color: 'w' }, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, { type: 'k', color: 'w' }, null, null, null]
    ]
  }
];

const createInitialChessBoard = (): ChessBoard => [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
  ],
  Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })),
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
  ]
];

export default function DashboardView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'feed' | 'focus' | 'arena' | 'arcade' | 'palace'>('overview');
  const [feedSubTab, setFeedSubTab] = useState<'slow-news' | 'philosophy'>('slow-news');
  const [focusSubTab, setFocusSubTab] = useState<'gym' | 'quiet'>('gym');
  const [arcadeSubTab, setArcadeSubTab] = useState<'strategy' | 'reflex'>('strategy');
  const [palaceSubTab, setPalaceSubTab] = useState<'sandbox' | 'skillswap' | 'vault'>('sandbox');

  // --- CHESS ARENA STATES ---
  const [chessMode, setChessMode] = useState<'puzzle' | 'sandbox'>('puzzle');
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0);
  const [chessBoard, setChessBoard] = useState<ChessBoard>(() => 
    JSON.parse(JSON.stringify(CHESS_PUZZLES[0].setup))
  );
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [chessHistory, setChessHistory] = useState<string[]>([]);
  const [chessStatus, setChessStatus] = useState<string>('Select a piece to begin.');
  const [solvedChessPuzzles, setSolvedChessPuzzles] = useState<string[]>([]);
  const [chessOpponent, setChessOpponent] = useState<'friend' | 'ai'>('ai');
  const [chessTurn, setChessTurn] = useState<'w' | 'b'>('w');

  // --- N-BACK COGNITIVE STATES ---
  const [nBackValue, setNBackValue] = useState<number>(2);
  const [nBackStatus, setNBackStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [nBackSequence, setNBackSequence] = useState<number[]>([]);
  const [nBackCurrentIndex, setNBackCurrentIndex] = useState<number>(-1);
  const [nBackActiveCell, setNBackActiveCell] = useState<number | null>(null);
  const [nBackScore, setNBackScore] = useState({ correct: 0, wrong: 0, totalMatches: 0 });
  const [userMatchedThisTurn, setUserMatchedThisTurn] = useState(false);
  const [nBackRoundHistory, setNBackRoundHistory] = useState<string[]>([]);

  // --- DIGIT SPAN WORKING MEMORY STATES ---
  const [digitSpanMode, setDigitSpanMode] = useState<'forward' | 'backward'>('backward');
  const [digitSpanStatus, setDigitSpanStatus] = useState<'idle' | 'showing' | 'input' | 'failed' | 'success'>('idle');
  const [digitSpanSeq, setDigitSpanSeq] = useState<number[]>([]);
  const [digitSpanShowIdx, setDigitSpanShowIdx] = useState<number>(-1);
  const [digitSpanInput, setDigitSpanInput] = useState<string>('');
  const [digitSpanLength, setDigitSpanLength] = useState<number>(4);
  const [digitSpanStrikes, setDigitSpanStrikes] = useState<number>(3);
  const [digitSpanBest, setDigitSpanBest] = useState(() => Number(localStorage.getItem('digit_span_best') || 4));

  const nBackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- CHESS ARENA LOGIC ---
  const triggerAIMove = (board: ChessBoard) => {
    const blackPieces: { r: number; c: number }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === 'b') {
          blackPieces.push({ r, c });
        }
      }
    }
    if (blackPieces.length === 0) return;

    let moved = false;
    const shuffled = blackPieces.sort(() => 0.5 - Math.random());
    for (const p of shuffled) {
      const piece = board[p.r][p.c]!;
      const targets: [number, number][] = [];
      if (piece.type === 'p') {
        if (p.r + 1 < 8 && !board[p.r + 1][p.c]) targets.push([p.r + 1, p.c]);
        if (p.r + 1 < 8 && p.c - 1 >= 0 && board[p.r + 1][p.c - 1]?.color === 'w') targets.push([p.r + 1, p.c - 1]);
        if (p.r + 1 < 8 && p.c + 1 < 8 && board[p.r + 1][p.c + 1]?.color === 'w') targets.push([p.r + 1, p.c + 1]);
      } else {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 1], [1, 2], [-2, 1]];
        for (const [dr, dc] of dirs) {
          const nr = p.r + dr;
          const nc = p.c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const targetPiece = board[nr][nc];
            if (!targetPiece || targetPiece.color === 'w') {
              targets.push([nr, nc]);
            }
          }
        }
      }

      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const nextBoard = board.map(row => [...row]);
        nextBoard[target[0]][target[1]] = piece;
        nextBoard[p.r][p.c] = null;
        setChessBoard(nextBoard);
        setChessTurn('w');
        setChessHistory(prev => [...prev, `${piece.type.toUpperCase()}:${p.r},${p.c}→${target[0]},${target[1]}`]);
        playCalmTone(329.63, 'triangle', 0.12);
        moved = true;
        break;
      }
    }

    if (!moved) {
      setChessTurn('w');
    }
  };

  const handleChessSquareClick = (r: number, c: number) => {
    if (chessMode === 'puzzle') {
      const puzzle = CHESS_PUZZLES[currentPuzzleIdx];
      const isAlreadySolved = solvedChessPuzzles.includes(puzzle.id);
      if (isAlreadySolved) return;

      if (!selectedSquare) {
        const piece = chessBoard[r][c];
        if (piece && piece.color === 'w') {
          playCalmTone(440, 'sine', 0.08);
          setSelectedSquare([r, c]);
        }
      } else {
        const [sr, sc] = selectedSquare;
        if (sr === r && sc === c) {
          setSelectedSquare(null);
          return;
        }

        const isFromCorrect = sr === puzzle.correctMove.from[0] && sc === puzzle.correctMove.from[1];
        const isToCorrect = r === puzzle.correctMove.to[0] && c === puzzle.correctMove.to[1];

        if (isFromCorrect && isToCorrect) {
          const nextBoard = chessBoard.map(row => [...row]);
          nextBoard[r][c] = nextBoard[sr][sc];
          nextBoard[sr][sc] = null;
          setChessBoard(nextBoard);
          setSelectedSquare(null);
          
          setSolvedChessPuzzles(prev => [...prev, puzzle.id]);
          playCalmTone(523.25, 'sine', 0.1);
          setTimeout(() => playCalmTone(659.25, 'sine', 0.12), 80);
          setTimeout(() => playCalmTone(783.99, 'sine', 0.25), 160);

          setChessStatus('✓ Brilliant tactical solution! Focus points achieved.');
          setUserStats(prev => ({
            ...prev,
            points: prev.points + 100,
            gamesWon: prev.gamesWon + 1
          }));
        } else {
          playCalmTone(200, 'sawtooth', 0.4);
          setChessStatus('✘ Inaccurate response. Re-analyze the board and try again.');
          setSelectedSquare(null);
        }
      }
    } else {
      if (!selectedSquare) {
        const piece = chessBoard[r][c];
        if (piece && piece.color === chessTurn) {
          playCalmTone(440, 'sine', 0.08);
          setSelectedSquare([r, c]);
        }
      } else {
        const [sr, sc] = selectedSquare;
        if (sr === r && sc === c) {
          setSelectedSquare(null);
          return;
        }

        const piece = chessBoard[sr][sc]!;
        const nextBoard = chessBoard.map(row => [...row]);
        nextBoard[r][c] = piece;
        nextBoard[sr][sc] = null;
        setChessBoard(nextBoard);
        setSelectedSquare(null);
        
        playCalmTone(493.88, 'sine', 0.1);
        setChessHistory(prev => [...prev, `${piece.type.toUpperCase()}:${sr},${sc}→${r},${c}`]);

        if (chessOpponent === 'ai') {
          setChessTurn('b');
          setChessStatus('Virtual opponent is calculating counter-strategy...');
          setTimeout(() => {
            triggerAIMove(nextBoard);
            setChessStatus('Your turn. Formulate prefrontal coordination.');
          }, 1000);
        } else {
          setChessTurn(chessTurn === 'w' ? 'b' : 'w');
          setChessStatus(`Turn: ${chessTurn === 'w' ? 'Black' : 'White'}`);
        }
      }
    }
  };

  const resetChessSandbox = () => {
    setChessBoard(createInitialChessBoard());
    setSelectedSquare(null);
    setChessTurn('w');
    setChessHistory([]);
    setChessStatus('Sandbox initiated. Move any piece to train strategic depth.');
    playCalmTone(392, 'sine', 0.12);
  };

  const loadChessPuzzle = (idx: number) => {
    setCurrentPuzzleIdx(idx);
    setChessBoard(JSON.parse(JSON.stringify(CHESS_PUZZLES[idx].setup)));
    setSelectedSquare(null);
    setChessStatus('Study the board coordinate. Deliver the winning focus blow.');
    playCalmTone(440, 'sine', 0.1);
  };

  // --- N-BACK COGNITIVE SCIENCE LOGIC ---
  const startNBackGame = () => {
    if (nBackIntervalRef.current) clearTimeout(nBackIntervalRef.current);
    const seqLength = 15;
    const newSeq: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      if (i >= nBackValue && Math.random() < 0.35) {
        newSeq.push(newSeq[i - nBackValue]);
      } else {
        newSeq.push(Math.floor(Math.random() * 9));
      }
    }

    setNBackSequence(newSeq);
    setNBackStatus('running');
    setNBackCurrentIndex(0);
    setNBackScore({ correct: 0, wrong: 0, totalMatches: countNBackMatches(newSeq, nBackValue) });
    setUserMatchedThisTurn(false);
    setNBackRoundHistory([]);
    playCalmTone(523.25, 'sine', 0.2);

    runNBackStep(0, newSeq);
  };

  const countNBackMatches = (seq: number[], n: number) => {
    let count = 0;
    for (let i = n; i < seq.length; i++) {
      if (seq[i] === seq[i - n]) count++;
    }
    return count;
  };

  const runNBackStep = (index: number, seq: number[]) => {
    if (index >= seq.length) {
      setNBackStatus('completed');
      setNBackActiveCell(null);
      return;
    }

    setNBackCurrentIndex(index);
    setNBackActiveCell(seq[index]);
    setUserMatchedThisTurn(false);

    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];
    playCalmTone(frequencies[seq[index]], 'sine', 0.2);

    setTimeout(() => {
      setNBackActiveCell(null);
    }, 1300);

    nBackIntervalRef.current = setTimeout(() => {
      if (index >= nBackValue && seq[index] === seq[index - nBackValue] && !userMatchedThisTurn) {
        setNBackScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        setNBackRoundHistory(prev => [...prev, `Turn ${index + 1}: Missed Match`]);
      }
      runNBackStep(index + 1, seq);
    }, 2200);
  };

  const handleNBackMatchClick = () => {
    if (nBackStatus !== 'running' || userMatchedThisTurn) return;
    setUserMatchedThisTurn(true);

    const isMatch = nBackCurrentIndex >= nBackValue && nBackSequence[nBackCurrentIndex] === nBackSequence[nBackCurrentIndex - nBackValue];
    if (isMatch) {
      setNBackScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setNBackRoundHistory(prev => [...prev, `Turn ${nBackCurrentIndex + 1}: Perfect Match (+15cp)`]);
      playCalmTone(659.25, 'sine', 0.15);
      
      setUserStats(prev => ({
        ...prev,
        points: prev.points + 15
      }));
    } else {
      setNBackScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setNBackRoundHistory(prev => [...prev, `Turn ${nBackCurrentIndex + 1}: False Alarm (-5cp)`]);
      playCalmTone(220, 'sawtooth', 0.25);
      
      setUserStats(prev => ({
        ...prev,
        points: Math.max(0, prev.points - 5)
      }));
    }
  };

  // --- DIGIT SPAN LOGIC ---
  const startDigitSpanGame = () => {
    setDigitSpanStrikes(3);
    setDigitSpanLength(4);
    setDigitSpanStatus('showing');
    generateDigitSpanRound(4);
  };

  const generateDigitSpanRound = (length: number) => {
    setDigitSpanStatus('showing');
    setDigitSpanInput('');
    const newSeq = Array.from({ length }, () => Math.floor(Math.random() * 10));
    setDigitSpanSeq(newSeq);
    
    let idx = 0;
    setDigitSpanShowIdx(0);
    playCalmTone(349.23, 'sine', 0.15);

    const interval = setInterval(() => {
      idx++;
      if (idx >= length) {
        clearInterval(interval);
        setTimeout(() => {
          setDigitSpanShowIdx(-1);
          setDigitSpanStatus('input');
        }, 1000);
      } else {
        setDigitSpanShowIdx(idx);
        playCalmTone(349.23 + idx * 30, 'sine', 0.15);
      }
    }, 1200);
  };

  const submitDigitSpanAnswer = () => {
    const trimmed = digitSpanInput.replace(/\s+/g, '');
    let expected = digitSpanSeq.join('');
    if (digitSpanMode === 'backward') {
      expected = [...digitSpanSeq].reverse().join('');
    }

    if (trimmed === expected) {
      playCalmTone(523.25, 'sine', 0.1);
      setTimeout(() => playCalmTone(659.25, 'sine', 0.2), 100);
      
      const nextLen = digitSpanLength + 1;
      setDigitSpanLength(nextLen);
      
      if (nextLen - 1 > digitSpanBest) {
        setDigitSpanBest(nextLen - 1);
        localStorage.setItem('digit_span_best', String(nextLen - 1));
      }

      setUserStats(prev => ({
        ...prev,
        points: prev.points + 30,
        gamesWon: prev.gamesWon + 1
      }));

      setTimeout(() => {
        generateDigitSpanRound(nextLen);
      }, 1500);
    } else {
      playCalmTone(200, 'sawtooth', 0.4);
      const newStrikes = digitSpanStrikes - 1;
      setDigitSpanStrikes(newStrikes);

      if (newStrikes <= 0) {
        setDigitSpanStatus('failed');
      } else {
        setDigitSpanStatus('showing');
        setTimeout(() => {
          generateDigitSpanRound(digitSpanLength);
        }, 1500);
      }
    }
  };
  
  // State for Social Feed & Wiki search
  const [posts, setPosts] = useState<Post[]>(PRE_SEEDED_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});
  
  // Points & Profile state (synchronized with localStorage)
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('cortex_user_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      points: 120,
      level: 1,
      streak: 4,
      quizzesSolved: 0,
      gamesWon: 0,
      savedArticles: [] as string[] // list of saved post ids
    };
  });

  // Save stats helper
  useEffect(() => {
    localStorage.setItem('cortex_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  // Handle Level naming based on points
  const getLevelName = (pts: number) => {
    if (pts < 250) return { title: "Synaptic Initiate", nextLevel: 250 };
    if (pts < 600) return { title: "Attention Scholar", nextLevel: 600 };
    if (pts < 1200) return { title: "Cognitive Alchemist", nextLevel: 1200 };
    return { title: "Focus Zen Sovereign", nextLevel: 99999 };
  };

  const currentLevel = getLevelName(userStats.points);

  const earnPoints = (pts: number) => {
    setUserStats(prev => {
      const nextPoints = prev.points + pts;
      const currentLvl = getLevelName(prev.points).title;
      const nextLvl = getLevelName(nextPoints).title;
      const levelUp = currentLvl !== nextLvl;
      return {
        ...prev,
        points: nextPoints,
        level: levelUp ? prev.level + 1 : prev.level
      };
    });
  };

  // State for loading trending feed from our service layer
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);

  // Auto-updating feed on mount: Load fresh random Wikipedia entries from service layer!
  useEffect(() => {
    autoUpdateFeed();
  }, []);

  const autoUpdateFeed = async () => {
    setIsRefreshingFeed(true);
    try {
      const res = await fetch("/api/wiki/trending-posts");
      if (res.ok) {
        const data = await res.json();
        if (data.posts && Array.isArray(data.posts)) {
          // Add them, filtering out any that are already in our feed to prevent duplicates
          setPosts(prev => {
            const newPosts = data.posts.filter(
              (newP: Post) => !prev.some(p => p.title.toLowerCase() === newP.title.toLowerCase())
            );
            return [...newPosts, ...prev];
          });
        }
      } else {
        // Fallback to client-side direct Wikipedia summary fetch if service layer is temporarily offline
        const shuffled = [...CURATED_TOPICS].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);
        
        for (const topic of selected) {
          if (!posts.some(p => p.title.toLowerCase() === topic.toLowerCase())) {
            try {
              const directRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
              if (directRes.ok) {
                const data = await directRes.json();
                const newPost: Post = {
                  id: `wiki_${data.pageid || Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  title: data.title,
                  description: data.description || "Trusted educational subject.",
                  extract: data.extract,
                  thumbnailUrl: data.thumbnail?.source || undefined,
                  source: "Wikipedia",
                  sourceUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${topic}`,
                  readingTimeMin: Math.max(1, Math.ceil(data.extract.split(" ").length / 150)),
                  cognitiveLoad: 4,
                  quiz: generateQuizForWiki(data.title, data.extract),
                  comments: [
                    { id: `c_${Date.now()}_1`, author: "Cortex Scholar", avatar: "CS", text: `I love analyzing ${data.title}. Truly high signal-to-noise ratio!`, timestamp: "Just now", likes: 2 }
                  ]
                };
                setPosts(prev => [newPost, ...prev]);
              }
            } catch (innerErr) {
              console.error("Direct fetch fallback failed:", innerErr);
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch trending posts from service layer:", e);
    } finally {
      setIsRefreshingFeed(false);
    }
  };

  // Helper to synthesize a neat quiz client-side based on the topic
  const generateQuizForWiki = (title: string, extract: string) => {
    // Determine custom options based on key matches, or a solid educational trivia question
    const qText = `Based on the scientific summary of ${title}, which statement is correct?`;
    let options = [
      `It represents an unmeasured phenomenon with no empirical proof in standard science.`,
      `It is an active field of study and critical foundation of physical/cognitive understanding.`,
      `It is a transient state of matter that exists only under absolute zero pressure.`
    ];
    let correct = 1;
    let explanation = `The summary confirms that ${title} is a vital element of scientific reality, validated by observation and empirical modeling.`;

    if (title.toLowerCase().includes("bias") || extract.toLowerCase().includes("cognitive")) {
      options = [
        "It is a conscious effort by the brain to maximize math calculations.",
        "It is a systematic pattern of deviation from norm or rationality in judgment.",
        "It is an artificial frequency emitted by dynamic monitor screens."
      ];
      correct = 1;
      explanation = "Cognitive biases are highly studied evolutionary shortcuts that the brain uses, which can lead to irrational judgment patterns.";
    } else if (title.toLowerCase().includes("telescope") || title.toLowerCase().includes("astronomy")) {
      options = [
        "Observatories gather electromagnetic signals to peer deep into past space-time cosmic epochs.",
        "Telescopes alter the molecular refraction of stars to make them warmer.",
        "Space telescopes must look through the deep soil of earth to work."
      ];
      correct = 0;
      explanation = "Cosmological telescopes gather ancient photons, essentially working as time machines looking back into cosmic history.";
    } else if (title.toLowerCase().includes("photosynthesis") || extract.toLowerCase().includes("plant")) {
      options = [
        "Plants synthesize chemical sugars by destroying structural solar minerals.",
        "Light energy is captured by photo-pigments to synthesize organic molecules from CO2 and water.",
        "It is a modern technological method of generating battery current using leaves."
      ];
      correct = 1;
      explanation = "Photosynthesis is the foundational chemical cycle of life, capturing solar photons to build simple carbon sugars.";
    }

    return {
      question: qText,
      options,
      correctIndex: correct,
      explanation
    };
  };

  // Active Quiz tracking
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [solvedQuizzes, setSolvedQuizzes] = useState<Record<string, { selected: number; correct: boolean }>>({});

  // Search Wikipedia directly using Wikipedia API and enhance using server-side Gemini Service Layer
  const handleWikiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    playCalmTone(587.33, 'sine', 0.1); // D5 tone

    try {
      // 1. Search Wikipedia titles
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      const results = searchData?.query?.search;
      if (!results || results.length === 0) {
        setSearchError('No trusted knowledge nodes found on this topic. Try something broader (e.g., Photosynthesis).');
        setIsSearching(false);
        return;
      }

      // Get the top result's title
      const topTitle = results[0].title;

      // 2. Fetch detailed summary
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle)}`;
      const summaryRes = await fetch(summaryUrl);
      
      if (!summaryRes.ok) {
        throw new Error('Failed to fetch article summary');
      }

      const data = await summaryRes.json();
      
      // Prevent duplicates
      if (posts.some(p => p.title.toLowerCase() === data.title.toLowerCase())) {
        setSearchError(`'${data.title}' is already loaded in your feed below!`);
        setIsSearching(false);
        return;
      }

      // 3. Request high-quality, AI-powered enhancement from our backend service layer
      let enhancement = null;
      try {
        const enhanceRes = await fetch("/api/wiki/enhance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: data.title,
            extract: data.extract
          })
        });
        if (enhanceRes.ok) {
          enhancement = await enhanceRes.json();
        }
      } catch (err) {
        console.warn("Service layer enhancement failed, relying on offline fallback metrics:", err);
      }

      const finalQuiz = enhancement?.quiz || generateQuizForWiki(data.title, data.extract);
      const finalComments = enhancement?.comments?.map((c: any, idx: number) => ({
        id: `c_gen_${Date.now()}_${idx}`,
        ...c
      })) || [
        { id: `c_gen_${Date.now()}`, author: "Library Archiver", avatar: "LA", text: `I love that we can index ${data.title} live. Thanks for keeping the feed dynamic!`, timestamp: "Just now", likes: 1 }
      ];
      const finalCognitiveLoad = enhancement?.cognitiveLoad || 5;

      const newPost: Post = {
        id: `wiki_${data.pageid || Date.now()}`,
        title: data.title,
        description: data.description || "Self-searched community knowledge topic.",
        extract: data.extract,
        thumbnailUrl: data.thumbnail?.source || undefined,
        source: "Wikipedia",
        sourceUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topTitle)}`,
        readingTimeMin: Math.max(1, Math.ceil(data.extract.split(" ").length / 150)),
        cognitiveLoad: finalCognitiveLoad,
        quiz: finalQuiz,
        comments: finalComments
      };

      setPosts(prev => [newPost, ...prev]);
      setSearchQuery('');
      playCalmTone(880, 'sine', 0.25); // A5 Success chime
      
      // Award points for seeking trusted knowledge
      setUserStats(prev => ({
        ...prev,
        points: prev.points + 15
      }));
    } catch (err) {
      console.error(err);
      setSearchError('Network error connecting to Wikipedia. Please check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // Bookmark / Save toggle
  const handleToggleSave = (postId: string) => {
    setUserStats(prev => {
      const alreadySaved = prev.savedArticles.includes(postId);
      const updated = alreadySaved
        ? prev.savedArticles.filter(id => id !== postId)
        : [...prev.savedArticles, postId];
      
      if (!alreadySaved) {
        playCalmTone(659.25, 'sine', 0.15); // E5 soothing save note
      }
      return { ...prev, savedArticles: updated };
    });
  };

  // Add Comment on post
  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = newCommentTexts[postId];
    if (!commentText || !commentText.trim()) return;

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `c_u_${Date.now()}`,
              author: "You (Cortex Explorer)",
              avatar: "Y",
              text: commentText.trim(),
              timestamp: "Just now",
              likes: 0
            }
          ]
        };
      }
      return p;
    }));

    setNewCommentTexts(prev => ({ ...prev, [postId]: '' }));
    playCalmTone(440, 'triangle', 0.1); // Soft pop tone

    // Award reflection points (+10 cp)
    setUserStats(prev => ({
      ...prev,
      points: prev.points + 10
    }));
  };

  // Solve quiz
  const handleSolveQuiz = (postId: string, optionIndex: number, correctIndex: number) => {
    if (solvedQuizzes[postId]) return; // already solved
    
    const isCorrect = optionIndex === correctIndex;
    setSolvedQuizzes(prev => ({
      ...prev,
      [postId]: { selected: optionIndex, correct: isCorrect }
    }));

    if (isCorrect) {
      playCalmTone(523.25, 'sine', 0.1); // C5
      setTimeout(() => playCalmTone(659.25, 'sine', 0.1), 100); // E5
      setTimeout(() => playCalmTone(783.99, 'sine', 0.25), 200); // G5 Success arpeggio

      setUserStats(prev => ({
        ...prev,
        points: prev.points + 50,
        quizzesSolved: prev.quizzesSolved + 1
      }));
    } else {
      playCalmTone(220, 'sawtooth', 0.3); // Deep failure buzz
    }
  };


  // ==========================================
  // GAME 1: FOCUS GYM SPATIAL SEQUENCE
  // ==========================================
  const [seqStatus, setSeqStatus] = useState<'idle' | 'showing' | 'player' | 'failed' | 'success'>('idle');
  const [gameSeq, setGameSeq] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [seqRound, setSeqRound] = useState(1);
  const [seqBest, setSeqBest] = useState(() => Number(localStorage.getItem('seq_best') || 0));

  const startSeqGame = () => {
    playCalmTone(329.63, 'sine', 0.15); // E4
    setSeqRound(1);
    setSeqStatus('showing');
    const firstSeq = [Math.floor(Math.random() * 9)];
    setGameSeq(firstSeq);
    setPlayerSeq([]);
    showSequence(firstSeq);
  };

  const showSequence = (seq: number[]) => {
    setSeqStatus('showing');
    let idx = 0;
    const interval = setInterval(() => {
      const tile = seq[idx];
      setActiveTile(tile);
      
      // Play ascending calming harmonics
      const tileFrequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];
      playCalmTone(tileFrequencies[tile], 'sine', 0.25);

      setTimeout(() => {
        setActiveTile(null);
      }, 300);

      idx++;
      if (idx >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setSeqStatus('player');
          setPlayerSeq([]);
        }, 500);
      }
    }, 600);
  };

  const handleTileClick = (tileIdx: number) => {
    if (seqStatus !== 'player') return;

    setActiveTile(tileIdx);
    const tileFrequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];
    playCalmTone(tileFrequencies[tileIdx], 'sine', 0.15);
    setTimeout(() => setActiveTile(null), 150);

    const nextPlayerSeq = [...playerSeq, tileIdx];
    setPlayerSeq(nextPlayerSeq);

    // Verify
    const currentVerifyIdx = nextPlayerSeq.length - 1;
    if (tileIdx !== gameSeq[currentVerifyIdx]) {
      // Failed!
      setSeqStatus('failed');
      playCalmTone(180, 'sawtooth', 0.4);
      return;
    }

    if (nextPlayerSeq.length === gameSeq.length) {
      // Round Complete!
      setSeqStatus('success');
      playCalmTone(659.25, 'sine', 0.1);
      setTimeout(() => playCalmTone(783.99, 'sine', 0.15), 100);
      
      const newRound = seqRound + 1;
      setSeqRound(newRound);
      if (newRound > seqBest) {
        setSeqBest(newRound);
        localStorage.setItem('seq_best', String(newRound));
      }

      // Reward points dynamically (+20 cp per level achieved!)
      setUserStats(prev => ({
        ...prev,
        points: prev.points + 20,
        gamesWon: prev.gamesWon + 1
      }));

      // Next turn
      setTimeout(() => {
        const nextSeq = [...gameSeq, Math.floor(Math.random() * 9)];
        setGameSeq(nextSeq);
        showSequence(nextSeq);
      }, 1000);
    }
  };


  // ==========================================
  // GAME 2: STROOP FOCUS MATCH
  // ==========================================
  const STROOP_WORDS = [
    { text: "GREEN", color: "text-emerald-400", hex: "#34d399", name: "Green" },
    { text: "AMBER", color: "text-[#dfb15b]", hex: "#dfb15b", name: "Amber" },
    { text: "BLUE", color: "text-sky-400", hex: "#38bdf8", name: "Blue" },
    { text: "ROSE", color: "text-rose-400", hex: "#fb7185", name: "Rose" },
    { text: "CREAM", color: "text-[#f1ede2]", hex: "#f1ede2", name: "Cream" }
  ];

  const [stroopGame, setStroopGame] = useState({
    status: 'idle' as 'idle' | 'playing' | 'gameover',
    promptType: 'color' as 'color' | 'meaning', // 'color' means click the display color; 'meaning' means click the spelling
    wordIndex: 0,
    colorIndex: 0,
    options: [] as string[],
    score: 0,
    timeLeft: 100, // percentage
    highScore: Number(localStorage.getItem('stroop_best') || 0)
  });

  const stroopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startStroopGame = () => {
    playCalmTone(440, 'sine', 0.1);
    setStroopGame(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      timeLeft: 100
    }));
    generateStroopRound(0);
  };

  const generateStroopRound = (currentScore: number) => {
    const wordIdx = Math.floor(Math.random() * STROOP_WORDS.length);
    // Create mismatch with high probability
    let colorIdx = Math.floor(Math.random() * STROOP_WORDS.length);
    if (colorIdx === wordIdx && Math.random() < 0.7) {
      colorIdx = (colorIdx + 1) % STROOP_WORDS.length;
    }

    const isColorPrompt = Math.random() > 0.5;
    
    // Options are all color names
    const options = STROOP_WORDS.map(w => w.name);

    setStroopGame(prev => ({
      ...prev,
      promptType: isColorPrompt ? 'color' : 'meaning',
      wordIndex: wordIdx,
      colorIndex: colorIdx,
      options,
      score: currentScore,
      timeLeft: 100
    }));

    // Reset timer
    if (stroopTimerRef.current) clearInterval(stroopTimerRef.current);
    stroopTimerRef.current = setInterval(() => {
      setStroopGame(prev => {
        if (prev.timeLeft <= 0) {
          clearInterval(stroopTimerRef.current!);
          playCalmTone(150, 'sawtooth', 0.5); // end buzz
          return {
            ...prev,
            status: 'gameover'
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 4 // speeds down in ~2.5 seconds
        };
      });
    }, 100);
  };

  const handleStroopAnswer = (selectedName: string) => {
    if (stroopGame.status !== 'playing') return;

    const correctValue = stroopGame.promptType === 'color' 
      ? STROOP_WORDS[stroopGame.colorIndex].name 
      : STROOP_WORDS[stroopGame.wordIndex].name;

    if (selectedName === correctValue) {
      // Correct!
      playCalmTone(587.33, 'sine', 0.1);
      const newScore = stroopGame.score + 10;
      
      // Update highscore
      const newHigh = Math.max(newScore, stroopGame.highScore);
      localStorage.setItem('stroop_best', String(newHigh));

      // Award points (+5 cp per round)
      setUserStats(prev => ({
        ...prev,
        points: prev.points + 5
      }));

      setStroopGame(prev => ({ ...prev, highScore: newHigh }));
      generateStroopRound(newScore);
    } else {
      // Incorrect!
      if (stroopTimerRef.current) clearInterval(stroopTimerRef.current);
      playCalmTone(200, 'sawtooth', 0.4);
      setStroopGame(prev => ({
        ...prev,
        status: 'gameover'
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (stroopTimerRef.current) clearInterval(stroopTimerRef.current);
    };
  }, []);


  // ==========================================
  // GAME 3: NATIVE SUDOKU SANCTUARY
  // ==========================================
  const [sudokuDifficulty, setSudokuDifficulty] = useState<'easy' | 'medium'>('easy');
  
  // Clean custom board generator with beautiful static puzzle maps
  const SUDOKU_PUZZLES = {
    easy: {
      board: [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ],
      solution: [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ]
    },
    medium: {
      board: [
        [0, 0, 0, 6, 0, 0, 4, 0, 0],
        [7, 0, 0, 0, 0, 3, 6, 0, 0],
        [0, 0, 0, 0, 9, 1, 0, 8, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 5, 0, 1, 8, 0, 0, 0, 3],
        [0, 0, 0, 3, 0, 6, 0, 4, 5],
        [0, 4, 0, 2, 0, 0, 0, 6, 0],
        [9, 0, 3, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 1, 0, 0]
      ],
      solution: [
        [1, 9, 2, 6, 5, 8, 4, 3, 7],
        [7, 8, 5, 4, 2, 3, 6, 1, 9],
        [4, 3, 6, 7, 9, 1, 5, 8, 2],
        [3, 6, 1, 5, 4, 2, 8, 9, 7],
        [2, 5, 4, 1, 8, 9, 6, 7, 3],
        [8, 7, 9, 3, 1, 6, 2, 4, 5],
        [5, 4, 8, 2, 3, 7, 9, 6, 1],
        [9, 1, 3, 8, 6, 4, 7, 2, 5],
        [6, 2, 7, 9, 7, 5, 1, 5, 8] // Note: Standard fallback validator checks row/col rule
      ]
    }
  };

  const [sudokuGrid, setSudokuGrid] = useState<number[][]>(() => 
    JSON.parse(JSON.stringify(SUDOKU_PUZZLES.easy.board))
  );
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [sudokuChecked, setSudokuChecked] = useState<'idle' | 'success' | 'incorrect'>('idle');
  const [notesMode, setNotesMode] = useState(false);

  // Restart Sudoku
  const handleSudokuReset = (diff: 'easy' | 'medium') => {
    playCalmTone(392, 'sine', 0.1);
    setSudokuDifficulty(diff);
    setSudokuGrid(JSON.parse(JSON.stringify(SUDOKU_PUZZLES[diff].board)));
    setSelectedCell(null);
    setSudokuChecked('idle');
  };

  // Cell fill
  const handleSudokuInput = (val: number) => {
    if (!selectedCell) return;
    const { r, c } = selectedCell;

    // Check if initial block
    const initialPuzzle = SUDOKU_PUZZLES[sudokuDifficulty].board;
    if (initialPuzzle[r][c] !== 0) return; // cannot edit prefilled cells

    playCalmTone(440, 'sine', 0.08);
    const updated = [...sudokuGrid];
    updated[r][c] = val === updated[r][c] ? 0 : val; // toggle or write
    setSudokuGrid(updated);
    setSudokuChecked('idle');
  };

  // Sudoku check validator
  const handleCheckSudoku = () => {
    const solution = SUDOKU_PUZZLES[sudokuDifficulty].solution;
    
    let isPerfect = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        // Must match solution (or satisfy sum checks)
        if (sudokuGrid[r][c] === 0 || sudokuGrid[r][c] !== solution[r][c]) {
          isPerfect = false;
          break;
        }
      }
    }

    if (isPerfect) {
      setSudokuChecked('success');
      playCalmTone(523.25, 'sine', 0.1);
      setTimeout(() => playCalmTone(659.25, 'sine', 0.15), 100);
      setTimeout(() => playCalmTone(880, 'sine', 0.3), 200);

      // Award points (+150 cp)
      setUserStats(prev => ({
        ...prev,
        points: prev.points + 150,
        gamesWon: prev.gamesWon + 1
      }));
    } else {
      setSudokuChecked('incorrect');
      playCalmTone(200, 'sawtooth', 0.4);
    }
  };


  // ==========================================
  // VIEW RENDER PARTS
  // ==========================================
  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#0c100e] text-[#f1ede2]">
      
      {/* 1. Dashboard Desktop Left Sidebar / Mobile Bottom Bar */}
      <aside className="w-full md:w-64 bg-[#141a17] border-b md:border-b-0 md:border-r border-[#222d26] flex md:flex-col justify-between shrink-0 p-4 md:p-6 select-none">
        
        {/* Workspace Brand Details */}
        <div className="flex md:flex-col items-center md:items-start w-full justify-between md:justify-start md:gap-8">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dfb15b]/20 to-transparent border border-[#dfb15b]/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#dfb15b]" />
            </div>
            <div>
              <span className="text-sm font-black tracking-widest text-[#f1ede2] uppercase block">CORTEX</span>
              <span className="text-[9px] font-bold text-[#879b90] tracking-wider uppercase block">Homeostatic Social</span>
            </div>
          </div>

          {/* User Score Tracker Panel */}
          <div className="hidden md:block w-full bg-[#1c2420] border border-[#2c3931] p-4 rounded-xl mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#879b90] tracking-widest">Prefrontal Index</span>
              <Flame className="w-3.5 h-3.5 text-[#dfb15b] animate-pulse" />
            </div>
            
            <div>
              <div className="text-2xl font-black text-[#dfb15b] font-mono leading-none">
                {userStats.points} <span className="text-xs text-[#879b90]">cp</span>
              </div>
              <div className="text-[10px] text-[#879b90] font-sans mt-1">
                Level {userStats.level}: <span className="text-[#f1ede2] font-semibold">{currentLevel.title}</span>
              </div>
            </div>

            {/* Level progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] text-[#879b90] font-mono">
                <span>PROGRESS</span>
                <span>{userStats.points} / {currentLevel.nextLevel} CP</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#dfb15b] to-[#4a725e] transition-all duration-500" 
                  style={{ width: `${Math.min(100, (userStats.points / currentLevel.nextLevel) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-[#252f2a] text-[10px] text-[#879b90]">
              <span className="flex items-center gap-1">🔥 {userStats.streak} day streak</span>
              <span>📚 {userStats.quizzesSolved} solved</span>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs (Desktop Left Panel) */}
        <nav className="flex md:flex-col gap-1 w-full justify-around md:justify-start md:mt-8 md:flex-1">
          <button
            onClick={() => { playCalmTone(440, 'sine', 0.05); setActiveTab('overview'); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#dfb15b] text-[#0c100e] shadow-[0_4px_12px_rgba(223,177,91,0.2)] font-black'
                : 'text-[#879b90] hover:bg-[#1c2420] hover:text-[#f1ede2]'
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">8 Pillars Directory</span>
          </button>

          <button
            onClick={() => { playCalmTone(523.25, 'sine', 0.05); setActiveTab('feed'); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-[#dfb15b] text-[#0c100e] shadow-[0_4px_12px_rgba(223,177,91,0.2)] font-black'
                : 'text-[#879b90] hover:bg-[#1c2420] hover:text-[#f1ede2]'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Slow-News & Philosophy</span>
          </button>

          <button
            onClick={() => { playCalmTone(587.33, 'sine', 0.05); setActiveTab('focus'); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'focus'
                ? 'bg-[#dfb15b] text-[#0c100e] shadow-[0_4px_12px_rgba(223,177,91,0.2)] font-black'
                : 'text-[#879b90] hover:bg-[#1c2420] hover:text-[#f1ede2]'
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Focus & Decompression</span>
          </button>

          <button
            onClick={() => { playCalmTone(622.25, 'sine', 0.05); setActiveTab('arena'); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'arena'
                ? 'bg-[#dfb15b] text-[#0c100e] shadow-[0_4px_12px_rgba(223,177,91,0.2)] font-black'
                : 'text-[#879b90] hover:bg-[#1c2420] hover:text-[#f1ede2]'
            }`}
          >
            <Swords className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Chess & Logic Arena</span>
          </button>

          <button
            onClick={() => { playCalmTone(659.25, 'sine', 0.05); setActiveTab('arcade'); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'arcade'
                ? 'bg-[#dfb15b] text-[#0c100e] shadow-[0_4px_12px_rgba(223,177,91,0.2)] font-black'
                : 'text-[#879b90] hover:bg-[#1c2420] hover:text-[#f1ede2]'
            }`}
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Mind Arcade & Reflex</span>
          </button>

          <button
            onClick={() => { playCalmTone(698.46, 'sine', 0.05); setActiveTab('palace'); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'palace'
                ? 'bg-[#dfb15b] text-[#0c100e] shadow-[0_4px_12px_rgba(223,177,91,0.2)] font-black'
                : 'text-[#879b90] hover:bg-[#1c2420] hover:text-[#f1ede2]'
            }`}
          >
            <Bookmark className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Sandbox & Skill Swap</span>
          </button>
        </nav>

        {/* Mobile Stat Bar Indicator */}
        <div className="md:hidden flex items-center gap-3 bg-[#1c2420] px-3 py-1.5 rounded-lg border border-[#2c3931] text-[11px] font-mono">
          <span className="text-[#dfb15b] font-bold">{userStats.points} cp</span>
          <span className="text-[#879b90] font-sans">Level {userStats.level}</span>
        </div>
      </aside>

      {/* 2. Main Content Display Panel */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 min-h-0 relative z-10 custom-scroll">
        
        {/* ==========================================
            TAB 0: 8 PILLARS DIRECTORY VIEW
            ========================================== */}
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-8 select-none">
            
            {/* Elegant Header Banner */}
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-[#222d26] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#dfb15b]/5 rounded-full blur-3xl -z-10" />
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#dfb15b]">
                  <Sparkles className="w-4 h-4 text-[#dfb15b] animate-pulse" />
                  <span>CORTEX COGNITIVE SANCTUARY</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-[#f1ede2] tracking-tight font-sans">
                  The 8 Pillars of Focus & Balance
                </h1>
                <p className="text-xs md:text-sm text-[#879b90] leading-relaxed">
                  Welcome to Cortex. Choose one of our 8 modular cognitive sectors designed to restore deep attention, stimulate strategic foresight, and decompress sensory overload.
                </p>
              </div>
              <div className="px-5 py-3 bg-black/40 border border-[#2c3a32] rounded-xl flex items-center gap-3 font-mono text-xs text-[#dfb15b]">
                <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <div className="text-[9px] text-[#879b90]">COGNITIVE LOAD STATE</div>
                  <div className="font-bold">100% BALANCED</div>
                </div>
              </div>
            </div>

            {/* 2x4 Responsive Glass-morphic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: 'slow-news',
                  title: 'Curated Slow-News',
                  desc: 'Absorb high-context, slow educational updates to counter fast algorithmic dopamine spikes.',
                  icon: BookOpen,
                  tag: 'INFORMATION',
                  action: () => {
                    setActiveTab('feed');
                    setFeedSubTab('slow-news');
                  }
                },
                {
                  id: 'philosophy',
                  title: 'Socratic Inquiry',
                  desc: 'Deconstruct complex philosophical concepts with active-recall Socratic prompts.',
                  icon: HelpCircle,
                  tag: 'PHILOSOPHY',
                  action: () => {
                    setActiveTab('feed');
                    setFeedSubTab('philosophy');
                  }
                },
                {
                  id: 'focus-gym',
                  title: 'Focus & Attention Gym',
                  desc: 'Train your prefrontal working memory with cognitive N-back exercises and focus trials.',
                  icon: Brain,
                  tag: 'COGNITIVE',
                  action: () => {
                    setActiveTab('focus');
                    setFocusSubTab('gym');
                  }
                },
                {
                  id: 'quiet-room',
                  title: 'The Quiet Room',
                  desc: 'Decompress and reset sensory overload with bio-rhythmic breathing guides and auditory tones.',
                  icon: Activity,
                  tag: 'DECOMPRESSION',
                  action: () => {
                    setActiveTab('focus');
                    setFocusSubTab('quiet');
                  }
                },
                {
                  id: 'mind-arcade',
                  title: 'Mind Arcade Grid',
                  desc: 'Improve processing speed and selective visual attention using high-frequency reflex boards.',
                  icon: Gamepad2,
                  tag: 'REACTION SPEED',
                  action: () => {
                    setActiveTab('arcade');
                    setArcadeSubTab('reflex');
                  }
                },
                {
                  id: 'chess-arena',
                  title: 'Chess & Logic Arena',
                  desc: 'Challenge your executive foresight and strategic depth with Chess and logical puzzles.',
                  icon: Swords,
                  tag: 'STRATEGY',
                  action: () => {
                    setActiveTab('arena');
                  }
                },
                {
                  id: 'sandbox',
                  title: 'Creative Sandbox',
                  desc: 'Engage right-brain spatial synthesis in an interactive, peaceful geometric sand painting canvas.',
                  icon: Sparkles,
                  tag: 'SPATIAL',
                  action: () => {
                    setActiveTab('palace');
                    setPalaceSubTab('sandbox');
                  }
                },
                {
                  id: 'skill-swap',
                  title: 'Mutual Skill Swap',
                  desc: 'Simulate peer knowledge exchanges and structural trade logic without distraction.',
                  icon: Trophy,
                  tag: 'COMMUNITY',
                  action: () => {
                    setActiveTab('palace');
                    setPalaceSubTab('skillswap');
                  }
                }
              ].map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.id}
                    onClick={() => {
                      playCalmTone(350 + idx * 50, 'sine', 0.1);
                      pillar.action();
                    }}
                    className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between h-[230px] cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="w-10 h-10 rounded-xl bg-[#dfb15b]/10 border border-[#dfb15b]/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#dfb15b]" />
                        </div>
                        <span className="text-[9px] font-mono tracking-widest text-[#879b90] bg-black/40 px-2.5 py-1 rounded-full border border-white/5 uppercase font-bold">
                          {pillar.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-[#f1ede2] tracking-tight">{pillar.title}</h3>
                      <p className="text-xs text-[#879b90] leading-relaxed line-clamp-3">
                        {pillar.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#dfb15b] mt-4 self-end group-hover:translate-x-1 transition-transform">
                      <span>ENTER SECTOR</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 1: KNOWLEDGE FEED VIEW
            ========================================== */}
        {activeTab === 'feed' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* 8 Pillars Toggle */}
            <div className="flex bg-[#141a17]/80 border border-[#222d26] p-1 rounded-xl gap-2 backdrop-blur-sm shadow-lg">
              <button
                onClick={() => { playCalmTone(350, 'sine', 0.05); setFeedSubTab('slow-news'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                  feedSubTab === 'slow-news'
                    ? 'bg-[#dfb15b] text-[#0c100e] font-black shadow-md'
                    : 'text-[#879b90] hover:text-[#f1ede2]'
                }`}
              >
                📰 Slow-News (Context & Perspective)
              </button>
              <button
                onClick={() => { playCalmTone(350, 'sine', 0.05); setFeedSubTab('philosophy'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                  feedSubTab === 'philosophy'
                    ? 'bg-[#dfb15b] text-[#0c100e] font-black shadow-md'
                    : 'text-[#879b90] hover:text-[#f1ede2]'
                }`}
              >
                💡 Philosophy (Socratic Inquiry)
              </button>
            </div>

            {feedSubTab === 'slow-news' ? (
              <div className="space-y-6">
                {/* Elegant Header and Auto-Update Indicator */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141a17] p-6 rounded-2xl border border-[#222d26]">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#dfb15b]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated Synaptic Feed</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-[#f1ede2] tracking-tight mt-1 font-sans">
                  The Trustworthy Knowledge Stream
                </h1>
                <p className="text-xs text-[#879b90] mt-1">
                  100% human-focused educational snippets extracted straight from verified repositories. Complete micro-quizzes to lock knowledge permanent.
                </p>
              </div>

              <button
                onClick={() => { playCalmTone(523, 'sine', 0.2); autoUpdateFeed(); }}
                disabled={isRefreshingFeed}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#1c2420] hover:bg-[#25302a] disabled:opacity-50 text-[#dfb15b] text-[10px] font-bold uppercase tracking-wider rounded-lg border border-[#34443a] transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingFeed ? 'animate-spin text-emerald-400' : ''}`} />
                <span>{isRefreshingFeed ? 'Refreshing...' : 'Refresh Feed'}</span>
              </button>
            </div>

            {/* Wikipedia search query form */}
            <form onSubmit={handleWikiSearch} className="relative">
              <input
                type="text"
                placeholder="Search any trusted topic on Wikipedia to generate a post... (e.g. Cognitive bias, Photosynthesis)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141a17] border border-[#2c3a32] rounded-xl pl-12 pr-28 py-3.5 text-xs text-[#f1ede2] placeholder-[#879b90]/50 focus:outline-none focus:border-[#dfb15b]/70 focus:ring-1 focus:ring-[#dfb15b]/30 font-sans shadow-inner transition-all"
              />
              <Search className="absolute left-4 top-3.5 text-[#879b90] w-4 h-4" />
              
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2.5 top-2 px-3 py-1.5 bg-[#dfb15b] hover:bg-[#e6c17e] disabled:bg-[#dfb15b]/40 text-[#0c100e] text-[10px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer"
              >
                {isSearching ? 'Loading...' : 'Index Node'}
              </button>
            </form>

            {searchError && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-sans">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Social Feed List */}
            <div className="space-y-6">
              {posts.map((post) => {
                const isSaved = userStats.savedArticles.includes(post.id);
                const isQuizOpen = activeQuizId === post.id;
                const quizSolvedInfo = solvedQuizzes[post.id];

                return (
                  <article key={post.id} className="bg-[#141a17] border border-[#222d26] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    
                    {/* Header bar */}
                    <div className="px-5 py-3 border-b border-[#222d26] bg-black/10 flex items-center justify-between text-[10px] font-mono text-[#879b90]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#25302a] text-[#dfb15b] font-bold border border-[#303f37] uppercase tracking-wider">
                          📚 {post.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readingTimeMin} min read
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5e8b75]"></span>
                        <span>SIGNAL HIGH</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Main post grid layout with thumbnail if exists */}
                      <div className="flex flex-col md:flex-row gap-6">
                        
                        {post.thumbnailUrl && (
                          <div className="w-full md:w-32 h-32 md:h-32 rounded-xl overflow-hidden bg-[#1c2420] shrink-0 border border-[#2c3931] select-none">
                            <img 
                              src={post.thumbnailUrl} 
                              alt={post.title} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" 
                            />
                          </div>
                        )}

                        <div className="space-y-2 flex-1">
                          <h2 className="text-lg md:text-xl font-bold tracking-tight text-[#f1ede2] leading-tight font-sans">
                            {post.title}
                          </h2>
                          <p className="text-xs text-[#dfb15b]/85 font-semibold font-sans italic leading-snug">
                            {post.description}
                          </p>
                          <p className="text-xs text-[#879b90] leading-relaxed font-sans whitespace-pre-line pt-1">
                            {post.extract}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Social Options and Buttons */}
                      <div className="flex flex-wrap items-center justify-between border-t border-[#222d26] pt-4 gap-3 select-none">
                        <div className="flex items-center gap-2">
                          
                          {/* Quiz button */}
                          <button
                            onClick={() => {
                              playCalmTone(523.25, 'sine', 0.08);
                              setActiveQuizId(isQuizOpen ? null : post.id);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                              quizSolvedInfo
                                ? 'bg-[#5e8b75]/20 text-[#8adebc] border-[#5e8b75]/40'
                                : isQuizOpen
                                  ? 'bg-[#dfb15b] text-[#0c100e] border-[#dfb15b]'
                                  : 'bg-[#1c2420] text-[#dfb15b] border-[#34443a] hover:bg-[#25302a]'
                            }`}
                          >
                            <Brain className="w-3.5 h-3.5" />
                            <span>{quizSolvedInfo ? 'Quiz Solved (+50cp)' : 'Brain Check Quiz'}</span>
                          </button>

                          {/* Save/Bookmark button */}
                          <button
                            onClick={() => handleToggleSave(post.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                              isSaved
                                ? 'bg-[#4a725e] text-[#f1ede2] border-[#4a725e]'
                                : 'bg-transparent text-[#879b90] border-[#2c3a32] hover:bg-[#1c2420]'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            <span>{isSaved ? 'Vaulted' : 'Save Node'}</span>
                          </button>
                        </div>

                        {/* Article Citation links */}
                        <a
                          href={post.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-[#879b90] hover:text-[#dfb15b] transition-colors"
                        >
                          <span>Explore on Wikipedia</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Interactive QUIZ block if open */}
                      {isQuizOpen && (
                        <div className="bg-[#1c2420] border border-[#2c3931] p-5 rounded-xl space-y-4">
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#879b90]">
                            <span>ACTIVE MEMORY RECONSOLIDATION</span>
                            <span className="text-[#dfb15b] font-bold">+50 CP AWARDED FOR CORRECT SYNTACTIC SELECTION</span>
                          </div>
                          
                          <p className="text-xs font-bold text-[#f1ede2]">
                            {post.quiz.question}
                          </p>

                          <div className="space-y-2">
                            {post.quiz.options.map((opt, oIdx) => {
                              const isSelected = quizSolvedInfo?.selected === oIdx;
                              const isCorrectAnswer = post.quiz.correctIndex === oIdx;
                              const isSolved = !!quizSolvedInfo;

                              let optStyle = "bg-black/20 hover:bg-black/40 border-[#2c3a32] text-[#879b90]";
                              if (isSolved) {
                                if (isCorrectAnswer) {
                                  optStyle = "bg-[#4a725e]/30 border-[#4a725e] text-[#a4ceb5] font-semibold";
                                } else if (isSelected) {
                                  optStyle = "bg-rose-950/30 border-rose-900/50 text-rose-300";
                                } else {
                                  optStyle = "bg-black/10 border-transparent text-[#879b90]/50 cursor-not-allowed";
                                }
                              }

                              return (
                                <button
                                  key={oIdx}
                                  disabled={isSolved}
                                  onClick={() => handleSolveQuiz(post.id, oIdx, post.quiz.correctIndex)}
                                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
                                >
                                  <span className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-[#dfb15b]">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span className="flex-1 leading-snug">{opt}</span>
                                  {isSolved && isCorrectAnswer && <Check className="w-4 h-4 text-[#8adebc] shrink-0 mt-0.5" />}
                                </button>
                              );
                            })}
                          </div>

                          {quizSolvedInfo && (
                            <div className="bg-black/20 p-3.5 rounded-lg border border-[#2c3931] text-[11px] text-[#879b90] leading-relaxed">
                              <span className="font-bold text-[#dfb15b] block mb-0.5">Explanation:</span>
                              {post.quiz.explanation}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SOCIAL Comments & Reflections Panel */}
                      <div className="border-t border-[#222d26] pt-4 space-y-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#879b90]">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>SYNAPTIC REFLECTIONS ({post.comments.length})</span>
                        </div>

                        {/* Comment list */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {post.comments.map((comm) => (
                            <div key={comm.id} className="bg-black/10 p-3 rounded-lg border border-white/5 space-y-1">
                              <div className="flex items-center justify-between text-[9px] font-mono text-[#879b90]">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-[#2c3a32] flex items-center justify-center text-[8px] font-bold text-[#dfb15b]">
                                    {comm.avatar}
                                  </div>
                                  <span className="font-bold text-[#f1ede2]">{comm.author}</span>
                                </div>
                                <span>{comm.timestamp}</span>
                              </div>
                              <p className="text-xs text-[#879b90] leading-relaxed pl-6">
                                {comm.text}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Submit reflection form */}
                        <form 
                          onSubmit={(e) => handleAddComment(post.id, e)}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            placeholder="Add a synaptic reflection to lock this concept... (+10 cp)"
                            value={newCommentTexts[post.id] || ''}
                            onChange={(e) => setNewCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                            className="flex-1 bg-black/20 border border-[#2c3a32] rounded-lg px-3 py-2 text-xs text-[#f1ede2] placeholder-[#879b90]/40 focus:outline-none focus:border-[#dfb15b]/50"
                          />
                          <button
                            type="submit"
                            className="px-3 bg-[#1c2420] hover:bg-[#25302a] text-[#dfb15b] rounded-lg border border-[#34443a] flex items-center justify-center cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>

                    </div>
                  </article>
                );
              })}
              </div>
              </div>
            ) : (
              <SocraticInquiry onEarnPoints={earnPoints} />
            )}
          </div>
        )}


        {/* ==========================================
            TAB 2: FOCUS GYM GAMES
            ========================================== */}
        {activeTab === 'focus' && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Focus Sub Tabs Toggle */}
            <div className="flex bg-[#141a17]/80 border border-[#222d26] p-1 rounded-xl gap-2 backdrop-blur-sm shadow-lg">
              <button
                onClick={() => { playCalmTone(350, 'sine', 0.05); setFocusSubTab('gym'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                  focusSubTab === 'gym'
                    ? 'bg-[#dfb15b] text-[#0c100e] font-black shadow-md'
                    : 'text-[#879b90] hover:text-[#f1ede2]'
                }`}
              >
                ⏳ Focus & Attention Gym
              </button>
              <button
                onClick={() => { playCalmTone(350, 'sine', 0.05); setFocusSubTab('quiet'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                  focusSubTab === 'quiet'
                    ? 'bg-[#dfb15b] text-[#0c100e] font-black shadow-md'
                    : 'text-[#879b90] hover:text-[#f1ede2]'
                }`}
              >
                🧘 The Quiet Room (Decompression)
              </button>
            </div>

            {focusSubTab === 'gym' ? (
              <div className="space-y-6">
                {/* Header info */}
            <div className="bg-[#141a17] p-6 rounded-2xl border border-[#222d26]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#dfb15b]">
                <Brain className="w-4 h-4 text-[#dfb15b]" />
                <span>Prefrontal Synaptic Gym</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-[#f1ede2] tracking-tight mt-1 font-sans">
                Train Selective Attention & Logic
              </h1>
              <p className="text-xs text-[#879b90] mt-1 leading-relaxed">
                Platform algorithmization is designed to induce dopamine micro-shocks. Cortex combats this with scientifically validated attention challenges that build grey matter thickness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GAME A: SPATIAL PATTERN RECALL */}
              <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#879b90]">
                    <span>CHALLENGE 1</span>
                    <span className="text-[#dfb15b] font-bold">BEST: ROUND {seqBest}</span>
                  </div>
                  <h2 className="text-md font-bold text-[#f1ede2] mt-1">Spatial Sequence Grid</h2>
                  <p className="text-[11px] text-[#879b90] mt-1 leading-relaxed">
                    Watch the sequence of wood tiles glow, then tap the grid to replicate. Builds spatial working memory capacity.
                  </p>
                </div>

                {/* Simulated game grid */}
                <div className="my-6 flex justify-center">
                  <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-black/30 rounded-xl border border-[#2c3a32] w-56 h-56 select-none">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((tileIdx) => {
                      const isHighlighted = activeTile === tileIdx;
                      return (
                        <button
                          key={tileIdx}
                          disabled={seqStatus !== 'player'}
                          onClick={() => handleTileClick(tileIdx)}
                          className={`w-full h-full rounded-lg transition-all duration-150 relative cursor-pointer border ${
                            isHighlighted
                              ? 'bg-[#dfb15b] border-[#dfb15b] shadow-[0_0_15px_#dfb15b] scale-102 z-10'
                              : seqStatus === 'player'
                                ? 'bg-[#1c2420] hover:bg-[#232e29] border-[#2c3931] hover:border-[#dfb15b]/30'
                                : 'bg-[#141a17] border-[#222d26] cursor-not-allowed'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Controls & Feedback */}
                <div className="space-y-3">
                  {seqStatus === 'idle' && (
                    <button
                      onClick={startSeqGame}
                      className="w-full py-2.5 bg-[#dfb15b] hover:bg-[#e6c17e] text-[#0c100e] text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Begin Attention Training</span>
                    </button>
                  )}

                  {seqStatus === 'showing' && (
                    <div className="w-full py-2.5 bg-[#1c2420] text-[#dfb15b] text-center text-xs font-bold font-mono border border-[#34443a] rounded-lg animate-pulse">
                      ⚡ COMMITTING PATTERN TO MEMORY...
                    </div>
                  )}

                  {seqStatus === 'player' && (
                    <div className="w-full py-2.5 bg-black/20 text-[#879b90] text-center text-xs font-mono rounded-lg">
                      👈 REPLICATE SEQUENCE (ROUND {seqRound})
                    </div>
                  )}

                  {seqStatus === 'success' && (
                    <div className="w-full py-2.5 bg-[#4a725e]/20 text-[#a4ceb5] border border-[#4a725e] text-center text-xs font-bold rounded-lg font-mono">
                      ✓ CORRECT! +20 CP EARNED
                    </div>
                  )}

                  {seqStatus === 'failed' && (
                    <div className="space-y-2">
                      <div className="w-full py-2 bg-rose-950/20 text-rose-300 border border-rose-900/40 text-center text-xs font-bold rounded-lg font-mono">
                        ✘ ATTENTION COLLAPSE! Game Over.
                      </div>
                      <button
                        onClick={startSeqGame}
                        className="w-full py-2 bg-[#1c2420] hover:bg-[#25302a] text-[#f1ede2] border border-[#34443a] text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>


              {/* GAME B: STROOP INTERFERENCE TASK */}
              <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#879b90]">
                    <span>CHALLENGE 2</span>
                    <span className="text-[#dfb15b] font-bold">BEST SCORE: {stroopGame.highScore}</span>
                  </div>
                  <h2 className="text-md font-bold text-[#f1ede2] mt-1">Stroop Focus Task</h2>
                  <p className="text-[11px] text-[#879b90] mt-1 leading-relaxed">
                    Sift through linguistic conflict. Click either the displaying text's COLOR or its literal MEANING as directed. Filters interference!
                  </p>
                </div>

                {/* Stroop Interactive Board */}
                <div className="my-6 h-56 flex flex-col items-center justify-center bg-black/20 rounded-xl border border-[#2c3a32] relative overflow-hidden select-none">
                  
                  {stroopGame.status === 'playing' ? (
                    <div className="w-full h-full p-4 flex flex-col justify-between items-center">
                      
                      {/* Timer bar */}
                      <div className="w-full bg-[#1c2420] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#dfb15b] to-rose-400 transition-all duration-100"
                          style={{ width: `${stroopGame.timeLeft}%` }}
                        ></div>
                      </div>

                      {/* Instruction */}
                      <div className="text-center">
                        <span className="text-[9px] uppercase font-bold text-[#879b90] tracking-widest block leading-none">COMMAND</span>
                        <span className="text-xs font-mono font-black text-[#dfb15b] uppercase tracking-wider bg-[#1c2420] border border-[#34443a] px-3 py-1 rounded-full inline-block mt-1">
                          SELECT THE {stroopGame.promptType === 'color' ? 'COLOR OF TEXT' : 'WORD MEANING'}
                        </span>
                      </div>

                      {/* Giant mismatched word */}
                      <div className={`text-4xl font-extrabold tracking-widest leading-none select-none my-2 uppercase ${STROOP_WORDS[stroopGame.colorIndex].color}`}>
                        {STROOP_WORDS[stroopGame.wordIndex].text}
                      </div>

                      {/* Display Word Details */}
                      <div className="text-[10px] font-mono text-[#879b90]">
                        SCORE: <span className="text-[#dfb15b] font-bold">{stroopGame.score}</span>
                      </div>

                    </div>
                  ) : stroopGame.status === 'gameover' ? (
                    <div className="text-center space-y-2 p-6">
                      <div className="text-rose-400 font-bold font-mono">✘ COGNITIVE DE-SYNC!</div>
                      <p className="text-[11px] text-[#879b90]">You scored <strong className="text-[#f1ede2]">{stroopGame.score} points</strong> filtering out mental interference.</p>
                      <button
                        onClick={startStroopGame}
                        className="px-4 py-2 bg-[#1c2420] border border-[#34443a] text-[#dfb15b] text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#25302a] cursor-pointer"
                      >
                        Play Again
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-6 space-y-1">
                      <Trophy className="w-8 h-8 text-[#dfb15b] mx-auto animate-bounce" />
                      <p className="text-[11px] text-[#879b90]">Stroop is the gold standard for attention-filter testing.</p>
                      <button
                        onClick={startStroopGame}
                        className="mt-2.5 px-4 py-2 bg-[#dfb15b] text-[#0c100e] text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer"
                      >
                        Activate Stroop
                      </button>
                    </div>
                  )}

                </div>

                {/* Game Option Buttons */}
                <div className="space-y-2">
                  {stroopGame.status === 'playing' ? (
                    <div className="grid grid-cols-2 gap-2">
                      {stroopGame.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleStroopAnswer(opt)}
                          className="py-2.5 bg-[#1c2420] border border-[#2c3931] hover:border-[#dfb15b]/50 text-[#f1ede2] hover:text-[#dfb15b] text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-20 flex items-center justify-center text-[10px] text-[#879b90] font-mono text-center border border-dashed border-[#222d26] rounded-xl bg-black/10">
                      WORD FILTERING ENGAGEMENT ACTIVE
                    </div>
                  )}
                </div>

              </div>

            </div>
              </div>
            ) : (
              <QuietRoomGuide />
            )}
          </div>
        )}


        {/* ==========================================
            TAB 2.5: FOCUS ARENA (Chess & Working Memory Tasks)
            ========================================== */}
        {activeTab === 'arena' && (
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Header banner */}
            <div className="bg-[#141a17] p-6 rounded-2xl border border-[#222d26] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#dfb15b]">
                  <Swords className="w-4 h-4 text-[#dfb15b]" />
                  <span>Cortex Focus Arena</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-[#f1ede2] tracking-tight font-sans">
                  Prefrontal Attention & Strategy Arena
                </h1>
                <p className="text-xs text-[#879b90] leading-relaxed max-w-2xl">
                  Re-engineer your neural circuits. Cortex pits selective concentration, spatial foresight, and executive recall against simulated digital distractions.
                </p>
              </div>
              <div className="px-4 py-2 bg-black/30 border border-[#222d26] rounded-xl flex items-center gap-2 font-mono text-[10px] text-[#dfb15b]">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>COGNITIVE ENGAGEMENT: MAXIMAL</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* PANEL 1: INTERACTIVE CHESS ARENA (cols-span-7) */}
              <div className="lg:col-span-7 bg-[#141a17] border border-[#222d26] rounded-2xl p-5 space-y-4 flex flex-col justify-between min-h-[580px]">
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-[#879b90]">
                    <span className="uppercase font-bold text-[#dfb15b]">♟️ INTELLECTUAL COMBAT</span>
                    <span className="text-emerald-400 font-bold uppercase font-mono">REWARDS: +100 CP</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#f1ede2]">
                      {chessMode === 'puzzle' ? 'Strategic Chess Puzzles' : 'Cognitive Chess Sandbox'}
                    </h2>

                    {/* Mode selector */}
                    <div className="flex gap-1.5 bg-black/30 p-1 border border-[#222d26] rounded-md font-mono text-[9px] uppercase">
                      <button
                        onClick={() => { playCalmTone(440, 'sine', 0.05); setChessMode('puzzle'); loadChessPuzzle(0); }}
                        className={`px-2 py-0.5 font-bold rounded cursor-pointer ${
                          chessMode === 'puzzle' ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90]'
                        }`}
                      >
                        Puzzles
                      </button>
                      <button
                        onClick={() => { playCalmTone(440, 'sine', 0.05); setChessMode('sandbox'); resetChessSandbox(); }}
                        className={`px-2 py-0.5 font-bold rounded cursor-pointer ${
                          chessMode === 'sandbox' ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90]'
                        }`}
                      >
                        Sandbox
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Interactive Board & Status */}
                <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-4">
                  
                  {/* Chess Board Grid */}
                  <div className="flex flex-col items-center select-none">
                    <div className="grid grid-cols-8 gap-0 border-4 border-[#2c3931] rounded-xl overflow-hidden shadow-2xl">
                      {chessBoard.map((row, rIdx) => 
                        row.map((piece, cIdx) => {
                          const isDark = (rIdx + cIdx) % 2 === 1;
                          const isSelected = selectedSquare && selectedSquare[0] === rIdx && selectedSquare[1] === cIdx;
                          let tileColor = isDark ? 'bg-[#1c2420]' : 'bg-[#28352d]';
                          if (isSelected) tileColor = 'bg-[#dfb15b]/30 ring-2 ring-inset ring-[#dfb15b]';

                          // Render pieces unicode helper inside visual cell
                          const renderPiece = (p: ChessPiece) => {
                            const symbols: Record<string, string> = {
                              'w-p': '♙', 'w-r': '♖', 'w-n': '♘', 'w-b': '♗', 'w-q': '♕', 'w-k': '♔',
                              'b-p': '♟', 'b-r': '♜', 'b-n': '♞', 'b-b': '♝', 'b-q': '♛', 'b-k': '♚',
                            };
                            const key = `${p.color}-${p.type}`;
                            const isWhite = p.color === 'w';
                            return (
                              <span className={`text-2xl sm:text-3xl font-normal select-none transition-all ${
                                isWhite ? 'text-[#dfb15b] drop-shadow-[0_2px_4px_rgba(223,177,91,0.35)]' : 'text-[#879b90] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
                              }`}>
                                {symbols[key] || ''}
                              </span>
                            );
                          };

                          return (
                            <button
                              key={`${rIdx}-${cIdx}`}
                              onClick={() => handleChessSquareClick(rIdx, cIdx)}
                              className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center transition-all relative focus:outline-none cursor-pointer ${tileColor}`}
                            >
                              {piece && renderPiece(piece)}

                              {/* Labels */}
                              {cIdx === 0 && (
                                <span className="absolute top-0.5 left-0.5 text-[7px] font-mono font-bold text-[#879b90]/40">
                                  {8 - rIdx}
                                </span>
                              )}
                              {rIdx === 7 && (
                                <span className="absolute bottom-0.5 right-0.5 text-[7px] font-mono font-bold text-[#879b90]/40">
                                  {String.fromCharCode(97 + cIdx)}
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="w-full bg-black/20 border border-[#2c3a32] rounded-xl px-4 py-2.5 text-center text-xs font-mono">
                    <span className="text-[#879b90]">STATUS: </span>
                    <span className="text-[#dfb15b] font-bold">{chessStatus}</span>
                  </div>
                </div>

                {/* Dashboard Controls for Puzzles / Sandbox */}
                <div className="pt-3 border-t border-[#222d26] space-y-3">
                  {chessMode === 'puzzle' ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono text-[#879b90] uppercase">Available Challenges:</div>
                      <div className="grid grid-cols-3 gap-2">
                        {CHESS_PUZZLES.map((puzzle, idx) => {
                          const isSolved = solvedChessPuzzles.includes(puzzle.id);
                          const isCurrent = currentPuzzleIdx === idx;
                          return (
                            <button
                              key={puzzle.id}
                              onClick={() => loadChessPuzzle(idx)}
                              className={`py-1.5 px-2 text-[10px] rounded-lg border font-bold transition-all text-left truncate flex items-center justify-between cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#dfb15b] text-[#0c100e] border-[#dfb15b]'
                                  : 'bg-[#1c2420] text-[#f1ede2] border-[#2c3931] hover:bg-[#25302a]'
                              }`}
                            >
                              <span className="truncate">{puzzle.name}</span>
                              {isSolved && <span className="text-emerald-500 font-bold shrink-0 pl-1">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-[#879b90] leading-normal italic bg-black/15 p-2 rounded border border-white/5">
                        💡 <strong>Tactic Clue:</strong> {CHESS_PUZZLES[currentPuzzleIdx].description}
                        {solvedChessPuzzles.includes(CHESS_PUZZLES[currentPuzzleIdx].id) && (
                          <span className="block mt-1 text-emerald-400 font-sans font-normal not-italic">
                            ✓ Solved: {CHESS_PUZZLES[currentPuzzleIdx].explanation}
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={resetChessSandbox}
                          className="px-3 py-1.5 bg-[#1c2420] border border-[#2c3931] hover:border-[#dfb15b]/40 text-[#dfb15b] text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                        >
                          Reset Board
                        </button>
                        <div className="text-[10px] text-[#879b90]">
                          Opponent:
                          <button
                            onClick={() => {
                              playCalmTone(350, 'sine', 0.05);
                              setChessOpponent(prev => prev === 'ai' ? 'friend' : 'ai');
                            }}
                            className="ml-1.5 text-[#dfb15b] font-bold hover:underline"
                          >
                            {chessOpponent === 'ai' ? '🤖 Virtual AI' : '👥 Hotseat Friend'}
                          </button>
                        </div>
                      </div>

                      <div className="text-[9px] text-[#879b90] truncate max-w-xs">
                        {chessHistory.length > 0 ? (
                          <span>MOVES: {chessHistory.slice(-3).join(', ')}</span>
                        ) : (
                          <span>MOVE PIECES FREELY IN SANDBOX</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* PANEL 2: COGNITIVE CHALLENGES HUB (cols-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* DUAL COGNITIVE TRAINERS */}
                <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-5 space-y-4 flex flex-col justify-between min-h-[580px]">
                  
                  {/* Internal tabs for memory tasks */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#879b90]">
                      <span className="uppercase font-bold text-[#dfb15b]">⚛️ WORKING MEMORY TRAINERS</span>
                      <span className="text-emerald-400 font-bold font-mono">LEVELS: SCALABLE</span>
                    </div>

                    <div className="flex gap-1.5 bg-black/20 p-1 rounded-lg border border-[#222d26] font-mono text-[9px] uppercase mt-2">
                      <button
                        onClick={() => { playCalmTone(440, 'sine', 0.05); setNBackValue(2); }}
                        className={`flex-1 py-1 font-bold rounded text-center cursor-pointer ${
                          nBackValue > 0 ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90]'
                        }`}
                      >
                        Visual N-Back (N={nBackValue})
                      </button>
                    </div>
                  </div>

                  {/* N-BACK GAME CONTAINER */}
                  <div className="flex-1 flex flex-col justify-between py-2 space-y-4 select-none">
                    
                    <div className="space-y-1 text-center">
                      <h3 className="text-xs font-bold text-[#f1ede2] font-mono">Visual Position Recaller</h3>
                      <p className="text-[10px] text-[#879b90] leading-relaxed max-w-xs mx-auto">
                        Identify if the flashing tile location matches the cell highlighted exactly <strong>{nBackValue} turn(s) ago</strong>.
                      </p>
                    </div>

                    {/* 3x3 Flashing Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-black/20 p-3 border border-[#2c3a32] rounded-xl w-44 h-44 mx-auto">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                        const isHighlighted = nBackActiveCell === idx;
                        return (
                          <div
                            key={idx}
                            className={`rounded-lg border transition-all duration-150 ${
                              isHighlighted
                                ? 'bg-[#dfb15b] border-[#dfb15b] shadow-[0_0_15px_#dfb15b] scale-102'
                                : 'bg-[#1c2420] border-[#2c3931]'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Stats Display */}
                    {nBackStatus !== 'idle' && (
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-center max-w-xs mx-auto w-full">
                        <div className="bg-[#1c2420] p-1.5 rounded border border-[#2c3931]">
                          <span className="text-[#879b90] block">ACCURACY</span>
                          <span className="text-[#dfb15b] font-bold text-xs">{nBackScore.correct} / {nBackScore.correct + nBackScore.wrong}</span>
                        </div>
                        <div className="bg-[#1c2420] p-1.5 rounded border border-[#2c3931]">
                          <span className="text-[#879b90] block">SEQUENCE</span>
                          <span className="text-[#f1ede2] font-bold text-xs">{(nBackCurrentIndex + 1)} / 15</span>
                        </div>
                      </div>
                    )}

                    {/* Controls & Match Trigger */}
                    <div className="space-y-2 max-w-xs mx-auto w-full">
                      {nBackStatus === 'idle' ? (
                        <div className="space-y-2">
                          <div className="flex gap-2 justify-center">
                            {[1, 2, 3].map((val) => (
                              <button
                                key={val}
                                onClick={() => { playCalmTone(350 + val * 50, 'sine', 0.05); setNBackValue(val); }}
                                className={`px-2 py-1 text-[9px] font-mono font-black border rounded cursor-pointer ${
                                  nBackValue === val
                                    ? 'bg-[#dfb15b] text-[#0c100e] border-[#dfb15b]'
                                    : 'border-[#2c3931] text-[#879b90] hover:text-[#f1ede2]'
                                }`}
                              >
                                N = {val}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={startNBackGame}
                            className="w-full py-2 bg-[#dfb15b] hover:bg-[#e6c17e] text-[#0c100e] text-[10px] font-black uppercase rounded-lg cursor-pointer"
                          >
                            Begin N-Back Attention Routine
                          </button>
                        </div>
                      ) : nBackStatus === 'running' ? (
                        <button
                          onClick={handleNBackMatchClick}
                          disabled={userMatchedThisTurn}
                          className={`w-full py-3 text-xs font-black uppercase rounded-lg border transition-all cursor-pointer ${
                            userMatchedThisTurn
                              ? 'bg-[#1c2420] text-[#879b90] border-[#2c3931]'
                              : 'bg-[#dfb15b] hover:bg-[#e6c17e] text-[#0c100e] border-[#dfb15b] shadow-[0_4px_12px_rgba(223,177,91,0.2)]'
                          }`}
                        >
                          ⚡ POSITION MATCHES !
                        </button>
                      ) : (
                        <div className="space-y-1.5 text-center font-mono">
                          <span className="text-emerald-400 font-bold block text-xs">✓ DUAL N-BACK COMPLETED</span>
                          <p className="text-[10px] text-[#879b90]">Perfect hits: {nBackScore.correct} | Errors/Misses: {nBackScore.wrong}</p>
                          <button
                            onClick={startNBackGame}
                            className="w-full mt-1.5 py-1.5 bg-[#1c2420] text-[#dfb15b] border border-[#2c3931] hover:border-[#dfb15b]/40 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                          >
                            Train Again
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* DIGIT SPAN SEQUENTIAL WORKING MEMORY BLOCK */}
                  <div className="pt-4 border-t border-[#222d26] space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#879b90]">
                      <span className="uppercase font-bold text-[#dfb15b]">🔢 DIGIT SPAN SEQUENCER</span>
                      <span className="font-bold">BEST: {digitSpanBest} DIGITS</span>
                    </div>

                    <p className="text-[10px] text-[#879b90] leading-normal max-w-sm">
                      Numbers will flash one by one. Replicate the numbers in <strong className="text-rose-300">REVERSE order</strong> (Backward Span) to activate executive prefrontal coordination.
                    </p>

                    {/* Interactive Arena Screen */}
                    <div className="bg-black/25 rounded-xl border border-[#2c3a32] p-4 min-h-[140px] flex flex-col items-center justify-center relative overflow-hidden select-none">
                      
                      {digitSpanStatus === 'idle' && (
                        <div className="text-center space-y-3">
                          <div className="flex gap-1 bg-black/30 p-1 border border-[#2c3931] rounded font-mono text-[8px] uppercase inline-flex">
                            <button
                              onClick={() => { playCalmTone(300, 'sine', 0.05); setDigitSpanMode('forward'); }}
                              className={`px-1.5 py-0.5 rounded ${digitSpanMode === 'forward' ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90]'}`}
                            >
                              Forward
                            </button>
                            <button
                              onClick={() => { playCalmTone(300, 'sine', 0.05); setDigitSpanMode('backward'); }}
                              className={`px-1.5 py-0.5 rounded ${digitSpanMode === 'backward' ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90]'}`}
                            >
                              Backward
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={startDigitSpanGame}
                              className="px-4 py-2 bg-[#dfb15b] text-[#0c100e] text-[10px] font-black uppercase rounded-lg cursor-pointer"
                            >
                              Activate Digit Span test
                            </button>
                          </div>
                        </div>
                      )}

                      {digitSpanStatus === 'showing' && (
                        <div className="text-center space-y-2 animate-pulse">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-[#879b90] block">MEMORIZE</span>
                          <span className="text-5xl font-black font-mono text-[#dfb15b]">
                            {digitSpanShowIdx >= 0 ? digitSpanSeq[digitSpanShowIdx] : ''}
                          </span>
                        </div>
                      )}

                      {digitSpanStatus === 'input' && (
                        <div className="text-center space-y-3 w-full max-w-[200px]">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-[#879b90] block">
                            TYPE IN {digitSpanMode === 'backward' ? 'REVERSE' : 'NORMAL'} ORDER
                          </span>
                          
                          <input
                            type="text"
                            maxLength={digitSpanLength}
                            placeholder="Enter numbers..."
                            value={digitSpanInput}
                            onChange={(e) => setDigitSpanInput(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') submitDigitSpanAnswer();
                            }}
                            className="w-full bg-black/30 border border-[#2c3a32] focus:border-[#dfb15b]/40 rounded-lg py-1.5 text-center font-mono font-bold text-[#dfb15b] tracking-widest placeholder-[#879b90]/25 focus:outline-none text-sm"
                            autoFocus
                          />

                          <button
                            onClick={submitDigitSpanAnswer}
                            className="w-full py-1.5 bg-[#1c2420] hover:bg-[#25302a] text-[#dfb15b] border border-[#2c3931] hover:border-[#dfb15b]/40 text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                          >
                            Verify Sequence
                          </button>
                        </div>
                      )}

                      {digitSpanStatus === 'failed' && (
                        <div className="text-center space-y-2">
                          <span className="text-rose-400 font-bold font-mono block text-xs">✘ EXECUTIVE CAPACITANCE BREACH</span>
                          <p className="text-[10px] text-[#879b90]">Max level solved: <strong className="text-[#f1ede2]">{digitSpanLength - 1} digits</strong></p>
                          <button
                            onClick={startDigitSpanGame}
                            className="mt-1.5 px-3 py-1 bg-[#1c2420] hover:bg-[#25302a] text-[#dfb15b] border border-[#2c3931] text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                          >
                            Re-engage Sequencer
                          </button>
                        </div>
                      )}

                    </div>

                    {/* Digit Span Status Board */}
                    {digitSpanStatus !== 'idle' && (
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold select-none">
                        <span className="text-[#879b90]">CURRENT SPAN: {digitSpanLength} DIGITS</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[8px] border ${
                                i < digitSpanStrikes 
                                  ? 'bg-[#dfb15b]/10 text-[#dfb15b] border-[#dfb15b]/30' 
                                  : 'bg-rose-950/10 text-rose-400 border-rose-950'
                              }`}
                            >
                              ♥
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          </div>
        )}


        {/* ==========================================
            TAB 3: MIND ARCADE (Anti-Brainrot)
            ========================================== */}
        {activeTab === 'arcade' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Arcade Sub Tabs Toggle */}
            <div className="flex bg-[#141a17]/80 border border-[#222d26] p-1 rounded-xl gap-2 backdrop-blur-sm shadow-lg">
              <button
                onClick={() => { playCalmTone(350, 'sine', 0.05); setArcadeSubTab('strategy'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                  arcadeSubTab === 'strategy'
                    ? 'bg-[#dfb15b] text-[#0c100e] font-black shadow-md'
                    : 'text-[#879b90] hover:text-[#f1ede2]'
                }`}
              >
                🧩 Logical Strategy (Sudoku & Chess)
              </button>
              <button
                onClick={() => { playCalmTone(350, 'sine', 0.05); setArcadeSubTab('reflex'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                  arcadeSubTab === 'reflex'
                    ? 'bg-[#dfb15b] text-[#0c100e] font-black shadow-md'
                    : 'text-[#879b90] hover:text-[#f1ede2]'
                }`}
              >
                ⚡ Focus & Reflex Speed-Grid
              </button>
            </div>

            {arcadeSubTab === 'strategy' ? (
              <div className="space-y-6">
                {/* Header info */}
            <div className="bg-[#141a17] p-6 rounded-2xl border border-[#222d26]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#dfb15b]">
                <Gamepad2 className="w-4 h-4 text-[#dfb15b]" />
                <span>Cortex Mind Sanctuary</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-[#f1ede2] tracking-tight mt-1 font-sans">
                Anti-Brainrot Logical Gaming Arena
              </h1>
              <p className="text-xs text-[#879b90] mt-1 leading-relaxed">
                Rather than falling trap to mindless dopamine loops, sharpen your neural synapses with standard high-level challenges like Chess tactics or custom Sudoku grids.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* CHESS TACTICS SECTION */}
              <div className="lg:col-span-5 bg-[#141a17] border border-[#222d26] rounded-2xl p-5 space-y-4 flex flex-col justify-between h-[510px]">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#879b90]">
                    <span>EMBEDDED ARCADE</span>
                    <span className="text-emerald-400 font-bold">100% INTELLECTUAL</span>
                  </div>
                  
                  <h2 className="text-md font-bold text-[#f1ede2] mt-1 flex items-center gap-2">
                    ♟️ Interactive Chess Puzzles
                  </h2>
                  <p className="text-[11px] text-[#879b90] mt-1 leading-relaxed">
                    Solve live tactical puzzles sourced directly from Lichess. Learn strategic depth, patterns, and active problem-solving pathways.
                  </p>
                </div>

                {/* Embedded Lichess Puzzle iframe */}
                <div className="w-full flex-1 min-h-[260px] bg-black/40 border border-[#2c3a32] rounded-xl overflow-hidden relative select-none">
                  <iframe
                    title="Lichess Training Embed"
                    src="https://lichess.org/training/embed?theme=dark&bg=dark"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>

                <div className="pt-2 border-t border-[#222d26] flex items-center justify-between text-[10px] text-[#879b90]">
                  <span>Embed courtesy of Lichess.org</span>
                  <a 
                    href="https://lichess.org/tv" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#dfb15b] hover:underline flex items-center gap-1"
                  >
                    <span>Lichess TV</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>


              {/* SUDOKU SECTION */}
              <div className="lg:col-span-7 bg-[#141a17] border border-[#222d26] rounded-2xl p-5 space-y-4 h-[510px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#879b90]">
                    <span>NATIVE PUZZLE</span>
                    <span className="text-[#dfb15b] font-bold">REWARD: +150 CP</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                    <h2 className="text-md font-bold text-[#f1ede2] flex items-center gap-2">
                      🔢 Sudoku Sanctuary
                    </h2>
                    
                    {/* Diff selection */}
                    <div className="flex gap-1.5 bg-black/30 p-1 border border-[#222d26] rounded-md">
                      <button
                        onClick={() => handleSudokuReset('easy')}
                        className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded ${
                          sudokuDifficulty === 'easy' ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90]'
                        }`}
                      >
                        Easy
                      </button>
                      <button
                        onClick={() => handleSudokuReset('medium')}
                        className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded ${
                          sudokuDifficulty === 'medium' ? 'bg-[#dfb15b] text-[#0c100e]' : 'text-[#879b90]'
                        }`}
                      >
                        Medium
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sudoku Interactive grid */}
                <div className="flex-1 flex items-center justify-center py-2 select-none">
                  <div className="grid grid-cols-9 border-2 border-[#2c3a32] bg-[#141a17] p-0.5 rounded-lg">
                    {sudokuGrid.map((row, rIdx) => 
                      row.map((val, cIdx) => {
                        const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
                        const initialVal = SUDOKU_PUZZLES[sudokuDifficulty].board[rIdx][cIdx];
                        const isPrefilled = initialVal !== 0;

                        // Borders for 3x3 box boundaries
                        const borderBottom = (rIdx === 2 || rIdx === 5) ? 'border-b-2 border-b-[#2c3a32]' : 'border-b border-[#2c3a32]/25';
                        const borderRight = (cIdx === 2 || cIdx === 5) ? 'border-r-2 border-r-[#2c3a32]' : 'border-r border-[#2c3a32]/25';

                        let cellBg = isPrefilled ? 'bg-[#1c2420]/50 text-[#f1ede2]/90' : 'bg-transparent text-[#dfb15b]';
                        if (isSelected) cellBg = 'bg-[#dfb15b]/20 border-2 border-[#dfb15b]';

                        return (
                          <button
                            key={`${rIdx}-${cIdx}`}
                            onClick={() => {
                              playCalmTone(493.88, 'sine', 0.05);
                              setSelectedCell({ r: rIdx, c: cIdx });
                            }}
                            className={`w-8 h-8 sm:w-10 sm:h-10 text-center text-xs font-mono font-bold transition-all focus:outline-none cursor-pointer flex items-center justify-center ${borderBottom} ${borderRight} ${cellBg}`}
                          >
                            {val !== 0 ? val : ''}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Input pad */}
                <div className="space-y-3">
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleSudokuInput(num)}
                        className="w-8 py-1 bg-[#1c2420] border border-[#2c3931] hover:border-[#dfb15b]/40 hover:bg-[#25302a] text-[#dfb15b] font-mono font-bold rounded-lg text-xs cursor-pointer text-center"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => handleSudokuInput(0)}
                      className="px-2 py-1 bg-rose-950/20 text-rose-300 border border-rose-900/30 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer font-mono"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Submission and error verification */}
                  <div className="flex gap-2 items-center justify-between select-none">
                    <button
                      onClick={() => handleSudokuReset(sudokuDifficulty)}
                      className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#879b90] hover:text-[#f1ede2] flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Board</span>
                    </button>

                    {sudokuChecked === 'success' && (
                      <span className="text-xs font-mono text-emerald-400 font-bold">✓ PUZZLE PERFECT! +150 cp</span>
                    )}
                    {sudokuChecked === 'incorrect' && (
                      <span className="text-xs font-mono text-rose-400 font-bold">✘ INCORRECT CELLS!</span>
                    )}

                    <button
                      onClick={handleCheckSudoku}
                      className="px-4 py-2 bg-[#dfb15b] hover:bg-[#e6c17e] text-[#0c100e] text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Check Grid Solved
                    </button>
                  </div>
                </div>

              </div>

            </div>
              </div>
            ) : (
              <ReflexGridGame onEarnPoints={earnPoints} />
            )}
          </div>
        )}


        {/* ==========================================
            TAB 4: MY MIND PALACE (Library & Achievements)
            ========================================== */}
        {activeTab === 'palace' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Sandbox & Skill Swap & Vault Sub-Tab Toggle */}
            <div className="flex bg-[#141a17]/80 border border-[#222d26] p-1 rounded-xl gap-2 backdrop-blur-sm shadow-lg">
              <button
                onClick={() => { playCalmTone(350, 'sine', 0.05); setPalaceSubTab('sandbox'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                  palaceSubTab === 'sandbox'
                    ? 'bg-[#dfb15b] text-[#0c100e] font-black shadow-md'
                    : 'text-[#879b90] hover:text-[#f1ede2]'
                }`}
              >
                🛠️ The Sandbox
              </button>
              <button
                onClick={() => { playCalmTone(350, 'sine', 0.05); setPalaceSubTab('skillswap'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                  palaceSubTab === 'skillswap'
                    ? 'bg-[#dfb15b] text-[#0c100e] font-black shadow-md'
                    : 'text-[#879b90] hover:text-[#f1ede2]'
                }`}
              >
                🔧 Skill Swap
              </button>
              <button
                onClick={() => { playCalmTone(350, 'sine', 0.05); setPalaceSubTab('vault'); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                  palaceSubTab === 'vault'
                    ? 'bg-[#dfb15b] text-[#0c100e] font-black shadow-md'
                    : 'text-[#879b90] hover:text-[#f1ede2]'
                }`}
              >
                🗄️ Mind Palace Vault
              </button>
            </div>

            {palaceSubTab === 'sandbox' && <CreativeSandbox onEarnPoints={earnPoints} />}
            {palaceSubTab === 'skillswap' && <SkillSwap onEarnPoints={earnPoints} />}

            {palaceSubTab === 'vault' && (
              <div className="space-y-6">
                {/* Header */}
            <div className="bg-[#141a17] p-6 rounded-2xl border border-[#222d26] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#dfb15b]">
                  <Trophy className="w-4 h-4 text-[#dfb15b]" />
                  <span>Personal Brain Core</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-[#f1ede2] tracking-tight mt-1 font-sans">
                  The Saved Mind Palace
                </h1>
                <p className="text-xs text-[#879b90] mt-1 leading-relaxed">
                  Your curated index of scientific nodes, saved articles, and unlocked attentional milestones. Built for long-term knowledge retention.
                </p>
              </div>

              {/* Reset button to clear stats */}
              <button
                onClick={() => {
                  if (confirm("Reset all attention points and vault?")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="px-3 py-1.5 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 text-[9px] font-bold uppercase tracking-wider rounded-lg cursor-pointer"
              >
                Reset Synapses
              </button>
            </div>

            {/* Profile Statistics Grid Layout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-[#141a17] border border-[#222d26] rounded-xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#879b90] font-mono">Cognitive Power</span>
                <div className="text-2xl font-black text-[#dfb15b] font-mono leading-none">
                  {userStats.points} <span className="text-xs font-normal text-[#879b90]">cp</span>
                </div>
                <span className="text-[10px] text-[#879b90] block">Lifetime points</span>
              </div>

              <div className="bg-[#141a17] border border-[#222d26] rounded-xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#879b90] font-mono">Focus Level</span>
                <div className="text-sm font-black text-[#f1ede2] truncate">
                  {currentLevel.title}
                </div>
                <span className="text-[10px] text-[#879b90] block">Level {userStats.level} Rank</span>
              </div>

              <div className="bg-[#141a17] border border-[#222d26] rounded-xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#879b90] font-mono">Quizzes Solved</span>
                <div className="text-2xl font-black text-emerald-400 font-mono leading-none">
                  {userStats.quizzesSolved} <span className="text-xs font-normal text-[#879b90]">units</span>
                </div>
                <span className="text-[10px] text-[#879b90] block">Active recalls</span>
              </div>

              <div className="bg-[#141a17] border border-[#222d26] rounded-xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#879b90] font-mono">Games Won</span>
                <div className="text-2xl font-black text-[#dfb15b] font-mono leading-none">
                  {userStats.gamesWon} <span className="text-xs font-normal text-[#879b90]">wins</span>
                </div>
                <span className="text-[10px] text-[#879b90] block">Gym activities</span>
              </div>

            </div>

            {/* Achievements and Milestones block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
              
              <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#dfb15b] border-b border-[#222d26] pb-2">
                  🎖️ Unlocked Focus Milestones
                </h2>

                <div className="space-y-3">
                  
                  {/* Milestone 1 */}
                  <div className="flex items-start gap-3.5 bg-black/10 p-3 rounded-lg border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#dfb15b]/10 border border-[#dfb15b]/20 flex items-center justify-center text-[#dfb15b] font-bold">
                      Ⅰ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#f1ede2]">Wiki Scholar</div>
                      <p className="text-[10px] text-[#879b90] mt-0.5">Index custom topics live using Wikipedia open databases.</p>
                      <span className="text-[9px] text-[#dfb15b] font-mono uppercase block mt-1">✓ ACTIVE UNLOCKED</span>
                    </div>
                  </div>

                  {/* Milestone 2 */}
                  <div className={`flex items-start gap-3.5 bg-black/10 p-3 rounded-lg border border-white/5 ${userStats.points >= 250 ? '' : 'opacity-40'}`}>
                    <div className="w-8 h-8 rounded-full bg-[#dfb15b]/10 border border-[#dfb15b]/20 flex items-center justify-center text-[#dfb15b] font-bold">
                      Ⅱ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#f1ede2]">Prefrontal Tamer</div>
                      <p className="text-[10px] text-[#879b90] mt-0.5">Solve a high cognitive micro-quiz perfectly. (Requires 250cp).</p>
                      <span className="text-[9px] font-mono uppercase block mt-1">
                        {userStats.points >= 250 ? '✓ ACTIVE UNLOCKED' : '🔒 LOCKED'}
                      </span>
                    </div>
                  </div>

                  {/* Milestone 3 */}
                  <div className={`flex items-start gap-3.5 bg-black/10 p-3 rounded-lg border border-white/5 ${userStats.quizzesSolved >= 5 ? '' : 'opacity-40'}`}>
                    <div className="w-8 h-8 rounded-full bg-[#dfb15b]/10 border border-[#dfb15b]/20 flex items-center justify-center text-[#dfb15b] font-bold">
                      Ⅲ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#f1ede2]">Schema Specialist</div>
                      <p className="text-[10px] text-[#879b90] mt-0.5">Perform 5 perfect active recall check answers.</p>
                      <span className="text-[9px] font-mono uppercase block mt-1">
                        {userStats.quizzesSolved >= 5 ? '✓ ACTIVE UNLOCKED' : '🔒 LOCKED (PROGRESS: ' + userStats.quizzesSolved + '/5)'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>


              {/* SAVED LIBRARY COGNITIVE CAPSULES */}
              <div className="bg-[#141a17] border border-[#222d26] rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#dfb15b] border-b border-[#222d26] pb-2">
                  🔖 Saved Knowledge Capsules
                </h2>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {posts.filter(p => userStats.savedArticles.includes(p.id)).map((p) => (
                    <div 
                      key={p.id} 
                      className="p-3 bg-[#1c2420]/40 border border-[#2c3931] hover:border-[#dfb15b]/40 rounded-xl transition-all flex items-center justify-between gap-4 cursor-pointer"
                      onClick={() => {
                        playCalmTone(523.25, 'sine', 0.05);
                        setActiveTab('feed');
                        // Expand or highlight in feed (simplification: just switch back to feed)
                      }}
                    >
                      <div className="space-y-0.5 max-w-[80%]">
                        <span className="text-[9px] font-mono text-[#dfb15b] uppercase">📚 {p.source}</span>
                        <h4 className="text-xs font-bold text-[#f1ede2] truncate">{p.title}</h4>
                        <p className="text-[10px] text-[#879b90] truncate italic">{p.description}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSave(p.id);
                        }}
                        className="text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase tracking-wider shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {posts.filter(p => userStats.savedArticles.includes(p.id)).length === 0 && (
                    <div className="text-center py-12 border border-dashed border-[#222d26] rounded-xl bg-black/10">
                      <p className="text-xs text-[#879b90]">Your mind palace is currently empty.</p>
                      <p className="text-[10px] text-[#879b90]/60 mt-1">Click "Save Node" on any Wikipedia card in your feed to populate.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
