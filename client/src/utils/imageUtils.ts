export const processImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;

    // Handle Google Drive links
    // Format: https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
    if (url.includes('drive.google.com')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            // using /thumbnail endpoint is more reliable for embedding than /uc
            // sz=w1000 requests a width of 1000px
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
    }

    return url;
};
