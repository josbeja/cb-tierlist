import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UnitCard.module.css';
import { processImageUrl } from '../utils/imageUtils';

interface UnitCardProps {
    name: string;
    imageUrl?: string;
}

export const UnitCard: React.FC<UnitCardProps> = ({ name, imageUrl }) => {
    const processedImage = processImageUrl(imageUrl);
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/unit/${encodeURIComponent(name)}`);
    };

    return (
        <div className={styles.card} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <div className={styles.imageContainer}>
                {processedImage ? (
                    <img
                        src={processedImage}
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
        </div>
    );
};
