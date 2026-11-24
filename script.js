// ----------------------------------------------------
// ProCVX - Application coordinator: wires the editor, the preview and persistence together.
// Rendering lives in render.js, the dynamic forms in forms.js and section
// visibility / ordering in sections.js.
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const { defaultLanguage: DEFAULT_LANGUAGE, storageKeys: STORAGE_KEYS, donateUrl: DONATE_URL } = window.ProCVXConfig;
    const translations = window.ProCVXTranslations;
    const SAMPLE_DATA = window.ProCVXSampleData;
    const { debounce } = window.ProCVXUtils;
    const { read: readStorage, write: writeStorage, remove: removeStorage, parseJson } = window.ProCVXStorage;
    const { createIcons, toast } = window.ProCVXUI;
    const SECTION_TITLE_DEFAULTS = window.ProCVXRender.sectionTitleDefaults;
    const DEFAULT_SECTION_ORDER = window.ProCVXSections.defaultOrder;

    const SAVE_DELAY_MS = 400;
    const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // a CV with photo is well under 1 MB

    // ----------------------------------------------------
    // DOM references
    // ----------------------------------------------------
    const $ = id => document.getElementById(id);

    const inputFullname = $('input-fullname');
    const inputTitle = $('input-title');
    const inputEmail = $('input-email');
    const inputPhone = $('input-phone');
    const inputLink = $('input-link');
    const inputLinkedin = $('input-linkedin');
    const inputWebsite = $('input-website');
    const inputLocation = $('input-location');
    const inputSummary = $('input-summary');
    const inputSoftSkillsDesc = $('input-softskills-desc');

    const inputPhoto = $('input-photo');
    const btnRemovePhoto = $('btn-remove-photo');
    let currentPhoto = null;

    const btnSampleData = $('btn-sample-data');
    const btnClearData = $('btn-clear-data');
    const btnExportPdf = $('btn-export-pdf');
    const btnImportJson = $('btn-import-json');
    const btnExportJson = $('btn-export-json');
    const inputJsonFile = $('input-json-file');

    // ----------------------------------------------------
    // i18n
    // ----------------------------------------------------
    // Read once from storage; afterwards kept in memory (tr() runs many times per keystroke)
    let currentLanguage = (() => {
        const savedLanguage = readStorage(STORAGE_KEYS.language);
        return savedLanguage && translations[savedLanguage] ? savedLanguage : DEFAULT_LANGUAGE;
    })();

    function getCurrentLanguage() {
        return currentLanguage;
    }

    function getTranslations(language = getCurrentLanguage()) {
        return translations[language] || translations.es;
    }

    function tr(key) {
        return getTranslations()[key] || key;
    }

    function updateLanguage(lang) {
        const t = getTranslations(lang);
        if (!t) return;

        document.documentElement.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!t[key]) return;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (t[key]) el.innerHTML = t[key];
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (t[key]) el.setAttribute('title', t[key]);
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            if (t[key]) el.setAttribute('aria-label', t[key]);
        });

        // Page metadata
        if (t.meta_title) document.title = t.meta_title;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && t.meta_description) metaDescription.setAttribute('content', t.meta_description);

        // Translate section titles that still hold a default value (in any language)
        const allLangs = Object.keys(translations);
        Object.values(SECTION_TITLE_DEFAULTS).forEach(([id, key]) => {
            const input = $(id);
            if (input && allLangs.some(l => translations[l][key] === input.value)) {
                input.value = t[key];
            }
        });

        refreshDropdownLabels();
        updatePreview();
    }

    // ----------------------------------------------------
    // Modules: dynamic forms, preview rendering, section visibility & order
    // ----------------------------------------------------
    const forms = window.ProCVXForms.create({
        onChange: () => updatePreview(),
        // New items: render their icons and translate their labels (this also refreshes the preview)
        onItemsAdded: () => {
            createIcons();
            updateLanguage(getCurrentLanguage());
        }
    });

    const renderer = window.ProCVXRender.create({ getTranslations: () => getTranslations() });

    const sections = window.ProCVXSections.create({
        onToggle: () => {
            renderer.renderCompleteness(collectState());
            saveNow();
        },
        onReorder: () => saveNow()
    });

    function resetSectionOrderToDefault() {
        sections.applyOrder(DEFAULT_SECTION_ORDER);
        removeStorage(STORAGE_KEYS.sectionOrder);
    }

    function updatePreview() {
        renderer.render(collectState());
        forms.updateControlsState();
        scheduleSave();
    }

    // Static fields, including every section title input
    [
        inputFullname, inputTitle, inputEmail, inputPhone, inputLink,
        inputLinkedin, inputWebsite, inputLocation, inputSummary, inputSoftSkillsDesc,
        ...Object.values(SECTION_TITLE_DEFAULTS).map(([inputId]) => $(inputId))
    ].filter(Boolean).forEach(element => element.addEventListener('input', updatePreview));

    // ----------------------------------------------------
    // Photo Upload
    // ----------------------------------------------------

    // Scales an image down (max side in px) and re-encodes it as JPEG so it stays small
    // enough for localStorage and for the exported JSON.
    function resizeImageFile(file, maxSide, quality) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                try {
                    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
                    const width = Math.max(1, Math.round(img.naturalWidth * scale));
                    const height = Math.max(1, Math.round(img.naturalHeight * scale));
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#ffffff'; // flatten transparency (JPEG has none)
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                } catch (err) {
                    reject(err);
                } finally {
                    URL.revokeObjectURL(url);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('image load failed'));
            };
            img.src = url;
        });
    }

    inputPhoto?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type || !file.type.startsWith('image/')) {
            toast(tr('alert_photo_invalid'), 'error');
            inputPhoto.value = '';
            return;
        }
        resizeImageFile(file, 400, 0.85)
            .then(dataUrl => {
                currentPhoto = dataUrl;
                updatePreview();
                saveNow();
            })
            .catch(() => {
                toast(tr('alert_photo_error'), 'error');
                inputPhoto.value = '';
            });
    });

    btnRemovePhoto?.addEventListener('click', () => {
        currentPhoto = null;
        inputPhoto.value = '';
        updatePreview();
        saveNow();
    });

    // ----------------------------------------------------
    // Dropdowns (Theme, Template, Language) - mouse + keyboard
    // ----------------------------------------------------
    const dropdownContainers = Array.from(document.querySelectorAll('.custom-dropdown'));
    const getOptions = container => Array.from(container.querySelectorAll('.dropdown-item'));

    function closeDropdown(container, { focusHeader = false } = {}) {
        if (!container.classList.contains('open')) return;
        container.classList.remove('open');
        const header = container.querySelector('.dropdown-header');
        header.setAttribute('aria-expanded', 'false');
        if (focusHeader) header.focus();
    }

    function openDropdown(container, { focusOption = false } = {}) {
        dropdownContainers.forEach(c => { if (c !== container) closeDropdown(c); });
        container.classList.add('open');
        container.querySelector('.dropdown-header').setAttribute('aria-expanded', 'true');
        if (focusOption) {
            const options = getOptions(container);
            (options.find(o => o.classList.contains('active')) || options[0])?.focus();
        }
    }

    function markActiveOption(container, option) {
        getOptions(container).forEach(o => {
            const active = o === option;
            o.classList.toggle('active', active);
            o.setAttribute('aria-selected', String(active));
        });
    }

    dropdownContainers.forEach(container => {
        const header = container.querySelector('.dropdown-header');
        const menu = container.querySelector('.dropdown-menu');

        header.addEventListener('click', (e) => {
            e.stopPropagation();
            if (container.classList.contains('open')) {
                closeDropdown(container);
            } else {
                // e.detail === 0 means keyboard activation: move focus into the list
                openDropdown(container, { focusOption: e.detail === 0 });
            }
        });

        header.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                openDropdown(container, { focusOption: true });
            } else if (e.key === 'Escape') {
                closeDropdown(container);
            }
        });

        menu.addEventListener('keydown', (e) => {
            const options = getOptions(container);
            const index = options.indexOf(document.activeElement);
            const focusAt = i => options[(i + options.length) % options.length].focus();
            switch (e.key) {
                case 'ArrowDown': e.preventDefault(); focusAt(index + 1); break;
                case 'ArrowUp': e.preventDefault(); focusAt(index - 1); break;
                case 'Home': e.preventDefault(); focusAt(0); break;
                case 'End': e.preventDefault(); focusAt(options.length - 1); break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    document.activeElement?.click();
                    header.focus();
                    break;
                case 'Escape': e.preventDefault(); closeDropdown(container, { focusHeader: true }); break;
                case 'Tab': closeDropdown(container); break;
            }
        });
    });

    document.addEventListener('click', () => dropdownContainers.forEach(c => closeDropdown(c)));

    const themeContainer = $('theme-dropdown-container');
    const templateContainer = $('template-dropdown-container');
    const langContainer = $('lang-dropdown-container');

    function applyTheme(theme) {
        const option = themeContainer.querySelector(`[data-theme="${theme}"]`)
            || themeContainer.querySelector('[data-theme="sapphire"]');
        theme = option.getAttribute('data-theme');
        markActiveOption(themeContainer, option);
        $('theme-selected-icon').className = `theme-btn theme-swatch btn-${theme} active`;
        document.body.classList.forEach(c => { if (c.startsWith('theme-')) document.body.classList.remove(c); });
        document.body.classList.add(`theme-${theme}`);
        refreshDropdownLabels();
    }

    function applyTemplate(template) {
        const option = templateContainer.querySelector(`[data-template="${template}"]`)
            || templateContainer.querySelector('[data-template="modern"]');
        template = option.getAttribute('data-template');
        markActiveOption(templateContainer, option);
        const icon = option.querySelector('svg, [data-lucide]');
        const target = $('template-selected-text');
        if (icon) {
            target.replaceChildren(icon.cloneNode(true));
            createIcons(target);
        }
        document.body.classList.forEach(c => { if (c.startsWith('template-')) document.body.classList.remove(c); });
        document.body.classList.add(`template-${template}`);
        refreshDropdownLabels();
        fitPreview();
    }

    function markLanguage(lang) {
        const option = langContainer.querySelector(`[data-lang="${lang}"]`);
        if (!option) return;
        markActiveOption(langContainer, option);
        $('lang-selected-text').textContent = option.textContent.trim();
    }

    // Screen-reader names for the icon-only dropdown buttons
    function refreshDropdownLabels() {
        const activeName = container => container?.querySelector('.dropdown-item.active')?.textContent.trim() || '';
        const themeName = $('theme-current-name');
        const templateName = $('template-current-name');
        if (themeName) themeName.textContent = activeName(themeContainer);
        if (templateName) templateName.textContent = activeName(templateContainer);
    }

    getOptions(themeContainer).forEach(option => option.addEventListener('click', (e) => {
        e.stopPropagation();
        applyTheme(option.getAttribute('data-theme'));
        closeDropdown(themeContainer);
        saveNow();
    }));

    getOptions(templateContainer).forEach(option => option.addEventListener('click', (e) => {
        e.stopPropagation();
        applyTemplate(option.getAttribute('data-template'));
        closeDropdown(templateContainer);
        saveNow();
    }));

    getOptions(langContainer).forEach(option => option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        closeDropdown(langContainer);
        currentLanguage = translations[lang] ? lang : DEFAULT_LANGUAGE;
        writeStorage(STORAGE_KEYS.language, currentLanguage);
        markLanguage(lang);
        updateLanguage(lang);
        // If the untouched sample is showing, reload it in the new language
        if (isShowingSample()) loadSample();
    }));

    // ----------------------------------------------------
    // State: collect / apply / persist
    // ----------------------------------------------------
    function collectState() {
        const titles = {};
        Object.entries(SECTION_TITLE_DEFAULTS).forEach(([section, [inputId]]) => {
            titles[section] = $(inputId).value;
        });
        const lists = forms.collect();

        // Key order matches the exported JSON of earlier versions
        return {
            fullname: inputFullname.value,
            title: inputTitle.value,
            email: inputEmail.value,
            phone: inputPhone.value,
            location: inputLocation.value,
            website: inputWebsite.value,
            link: inputLink.value,
            linkedin: inputLinkedin.value,
            summary: inputSummary.value,
            skills: lists.skills,
            titles,
            softskillsDesc: inputSoftSkillsDesc.value,
            photo: currentPhoto,
            experience: lists.experience,
            projects: lists.projects,
            education: lists.education,
            volunteer: lists.volunteer,
            certifications: lists.certifications,
            languages: lists.languages,
            toggles: sections.getToggleStates()
        };
    }

    // Fills the whole editor from a state object (saved, imported, sample or empty)
    function applyState(state) {
        state = state && typeof state === 'object' && !Array.isArray(state) ? state : {};
        const t = getTranslations();
        const str = value => (typeof value === 'string' || typeof value === 'number') ? String(value) : '';
        const validItems = list => Array.isArray(list) ? list.filter(item => item && typeof item === 'object') : [];

        inputFullname.value = str(state.fullname);
        inputTitle.value = str(state.title);
        inputEmail.value = str(state.email);
        inputPhone.value = str(state.phone);
        inputLocation.value = str(state.location);
        inputWebsite.value = str(state.website);
        inputLink.value = str(state.link || state.github);
        inputLinkedin.value = str(state.linkedin);
        inputSummary.value = str(state.summary);
        inputSoftSkillsDesc.value = str(state.softskillsDesc);

        const titles = state.titles && typeof state.titles === 'object' ? state.titles : {};
        Object.entries(SECTION_TITLE_DEFAULTS).forEach(([section, [inputId, key]]) => {
            $(inputId).value = str(titles[section]) || t[key];
        });

        // Only accept embedded images as photo
        currentPhoto = typeof state.photo === 'string' && /^data:image\//.test(state.photo) ? state.photo : null;

        sections.applyToggleStates(state.toggles && typeof state.toggles === 'object' ? state.toggles : {});

        forms.clear();
        forms.runBulk(() => {
            forms.setSkills(validItems(state.skills).map(sk => str(sk.name)).filter(Boolean).join(', '));
            validItems(state.languages).forEach(lg => forms.addLanguage(str(lg.name), str(lg.level) || 'Básico'));
            validItems(state.experience).forEach(exp => forms.addExperience(exp));
            validItems(state.projects).forEach(proj => forms.addProject(proj));
            validItems(state.education).forEach(edu => forms.addEducation(edu));
            validItems(state.volunteer).forEach(vol => forms.addVolunteer(vol));
            validItems(state.certifications).forEach(cert => forms.addCertification(cert));
        });
    }

    let saveFailedNotified = false;
    function saveNow() {
        scheduleSave.cancel();
        const ok = writeStorage(STORAGE_KEYS.state, JSON.stringify(collectState()));
        writeStorage(STORAGE_KEYS.sectionOrder, JSON.stringify(sections.getOrder()));

        const theme = themeContainer.querySelector('.dropdown-item.active')?.getAttribute('data-theme');
        const template = templateContainer.querySelector('.dropdown-item.active')?.getAttribute('data-template');
        if (theme) writeStorage(STORAGE_KEYS.theme, theme);
        if (template) writeStorage(STORAGE_KEYS.template, template);
        if (!ok && !saveFailedNotified) {
            // Usually a quota error caused by a large photo; warn once per session
            saveFailedNotified = true;
            toast(tr('toast_save_failed'), 'error');
        }
    }

    // Typing triggers many updates: save at most once per pause in typing
    const scheduleSave = debounce(saveNow, SAVE_DELAY_MS);
    window.addEventListener('pagehide', () => scheduleSave.flush());
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') scheduleSave.flush();
    });

    function getSampleData(lang = getCurrentLanguage()) {
        return SAMPLE_DATA[lang] || SAMPLE_DATA.es;
    }

    function isShowingSample() {
        return Object.values(SAMPLE_DATA).some(sample => sample.fullname === inputFullname.value);
    }

    function loadSample() {
        resetSectionOrderToDefault();
        applyState(getSampleData());
        saveNow();
    }

    btnSampleData.addEventListener('click', () => {
        loadSample();
        toast(tr('toast_sample_loaded'), 'success');
    });

    // ----------------------------------------------------
    // Modals (confirm + legal)
    // ----------------------------------------------------
    let lastFocusedBeforeModal = null;

    function openModal(modalId) {
        const modal = $(modalId);
        if (!modal) return;
        lastFocusedBeforeModal = document.activeElement;
        modal.inert = false;
        modal.classList.add('active');
        createIcons(modal);
        modal.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])')?.focus();
    }

    function closeModal(modalId) {
        const modal = $(modalId);
        if (!modal || !modal.classList.contains('active')) return;
        modal.classList.remove('active');
        modal.inert = true;
        lastFocusedBeforeModal?.focus?.();
        lastFocusedBeforeModal = null;
    }

    document.querySelectorAll('[data-open-modal]').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.getAttribute('data-open-modal')));
    });
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close-modal')));
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            closeModal(activeModal.id);
            return;
        }
        const openDropdownEl = dropdownContainers.find(c => c.classList.contains('open'));
        if (openDropdownEl) closeDropdown(openDropdownEl, { focusHeader: true });
    });

    btnClearData.addEventListener('click', () => openModal('confirm-modal'));
    $('modal-btn-cancel').addEventListener('click', () => closeModal('confirm-modal'));
    $('modal-btn-confirm').addEventListener('click', () => {
        resetSectionOrderToDefault();
        applyState({});
        saveNow();
        closeModal('confirm-modal');
        toast(tr('toast_cleared'), 'info');
    });

    // ----------------------------------------------------
    // Import / Export JSON
    // ----------------------------------------------------
    function getFileBaseName(fallback) {
        return inputFullname.value.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_') || fallback;
    }

    btnExportJson?.addEventListener('click', () => {
        saveNow();
        const blob = new Blob([JSON.stringify(collectState(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${getFileBaseName('Mi_Curriculum')}_ProCVX.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
        toast(tr('toast_exported'), 'success');
    });

    btnImportJson?.addEventListener('click', () => inputJsonFile.click());

    inputJsonFile?.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > MAX_IMPORT_BYTES) {
            toast(tr('alert_import_too_large'), 'error');
            inputJsonFile.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const importedState = parseJson(e.target.result);
            if (!importedState || typeof importedState !== 'object' || Array.isArray(importedState)) {
                toast(tr('alert_import_error'), 'error');
            } else {
                applyState(importedState);
                saveNow();
                toast(tr('alert_import_ok'), 'success');
            }
            inputJsonFile.value = '';
        };
        reader.onerror = () => {
            toast(tr('alert_import_error'), 'error');
            inputJsonFile.value = '';
        };
        reader.readAsText(file);
    });

    // ----------------------------------------------------
    // Export PDF (browser print)
    // ----------------------------------------------------
    btnExportPdf.addEventListener('click', () => {
        saveNow();
        const originalTitle = document.title;
        // The browser uses the page title as the default PDF file name
        document.title = `${getFileBaseName('Curriculum')}_ProCVX`;
        window.addEventListener('afterprint', () => {
            document.title = originalTitle;
            suggestDonation();
        }, { once: true });
        window.print();
    });

    // ----------------------------------------------------
    // Donations (only when config.donateUrl is set)
    // ----------------------------------------------------
    const donateHref = /^https:\/\//.test(DONATE_URL || '') ? DONATE_URL : '';
    const donateLink = $('donate-link');
    if (donateLink && donateHref) {
        donateLink.href = donateHref;
        donateLink.hidden = false;
    }

    // Right after the user got their PDF: a gentle, once-per-session suggestion
    let donationSuggested = false;
    function suggestDonation() {
        if (!donateHref || donationSuggested) return;
        donationSuggested = true;
        setTimeout(() => toast(tr('toast_donate'), 'info', 9000, { label: tr('toast_donate_action'), href: donateHref }), 600);
    }

    // ----------------------------------------------------
    // Mobile: editor / preview switch and preview scaling
    // ----------------------------------------------------
    const previewPanel = document.querySelector('.preview-panel');
    const previewSheet = $('cv-preview-sheet');

    // Scales the A4 sheet down (never up) so it fits the preview panel without horizontal scroll
    const sheetFrame = $('cv-sheet-frame');

    function resetPreviewScale() {
        previewSheet.style.transform = '';
        sheetFrame.style.width = '';
        sheetFrame.style.height = '';
        sheetFrame.classList.remove('is-scaled');
    }

    // Shrinks the A4 sheet with transform: scale() (never enlarges it). The frame takes the
    // scaled size so there is no empty space or horizontal scroll. transform behaves the same
    // in every browser; CSS zoom made Safari/iOS enlarge some text blocks.
    function fitPreview() {
        if (!previewPanel || !previewSheet || !sheetFrame) return;
        const style = getComputedStyle(previewPanel);
        const available = previewPanel.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const width = previewSheet.offsetWidth;   // layout size, not affected by transform
        const height = previewSheet.offsetHeight;
        if (available <= 0 || width <= 0) return;
        const scale = Math.min(1, available / width);
        if (scale >= 1) {
            resetPreviewScale();
            return;
        }
        previewSheet.style.transform = `scale(${scale.toFixed(4)})`;
        sheetFrame.style.width = `${Math.floor(width * scale)}px`;
        sheetFrame.style.height = `${Math.ceil(height * scale)}px`;
        sheetFrame.classList.add('is-scaled');
    }

    if (previewPanel && 'ResizeObserver' in window) {
        // Panel resizes (rotation, view switch) and sheet height changes (typing) both refit
        const observer = new ResizeObserver(() => fitPreview());
        observer.observe(previewPanel);
        observer.observe(previewSheet);
    }
    window.addEventListener('afterprint', fitPreview);
    window.addEventListener('beforeprint', () => { if (previewSheet && sheetFrame) resetPreviewScale(); });

    const viewButtons = Array.from(document.querySelectorAll('.mobile-view-btn'));
    function setMobileView(view) {
        document.body.setAttribute('data-view', view);
        viewButtons.forEach(btn => {
            const active = btn.getAttribute('data-view') === view;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
        fitPreview();
        window.scrollTo({ top: 0 });
    }
    viewButtons.forEach(btn => btn.addEventListener('click', () => setMobileView(btn.getAttribute('data-view'))));

    // ----------------------------------------------------
    // Auto-bullet textareas
    // ----------------------------------------------------
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' || !e.target?.classList?.contains('bullet-textarea')) return;
        e.preventDefault();
        const textarea = e.target;
        const { selectionStart: start, selectionEnd: end, value } = textarea;
        const bullet = '\n• ';
        textarea.value = value.substring(0, start) + bullet + value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + bullet.length;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Capture phase: normalise the bullet BEFORE the field's own listener renders the preview
    document.addEventListener('input', (e) => {
        const textarea = e.target;
        if (!textarea?.classList?.contains('bullet-textarea')) return;
        const value = textarea.value;
        if ((value === '•' || value === '• ') && e.inputType === 'deleteContentBackward') {
            textarea.value = '';
        } else if (value.length > 0 && !value.startsWith('• ')) {
            textarea.value = '• ' + (value.startsWith('•') ? value.substring(1).trimStart() : value);
        }
    }, true);

    document.addEventListener('focusin', (e) => {
        const textarea = e.target;
        if (!textarea?.classList?.contains('bullet-textarea') || textarea.value.trim() !== '') return;
        textarea.value = '• ';
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // ----------------------------------------------------
    // Initialization
    // ----------------------------------------------------
    function init() {
        // Snapshot stored data first: rendering schedules saves of the (still empty) form
        const stored = {
            state: readStorage(STORAGE_KEYS.state),
            theme: readStorage(STORAGE_KEYS.theme),
            template: readStorage(STORAGE_KEYS.template),
            order: readStorage(STORAGE_KEYS.sectionOrder)
        };

        const lang = getCurrentLanguage();
        markLanguage(lang);
        applyTheme(stored.theme || 'sapphire');
        applyTemplate(stored.template || 'modern');
        setMobileView('editor');

        const order = parseJson(stored.order, null);
        if (Array.isArray(order)) sections.applyOrder(order);
        else sections.updatePreviewOrder();


        const state = parseJson(stored.state, null);
        if (state && typeof state === 'object' && !Array.isArray(state)) {
            applyState(state);
        } else {
            // First visit (or unreadable data): show the sample so the preview isn't empty
            loadSample();
        }
        createIcons();
        fitPreview();
    }

    init();

    // ----------------------------------------------------
    // Offline support (service worker). Only over http(s): not available on file://
    // ----------------------------------------------------
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
        const firstInstall = !navigator.serviceWorker.controller;
        navigator.serviceWorker.register('sw.js').then(registration => {
            const worker = registration.installing;
            if (!firstInstall || !worker) return;
            worker.addEventListener('statechange', () => {
                if (worker.state === 'activated') toast(tr('toast_offline_ready'), 'success');
            });
        }).catch(() => { /* Offline mode is optional */ });
    }
});
