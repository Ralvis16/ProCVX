// ProCVX - Application configuration
(function (global) {
    global.ProCVXConfig = Object.freeze({
        defaultLanguage: 'es',
        // Donation page (Ko-fi, Buy Me a Coffee...). Leave empty to hide the donate link.
        donateUrl: 'https://buymeacoffee.com/raniell166',
        storageKeys: Object.freeze({
            language: 'procvx_lang',
            state: 'procvx-state',
            sectionOrder: 'procvx-section-order',
            theme: 'procvx-theme',
            template: 'procvx-template'
        })
    });
})(window);
