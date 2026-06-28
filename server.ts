import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK helper to ensure startup doesn't crash if the key is missing.
let aiClient: GoogleGenAI | null = null;
const getGeminiClient = (): GoogleGenAI | null => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
};

// Expanded list of high-quality, trending cognitive-science, neuroscience, and metacognition topics
const TRENDING_COG_SCI_TOPICS = [
  "Metacognition",
  "Neuroplasticity",
  "Cognitive load",
  "Default mode network",
  "Salience network",
  "Cognitive bias",
  "Working memory",
  "Attention span",
  "Heuristic",
  "Neural oscillation",
  "Prefrontal cortex",
  "Synaptic plasticity",
  "Dual-process theory",
  "Dunning–Kruger effect",
  "Epistemic humility",
  "Flow (psychology)",
  "Executive functions",
  "Growth mindset",
  "Memory consolidation",
  "Neurotransmitter",
  "Cognitive dissonance",
  "Neurogenesis",
  "Mirror neuron",
  "Chunking (psychology)"
];

// Pre-computed, high-quality, professional fallback enhancements for each cognitive science topic.
// This ensures that even if the Gemini API key is missing or restricted, the application delivers
// high-signal academic quizzes, calibrated cognitive load, and expert comments.
const PRE_COMPUTED_ENHANCEMENTS: Record<string, {
  cognitiveLoad: number;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  comments: {
    author: string;
    avatar: string;
    text: string;
    likes: number;
    timestamp: string;
  }[];
}> = {
  "metacognition": {
    cognitiveLoad: 8,
    quiz: {
      question: "What is the primary defining characteristic of Metacognition?",
      options: [
        "The automatic processing of auditory signals in the brain stem.",
        "The active ability to monitor, evaluate, and regulate one's own thinking processes.",
        "A biological technique for accelerating visual scanning."
      ],
      correctIndex: 1,
      explanation: "Metacognition is commonly conceptualized as 'thinking about thinking,' encompassing self-monitoring and executive control over one's cognitive strategies."
    },
    comments: [
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Metacognitive monitoring is the difference between rote memorization and deep, conceptual learning. Vital for deliberate practice.",
        likes: 34,
        timestamp: "2 hrs ago"
      },
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "Fascinating. Increasing metacognitive awareness is the ultimate antidote to cognitive overconfidence.",
        likes: 21,
        timestamp: "1 hr ago"
      }
    ]
  },
  "neuroplasticity": {
    cognitiveLoad: 7,
    quiz: {
      question: "Which mechanism best describes the core principle of Neuroplasticity?",
      options: [
        "The permanent crystallization of all brain structures by early childhood.",
        "The brain's ability to reorganize itself by forming new neural connections and modifying synaptic strength throughout life.",
        "The structural replacement of cranial bone tissues with dynamic neuro-fibers."
      ],
      correctIndex: 1,
      explanation: "Neuroplasticity allows the central nervous system to adapt to new experiences, learning, or environmental changes through synaptic remodeling."
    },
    comments: [
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "The phrase 'neurons that fire together, wire together' is more than a slogan; it is the biological baseline of neural adaptation.",
        likes: 42,
        timestamp: "3 hrs ago"
      },
      {
        author: "Prof. Sarah Jenkins",
        avatar: "SJ",
        text: "This completely refutes the mid-20th-century dogma that the adult brain is entirely rigid. Incredible implications.",
        likes: 19,
        timestamp: "30 mins ago"
      }
    ]
  },
  "cognitive load": {
    cognitiveLoad: 6,
    quiz: {
      question: "According to Cognitive Load Theory, what represents the inherent difficulty of the informational material itself?",
      options: [
        "Intrinsic cognitive load.",
        "Extraneous cognitive load.",
        "Germane cognitive load."
      ],
      correctIndex: 0,
      explanation: "Intrinsic load is the effort associated with a specific topic, determined by its natural complexity and the learner's prior knowledge."
    },
    comments: [
      {
        author: "Prof. Alan Sweller",
        avatar: "AS",
        text: "Designing interfaces that minimize extraneous load is essential if we want learners to dedicate mental reserves to intrinsic material.",
        likes: 28,
        timestamp: "4 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "This explains why minimalist dashboards improve retention. Unnecessary decoration directly eats into available working memory.",
        likes: 15,
        timestamp: "2 hrs ago"
      }
    ]
  },
  "default mode network": {
    cognitiveLoad: 7,
    quiz: {
      question: "In which mental state is the Default Mode Network (DMN) typically most active?",
      options: [
        "Engaged in highly focused, goal-directed mathematical calculations.",
        "During passive, wakeful rest, daydreaming, self-reflection, and mind-wandering.",
        "During total deep dreamless chemical anesthesia."
      ],
      correctIndex: 1,
      explanation: "The DMN is a set of interacting brain areas that consistently activate when an individual is not focused on external task execution."
    },
    comments: [
      {
        author: "Dr. Marcus Raichle",
        avatar: "MR",
        text: "The discovery of the brain's dark energy—the DMN—shows that mental rest is actually a period of intensive self-referential synthesis.",
        likes: 47,
        timestamp: "5 hrs ago"
      },
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "This is why creative breakthroughs happen when we step away from the desk. The DMN connects disparate concepts in the background.",
        likes: 33,
        timestamp: "3 hrs ago"
      }
    ]
  },
  "salience network": {
    cognitiveLoad: 8,
    quiz: {
      question: "What is the primary role of the Salience Network in human cognition?",
      options: [
        "To filter sensory inputs and dynamically direct attention to the most relevant internal and external signals.",
        "To synthesize and distribute insulin throughout the endocrine system.",
        "To trigger involuntary reflex actions in skeletal muscle groups."
      ],
      correctIndex: 0,
      explanation: "The Salience Network detects and filters salient (highly relevant) stimuli, serving as a master switch to coordinate other major networks."
    },
    comments: [
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "The Salience Network acts like the brain's air traffic controller, routing signals between internal reflections and external demands.",
        likes: 31,
        timestamp: "2 hrs ago"
      },
      {
        author: "Prof. Vinod Menon",
        avatar: "VM",
        text: "Dysfunction in this network is heavily implicated in cognitive and attentional difficulties. Fascinating neural hub.",
        likes: 25,
        timestamp: "1 hr ago"
      }
    ]
  },
  "cognitive bias": {
    cognitiveLoad: 5,
    quiz: {
      question: "What defines a Cognitive Bias?",
      options: [
        "A localized physical abrasion on the neural cortex.",
        "A systematic, subjective pattern of deviation from norm or objective rationality in judgment.",
        "An intentional decision to omit research data from peer review."
      ],
      correctIndex: 1,
      explanation: "Cognitive biases are systematic patterns of subjective deviation from objective rational standards, often driven by evolutionary shortcuts."
    },
    comments: [
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Biases are not 'brain bugs'; they are highly optimized heuristics that saved our ancestors' lives, though they occasionally mislead us today.",
        likes: 50,
        timestamp: "6 hrs ago"
      },
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "Awareness of cognitive biases is the first step toward building rigorous mental models.",
        likes: 38,
        timestamp: "4 hrs ago"
      }
    ]
  },
  "working memory": {
    cognitiveLoad: 6,
    quiz: {
      question: "What is the typical visual or spatial storage capacity limit of working memory for an average adult?",
      options: [
        "Between 50 and 100 distinct items simultaneously.",
        "Around 4 to 7 items or information chunks.",
        "Virtually unlimited capacity, restricted only by the duration of sleep."
      ],
      correctIndex: 1,
      explanation: "Working memory has a highly restricted buffer of about 4 to 7 items, making cognitive load management essential for learning."
    },
    comments: [
      {
        author: "Dr. Nelson Cowan",
        avatar: "NC",
        text: "Our working memory is the narrow bottleneck of the human mind. Respecting this bottleneck is crucial in visual and instructional design.",
        likes: 29,
        timestamp: "3 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "This is precisely why we must 'chunk' complex concepts. It allows us to fit far more aggregate intelligence through the same small pipe.",
        likes: 18,
        timestamp: "2 hrs ago"
      }
    ]
  },
  "attention span": {
    cognitiveLoad: 5,
    quiz: {
      question: "How does Selective Attention affect the conscious processing of dense information?",
      options: [
        "It forces the conscious brain to process all sensory signals at exactly equal volume.",
        "It empowers the mind to prioritize a single relevant stream of information while filtering out surrounding distractions.",
        "It temporarily halts cellular respiration in the cerebral cortex."
      ],
      correctIndex: 1,
      explanation: "Selective attention is the cognitive filtering system that enables concentrated focus on a target amidst multi-sensory interference."
    },
    comments: [
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "In an era of hyper-stimulating notifications, selective attention is the ultimate executive resource. It must be actively trained.",
        likes: 41,
        timestamp: "4 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Attention isn't just about what you look at; it's heavily about what you actively choose to ignore.",
        likes: 23,
        timestamp: "2 hrs ago"
      }
    ]
  },
  "heuristic": {
    cognitiveLoad: 6,
    quiz: {
      question: "What is a Heuristic in cognitive psychology?",
      options: [
        "A rigorous, absolute mathematical equation for calculating logical certainties.",
        "A practical mental shortcut or 'rule of thumb' designed to yield quick, satisfactory decisions.",
        "A rhythmic muscle contraction that occurs during high anxiety states."
      ],
      correctIndex: 1,
      explanation: "Heuristics are evolutionary shortcuts used by the brain to resolve complex scenarios quickly when optimal computation is too costly."
    },
    comments: [
      {
        author: "Prof. Herbert Simon",
        avatar: "HS",
        text: "Bounded rationality dictates that humans use heuristics because we lack the infinite computing power to always optimize.",
        likes: 31,
        timestamp: "5 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Excellent summary. Heuristics are incredibly useful for rapid survival decisions, but they can misfire in statistical domains.",
        likes: 19,
        timestamp: "3 hrs ago"
      }
    ]
  },
  "neural oscillation": {
    cognitiveLoad: 8,
    quiz: {
      question: "What are Neural Oscillations in the nervous system?",
      options: [
        "Repetitive, rhythmic patterns of electrical activity generated by synchronized groups of central neurons.",
        "Physical vibrations of the cranium during heavy exercise.",
        "The spatial sliding movement of neurotransmitters as they cross synaptic gaps."
      ],
      correctIndex: 0,
      explanation: "Neural oscillations (brainwaves) are synchronized, rhythmic voltage fluctuations across neural ensembles, essential for temporal coordination of information."
    },
    comments: [
      {
        author: "Prof. György Buzsáki",
        avatar: "GB",
        text: "Oscillations organize neural activity across space and time. They are the scaffolding of cognitive synchronization.",
        likes: 54,
        timestamp: "6 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Fascinating. The correlation of gamma-band oscillation with intense concentration highlights its role in binding sensory information.",
        likes: 37,
        timestamp: "4 hrs ago"
      }
    ]
  },
  "prefrontal cortex": {
    cognitiveLoad: 7,
    quiz: {
      question: "Which of the following domains is primarily coordinated by the Prefrontal Cortex?",
      options: [
        "Simple visual light transduction and raw retinal mapping.",
        "Executive functions, including planning, decision-making, working memory, and social regulation.",
        "Automated cardiac regulation and basic respiration."
      ],
      correctIndex: 1,
      explanation: "The Prefrontal Cortex (PFC) is the master seat of executive cognitive control, governing goal-oriented behavior, impulse inhibition, and future planning."
    },
    comments: [
      {
        author: "Prof. Patricia Goldman-Rakic",
        avatar: "PG",
        text: "The prefrontal cortex acts as the mental whiteboard of the brain, holding and manipulating representations to guide action.",
        likes: 45,
        timestamp: "5 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Indeed. It is the last brain structure to fully mature, which perfectly matches its complex role in impulse inhibition and social alignment.",
        likes: 29,
        timestamp: "3 hrs ago"
      }
    ]
  },
  "synaptic plasticity": {
    cognitiveLoad: 8,
    quiz: {
      question: "What is the biological definition of Synaptic Plasticity?",
      options: [
        "The permanent rigidification of synaptic gates to prevent change.",
        "The ability of synaptic connections to strengthen or weaken over time in response to changes in their activity levels.",
        "The dynamic replacement of neurotransmitters with micro-synthetic elements."
      ],
      correctIndex: 1,
      explanation: "Synaptic plasticity (such as LTP and LTD) is the ability of connections to alter their transmission efficiency, forming the primary physical basis of memory."
    },
    comments: [
      {
        author: "Prof. Eric Kandel",
        avatar: "EK",
        text: "Long-term synaptic modification is the cellular language of memory. It is how experiences physically write themselves into the brain's wiring.",
        likes: 52,
        timestamp: "7 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "This explains why repetitive retrieval practice is so much more effective than passive reading. It repeatedly exercises and strengthens that specific synaptic path.",
        likes: 33,
        timestamp: "5 hrs ago"
      }
    ]
  },
  "dual-process theory": {
    cognitiveLoad: 7,
    quiz: {
      question: "According to Dual-Process Theory, what describes the main difference between 'System 1' and 'System 2' thinking?",
      options: [
        "System 1 is conscious and slow; System 2 is automated and non-computational.",
        "System 1 is fast, intuitive, and subconscious; System 2 is slow, deliberate, and highly logical.",
        "System 1 operates only during sleep; System 2 operates only during intense physical exercise."
      ],
      correctIndex: 1,
      explanation: "Dual-process theory asserts that System 1 operates automatically and quickly with little effort, while System 2 allocates attention to complex, effortful computations."
    },
    comments: [
      {
        author: "Dr. Daniel Kahneman",
        avatar: "DK",
        text: "We live mostly in System 1 because it's highly efficient. System 2 is lazy and requires real mental effort, which is why active learning feels hard.",
        likes: 61,
        timestamp: "8 hrs ago"
      },
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "This framework is so powerful. Overcoming biases almost always requires System 2 intervention to veto a System 1 default.",
        likes: 42,
        timestamp: "6 hrs ago"
      }
    ]
  },
  "dunning–kruger effect": {
    cognitiveLoad: 5,
    quiz: {
      question: "What cognitive pattern is described by the Dunning-Kruger Effect?",
      options: [
        "A bias where people with low ability in a domain overestimate their competence due to a lack of metacognitive self-awareness.",
        "The biological limit that prevents older adults from acquiring complex second languages.",
        "The scientific proof that highly confident individuals are statistically always correct."
      ],
      correctIndex: 0,
      explanation: "The Dunning-Kruger effect suggests that novices often lack the dual skills of performing a task and evaluating their performance, leading to inflated confidence."
    },
    comments: [
      {
        author: "Prof. David Dunning",
        avatar: "DD",
        text: "The tragedy of ignorance is that it is often accompanied by a sense of absolute certainty. Metacognition is the path out.",
        likes: 49,
        timestamp: "4 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "This shows why learning a little bit of a topic makes you feel like an expert, but learning more makes you realize how little you know.",
        likes: 31,
        timestamp: "2 hrs ago"
      }
    ]
  },
  "epistemic humility": {
    cognitiveLoad: 6,
    quiz: {
      question: "What does the concept of Epistemic Humility encourage in cognitive and scientific pursuits?",
      options: [
        "The absolute certainty that one's current mental models are permanent and flawless.",
        "The active recognition of the boundaries, limitations, and potential fallibility of our own knowledge.",
        "The absolute refusal to update opinions in light of new research evidence."
      ],
      correctIndex: 1,
      explanation: "Epistemic humility is the philosophical and cognitive stance that acknowledges our bounded understanding, prompting continuous questioning and adaptation."
    },
    comments: [
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "Epistemic humility is the absolute core of the scientific method. To learn, we must first accept that we do not know.",
        likes: 39,
        timestamp: "3 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Perfectly stated. This is the ultimate mental vaccine against dogma and cognitive stagnation.",
        likes: 27,
        timestamp: "1 hr ago"
      }
    ]
  },
  "flow (psychology)": {
    cognitiveLoad: 6,
    quiz: {
      question: "Which of these is a vital prerequisite for entering a state of 'Flow'?",
      options: [
        "A task that is extremely boring and requires very little cognitive effort.",
        "An optimal, dynamic balance between challenge level and individual skill level, coupled with immediate feedback.",
        "A complete lack of clear goals, leaving the participant highly confused."
      ],
      correctIndex: 1,
      explanation: "Flow state occurs when a task's demands perfectly match the person's capabilities, locking attention into a highly productive present moment."
    },
    comments: [
      {
        author: "Dr. Mihaly C.",
        avatar: "MC",
        text: "In flow, the self-consciousness disappears, and time is distorted. It is the peak human experience of focused performance.",
        likes: 58,
        timestamp: "5 hrs ago"
      },
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "If the task is too easy, we get bored. If it's too hard, we get anxious. Flow is that narrow, beautiful golden path of engagement.",
        likes: 36,
        timestamp: "3 hrs ago"
      }
    ]
  },
  "executive functions": {
    cognitiveLoad: 7,
    quiz: {
      question: "What are the three universally recognized core Executive Functions?",
      options: [
        "Visual contrast, sound localization, and tactile sensitivity.",
        "Inhibitory control (selective attention), working memory, and cognitive flexibility.",
        "Muscle density, digestion speed, and resting heart rate."
      ],
      correctIndex: 1,
      explanation: "Inhibitory control, working memory, and cognitive flexibility are the primary executive blocks that regulate complex goal-oriented thoughts and actions."
    },
    comments: [
      {
        author: "Prof. Adele Diamond",
        avatar: "AD",
        text: "Executive functions are more predictive of academic and life success than standard IQ metrics. They are our mental steering wheel.",
        likes: 46,
        timestamp: "6 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Precisely. They allow us to pause, plan, adapt, and refuse immediate distractions in pursuit of long-term goals.",
        likes: 30,
        timestamp: "4 hrs ago"
      }
    ]
  },
  "growth mindset": {
    cognitiveLoad: 5,
    quiz: {
      question: "What is the defining belief underlying a Growth Mindset?",
      options: [
        "That primary human intelligence is a fixed, biological state that can never be developed.",
        "That core talents, cognitive abilities, and intelligence can be systematically developed through persistence and methodology.",
        "That external luck is the sole determining variable of intellectual mastery."
      ],
      correctIndex: 1,
      explanation: "A growth mindset views intelligence as highly malleable and responsive to deliberate effort, strategic learning, and input."
    },
    comments: [
      {
        author: "Dr. Carol Dweck",
        avatar: "CD",
        text: "Praising effort and strategy rather than raw, natural intelligence builds resilience and encourages children to tackle hard tasks.",
        likes: 44,
        timestamp: "5 hrs ago"
      },
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "A growth mindset shifts failure from an identity ('I am bad at this') to information ('I need to try a different strategy'). Extremely powerful.",
        likes: 29,
        timestamp: "3 hrs ago"
      }
    ]
  },
  "memory consolidation": {
    cognitiveLoad: 7,
    quiz: {
      question: "Which biological mechanism describes the process of Memory Consolidation?",
      options: [
        "The rapid, instant deletion of recent cognitive events to avoid system overload.",
        "The temporal transfer of volatile short-term hippocampus traces into stable, long-term neocortical networks.",
        "The physical transformation of nerve cells into static tissue layers."
      ],
      correctIndex: 1,
      explanation: "Memory consolidation stabilizes a memory trace after its initial acquisition, transitioning it from the fragile hippocampus to the resilient neocortex."
    },
    comments: [
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Consolidation occurs heavily during sleep—specifically slow-wave and REM sleep. Missing sleep is literally throwing away your study time.",
        likes: 38,
        timestamp: "4 hrs ago"
      },
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "Excellent. This is why spaced repetition works so well; it triggers consolidation multiple times to cement the synapse.",
        likes: 25,
        timestamp: "2 hrs ago"
      }
    ]
  },
  "neurotransmitter": {
    cognitiveLoad: 7,
    quiz: {
      question: "Which chemical neurotransmitter is most closely linked to anticipation, reward prediction error, and goal-directed focus?",
      options: [
        "Melatonin.",
        "Dopamine.",
        "Acetylcholine."
      ],
      correctIndex: 1,
      explanation: "Dopamine is primarily responsible for signaling the error between predicted rewards and actual outcomes, driving motivation, focus, and drive."
    },
    comments: [
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Dopamine is not the chemical of pleasure itself; it is the molecule of anticipation, craving, and pursuit.",
        likes: 41,
        timestamp: "3 hrs ago"
      },
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: "This explains why slot machines and notifications are so addictive. They leverage random dopamine bursts to hijack our attention.",
        likes: 28,
        timestamp: "1 hr ago"
      }
    ]
  },
  "cognitive dissonance": {
    cognitiveLoad: 6,
    quiz: {
      question: "What is the psychological definition of Cognitive Dissonance?",
      options: [
        "An optimal harmonic frequency that improves spatial coordination.",
        "The acute mental tension felt when holding multiple contradictory beliefs, values, or behaviors.",
        "The complete loss of language comprehension due to fatigue."
      ],
      correctIndex: 1,
      explanation: "Cognitive dissonance is the psychological discomfort felt when actions or new data contradict existing beliefs, driving the mind to rationalize or change views."
    },
    comments: [
      {
        author: "Dr. Leon Festinger",
        avatar: "LF",
        text: "Humans are not rational animals; we are rationalizing animals. We will change our beliefs before we admit that we were wrong.",
        likes: 59,
        timestamp: "6 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Absolutely. Dissonance is painful, but experiencing it with curiosity instead of defensiveness is the key to actual intellectual growth.",
        likes: 40,
        timestamp: "4 hrs ago"
      }
    ]
  },
  "neurogenesis": {
    cognitiveLoad: 8,
    quiz: {
      question: "In which area of the adult human brain does Neurogenesis (the creation of new neurons) actively continue?",
      options: [
        "The primary motor strip of the cerebellum.",
        "The subgranular zone of the dentate gyrus in the hippocampus.",
        "The optical nerve canal."
      ],
      correctIndex: 1,
      explanation: "Adult neurogenesis is most strongly validated in the dentate gyrus of the hippocampus, which plays a massive role in forming new episodic memories."
    },
    comments: [
      {
        author: "Dr. Fred Gage",
        avatar: "FG",
        text: "Aerobic exercise, learning, and sensory enrichment actively increase neurogenesis. Stagnation and chronic stress actively suppress it.",
        likes: 47,
        timestamp: "5 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "The fact that we can literally grow new brain cells as adults completely alters how we should approach rehabilitation and lifelong learning.",
        likes: 33,
        timestamp: "3 hrs ago"
      }
    ]
  },
  "mirror neuron": {
    cognitiveLoad: 7,
    quiz: {
      question: "What defines the functionality of a Mirror Neuron?",
      options: [
        "A neuron that reflects photons directly inside the optic nerve.",
        "A motor-sensory neuron that fires both when an animal performs an action and when it observes another performing the same action.",
        "A synthetic computer node used to copy digital data files."
      ],
      correctIndex: 1,
      explanation: "Mirror neurons respond to both the performance and observation of goal-directed actions, believed to be key for observational learning."
    },
    comments: [
      {
        author: "Prof. Giacomo Rizzolatti",
        avatar: "GR",
        text: "Mirror neurons suggest that our brains are built for social resonance. We do not just analyze others; we internally simulate them.",
        likes: 43,
        timestamp: "5 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "This explains why watching experts perform high-level tasks actually accelerates our physical understanding of those movements.",
        likes: 28,
        timestamp: "3 hrs ago"
      }
    ]
  },
  "chunking (psychology)": {
    cognitiveLoad: 6,
    quiz: {
      question: "How does the process of 'Chunking' optimize the limited buffer of Working Memory?",
      options: [
        "It increases the absolute physiological volume of the prefrontal cortex.",
        "It aggregates separate bits of information into highly cohesive, meaningful clusters to reduce immediate cognitive friction.",
        "It automatically discards long-term facts to create empty working slots."
      ],
      correctIndex: 1,
      explanation: "Chunking bypasses working memory constraints by grouping individual elements into single high-level conceptual chunks (e.g., 1984 instead of 1, 9, 8, 4)."
    },
    comments: [
      {
        author: "Prof. George Miller",
        avatar: "GM",
        text: "The magic number seven, plus or minus two, is actually far smaller if we don't chunk. Chunking is the key to cognitive leverage.",
        likes: 38,
        timestamp: "4 hrs ago"
      },
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: "Exactly. To teach complex programming or chess, you must first help the student recognize patterns so they can chunk the state.",
        likes: 22,
        timestamp: "2 hrs ago"
      }
    ]
  }
};

