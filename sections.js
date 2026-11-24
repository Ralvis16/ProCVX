// ProCVX - Section visibility (header checkboxes) and ordering (arrows + drag and drop).
// The editor accordion order is the source of truth; the preview follows it with CSS `order`.
(function (global) {
    const DEFAULT_ORDER = Object.freeze([
        'cv-section-summary',
        'cv-section-experience',
        'cv-section-projects',
        'cv-section-volunteer',
        'cv-section-education',
        'cv-section-certifications',
        'cv-section-softskills',
        'cv-section-skills',
        'cv-section-languages'
    ]);

    // Orders saved before a section existed don't list it: insert it after its default predecessor.
    // Unknown ids are dropped. Pure, so it can be unit tested.
    function completeOrder(order) {
        const fullOrder = order.map(String).filter(id => DEFAULT_ORDER.includes(id));
        DEFAULT_ORDER.forEach((sectionId, index) => {
            if (fullOrder.includes(sectionId)) return;
            const prevIndex = fullOrder.indexOf(DEFAULT_ORDER[index - 1]);
            fullOrder.splice(prevIndex + 1, 0, sectionId);
        });
        return fullOrder;
    }

    // hooks.onToggle(): a section was switched on/off by the user
    // hooks.onReorder(): the user moved a section (arrows or drag and drop)
    function create(hooks) {
        const document = global.document;
        const toggles = Array.from(document.querySelectorAll('.section-toggle'));

        function setEnabled(toggle, enabled) {
            toggle.checked = enabled;
            const targetSection = document.getElementById(toggle.getAttribute('data-section'));
            const accordionItem = toggle.closest('.accordion-item');
            targetSection?.classList.toggle('hidden-section', !enabled);
            accordionItem?.classList.toggle('section-disabled', !enabled);
        }

        // { 'cv-section-summary': true, ... }
        function getToggleStates() {
            const states = {};
            toggles.forEach(toggle => { states[toggle.getAttribute('data-section')] = toggle.checked; });
            return states;
        }

        // Sections missing from `states` are switched on
        function applyToggleStates(states) {
            toggles.forEach(toggle => {
                const saved = states[toggle.getAttribute('data-section')];
                setEnabled(toggle, saved === undefined ? true : Boolean(saved));
            });
        }

        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                setEnabled(toggle, toggle.checked);
                hooks.onToggle();
            });
        });

        function getOrder() {
            // querySelectorAll returns document order, i.e. the current editor order
            return Array.from(document.querySelectorAll('.section-toggle'))
                .map(toggle => toggle.getAttribute('data-section'))
                .filter(Boolean);
        }

        function updatePreviewOrder() {
            const orderedIds = getOrder();
            document.querySelectorAll('#cv-preview-sheet .cv-section').forEach(sec => {
                const idx = orderedIds.indexOf(sec.id);
                sec.style.order = idx !== -1 ? idx : 99;
            });
        }

        function applyOrder(order) {
            if (!Array.isArray(order)) return;
            completeOrder(order).forEach(sectionId => {
                const toggle = document.querySelector(`.section-toggle[data-section="${CSS.escape(String(sectionId))}"]`);
                const item = toggle?.closest('.accordion-item');
                if (item?.parentNode) item.parentNode.appendChild(item);
            });
            updatePreviewOrder();
        }

        function moveSection(btn, direction) {
            const item = btn.closest('.accordion-item');
            if (!item) return;
            const prev = item.previousElementSibling;
            const next = item.nextElementSibling;
            if (direction === 'up' && prev?.classList.contains('accordion-item') && !prev.hasAttribute('data-fixed')) {
                item.parentNode.insertBefore(item, prev);
            } else if (direction === 'down' && next?.classList.contains('accordion-item')) {
                item.parentNode.insertBefore(next, item);
            }
            updatePreviewOrder();
            hooks.onReorder();
            btn.focus();
        }

        document.querySelectorAll('.btn-section-up, .btn-section-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                moveSection(btn, btn.classList.contains('btn-section-up') ? 'up' : 'down');
            });
        });

        // Drag and drop reordering (SortableJS)
        const accordionContainer = document.querySelector('.editor-accordion');
        if (typeof global.Sortable !== 'undefined' && accordionContainer) {
            new global.Sortable(accordionContainer, {
                animation: 150,
                handle: '.accordion-trigger, .drag-handle',
                filter: '[data-fixed="true"] .accordion-trigger, input, textarea, select, button, .section-toggle',
                preventOnFilter: false,
                onMove: evt => !evt.related.hasAttribute('data-fixed'),
                onEnd: evt => {
                    // Prevent the accordion from toggling right after a drag
                    const trigger = evt.item.querySelector('.accordion-trigger');
                    if (trigger) {
                        const preventClick = e => {
                            e.preventDefault();
                            e.stopPropagation();
                            trigger.removeEventListener('click', preventClick, true);
                        };
                        trigger.addEventListener('click', preventClick, true);
                        setTimeout(() => trigger.removeEventListener('click', preventClick, true), 100);
                    }
                    updatePreviewOrder();
                    hooks.onReorder();
                }
            });
            document.querySelectorAll('.accordion-item:not([data-fixed="true"]) .accordion-trigger')
                .forEach(trigger => trigger.classList.add('is-draggable'));
        }

        return { getToggleStates, applyToggleStates, getOrder, applyOrder, updatePreviewOrder };
    }

    global.ProCVXSections = Object.freeze({ create, defaultOrder: DEFAULT_ORDER, completeOrder });
})(window);
