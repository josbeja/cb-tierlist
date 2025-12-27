import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('https://cb-tierlist-server.onrender.com/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim() || undefined,
                    content
                }),
            });

            if (response.ok) {
                alert(t('feedback.success'));
                onClose();
                setName('');
                setContent('');
            } else {
                alert(t('feedback.error'));
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            alert(t('feedback.errorNetwork'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles.modal}>
                <h2 className={styles.title}>{t('feedback.title')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="name">{t('feedback.nameLabel')}</label>
                        <input
                            id="name"
                            type="text"
                            className={styles.input}
                            placeholder={t('feedback.namePlaceholder')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="content">{t('feedback.feedbackLabel')}</label>
                        <textarea
                            id="content"
                            className={styles.textarea}
                            required
                            maxLength={500}
                            placeholder={t('feedback.feedbackPlaceholder')}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                            {content.length}/500
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={`${styles.button} ${styles.cancelBtn}`}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            {t('feedback.cancel')}
                        </button>
                        <button
                            type="submit"
                            className={`${styles.button} ${styles.submitBtn}`}
                            disabled={isSubmitting || !content.trim()}
                        >
                            {isSubmitting ? t('feedback.sending') : t('feedback.send')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
