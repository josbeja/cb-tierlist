import React, { useState } from 'react';
import { Shield, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './Header.module.css';
import { FeedbackModal } from './FeedbackModal';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
    lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated }) => {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <Shield className={styles.icon} size={32} />
                    <h1>{t('header.subtitle')} <span className={styles.subtitle}>{t('header.title')}</span></h1>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div className={styles.meta}>
                        {t('header.lastUpdated')}: {lastUpdated || 'Loading...'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <LanguageSelector />
                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--color-gold)',
                                color: 'var(--color-gold)',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--color-gold)';
                                e.currentTarget.style.color = '#000';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--color-gold)';
                            }}
                        >
                            <MessageSquare size={16} />
                            {t('header.feedback')}
                        </button>
                    </div>
                </div>
            </header>
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />
        </>
    );
};

