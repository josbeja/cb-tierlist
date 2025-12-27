import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UnitCard.module.css';
import { processImageUrl } from '../utils/imageUtils';
import { FaBook } from 'react-icons/fa';

interface UnitCardProps {
    name: string;
    imageUrl?: string;
    hasGuide?: boolean;
}

export const UnitCard: React.FC<UnitCardProps> = ({ name, imageUrl, hasGuide }) => {
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!cardRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isVisible) {
                        setIsVisible(true);
                        // Process image URL only when card becomes visible
                        const processed = processImageUrl(imageUrl);
                        setImageSrc(processed);
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before card is visible
                threshold: 0.01
            }
        );

        observer.observe(cardRef.current);

        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, [imageUrl, isVisible]);

    const handleClick = () => {
        navigate(`/unit/${encodeURIComponent(name)}`);
    };

    return (
        <div ref={cardRef} className={styles.card} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <div className={styles.imageContainer}>
                {isVisible && imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={name}
                        className={styles.image}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                )}
            </div>
            <div className={styles.content}>
                <span className={styles.name}>{name}</span>
            </div>
            <div className={styles.glow} />
            {hasGuide && (
                <div className={styles.guideIndicator}>
                    <FaBook />
                </div>
            )}
        </div>
    );
};
