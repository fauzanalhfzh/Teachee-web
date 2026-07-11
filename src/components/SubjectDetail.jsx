import React from 'react';
import backgroundImg from '../background.jpeg';
import maskotImg from '../assets/maskot.png';
import jerukImg from '../assets/jeruk.png';
import belimbingImg from '../assets/belimbing.png';
import apelImg from '../assets/apel.png';

const subjectDetails = {
  bahasa: {
    title: 'Bahasa Indonesia',
    image: jerukImg,
    level: 'Level 2',
    progress: 60,
    colorClass: 'border-secondary-fixed-dim bg-secondary-fixed shadow-glow-fruit'
  },
  ipa: {
    title: 'IPA',
    image: belimbingImg,
    level: 'Level 1',
    progress: 35,
    colorClass: 'border-primary-container bg-[#a8e7c5] shadow-[0_0_20px_rgba(168,231,197,0.8),inset_0_-4px_10px_rgba(0,0,0,0.2)]'
  },
  matematika: {
    title: 'Matematika',
    image: apelImg,
    level: 'Level 3',
    progress: 49,
    colorClass: 'border-tertiary-container bg-tertiary-fixed shadow-[0_0_20px_rgba(179,235,255,0.8),inset_0_-4px_10px_rgba(0,0,0,0.2)]'
  }
};

const CoinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="var(--color-coin-gold, #fdb913)" />
    <circle cx="12" cy="12" r="8" fill="none" stroke="#fff" strokeWidth="1.5" />
    <text x="12" y="16.5" fontSize="13" fontWeight="900" textAnchor="middle" fill="#fff" fontFamily="var(--font-kids)">$</text>
  </svg>
);

const SubjectDetail = ({ subjectType, coins, onBack, onPlay }) => {
  const detail = subjectDetails[subjectType];
  
  if (!detail) return null;

  return (
    <div className="fixed inset-0 z-50 w-full h-full overflow-hidden flex flex-col items-center justify-center p-6 page-transition-enter">
      
      {/* Background Image Base */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <img 
          alt="Landscape Background" 
          className="w-full h-full object-cover object-[65%_center]"
          src={backgroundImg} 
        />
        {/* Dark overlay for detail view contrast */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      </div>

      {/* Header Actions Overlay */}
      <div className="absolute top-0 left-0 w-full z-10 flex justify-between items-center p-6 md:p-8 pointer-events-none">
        
        {/* Back Button */}
        <button 
          className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto"
          onClick={onBack}
        >
          <span className="material-symbols-outlined text-2xl font-bold">arrow_back</span>
        </button>

        {/* Coins Pill */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg pointer-events-auto border border-primary-container/10">
          <span className="flex items-center">
            <CoinIcon />
          </span>
          <span className="text-[#6b4d00] font-black text-sm md:text-base">
            {coins.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Main Container Layout with Mascot Peeking */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg z-10">
        
        {/* Fox Mascot peeking from behind the card */}
        <div className="absolute -right-24 bottom-4 w-44 h-auto pointer-events-none z-0 transform translate-x-4 animate-float opacity-90">
          <img src={maskotImg} alt="Fox Mascot" className="w-full h-full object-contain" />
        </div>

        {/* Central Tactile Subject Card */}
        <div className="bg-white rounded-[32px] p-8 w-full max-w-[390px] flex flex-col items-center shadow-2xl relative z-10 border-2 border-primary-container/10 animate-scale-up">
          
          {/* Fruit Ring Wrapper */}
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center animate-float ${detail.colorClass}`}>
            <img src={detail.image} alt={detail.title} className="w-full h-full object-cover rounded-full" />
          </div>

          {/* Subject Title */}
          <h2 className="mt-6 font-headline-md text-2xl text-primary font-bold tracking-tight">
            {detail.title}
          </h2>

          {/* Progress Container inside card */}
          <div className="w-full bg-[#f2f4f0] rounded-2xl p-4 my-6 text-left border border-outline-variant/15 flex flex-col">
            
            <div className="flex justify-between items-center mb-2 font-bold text-primary">
              <span className="text-sm">{detail.title}</span>
              <span className="text-xs bg-primary-fixed/20 text-primary-container px-2 py-0.5 rounded-full">
                {detail.level}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress bar line */}
              <div className="flex-grow bg-outline-variant/30 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-[#aa3bff] h-full rounded-full shadow-md"
                  style={{ width: `${detail.progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-outline">
                {detail.progress}%
              </span>
            </div>
          </div>

          {/* Play Button */}
          <button 
            className="w-16 h-16 rounded-full bg-primary hover:bg-[#1b6d4b] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg"
            onClick={onPlay}
          >
            <span className="material-symbols-outlined text-3xl font-black">play_arrow</span>
          </button>
          
          {/* Subtitle Caption */}
          <span className="mt-3 text-xs font-bold text-outline uppercase tracking-wider">
            Teacherware
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetail;
