// Helper function to copy to clipboard
const copyToClipboardFallback = (text: string): boolean => {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;

        // Avoid scrolling to bottom
        textarea.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0; pointerEvents: none;';
        document.body.appendChild(textarea);

        if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
            // Handle iOS devices
            textarea.contentEditable = 'true';
            textarea.readOnly = false;

            const range = document.createRange();
            range.selectNodeContents(textarea);

            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
                textarea.setSelectionRange(0, 999999);
            }
        } else {
            // Handle other devices
            textarea.select();
        }

        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
    } catch (err) {
        console.error('Fallback clipboard copy failed:', err);
        return false;
    }
};

export const copyToClipboardText = async (text: string): Promise<boolean> => {
    // First try the modern Clipboard API
    if (navigator?.clipboard) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('Modern clipboard API failed:', err);
            // Fall through to fallback
            return false;
        }
    }

    // Fallback for non-secure contexts or if modern method fails
    return copyToClipboardFallback(text);
};

export const copyHTMLSectionContent = async (elementRef: React.RefObject<HTMLElement | null>): Promise<boolean> => {
    if (!elementRef.current) {
        console.error('Element reference not found');
        return false;
    }

    const element = elementRef.current;
    const elementHTML = element.outerHTML;
    const elementText = element.innerText;

    // Try modern ClipboardItem API first (supports both HTML and plain text)
    if (navigator?.clipboard?.write) {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob([elementHTML], { type: 'text/html' }),
                    'text/plain': new Blob([elementText], { type: 'text/plain' }),
                }),
            ]);
            return true;
        } catch (err) {
            console.warn('ClipboardItem API failed, falling back to text-only copy:', err);
            // Fall through to text-only copy
        }
    }

    // Fallback to text-only copy using existing utility
    return copyToClipboardText(elementText);
};

export const getNameInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};