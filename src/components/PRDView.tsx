import React, { useState, useMemo } from 'react';
import { prdSections, PRDSection } from '../data/prdData';
import { Search, BookOpen, Clock, Heart, Shield, Landmark, Layers, HelpCircle, Activity } from 'lucide-react';

interface PRDViewProps {
  onHighlightFeature?: (featureId: string) => void;
}

export default function PRDView({ onHighlightFeature }: PRDViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(prdSections[0].id);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return prdSections;
    return prdSections.filter(sec => 
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.contentMarkdown.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.cognitiveImpact.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getIcon = (id: string) => {
    switch (id) {
      case 'sec_cognitive_friction': return <Activity className="w-5 h-5 text-[#f59e0b]" />;
      case 'sec_info_architecture': return <Layers className="w-5 h-5 text-[#f59e0b]" />;
      case 'sec_signal_noise': return <HelpCircle className="w-5 h-5 text-[#f59e0b]" />;
      case 'sec_anti_addiction': return <Clock className="w-5 h-5 text-[#f59e0b]" />;
      case 'sec_anti_bot': return <Shield className="w-5 h-5 text-[#f59e0b]" />;
      case 'sec_sustainable_econ': return <Landmark className="w-5 h-5 text-[#f59e0b]" />;
      default: return <BookOpen className="w-5 h-5 text-white/50" />;
    }
  };

  // Helper to parse very simple markdown structures (headings, bullet points, tables, bold text)
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    let insideTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Check if inside a table
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (trimmed.includes('---')) {
          // Separator line, ignore
          return;
        }
        
        const cells = trimmed.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        
        if (!insideTable) {
          insideTable = true;
          tableHeaders = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (insideTable) {
        // Table ended, render it
        elements.push(
          <div key={`table-${index}`} className="my-6 overflow-x-auto rounded-lg border border-white/10 bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  {tableHeaders.map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {parseInlineFormatting(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 text-xs text-white/70 leading-relaxed max-w-[250px]">
                        {parseInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        insideTable = false;
        tableHeaders = [];
        tableRows = [];
      }

      // Render headings
      if (trimmed.startsWith('###')) {
        elements.push(
          <h4 key={index} className="text-sm font-bold text-[#f59e0b] mt-6 mb-3 tracking-wider uppercase">
            {parseInlineFormatting(trimmed.substring(3).trim())}
          </h4>
        );
      } else if (trimmed.startsWith('*') && !trimmed.startsWith('**')) {
        elements.push(
          <ul key={index} className="list-disc pl-5 my-2 space-y-1 text-xs text-white/70">
            <li>{parseInlineFormatting(trimmed.substring(1).trim())}</li>
          </ul>
        );
      } else if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || trimmed.startsWith('4.')) {
        elements.push(
          <div key={index} className="my-3 pl-3 border-l-2 border-[#f59e0b]/40">
            <span className="font-semibold text-white text-xs block">
              {parseInlineFormatting(trimmed)}
            </span>
          </div>
        );
      } else if (trimmed.startsWith('```')) {
        // Code block indicator - skip or parse simple visual layout
        return;
      } else if (trimmed.startsWith('+--') || trimmed.startsWith('|  [')) {
        // Visual text art - render as a mono box
        elements.push(
          <pre key={index} className="bg-black/60 p-4 rounded-xl font-mono text-[10px] text-white/80 border border-white/10 my-3 overflow-x-auto leading-relaxed shadow-inner">
            {trimmed}
          </pre>
        );
      } else if (trimmed === '') {
        // Empty space
        return;
      } else {
        elements.push(
          <p key={index} className="text-xs text-white/70 leading-relaxed mb-4 font-sans">
            {parseInlineFormatting(trimmed)}
          </p>
        );
      }
    });

    // Cleanup lingering table
    if (insideTable) {
      elements.push(
        <div key="table-end-cleanup" className="my-6 overflow-x-auto rounded-lg border border-white/10 bg-black/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {tableHeaders.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    {parseInlineFormatting(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tableRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 text-xs text-white/70 leading-relaxed">
                      {parseInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  const parseInlineFormatting = (text: string) => {
    // Very basic helper to parse **bold** and `code` in the text
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let key = 0;

    while (currentText.length > 0) {
      const boldIdx = currentText.indexOf('**');
      const codeIdx = currentText.indexOf('`');

      if (boldIdx === -1 && codeIdx === -1) {
        parts.push(<span key={key++}>{currentText}</span>);
        break;
      }

      const nextTag = (boldIdx !== -1 && (codeIdx === -1 || boldIdx < codeIdx)) ? 'bold' : 'code';
      const delimiter = nextTag === 'bold' ? '**' : '`';
      const startIdx = nextTag === 'bold' ? boldIdx : codeIdx;

      if (startIdx > 0) {
        parts.push(<span key={key++}>{currentText.substring(0, startIdx)}</span>);
      }

      const rest = currentText.substring(startIdx + delimiter.length);
      const endIdx = rest.indexOf(delimiter);

      if (endIdx === -1) {
        parts.push(<span key={key++}>{currentText.substring(startIdx)}</span>);
        break;
      }

      const innerContent = rest.substring(0, endIdx);
      if (nextTag === 'bold') {
        parts.push(<strong key={key++} className="font-bold text-white">{innerContent}</strong>);
      } else {
        parts.push(<code key={key++} className="bg-white/10 text-[#f59e0b] px-1 py-0.5 rounded text-[10px] font-mono border border-white/5">{innerContent}</code>);
      }

      currentText = rest.substring(endIdx + delimiter.length);
    }

    return parts;
  };

  return (
    <div id="prd_view_container" className="flex flex-col h-full bg-[#050507] text-[#e0e0e6]">
      {/* Header with Search */}
      <div className="p-6 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="flex items-center space-x-3 mb-2">
          <span className="px-2 py-1 bg-[#f59e0b] text-black rounded font-mono text-[9px] font-black tracking-widest uppercase">SPEC</span>
          <h2 className="text-sm font-bold text-white tracking-widest uppercase font-sans">Engineering PRD</h2>
        </div>
        <p className="text-[11px] text-white/50 mb-4 leading-relaxed font-sans">
          This system specification defines the safeguards & design guidelines of the Cortex Platform. Use the sandbox panel on the right to simulate and audit them in real time.
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/40" />
          <input
            id="prd_search_input"
            type="text"
            placeholder="Search specification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-white/10 rounded-md bg-black/40 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] focus:border-[#f59e0b] font-sans transition-all"
          />
        </div>
      </div>

      {/* Navigation / Quick Jumps */}
      <div className="flex px-4 py-2 bg-black/40 overflow-x-auto gap-2 scrollbar-none border-b border-white/10">
        {filteredSections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              setActiveSectionId(sec.id);
              const element = document.getElementById(sec.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
              if (onHighlightFeature) onHighlightFeature(sec.id);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              activeSectionId === sec.id
                ? 'bg-[#f59e0b] text-black border-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border-white/10'
            }`}
          >
            {getIcon(sec.id)}
            <span>{sec.title.split('.')[0]}</span>
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth" id="prd_sections_scroller">
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <HelpCircle className="w-12 h-12 text-white/20 mb-2" />
            <p className="text-xs text-white/40">No matching specification sections found.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs text-[#f59e0b] hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          filteredSections.map((sec) => (
            <div 
              key={sec.id} 
              id={sec.id}
              className={`pb-8 border-b border-white/5 last:border-b-0 transition-opacity duration-300 ${
                activeSectionId === sec.id ? 'opacity-100' : 'opacity-50 hover:opacity-100'
              }`}
              onMouseEnter={() => {
                setActiveSectionId(sec.id);
                if (onHighlightFeature) onHighlightFeature(sec.id);
              }}
            >
              {/* Section Header */}
              <div className="flex items-start space-x-3 mb-4">
                <div className="mt-0.5 p-2 bg-white/5 border border-white/10 rounded">
                  {getIcon(sec.id)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase leading-snug">
                    {sec.title}
                  </h3>
                  <p className="text-[11px] text-[#f59e0b] font-mono tracking-tight mt-0.5">
                    {sec.subtitle}
                  </p>
                </div>
              </div>

              {/* Cognitive Impact Badge */}
              <div className="mb-6 p-4 border border-[#f59e0b]/30 bg-[#f59e0b]/5 rounded-xl">
                <span className="text-[9px] font-bold text-[#f59e0b] uppercase tracking-widest block mb-1">
                  Cognitive Impact Strategy
                </span>
                <p className="text-xs text-white/80 leading-relaxed font-sans">
                  {sec.cognitiveImpact}
                </p>
              </div>

              {/* Markdown Content */}
              <div className="text-white/70">
                {renderMarkdown(sec.contentMarkdown)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

