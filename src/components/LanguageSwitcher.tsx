'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' }
];

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = useLocale();
  const router = useRouter();

  const switchLanguage = (code: string) => {
    document.cookie = `locale=${code}; path=/; max-age=31536000`;
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Change language"
        className="flex items-center justify-center p-2.5 rounded-full bg-white shadow-sm hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors text-zinc-600 hover:text-zinc-900"
      >
        <Globe className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-md border border-zinc-100 overflow-hidden z-50 p-1"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
                >
                  {lang.name}
                  {currentLocale === lang.code && (
                    <Check className="w-4 h-4 text-zinc-900" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