// Offline fallback generator for quizzes and academic discussion comments
function getFallbackEnhancement(title: string, extract: string) {
  const lowerTitle = title.toLowerCase().trim();
  
  // Try direct match
  if (PRE_COMPUTED_ENHANCEMENTS[lowerTitle]) {
    return PRE_COMPUTED_ENHANCEMENTS[lowerTitle];
  }

  // Try substring match
  for (const key of Object.keys(PRE_COMPUTED_ENHANCEMENTS)) {
    if (lowerTitle.includes(key) || key.includes(lowerTitle)) {
      return PRE_COMPUTED_ENHANCEMENTS[key];
    }
  }

  // Default dynamic builder for non-trending topics
  const qText = `Based on the scientific summary of ${title}, which statement is correct?`;
  let options = [
    `It represents an unmeasured phenomenon with no empirical proof in standard science.`,
    `It is an active field of study and critical foundation of physical/cognitive understanding.`,
    `It is a transient state of matter that exists only under absolute zero pressure.`
  ];
  let correctIndex = 1;
  let explanation = `The summary confirms that ${title} is a vital element of scientific reality, validated by observation and empirical modeling.`;

  const lowerExtract = extract.toLowerCase();

  if (lowerTitle.includes("bias") || lowerExtract.includes("cognitive")) {
    options = [
      "It is a conscious effort by the brain to maximize math calculations.",
      "It is a systematic pattern of deviation from norm or rationality in judgment.",
      "It is an artificial frequency emitted by dynamic monitor screens."
    ];
    correctIndex = 1;
    explanation = "Cognitive biases are highly studied evolutionary shortcuts that the brain uses, which can lead to irrational judgment patterns.";
  } else if (lowerTitle.includes("plastic") || lowerExtract.includes("neuro")) {
    options = [
      "The brain becomes entirely rigid and unable to form any new synapses after childhood.",
      "The brain is capable of forming new connections and reorganizing neural structures throughout life.",
      "Plastic refers to structural polymers artificially injected to repair skull fractures."
    ];
    correctIndex = 1;
    explanation = "Neuroplasticity represents the dynamic nature of synaptic structures which adapt in response to focus, practice, and learning.";
  }

  return {
    cognitiveLoad: 6,
    quiz: {
      question: qText,
      options,
      correctIndex,
      explanation
    },
    comments: [
      {
        author: "Dr. Catherine Miller",
        avatar: "CM",
        text: `Analyzing ${title} is key to understanding cognitive friction and metacognitive growth. This is high-signal stuff.`,
        likes: 18,
        timestamp: "3 hrs ago"
      },
      {
        author: "Prof. Arthur Pendelton",
        avatar: "AP",
        text: `The implications of ${title} on modern attention spans cannot be overstated. A vital addition to the knowledge node.`,
        likes: 11,
        timestamp: "1 hr ago"
      }
    ]
  };
}

