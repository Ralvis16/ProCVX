// ProCVX - UI integration helpers
(function (global) {
    function createIcons(root) {
        if (typeof global.lucide === 'undefined' || !global.lucide.createIcons) return;
        try {
            global.lucide.createIcons(root ? { nameAttr: 'data-lucide', root } : undefined);
        } catch (error) {
            // Icon rendering is optional and must not block the editor.
        }
    }

    // Small non-blocking notification (replaces window.alert).
    // type: 'success' | 'error' | 'info'
    function toast(message, type = 'info', duration = 3500) {
        const region = global.document.getElementById('toast-region');
        if (!region || !message) return;
        const el = global.document.createElement('div');
        el.className = `toast toast-${type}`;
        el.setAttribute('role', type === 'error' ? 'alert' : 'status');
        el.textContent = message;
        region.appendChild(el);
        // Next frame so the CSS transition runs
        global.requestAnimationFrame(() => el.classList.add('visible'));
        const remove = () => {
            el.classList.remove('visible');
            global.setTimeout(() => el.remove(), 250);
        };
        global.setTimeout(remove, type === 'error' ? Math.max(duration, 6000) : duration);
        el.addEventListener('click', remove);
    }

    global.ProCVXUI = Object.freeze({ createIcons, toast });
})(window);
