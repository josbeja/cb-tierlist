import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Header } from './Header';

interface LayoutProps {
    children: React.ReactNode;
    lastUpdated?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, lastUpdated }) => {
    const [userCount, setUserCount] = useState<number>(0);

    useEffect(() => {
        const socket = io('https://cb-tierlist-server.onrender.com:3001');

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('userCount', (count: number) => {
            setUserCount(count);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="container">
            <Header lastUpdated={lastUpdated} />
            <main>
                {children}
            </main>
            <footer style={{ marginTop: '4rem', padding: '2rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem', position: 'relative' }}>
                {/* Left: User Counter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '200px' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ff4444',
                        borderRadius: '50%',
                        boxShadow: '0 0 8px #ff4444'
                    }} />
                    <span>{userCount} user{userCount !== 1 ? 's' : ''} online</span>
                </div>

                {/* Center: Credits */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ margin: 0 }}>Made by <strong>Zombyjab</strong> from <strong>Elysium Peak</strong> server.</p>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <a
                            href="https://twitch.tv/zombyjab"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Twitch"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#9146FF',
                                borderRadius: '4px',
                                color: '#fff',
                                textDecoration: 'none',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                            </svg>
                        </a>
                        <a
                            href="https://kick.com/zombyjab"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Kick"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#53FC18',
                                borderRadius: '4px',
                                color: '#000000ff',
                                textDecoration: 'none',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
                                <path d="M37 .036h164.448v113.621h54.71v-56.82h54.731V.036h164.448v170.777h-54.73v56.82h-54.711v56.8h54.71v56.82h54.73V512.03H310.89v-56.82h-54.73v-56.8h-54.711v113.62H37V.036z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.youtube.com/c/zombyjab"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="YouTube"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#FF0000',
                                borderRadius: '4px',
                                color: '#fff',
                                textDecoration: 'none',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Right: Spacer for balance */}
                <div style={{ width: '200px' }} />
            </footer>
        </div>
    );
};
