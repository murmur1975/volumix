/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { resources, detectLanguage, createT } from './locales';

const I18nContext = createContext();

export function I18nProvider({ children }) {
    const [lang, setLang] = useState(detectLanguage());
    const t = createT(lang);

    // Checkout URLs for different languages
    const checkoutUrl = lang === 'ja'
        ? 'https://volumix.lemonsqueezy.com/buy/volumix-jp'  // TODO: Replace with actual JP checkout URL
        : 'https://volumix.lemonsqueezy.com/buy/volumix';     // TODO: Replace with actual EN checkout URL

    const value = {
        lang,
        setLang,
        t,
        checkoutUrl,
        availableLanguages: Object.keys(resources)
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}
