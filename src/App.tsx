import React from 'react';
import DashboardView from './components/DashboardView';
import StarfieldBackground from './components/StarfieldBackground';
import { Sparkles, Brain } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0c100e] text-[#f1ede2] flex flex-col font-sans selection:bg-[#dfb15b]/30 selection:text-white relative">
      {/* Dynamic Starfield Background */}
      <StarfieldBackground />
      
      {/* Immersive Theme Navigation & Mind Balance Rail */}
      <nav className="h-14 border-b border-[#222d26] flex items-center justify-between px-6 bg-[#141a17]/60 backdrop-blur-md shrink-0 select-none">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#dfb15b]/10 border border-[#dfb15b]/30 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-[#dfb15b]" />
            </div>
            <span className="text-xs font-black tracking-widest uppercase text-[#f1ede2] font-mono">CORTEX</span>
          </div>
          <div className="h-4 w-px bg-[#222d26] hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-4 text-[9px] font-bold tracking-widest text-[#879b90] font-mono">
            <span className="text-[#dfb15b] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfb15b] animate-pulse"></span>
              COGNITIVE DEFENSE: ACTIVE
            </span>
            <span>HUMAN INTELLIGENCE DEEP ENHANCEMENT</span>
          </div>
        </div>

        {/* Desktop Version Badge */}
        <div className="hidden md:flex items-center space-x-6 text-xs text-[#879b90]">
          <div className="flex items-center space-x-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#dfb15b]" />
            <span className="font-semibold tracking-wider text-[10px] uppercase">Anti-Brainrot Sanctuary v2.0</span>
          </div>
        </div>

        {/* User Balance Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[9px] text-[#879b90] uppercase tracking-wider font-mono leading-none">Neural Balance</div>
            <div className="text-xs text-emerald-400 font-mono font-bold">100% Homeostatic</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-[#2c3a32] bg-[#1c2420] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#dfb15b] font-bold">ME</span>
          </div>
        </div>
      </nav>

      {/* Main Responsive Grid split layout */}
      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        <DashboardView />
      </main>

      {/* Footer marquee mimicking Global Insight Stream */}
      <div className="h-9 bg-black border-t border-[#222d26] flex items-center px-6 gap-8 shrink-0 select-none">
        <span className="text-[9px] font-bold text-[#dfb15b] uppercase tracking-widest shrink-0 font-mono">Insight Feed:</span>
        <div className="flex-1 flex gap-12 overflow-hidden whitespace-nowrap text-[9px] font-mono text-[#879b90]">
          <div className="flex animate-marquee gap-12">
            <span>[Attentional Science] Deep reading of structured concepts is shown to instantly reverse attention span degradation.</span>
            <span>[Neuro-Balance] Removing algorithmic autoplay loops normalizes baseline dopamine thresholds.</span>
            <span>[Gamified Synthesis] Active recall micro-quizzes foster maximum long-term semantic layout memory.</span>
            <span>[Homeostatic State] A visual palette using warm spectrum light reduces sensory visual strain perfectly.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
