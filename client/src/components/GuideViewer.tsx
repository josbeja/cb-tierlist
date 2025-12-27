import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import './GuideViewer.css';

interface GuideHeading {
    id: string;
    text: string;
    level: number;
}

interface GuideViewerProps {
    unitSlug: string;
    onLoaded?: (hasContent: boolean, headings?: GuideHeading[]) => void;
}

export const GuideViewer: React.FC<GuideViewerProps> = ({ unitSlug, onLoaded }) => {
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

                // Extract headings for TOC
                // We're looking for # Heading (h1) -> we usually skip h1 if it matches unit name
                // ## Heading (h2)
                // ### Heading (h3)
                const headings: GuideHeading[] = [];
                const lines = content.split('\n');
                let inCodeBlock = false;
                const slugger = new GithubSlugger();

                lines.forEach(line => {
                    if (line.trim().startsWith('```')) {
                        inCodeBlock = !inCodeBlock;
                        return;
                    }
                    if (inCodeBlock) return;

                    const match = line.match(/^(#{2,3})\s+(.+)$/);
                    if (match) {
                        const level = match[1].length;
                        const text = match[2];
                        const id = slugger.slug(text);

                        headings.push({ id, text, level });
                    }
                });

                if (onLoaded) onLoaded(true, headings);
            } catch (err) {
                console.error('Error loading guide:', err);
                setError(true);
                if (onLoaded) onLoaded(false);
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
                rehypePlugins={[rehypeRaw, rehypeSlug]}
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
