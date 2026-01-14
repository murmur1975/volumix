/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { resources, detectLanguage, createT } from './locales';

const I18nContext = createContext();

export function I18nProvider({ children }) {
    const [lang, setLang] = useState(detectLanguage());
    const t = createT(lang);

    // Checkout URLs for different languages
    const checkoutUrl = lang === 'ja'
        ? 'https://tryxlab.lemonsqueezy.com/checkout/buy/6713bd8c-8b0e-4c53-8788-9bfd1796b3ce'
        : 'https://tryxlab.lemonsqueezy.com/checkout/buy/d24d927e-7186-493d-a7e2-2af0860f7918';

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
