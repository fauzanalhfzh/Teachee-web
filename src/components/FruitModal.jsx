import React, { useState } from 'react';
import apelImg from '../assets/apel.png';
import belimbingImg from '../assets/belimbing.png';
import jerukImg from '../assets/jeruk.png';

const quizData = {
  bahasa: {
    title: 'Tantangan Bahasa Indonesia 🍊',
    question: "Apakah antonim (lawan kata) dari kata 'Cepat'?",
    image: jerukImg,
    color: '#ff9800',
    options: [
      { text: 'Lambat', isCorrect: true },
      { text: 'Tinggi', isCorrect: false },
      { text: 'Lebar', isCorrect: false },
      { text: 'Kecil', isCorrect: false }
    ]
  },
  ipa: {
    title: 'Tantangan IPA 🌟',
    question: 'Hewan apakah yang bisa hidup di darat dan di air?',
    image: belimbingImg,
    color: '#4caf50',
    options: [
      { text: 'Ikan', isCorrect: false },
      { text: 'Burung', isCorrect: false },
      { text: 'Katak', isCorrect: true },
      { text: 'Kucing', isCorrect: false }
    ]
  },
  matematika: {
    title: 'Tantangan Matematika 🍎',
    question: 'Berapakah hasil dari 15 - 7?',
    image: apelImg,
    color: '#f44336',
    options: [
      { text: '6', isCorrect: false },
      { text: '7', isCorrect: false },
      { text: '8', isCorrect: true },
      { text: '9', isCorrect: false }
    ]
  }
};

const FruitModal = ({ subjectType, onClose, onCorrectAnswer }) => {
  const data = quizData[subjectType];
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  if (!data) return null;

  const handleOptionClick = (option) => {
    if (isAnswered) return;
    setSelectedOption(option.text);
    setIsAnswered(true);

    if (option.isCorrect) {
      setIsWrong(false);
      setTimeout(() => {
        onCorrectAnswer(50); // reward 50 koin
      }, 500);
    } else {
      setIsWrong(true);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsWrong(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn animate-none" onClick={onClose}>×</button>

        {/* Modal Header Icon */}
        <div className="modal-fruit-header" style={{ '--accent-color': data.color }}>
          <img src={data.image} alt={subjectType} className="modal-fruit-img" />
        </div>

        {/* Modal Title */}
        <h2 className="modal-title">{data.title}</h2>

        {/* Quiz Content */}
        {!isAnswered ? (
          <div className="quiz-section">
            <p className="quiz-question">{data.question}</p>
            <div className="quiz-options">
              {data.options.map((option, idx) => (
                <button
                  key={idx}
                  className="quiz-option-btn"
                  onClick={() => handleOptionClick(option)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="result-section">
            {!isWrong ? (
              <div className="success-state animate-bounce">
                <div className="success-icon text-4xl mb-4">🎉</div>
                <p className="result-message-title font-bold text-lg text-primary">Hore, Jawabanmu Benar!</p>
                <p className="result-message-desc text-sm text-secondary-container">Kamu mendapatkan bonus +50 Koin Pengetahuan!</p>
                <button className="btn-modal-action mt-4" onClick={onClose}>Lanjutkan Petualangan</button>
              </div>
            ) : (
              <div className="fail-state">
                <div className="fail-icon text-4xl mb-4">💡</div>
                <p className="result-message-title font-bold text-lg text-primary">Hampir Tepat!</p>
                <p className="result-message-desc text-sm text-secondary-container">Ayo coba lagi, kamu pasti bisa!</p>
                <button className="btn-modal-action retry-btn mt-4" onClick={handleRetry}>Coba Lagi</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FruitModal;
