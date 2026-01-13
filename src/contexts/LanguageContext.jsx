import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en.json';
import ja from '../locales/ja.json';

const translations = { en, ja };

const LanguageContext = createContext();

/**
 * 言語プロバイダー
 * アプリ全体の言語状態を管理
 */
export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState('ja'); // デフォルトは日本語
    const [isLoading, setIsLoading] = useState(true);

    // 起動時に保存済み言語を読み込み
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                if (window.electronAPI && window.electronAPI.getLanguage) {
                    const savedLang = await window.electronAPI.getLanguage();
                    if (savedLang && translations[savedLang]) {
                        setLanguageState(savedLang);
                    }
                }
            } catch (err) {
                console.error('Failed to load language setting:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadLanguage();
    }, []);

    // 言語を変更して保存
    const setLanguage = useCallback(async (lang) => {
        if (!translations[lang]) return;

        setLanguageState(lang);

        try {
            if (window.electronAPI && window.electronAPI.setLanguage) {
                await window.electronAPI.setLanguage(lang);
            }
        } catch (err) {
            console.error('Failed to save language setting:', err);
        }
    }, []);

    // 翻訳を取得
    const t = useCallback((key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    }, [language]);

    // テンプレート付き翻訳（例: "{count}ファイル" → "5ファイル"）
    const tFormat = useCallback((key, params = {}) => {
        let text = t(key);

        Object.entries(params).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, v);
        });

        return text;
    }, [t]);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            tFormat,
            isLoading,
            languages: Object.keys(translations)
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * 言語フック
 */
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
