export const processImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;

    // Cloudinary URLs work directly
    if (url.includes('cloudinary.com')) {
        return url;
    }

    // Handle Google Drive links (fallback for any remaining Drive URLs)
    if (url.includes('drive.google.com')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
    }

    // Return URL as-is for other sources
    return url;
};
