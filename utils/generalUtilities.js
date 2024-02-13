export const scrollToBottom = (containerRef) => {
    if (containerRef.current) {
        const container = containerRef.current;
        const lastEnd = container.lastElementChild;
        if (lastEnd) {
            lastEnd.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest', inlineSize: 1 });
        }
    }
};