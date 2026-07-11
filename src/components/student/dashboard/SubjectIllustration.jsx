import React from 'react';

const IllustrationSvg = ({ type, className = '' }) => {
  const common = 'w-full h-full';

  if (type === 'computer') {
    return (
      <svg viewBox="0 0 200 160" className={`${common} ${className}`} fill="none" aria-hidden>
        <rect x="30" y="24" width="140" height="90" rx="16" fill="#D1FAE5" stroke="#0F5238" strokeWidth="2" />
        <rect x="44" y="38" width="112" height="58" rx="8" fill="#ECFDF5" />
        <path d="M58 72h84M58 58h52" stroke="#6EE7B7" strokeWidth="4" strokeLinecap="round" />
        <rect x="70" y="114" width="60" height="8" rx="4" fill="#0F5238" opacity="0.25" />
        <circle cx="156" cy="44" r="18" fill="#A7F3D0" />
        <path d="M150 44l4 4 8-8" stroke="#0F5238" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (type === 'math') {
    return (
      <svg viewBox="0 0 200 160" className={`${common} ${className}`} fill="none" aria-hidden>
        <circle cx="100" cy="80" r="56" fill="#DBEAFE" />
        <path d="M72 92l20-36 20 36M82 84h20" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="126" y="42" width="34" height="34" rx="8" fill="#BFDBFE" />
        <path d="M136 59h14M143 52v14" stroke="#1D4ED8" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'language') {
    return (
      <svg viewBox="0 0 200 160" className={`${common} ${className}`} fill="none" aria-hidden>
        <rect x="42" y="30" width="88" height="104" rx="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
        <path d="M58 58h56M58 76h44M58 94h36" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="146" cy="58" r="24" fill="#FDE68A" />
        <path d="M136 58h20M146 48v20" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'science') {
    return (
      <svg viewBox="0 0 200 160" className={`${common} ${className}`} fill="none" aria-hidden>
        <path d="M78 34h44l18 58-40 34-40-34 18-58z" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
        <circle cx="100" cy="78" r="10" fill="#86EFAC" />
        <path d="M126 42c10 8 16 18 16 30" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
        <rect x="132" y="96" width="28" height="28" rx="8" fill="#BBF7D0" />
      </svg>
    );
  }

  if (type === 'history') {
    return (
      <svg viewBox="0 0 200 160" className={`${common} ${className}`} fill="none" aria-hidden>
        <path d="M52 118V54l48-22 48 22v64H52z" fill="#F5F5F4" stroke="#78716C" strokeWidth="2" />
        <rect x="78" y="72" width="44" height="46" rx="4" fill="#E7E5E4" />
        <path d="M88 88h24M88 100h18" stroke="#A8A29E" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="48" r="8" fill="#D6D3D1" />
      </svg>
    );
  }

  if (type === 'art') {
    return (
      <svg viewBox="0 0 200 160" className={`${common} ${className}`} fill="none" aria-hidden>
        <circle cx="100" cy="84" r="48" fill="#F3E8FF" stroke="#9333EA" strokeWidth="2" />
        <circle cx="82" cy="74" r="8" fill="#F472B6" />
        <circle cx="112" cy="68" r="8" fill="#60A5FA" />
        <circle cx="118" cy="96" r="8" fill="#FBBF24" />
        <circle cx="86" cy="100" r="8" fill="#34D399" />
        <path d="M132 42l10 10-18 18" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 160" className={`${common} ${className}`} fill="none" aria-hidden>
      <rect x="48" y="36" width="104" height="88" rx="18" fill="#ECFDF5" stroke="#0F5238" strokeWidth="2" />
      <path d="M68 72h64M68 88h48M68 104h36" stroke="#6EE7B7" strokeWidth="4" strokeLinecap="round" />
      <circle cx="146" cy="52" r="16" fill="#A7F3D0" />
    </svg>
  );
};

const SubjectIllustration = ({ type = 'default', className = '', size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'w-40 h-32' : size === 'sm' ? 'w-20 h-16' : 'w-28 h-22';
  return (
    <div className={`${sizeClass} ${className}`}>
      <IllustrationSvg type={type} />
    </div>
  );
};

export default SubjectIllustration;
