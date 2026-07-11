import React, { useEffect, useState } from 'react';
import screenImg from '../assets/screen.png';
import maskotImg from '../assets/maskot.png';

const TreeMap = ({ coins, onBack, onSelectFruit }) => {
  const [progressWidth, setProgressWidth] = useState('0%');

  useEffect(() => {
    // Animate progress bar on mount
    const timer = setTimeout(() => {
      setProgressWidth('60%');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-surface text-on-surface font-body-md overflow-hidden h-screen flex page-transition-enter">
      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        
        {/* Top Bar */}
        <header className="absolute top-0 right-0 w-full z-40 flex justify-between items-center px-gutter py-4 bg-surface/80 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform mr-2"
            >
              <span className="material-symbols-outlined text-primary font-bold">chevron_left</span>
            </button>
            <div className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <span className="font-label-md text-label-md">Unit: Dasar-dasar Huruf</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-surface-container-high rounded-full px-4 py-2 flex items-center gap-2 border border-outline-variant shadow-sm hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className="font-label-md text-label-md font-bold">{coins.toLocaleString('id-ID')}</span>
            </div>
            <div className="bg-surface-container-high rounded-full px-4 py-2 flex items-center gap-2 border border-outline-variant shadow-sm hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
              <span className="font-label-md text-label-md font-bold">65</span>
            </div>
            <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        {/* The "Roots" Learning Path Canvas */}
        <div className="flex-1 soil-gradient relative flex items-center justify-center p-xl">
          
          {/* Root Image Background */}
          <div className="absolute inset-0 z-0">
            <img 
              alt="Roots background" 
              className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
              src={screenImg} 
            />
          </div>

          {/* Dynamic Root SVG Path matching Image 14 sketch */}
          <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 1000 800">
            <defs>
              <linearGradient id="rootGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#b1f0ce', stopOpacity: 1 }}></stop>
                <stop offset="50%" style={{ stopColor: '#95d4b3', stopOpacity: 1 }}></stop>
                <stop offset="100%" style={{ stopColor: '#2c694e', stopOpacity: 1 }}></stop>
              </linearGradient>
            </defs>
            {/* Main Root to Node A (Top) */}
            <path className="root-line magical-glow" d="M 500 0 L 500 40"></path>
            {/* A to B and C */}
            <path className="root-line magical-glow" d="M 500 80 C 500 120 400 140 350 200"></path>
            <path className="root-line magical-glow" d="M 500 80 C 500 120 600 140 650 200"></path>
            {/* B to P, E, L, T */}
            <path className="root-line magical-glow" d="M 350 200 C 320 250 280 300 250 350"></path>
            <path className="root-line magical-glow" d="M 350 200 C 350 260 350 300 350 380"></path>
            <path className="root-line magical-glow" d="M 350 200 C 380 250 420 300 450 350"></path>
            <path className="root-line magical-glow opacity-50" d="M 250 350 C 240 380 230 410 220 440"></path>
            {/* C to K1, K2 */}
            <path className="root-line magical-glow" d="M 650 200 C 620 250 600 300 580 350"></path>
            <path className="root-line magical-glow" d="M 650 200 C 680 250 720 300 750 350"></path>
          </svg>

          {/* Mission Nodes Layer */}
          <div className="relative z-20 w-full h-full max-w-[1000px] max-h-[800px] mx-auto">
            {/* Top Root Node (A) */}
            <div className="absolute top-[5%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <button className="mission-node active w-20 h-20 bg-white rounded-full border-4 border-primary flex items-center justify-center text-primary relative shadow-[0_0_20px_rgba(149,212,179,0.6)] group">
                <span className="font-headline-lg text-headline-lg transition-transform duration-300 group-hover:scale-110">A</span>
                <div className="absolute -bottom-1 -right-1 bg-secondary-container rounded-full p-0.5 border border-white">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                </div>
              </button>
              <p className="font-label-sm text-white font-bold drop-shadow-md">Awal</p>
            </div>
            
            {/* Second Level: B & C */}
            <div className="absolute top-[20%] left-[35%] -translate-x-1/2 flex flex-col items-center gap-1">
              <button className="mission-node active w-20 h-20 bg-white rounded-full border-4 border-primary flex items-center justify-center text-primary relative shadow-[0_0_20px_rgba(149,212,179,0.6)] group">
                <span className="font-headline-lg text-headline-lg transition-transform duration-300 group-hover:scale-110">B</span>
              </button>
              <p className="font-label-sm text-white font-bold">Vokal</p>
            </div>
            
            <div className="absolute top-[20%] left-[65%] -translate-x-1/2 flex flex-col items-center gap-1">
              {/* Active node triggers the quiz */}
              <button 
                onClick={() => onSelectFruit('bahasa')}
                className="mission-node w-20 h-20 bg-primary rounded-full border-4 border-primary-fixed-dim flex items-center justify-center text-white relative shadow-[0_0_25px_rgba(149,212,179,0.8)] cursor-pointer hover:scale-105 active:scale-95 group"
              >
                <span className="font-headline-lg text-headline-lg transition-transform duration-300 group-hover:scale-110">C</span>
                <div className="absolute -top-3 px-3 py-1 bg-secondary rounded-full text-white font-label-sm animate-bounce shadow-md">Mulai!</div>
              </button>
              <p className="font-label-sm text-secondary-fixed-dim font-bold drop-shadow-md">Konsonan</p>
            </div>
            
            {/* Third Level: B Sub-branches (P, E, L) */}
            <div className="absolute top-[38%] left-[25%] -translate-x-1/2 flex flex-col items-center gap-1 opacity-80">
              <button className="mission-node active w-16 h-16 bg-white rounded-full border-2 border-primary flex items-center justify-center text-primary shadow-md group">
                <span className="font-headline-md transition-transform duration-300 group-hover:scale-110">P</span>
              </button>
              <p className="font-label-sm text-white/80">Pola</p>
            </div>
            <div className="absolute top-[42%] left-[35%] -translate-x-1/2 flex flex-col items-center gap-1 grayscale">
              <button className="mission-node w-16 h-16 bg-surface-dim rounded-full border-2 border-outline-variant flex items-center justify-center text-on-surface-variant group">
                <span className="font-headline-md transition-transform duration-300 group-hover:scale-110">E</span>
              </button>
              <p className="font-label-sm text-white/60">Eja</p>
            </div>
            <div className="absolute top-[38%] left-[45%] -translate-x-1/2 flex flex-col items-center gap-1 grayscale">
              <button className="mission-node w-16 h-16 bg-surface-dim rounded-full border-2 border-outline-variant flex items-center justify-center text-on-surface-variant group">
                <span className="font-headline-md transition-transform duration-300 group-hover:scale-110">L</span>
              </button>
              <p className="font-label-sm text-white/60">Latih</p>
            </div>
            
            {/* Third Level: C Sub-branches (K1, K2) */}
            <div className="absolute top-[38%] left-[58%] -translate-x-1/2 flex flex-col items-center gap-1 grayscale">
              <button className="mission-node w-16 h-16 bg-surface-dim rounded-full border-2 border-outline-variant flex items-center justify-center text-on-surface-variant group">
                <span className="font-headline-md transition-transform duration-300 group-hover:scale-110">K1</span>
              </button>
              <p className="font-label-sm text-white/60">Sub 1</p>
            </div>
            <div className="absolute top-[38%] left-[75%] -translate-x-1/2 flex flex-col items-center gap-1 grayscale">
              <button className="mission-node w-16 h-16 bg-surface-dim rounded-full border-2 border-outline-variant flex items-center justify-center text-on-surface-variant group">
                <span className="font-headline-md transition-transform duration-300 group-hover:scale-110">K2</span>
              </button>
              <p className="font-label-sm text-white/60">Sub 2</p>
            </div>
            
            {/* Final Deep Node (T) */}
            <div className="absolute top-[50%] left-[22%] -translate-x-1/2 flex flex-col items-center gap-1 grayscale opacity-50">
              <button className="mission-node w-12 h-12 bg-surface-dim rounded-full border-2 border-outline-variant flex items-center justify-center text-on-surface-variant group">
                <span className="text-label-md transition-transform duration-300 group-hover:scale-110">T</span>
              </button>
            </div>
          </div>

          {/* Right Progress Panel */}
          <aside className="absolute right-gutter top-1/2 -translate-y-1/2 w-80 z-30 flex flex-col gap-gutter hidden lg:flex">
            {/* Unit Progress Card */}
            <div className="bg-surface/90 backdrop-blur-lg p-6 rounded-3xl clay-card border border-primary-container/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-sm text-primary font-bold">Progres Unit</h3>
                <span className="text-primary font-bold">3/5</span>
              </div>
              <div className="w-full bg-surface-container-high h-4 rounded-full mb-6 overflow-hidden">
                <div 
                  className="h-full progress-vine rounded-full"
                  style={{ width: progressWidth, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                ></div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="font-label-md text-on-surface">Pengenalan Vokal</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <span className="font-label-md text-on-surface">Huruf Konsonan</span>
                </li>
                <li className="flex items-center gap-3 p-2 bg-primary-fixed/20 rounded-xl border border-primary-container">
                  <div className="w-8 h-8 bg-secondary-container rounded-lg flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                  </div>
                  <span className="font-label-md text-primary font-bold">Mengeja Suku Kata</span>
                </li>
                <li className="flex items-center gap-3 opacity-50">
                  <div className="w-8 h-8 bg-surface-container-highest rounded-lg flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">lock</span>
                  </div>
                  <span className="font-label-md text-on-surface">Kuis Unit Dasar</span>
                </li>
              </ul>
            </div>
            
            {/* AI Tutor Widget */}
            <div className="bg-tertiary-container text-white p-6 rounded-3xl clay-card flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <span className="material-symbols-outlined text-8xl">school</span>
              </div>
              <div className="floating-owl flex-shrink-0">
                <img 
                  alt="Mascot" 
                  className="w-20 h-20 drop-shadow-xl" 
                  src={maskotImg} 
                />
              </div>
              <div className="relative z-10">
                <p className="font-label-sm text-label-sm text-tertiary-fixed opacity-80 uppercase tracking-widest mb-1">AI Tutor</p>
                <h4 className="font-headline-sm font-bold leading-tight">Halo Raka! Siap untuk tantangan baru?</h4>
              </div>
            </div>
          </aside>

          {/* Bottom Floating Message Bar */}
          <footer className="absolute bottom-gutter left-1/2 -translate-x-1/2 w-full max-w-2xl px-gutter z-30">
            <div className="bg-inverse-surface/90 text-inverse-on-surface backdrop-blur-md px-8 py-4 rounded-full flex items-center justify-center gap-3 shadow-2xl border border-white/10 flex-wrap">
              <span className="material-symbols-outlined text-secondary-fixed">info</span>
              <p className="font-label-md text-label-md flex-1 text-center md:text-left">Selesaikan semua unit untuk mendapatkan kartu baru!</p>
              <button className="px-6 py-2 bg-primary text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg">
                Lanjutkan
              </button>
            </div>
          </footer>

        </div>
      </main>
    </div>
  );
};

export default TreeMap;
