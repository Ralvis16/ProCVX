// ProCVX - UI integration helpers
(function (global) {
    function createIcons() {
        if (typeof global.lucide === 'undefined' || !global.lucide.createIcons) return;
        try {
            global.lucide.createIcons();
        } catch (error) {
            // Icon rendering is optional and must not block the editor.
        }
    }

    global.ProCVXUI = Object.freeze({ createIcons });
})(window);
