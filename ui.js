// ProCVX - UI integration helpers
(function (global) {
    function createIcons(root) {
        if (!global.ProCVXIcons) return;
        try {
            global.ProCVXIcons.createIcons(root ? { root } : undefined);
        } catch (error) {
            // Icon rendering is optional and must not block the editor.
        }
    }

    // Small non-blocking notification (replaces window.alert).
    // type: 'success' | 'error' | 'info'
    // action (optional): { label, href } renders a link inside the toast
    function toast(message, type = 'info', duration = 3500, action = null) {
        const region = global.document.getElementById('toast-region');
        if (!region || !message) return;
        const el = global.document.createElement('div');
        el.className = `toast toast-${type}`;
        el.setAttribute('role', type === 'error' ? 'alert' : 'status');
        el.textContent = message;
        if (action && action.href) {
            const link = global.document.createElement('a');
            link.className = 'toast-action';
            link.href = action.href;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = action.label;
            link.addEventListener('click', e => e.stopPropagation());
            el.append(' ', link);
        }
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
