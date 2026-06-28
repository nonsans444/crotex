export interface PRDSection {
  id: string;
  title: string;
  subtitle: string;
  cognitiveImpact: string;
  contentMarkdown: string;
}

export const prdSections: PRDSection[] = [
  {
    id: 'sec_cognitive_friction',
    title: '1. The "Cognitive Friction" Engine',
    subtitle: 'Re-engineering deliberate engagement and mitigating System 1 cognitive hijacking.',
    cognitiveImpact: 'Directly limits impulsive neural pathways, shifting cognitive processing from fast, reactive System 1 heuristics to deliberate, analytical System 2 reflection.',
    contentMarkdown: `### Architectural Intent
The "Cognitive Friction" Engine is a programmatic layer designed to act as an intentional brake on human-computer interaction. Modern engagement-driven networks minimize friction to trigger mindless consumption loops. Cortex introduces systematic, calibrated friction points to restore cognitive sovereignty.

### Friction Mechanics Specifications

| Friction Module | Technical Trigger | Algorithmic Execution | Cognitive Impact |
| :--- | :--- | :--- | :--- |
| **Forced Focus Interval** | Attempting to access a \`Deep Dive\` or transition between remote subjects. | Initiates a calm, non-flashy 3-second visual visual countdown (breathing rhythm). Screen gestures are temporarily disabled. | Restores autonomic nervous system equilibrium. Suppresses impulsive clicks and provides a neural reset. |
| **Commitment Logger** | Opening an \`Insight\` for the first time. | Forces the input of a "Learning Intention" (min. 8 characters; e.g., *"Understand Shannon's entropy limit"*). | Triggers goal-directed behavior. Priming the brain with an explicit intention increases retention by up to 35%. |
| **Active Recall Checks** | Completing a \`Deep Dive\` and exiting back to the global map. | Generates a prompt requiring a brief 1-sentence synthesis of the core insight. Verified via lightweight local heuristic parsing. | Leverages the *Testing Effect*. Retrieving information shortly after exposure reinforces synaptic consolidation. |
| **Choice Restrictions** | Navigating the knowledge graph. | Enforces a maximum of 3 logical paths at any given hierarchy step. Hides all unrelated global indicators. | Eliminates decision fatigue by aligning choice architecture with Miller's law of working memory limits. |

### Operational Implementation
When a user attempts to traverse a connection between nodes, the system evaluates their current session state. If their "Accumulated Cognitive Intensity" exceeds a threshold (calculated by reading speed and session duration), the engine increases the Forced Focus Interval duration up to a maximum of 10 seconds. This is a self-regulating cybernetic system protecting the user from mental exhaustion.`
  },
  {
    id: 'sec_info_architecture',
    title: '2. Information Architecture (The Knowledge Graph)',
    subtitle: 'Transitioning from the Infinite Feed to structural, self-limiting Node Navigation.',
    cognitiveImpact: 'Restores spatial and conceptual mapping, activating the hippocampus and providing clear "stopping cues" to facilitate intellectual closure.',
    contentMarkdown: `### Structural Topology
Cortex completely deprecates the "Infinite Feed." Feeds are linear, unidirectional streams of information designed to prevent the brain from building a structured mental index. Cortex replaces this paradigm with a strict, hierarchical, and multi-dimensional **Knowledge Graph** structured into four distinct structural layers.

### The Cortex Structural Hierarchy

1. **Domain**: Broad scientific, technical, or philosophical fields (e.g., *Cognitive Psychology*, *Information Theory*). These serve as the master conceptual root nodes.
2. **Subject**: Structured categories nested within a domain representing focused areas of study (e.g., *Attentional Selection*, *Signal Processing*).
3. **Insight**: Atomic, self-contained educational breakthroughs and conceptual paradigms (e.g., *Cognitive Load Theory*, *The SNR of UX*).
4. **Deep Dive**: High-density academic analyses, empirical studies, and formal derivations (e.g., *Split-Attention Effect*, *Shannon Entropy and Satiation*).

### Structural Comparison: Feed vs. Graph

| Characteristic | Legacy Infinite Feed | Cortex Knowledge Graph | Cognitive Consequence |
| :--- | :--- | :--- | :--- |
| **Navigation Axis** | Linear, vertical, endless. | Multi-dimensional, hierarchical, finite. | Feed: Triggers chronic "Seeking" behavior. Graph: Fosters structured spatial discovery. |
| **Temporal Focus** | Chronological bias (recency). | Epistemic value bias (timelessness). | Feed: Promotes temporary panic/FOMO. Graph: Accumulates durable semantic memory. |
| **Structural Endpoints** | Absent (Infinite scroll). | Explicit, logical terminals (Deep Dives). | Feed: Suppresses reflective "Default Mode Network" (DMN). Graph: Restores healthy "Stopping Cues." |
| **User Agency** | Passive (Algorithmically pushed). | Active (User-selected trajectory). | Feed: Demoralizing feel of loss-of-control. Graph: High cognitive sovereignty and self-efficacy. |

### Semantic Traversal Engine
Users explore the system through a visual Node interface. Traversal is deliberate; users cannot teleport or skip intermediate steps. Accessing a \`Deep Dive\` requires the traversal of its parent \`Insight\`, and and the successful execution of the friction check. The graph maintains a strict "Epistemic Chain of Custody," reinforcing the mental relationships between core principles and their derived applications.`
  },
  {
    id: 'sec_signal_noise',
    title: '3. The "Signal-to-Noise" Feedback Loop',
    subtitle: 'Dismantling social validation metrics and replacing them with objective informational utility.',
    cognitiveImpact: 'De-activates social anxiety and status-seeking loops, aligning attention purely with internal intellectual growth.',
    contentMarkdown: `### Redefining Platform Engagement
Legacy systems measure engagement via actions designed to elicit tribal behavior: "Likes", "Shares", "Retweets", and "Flame Wars". These metrics trigger cortisol and dopamine fluctuations. Cortex eliminates all metrics of social approval, establishing objective informational vectors in their place.

### The Cortex Epistemic Metrics

* **Signal Score (SS)**: A user-contributed percentage measuring the structural density of the content. A low score indicates redundant, filler, or fluff content.
* **Utility Value (UV)**: A metric from 0 to 10 assessing whether the node provided immediately applicable knowledge or critical conceptual clarity.
* **Cognitive Load Index (CLI)**: A visual indicator of the mental effort required to process the node. Values range from 1 (Very Low; rapid assimilation) to 10 (Extremely High; mathematical proofs/complex systems).
* **Proof of Effort (PoE) Count**: Displays how many human researchers have completed and written verified recalls of this specific node.

### Visual Architecture: Effort vs. Gain

To prevent deceptive formatting and clickbait, every node header displays a unified **Effort/Gain Matrix** before opening. 

\`\`\`
+-------------------------------------------------------------+
|  [COGNITIVE LOAD] ■■■■■■■□□□ (7/10)    [READ TIME] 8 mins   |
|  [SIGNAL SCORE]   98%                   [UTILITY]   9.4/10   |
|  ---------------------------------------------------------  |
|  COGNITIVE RATIO: 1.34 (High-density analytical material)   |
+-------------------------------------------------------------+
\`\`\`

This matrix allows the user to perform a rational, deliberate cost-benefit analysis before expending mental capital. It replaces the immediate visual hook with a cool, clinical structural breakdown.`
  },
  {
    id: 'sec_anti_addiction',
    title: '4. Anti-Addiction Technical Specification',
    subtitle: 'Circadian-Aware interface modulations and prefrontal state preservation.',
    cognitiveImpact: 'Aligns cognitive consumption with biological hormonal states, protecting melatonin synthesis and mitigating split-session anxiety.',
    contentMarkdown: `### Circadian-Aware UI Modulations
Cognitive capacity is directly tied to human circadian rhythms. Late-night exposure to blue light and high-intensity, controversial content is a major driver of sleep disruption and mental health degradation. Cortex implements a mandatory server-synchronized circadian protocol.

| Phase | Time Window | Interface Hue Class | Content Filtering Mode | Cognitive Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Morning Focus** | 06:00 - 12:00 | Crisp, high-contrast, blue-light balanced. | Prioritizes mathematical, abstract, and structural nodes. | Leverages peak cortisol levels and fresh prefrontal reserves for high-complexity learning. |
| **Afternoon Deep Work** | 12:00 - 18:00 | Balanced daylight white, soft shadows. | Prioritizes synthesis, reviews, and choice architecture analysis. | Matches high task-focus periods, supporting logical schema construction. |
| **Evening Reflection** | 18:00 - 06:00 | Warm monochrome (amber/monochrome), dark mode. | Restricts high-intensity CLI (>7) nodes; suggests philosophical, meditative, or reflective nodes. | Protects melatonin secretion; de-escalates prefrontal alertness to prepare for restorative delta-wave sleep. |

### Prefrontal State-Preservation Desk
A major cause of digital stress is "Attention Fragmentation"—the feeling of leaving multiple mental tabs open. Cortex implements a **State-Preservation protocol**.

When a user suspends a session, Cortex records a highly detailed metadata capsule of their active mental state:
* Exact node coordinates and parent chain.
* Visual scroll position and reading speed.
* Active recall scratchpad data.
* Current cognitive load and heart rate proxy.

Upon returning, the system does not present a chaotic, brand-new feed. It presents a quiet "State-Resumption desk," showing their pending learning capsules. Re-entry is smooth, eliminating the "re-orientation cost" which typically depletes prefrontal glucose reserves.`
  },
  {
    id: 'sec_anti_bot',
    title: '5. The "Anti-Bot & Pro-Human" Verification Layer',
    subtitle: 'Proof of Effort (PoE) protocols and decentralized epistemic standards.',
    cognitiveImpact: 'Immunizes the environment against artificial cognitive spam, ensuring that every byte of information has been verified by human intellect.',
    contentMarkdown: `### The Threat of Epistemic Spam
LLMs have reduced the marginal cost of producing grammatically correct, semantically empty content to near-zero. Unfiltered social channels are being overwhelmed by synthetic "AI Slop"—high-frequency, low-utility content designed to capture attention metrics. Cortex implements a cryptographic and human verification filter.

### The Creator "Proof of Effort" (PoE) Protocol
To publish any Node on Cortex, a creator must execute and upload a structural proof demonstrating serious human labor. 

\`\`\`
                                +---------------------------+
                                |  1. Structured Concept    |
                                +---------------------------+
                                              |
                                              v
                                +---------------------------+
                                |  2. Mandatory Citations   |
                                |     (DOI/ISBN/ArXiv Links)|
                                +---------------------------+
                                              |
                                              v
                                +---------------------------+
                                |  3. Epistemic Synthesis   |
                                |     (3 Atomic Takeaways)  |
                                +---------------------------+
                                              |
                                              v
                                +---------------------------+
                                |  4. Human Peer Audit      |
                                |     (Consensus Validation)|
                                +---------------------------+
\`\`\`

### Verification Hierarchy

1. **Academic DOI Anchor**: Every published insight must bind directly to at least one verified external academic paper (via cross-referenced DOIs, ISBNs, or ArXiv links).
2. **Structural Completeness Check**: Submissions must contain:
   * A clear, jargon-free abstract.
   * Exactly 3 atomic, independent takeaways.
   * Estimated reading time backed by character count.
3. **Consensus Validation**: Content is initially placed in a "Liminal Ledger" where it is audited by three random human researchers of a matching domain. It is only integrated into the global Knowledge Graph once it receives a 2/3 validation score.`
  },
  {
    id: 'sec_sustainable_econ',
    title: '6. Sustainable Economics',
    subtitle: 'Eliminating the ad-driven incentive structure that breeds attentional addiction.',
    cognitiveImpact: 'Aligns the platform’s survival directly with the user’s cognitive enrichment, making the business model zero-sum against dopamine-mining.',
    contentMarkdown: `### The Attentional Conflict of Interest
The structural rot of modern digital platforms is a direct consequence of the **Ad-Based Revenue Model**. 
* **The Formula**: Revenue = Impressions * Average Session Duration * CTR.
* **The Consequence**: To survive, the platform must optimize for addiction, outrage, tribal conflict, and constant interruption.

Cortex rejects this paradigm. Our financial incentives are aligned directly with the **cognitive development** of our members.

### Subscription & Epistemic Resource Allocation

| Metric | Legacy Ad-Driven Social Media | Cortex Sustainable Economy |
| :--- | :--- | :--- |
| **Financial Engine** | Target Advertising / Data Brokerage. | Utility-Based Subscription + Epistemic Micro-Endowments. |
| **Primary Incentive** | Maximize passive, low-effort dwell time. | Maximize efficient, high-density knowledge transfer. |
| **User Status** | The product (attention harvested & sold). | The primary patron (investing in cognitive enhancement). |
| **Creator Compensation** | Click-through rates, video view counts, outrage generation. | Direct endowment payouts based on peer-reviewed Utility Scores. |

### Micro-Endowments for Creators
Cortex operates a cooperative dividend system. From the standard subscription fee, 40% is pooled and distributed directly to creators. However, unlike standard systems where payment is tied to view counts, Cortex compensates creators based on their **Utility and Signal Scores**. 

A creator who publishes a highly dense, 10-minute insight that is rated **9.5/10 Utility** by 100 professionals receives a higher dividend than a creator who publishes a flashy, high-volume listicle read by 10,000 users. This elevates publishing from an attention-grabbing contest to a high-end research guild.`
  }
];
