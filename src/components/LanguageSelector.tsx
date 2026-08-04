'use client';

import { useTranslation } from '@/lib/useTranslation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export function LanguageSelector() {
  const { language, setLanguage, languages } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#F9F9F9',
          border: '1px solid #E8E8E8',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 500,
          color: '#2C2C2C',
        }}
      >
        <Globe size={14} />
        {languages[language].flag} {languages[language].native}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E8E8',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
            minWidth: '200px',
          }}
        >
          {(Object.entries(languages) as any[]).map(([lang, config]) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang as any);
                setOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: lang === language ? '#F0F7FF' : '#FFFFFF',
                color: '#2C2C2C',
                cursor: 'pointer',
                borderBottom: '1px solid #F0F0F0',
                fontSize: '12px',
              }}
            >
              {config.flag} {config.native} ({config.name})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
