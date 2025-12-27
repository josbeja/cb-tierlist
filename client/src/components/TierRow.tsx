import { useRef, useState } from 'react';
import type { Tier, UnitMap } from '../types';
import { UnitCard } from './UnitCard';
import styles from './TierRow.module.css';

interface TierRowProps {
    tier: Tier;
    units: UnitMap;
    viewMode: 'scroll' | 'wrap';
}

export const TierRow: React.FC<TierRowProps> = ({ tier, units, viewMode }) => {
    // Map tier ID to CSS variable for color
    const tierColorVar = `--tier-${tier.id.toLowerCase().replace('*', 'situational')}`;

    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (viewMode !== 'scroll' || !sliderRef.current) return;
        setIsDown(true);
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDown(false);
    };

    const handleMouseUp = () => {
        setIsDown(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown || viewMode !== 'scroll' || !sliderRef.current) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast multiplier
        sliderRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (viewMode !== 'scroll' || !sliderRef.current) return;
        if (e.key === 'ArrowLeft') {
            sliderRef.current.scrollLeft -= 50;
        } else if (e.key === 'ArrowRight') {
            sliderRef.current.scrollLeft += 50;
        }
    };

    return (
        <div className={styles.row}>
            <div className={styles.label} style={{ backgroundColor: `var(${tierColorVar})` }}>
                <h2 className={styles.tierName}>{tier.id}</h2>
                <span className={styles.tierDesc}>{tier.description}</span>
            </div>
            <div
                ref={sliderRef}
                className={`${styles.units} ${viewMode === 'scroll' ? styles.unitsScroll : styles.unitsWrap} ${viewMode === 'scroll' ? (isDown ? styles.grabbing : styles.grab) : ''}`}
                tabIndex={0}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onKeyDown={handleKeyDown}
            >
                {tier.units.length > 0 ? (
                    tier.units.map((unitName) => (
                        <UnitCard
                            key={unitName}
                            name={unitName}
                            imageUrl={units[unitName]?.imageUrl}
                            hasGuide={units[unitName]?.hasGuide}
                        />
                    ))
                ) : (
                    <div className={styles.empty}>No units in this tier currently.</div>
                )}
            </div>
        </div>
    );
};