// Service Endpoint 1: GET /api/wiki/trending - Returns list of trending topics
app.get("/api/wiki/trending", (req, res) => {
  res.json({ topics: TRENDING_COG_SCI_TOPICS });
});

// Service Endpoint 2: GET /api/wiki/trending-posts - Fetches random topics and enhances them
app.get("/api/wiki/trending-posts", async (req, res) => {
  try {
    // Pick 3 random topics from the list
    const shuffled = [...TRENDING_COG_SCI_TOPICS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const posts: any[] = [];

    for (const topic of selected) {
      try {
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
        if (wikiRes.ok) {
          const data = await wikiRes.json();
          const title = data.title;
          const extract = data.extract;

          let enhancement: any = null;
          const ai = getGeminiClient();

          if (ai && process.env.GEMINI_API_KEY) {
            try {
              const prompt = `
You are a cognitive-science educational assistant.
We have an article summary from Wikipedia:
Title: "${title}"
Extract: "${extract}"

Generate a high-quality educational enhancement for this article in JSON format.
The enhancement should include:
1. A cognitiveLoad rating between 1 and 10 based on how dense or complex the subject is.
2. A quiz containing:
   - "question": a multiple-choice question testing comprehension of this concept.
   - "options": exactly 3 multiple-choice options.
   - "correctIndex": the 0-based index of the correct option (0, 1, or 2).
   - "explanation": a concise description of why this option is correct and how it reinforces learning.
3. Two simulated comments under "comments" representing high-signal, academic discussion of this concept by simulated experts.
   - Each comment has:
     - "author": full name with scientific title (e.g., Dr. Jane Smith, Prof. Alan Turing).
     - "avatar": 2-letter initials.
     - "text": a highly relevant, interesting insight or reaction to this topic.
     - "likes": a random number of likes (between 5 and 50).
     - "timestamp": e.g., "1 hr ago" or "3 hrs ago".
`;

              const response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: prompt,
                config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    required: ["cognitiveLoad", "quiz", "comments"],
                    properties: {
                      cognitiveLoad: { type: Type.INTEGER },
                      quiz: {
                        type: Type.OBJECT,
                        required: ["question", "options", "correctIndex", "explanation"],
                        properties: {
                          question: { type: Type.STRING },
                          options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                          },
                          correctIndex: { type: Type.INTEGER },
                          explanation: { type: Type.STRING }
                        }
                      },
                      comments: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          required: ["author", "avatar", "text", "likes", "timestamp"],
                          properties: {
                            author: { type: Type.STRING },
                            avatar: { type: Type.STRING },
                            text: { type: Type.STRING },
                            likes: { type: Type.INTEGER },
                            timestamp: { type: Type.STRING }
                          }
                        }
                      }
                    }
                  }
                }
              });

              if (response.text) {
                enhancement = JSON.parse(response.text.trim());
              }
            } catch (e) {
              console.warn(`[Gemini API Warning] Seamlessly using pre-computed academic database fallback for ${topic}:`, e instanceof Error ? e.message : e);
            }
          }

          if (!enhancement) {
            enhancement = getFallbackEnhancement(title, extract);
          }

          posts.push({
            id: `wiki_${data.pageid || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: data.title,
            description: data.description || "Trusted educational subject.",
            extract: data.extract,
            thumbnailUrl: data.thumbnail?.source || undefined,
            source: "Wikipedia",
            sourceUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${topic}`,
            readingTimeMin: Math.max(1, Math.ceil(data.extract.split(" ").length / 150)),
            cognitiveLoad: enhancement.cognitiveLoad || 5,
            quiz: enhancement.quiz,
            comments: enhancement.comments.map((c: any, i: number) => ({
              id: `c_${Date.now()}_${i}`,
              ...c
            }))
          });
        }
      } catch (err) {
        console.error(`Failed fetching summary for ${topic}:`, err);
      }
    }

    res.json({ posts });
  } catch (error) {
    console.error("Error generating trending posts:", error);
    res.status(500).json({ error: "Failed to generate trending cognitive-science posts" });
  }
});

