// ProCVX - Application configuration
(function (global) {
    global.ProCVXConfig = Object.freeze({
        defaultLanguage: 'es',
        storageKeys: Object.freeze({
            language: 'procvx_lang',
            state: 'procvx-state',
            sectionOrder: 'procvx-section-order',
            theme: 'procvx-theme',
            template: 'procvx-template'
        })
    });
})(window);
