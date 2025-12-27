import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './GuideViewer.css';

interface GuideViewerProps {
    unitSlug: string;
}

export const GuideViewer: React.FC<GuideViewerProps> = ({ unitSlug }) => {
    const { i18n } = useTranslation();
    const [markdown, setMarkdown] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadGuide = async () => {
            setLoading(true);
            setError(false);

            try {
                // Try current language first
                let response = await fetch(`/guides/${i18n.language}/${unitSlug}.md`);

                if (!response.ok) {
                    // Fallback to Spanish
                    response = await fetch(`/guides/es/${unitSlug}.md`);

                    if (!response.ok) {
                        throw new Error('Guide not found');
                    }
                }

                const content = await response.text();
                setMarkdown(content);
            } catch (err) {
                console.error('Error loading guide:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (unitSlug) {
            loadGuide();
        }
    }, [unitSlug, i18n.language]);

    if (loading) {
        return (
            <div className="guide-loading">
                <div className="spinner"></div>
                <p>Loading guide...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="guide-error">
                <h2>Guide Not Available</h2>
                <p>This unit guide is not available yet. Check back soon!</p>
            </div>
        );
    }

    return (
        <div className="guide-viewer">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    img: ({ src, alt, ...props }) => {
                        const isAbsolute = src?.startsWith('http');
                        const isRootPath = src?.startsWith('/');
                        const finalSrc = isAbsolute || isRootPath ? src : `/guides/media/images/${src}`;

                        return (
                            <img
                                src={finalSrc}
                                alt={alt || 'Guide image'}
                                loading="lazy"
                                {...props}
                            />
                        );
                    },
                    video: ({ src, ...props }) => {
                        const isAbsolute = src?.startsWith('http');
                        const isRootPath = src?.startsWith('/');
                        const finalSrc = isAbsolute || isRootPath ? src : `/guides/media/videos/${src}`;

                        return (
                            <video
                                src={finalSrc}
                                controls
                                preload="metadata"
                                {...props}
                            />
                        );
                    },
                    a: ({ href, children, ...props }) => (
                        <a
                            href={href}
                            target={href?.startsWith('http') ? '_blank' : undefined}
                            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                            {...props}
                        >
                            {children}
                        </a>
                    )
                }}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
};
