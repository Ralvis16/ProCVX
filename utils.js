// ProCVX - Pure text utilities
(function (global) {
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDescHtml(text) {
        let html = '';
        let inList = false;
        const closeList = () => {
            if (inList) { html += '</ul>'; inList = false; }
        };
        String(text ?? '').split('\n').forEach(raw => {
            const line = raw.trim();
            if (!line) return;
            const bullet = line.match(/^•\s*(.*)$/);
            if (bullet) {
                if (!bullet[1]) return;
                if (!inList) { html += '<ul class="cv-bullets">'; inList = true; }
                html += `<li>${escapeHtml(bullet[1])}</li>`;
            } else {
                closeList();
                html += `<p>${escapeHtml(line)}</p>`;
            }
        });
        closeList();
        return html;
    }

    function hasRealText(text) {
        return typeof text === 'string' && text.replace(/[•\s]/g, '') !== '';
    }

    function parseCommaSeparated(value) {
        return String(value ?? '').split(',').map(item => item.trim()).filter(Boolean);
    }

    const LEVEL_LABEL_KEYS = Object.freeze({
        'Básico': 'opt_basic', 'Intermedio': 'opt_intermediate', 'Avanzado': 'opt_advanced',
        'Bilingüe': 'opt_bilingual', 'Nativo': 'opt_native'
    });
    const LEVEL_ALIASES = Object.freeze({
        Basic: 'Básico', Intermediate: 'Intermedio', Advanced: 'Avanzado',
        Bilingual: 'Bilingüe', Native: 'Nativo'
    });

    function normalizeLevel(level) {
        return LEVEL_ALIASES[level] || level;
    }

    global.ProCVXUtils = Object.freeze({
        escapeHtml, formatDescHtml, hasRealText, parseCommaSeparated,
        levelLabelKeys: LEVEL_LABEL_KEYS, normalizeLevel
    });
})(window);