// Service Endpoint 3: POST /api/wiki/enhance - Takes any raw title/extract and enhances it
app.post("/api/wiki/enhance", async (req, res) => {
  const { title, extract } = req.body;
  if (!title || !extract) {
    return res.status(400).json({ error: "Missing title or extract in request body." });
  }

  try {
    let enhancement: any = null;
    const ai = getGeminiClient();

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
You are a cognitive-science educational assistant.
We have an article summary from Wikipedia:
Title: "${title}"
Extract: "${extract}"

Generate a high-quality educational enhancement for this article in JSON format.
The enhancement should include:
1. A cognitiveLoad rating between 1 and 10 based on how dense or complex the subject is.
2. A quiz containing:
   - "question": a multiple-choice question testing comprehension of this concept.
   - "options": exactly 3 multiple-choice options.
   - "correctIndex": the 0-based index of the correct option (0, 1, or 2).
   - "explanation": a concise description of why this option is correct and how it reinforces learning.
3. Two simulated comments under "comments" representing high-signal, academic discussion of this concept by simulated experts.
   - Each comment has:
     - "author": full name with scientific title (e.g., Dr. Jane Smith, Prof. Alan Turing).
     - "avatar": 2-letter initials.
     - "text": a highly relevant, interesting insight or reaction to this topic.
     - "likes": a random number of likes (between 5 and 50).
     - "timestamp": e.g., "1 hr ago" or "3 hrs ago".
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["cognitiveLoad", "quiz", "comments"],
              properties: {
                cognitiveLoad: { type: Type.INTEGER },
                quiz: {
                  type: Type.OBJECT,
                  required: ["question", "options", "correctIndex", "explanation"],
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  }
                },
                comments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["author", "avatar", "text", "likes", "timestamp"],
                    properties: {
                      author: { type: Type.STRING },
                      avatar: { type: Type.STRING },
                      text: { type: Type.STRING },
                      likes: { type: Type.INTEGER },
                      timestamp: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        });

        if (response.text) {
          enhancement = JSON.parse(response.text.trim());
        }
      } catch (e) {
        console.warn("[Gemini API Warning] Seamlessly using pre-computed academic database fallback for searched topic:", e instanceof Error ? e.message : e);
      }
    }

    if (!enhancement) {
      enhancement = getFallbackEnhancement(title, extract);
    }

    res.json(enhancement);
  } catch (error) {
    console.error("Error in enhance service:", error);
    res.status(500).json({ error: "Failed to enhance topic" });
  }
});

// Configure Vite middleware in development, and serve static build in production.
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cortex Server running on http://localhost:${PORT}`);
  });
}

startServer();
