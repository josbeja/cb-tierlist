import React from 'react';
import { Shield } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
    lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({ lastUpdated }) => {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Shield className={styles.icon} size={32} />
                <h1>Conqueror's Blade <span className={styles.subtitle}>Units Tierlist</span></h1>
            </div>
            <div className={styles.meta}>
                Last Updated: {lastUpdated || 'Loading...'}
            </div>
        </header>
    );
};
