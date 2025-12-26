import React, { useState } from 'react';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${window.location.protocol}//${window.location.hostname}:3001/api/feedback`, {
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
                alert('Feedback sent! Thank you.');
                onClose();
                setName('');
                setContent('');
            } else {
                alert('Failed to send feedback. Please try again.');
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            alert('An error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles.modal}>
                <h2 className={styles.title}>Send Feedback</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="name">Name (Optional)</label>
                        <input
                            id="name"
                            type="text"
                            className={styles.input}
                            placeholder="Anonimo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="content">Feedback</label>
                        <textarea
                            id="content"
                            className={styles.textarea}
                            required
                            maxLength={500}
                            placeholder="Write your feedback here (max 500 characters)..."
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
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`${styles.button} ${styles.submitBtn}`}
                            disabled={isSubmitting || !content.trim()}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
