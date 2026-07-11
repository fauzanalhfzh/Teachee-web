import React from 'react';
import backgroundImg from '../background.jpeg';
import jerukImg from '../assets/jeruk.png';
import belimbingImg from '../assets/belimbing.png';
import apelImg from '../assets/apel.png';

const MainContent = ({ onSelectSubject }) => {
  return (
    <main className="w-full min-h-[calc(100dvh-4rem)] relative overflow-hidden flex flex-col">
      {/* Interactive Landscape Container */}
      <div className="relative w-full flex-grow flex items-center justify-center p-6 md:p-lg">
        
        {/* Background Image Base (Full screen edge-to-edge) */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          <img 
            alt="Magical Tree of Knowledge Landscape" 
            className="w-full h-full object-cover object-[65%_center]"
            src={backgroundImg} 
          />
          {/* Overlay Gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-tint/40 via-transparent to-surface/10 mix-blend-multiply pointer-events-none"></div>
        </div>

        {/* Centered Subject Grid (Large Tactile Cards) */}
        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-8 pointer-events-none">
          
          {/* Headline for the grid */}
          <h2 className="font-headline-xl text-3xl md:text-headline-xl text-white text-shadow-glow text-center font-extrabold tracking-tight drop-shadow-md">
            Pilih Petualangan Belajarmu!
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 w-full justify-items-center">
            
            {/* Card 1: Bahasa Indonesia */}
            <button 
              className="glass-panel w-48 h-72 sm:w-56 sm:h-80 rounded-[32px] p-6 flex flex-col items-center justify-center border-2 border-primary-container/20 hover:border-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer shadow-ambient-tier-2 hover:shadow-ambient-tier-3 group"
              onClick={() => onSelectSubject('bahasa')}
            >
              {/* Fruit Image Container */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary-fixed rounded-full shadow-glow-fruit flex items-center justify-center border-4 border-secondary-fixed-dim transition-transform duration-300 group-hover:rotate-12 group-active:scale-95 animate-float" style={{ animationDelay: '0s' }}>
                <img src={jerukImg} alt="Orange" className="w-full h-full object-cover rounded-full" />
              </div>
              {/* Subject Title */}
              <span className="mt-4 font-headline-md text-lg sm:text-headline-md text-primary dark:text-inverse-primary text-center font-bold tracking-tight leading-snug">
                Bahasa Indonesia
              </span>
              {/* Play/Mulai Badge */}
              <span className="mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-inverse-primary/20 dark:text-inverse-primary text-label-sm font-semibold group-hover:bg-primary group-hover:text-white transition-all duration-300">
                Mulai Belajar
              </span>
            </button>

            {/* Card 2: IPA */}
            <button 
              className="glass-panel w-48 h-72 sm:w-56 sm:h-80 rounded-[32px] p-6 flex flex-col items-center justify-center border-2 border-primary-container/20 hover:border-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer shadow-ambient-tier-2 hover:shadow-ambient-tier-3 group"
              onClick={() => onSelectSubject('ipa')}
            >
              {/* Fruit Image Container */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[#a8e7c5] rounded-full shadow-[0_0_20px_rgba(168,231,197,0.8),inset_0_-4px_10px_rgba(0,0,0,0.2)] flex items-center justify-center border-4 border-primary-container transition-transform duration-300 group-hover:rotate-12 group-active:scale-95 animate-float animate-pulse-glow" style={{ animationDelay: '0.5s' }}>
                <img src={belimbingImg} alt="Pear" className="w-full h-full object-cover rounded-full" />
              </div>
              {/* Subject Title */}
              <span className="mt-4 font-headline-md text-lg sm:text-headline-md text-primary dark:text-inverse-primary text-center font-bold tracking-tight leading-snug">
                IPA
              </span>
              {/* Play/Mulai Badge */}
              <span className="mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-inverse-primary/20 dark:text-inverse-primary text-label-sm font-semibold group-hover:bg-primary group-hover:text-white transition-all duration-300">
                Mulai Belajar
              </span>
            </button>

            {/* Card 3: Matematika */}
            <button 
              className="glass-panel w-48 h-72 sm:w-56 sm:h-80 rounded-[32px] p-6 flex flex-col items-center justify-center border-2 border-primary-container/20 hover:border-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto cursor-pointer shadow-ambient-tier-2 hover:shadow-ambient-tier-3 group"
              onClick={() => onSelectSubject('matematika')}
            >
              {/* Fruit Image Container */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-tertiary-fixed rounded-full shadow-[0_0_20px_rgba(179,235,255,0.8),inset_0_-4px_10px_rgba(0,0,0,0.2)] flex items-center justify-center border-4 border-tertiary-container transition-transform duration-300 group-hover:rotate-12 group-active:scale-95 animate-float animate-pulse-glow" style={{ animationDelay: '1s' }}>
                <img src={apelImg} alt="Apple" className="w-full h-full object-cover rounded-full" />
              </div>
              {/* Subject Title */}
              <span className="mt-4 font-headline-md text-lg sm:text-headline-md text-primary dark:text-inverse-primary text-center font-bold tracking-tight leading-snug">
                Matematika
              </span>
              {/* Play/Mulai Badge */}
              <span className="mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-inverse-primary/20 dark:text-inverse-primary text-label-sm font-semibold group-hover:bg-primary group-hover:text-white transition-all duration-300">
                Mulai Belajar
              </span>
            </button>

          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
