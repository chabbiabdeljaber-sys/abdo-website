import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languageNames = {
    en: 'English',
    fr: 'Français',
  };

  const languageFlags = {
    en: '🇺🇸',
    fr: '🇫🇷',
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (language) => {
    changeLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-selector__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('selectLanguage')}
      >
        <span className="language-selector__flag">{languageFlags[currentLanguage]}</span>
        <span className="language-selector__text">{languageNames[currentLanguage]}</span>
        <span className={`language-selector__arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="language-selector__dropdown">
          {availableLanguages.map((language) => (
            <button
              key={language}
              className={`language-selector__option ${currentLanguage === language ? 'active' : ''}`}
              onClick={() => handleLanguageChange(language)}
            >
              <span className="language-selector__flag">{languageFlags[language]}</span>
              <span className="language-selector__text">{languageNames[language]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 