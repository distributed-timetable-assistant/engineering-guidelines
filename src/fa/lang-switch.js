
const langSwitch = () => {
    const rightButtons = document.querySelector('.right-buttons');
    if (!rightButtons) return;

    if (document.getElementById('language-toggle')) return;

    const currentPath = window.location.pathname;
    const isEn = currentPath.includes('/en/');
    const isFa = currentPath.includes('/fa/');

    // Only show if we are clearly in one of the known paths
    if (!isEn && !isFa) return;

    const targetPath = isEn
        ? currentPath.replace('/en/', '/fa/')
        : currentPath.replace('/fa/', '/en/');

    const title = isEn ? 'Switch to Persian' : 'تغییر زبان به انگلیسی';

    const link = document.createElement('a');
    link.id = 'language-toggle';
    link.href = targetPath;
    link.title = title;
    link.ariaLabel = title;

    // Match mdbook style
    link.style.cursor = 'pointer';

    const icon = document.createElement('i');
    icon.className = 'fa fa-language';

    link.appendChild(icon);

    // Insert before the print button if it exists, otherwise append
    const printButton = rightButtons.querySelector('[aria-label="Print this book"]');
    if (printButton) {
        rightButtons.insertBefore(link, printButton);
    } else {
        rightButtons.appendChild(link);
    }
};

// Run on load
window.addEventListener('load', langSwitch);
