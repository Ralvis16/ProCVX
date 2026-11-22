// ----------------------------------------------------
// ProCVX - JavaScript Logic for Live Preview and PDF Export
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const { defaultLanguage: DEFAULT_LANGUAGE, storageKeys: STORAGE_KEYS } = window.ProCVXConfig;
    const translations = window.ProCVXTranslations;
    const SAMPLE_DATA = window.ProCVXSampleData;
    const {
        escapeHtml, formatDescHtml, hasRealText, parseCommaSeparated,
        normalizeLevel, levelLabelKeys: LEVEL_LABEL_KEYS, debounce, toSafeUrl
    } = window.ProCVXUtils;
    const { read: readStorage, write: writeStorage, remove: removeStorage, parseJson } = window.ProCVXStorage;
    const { createIcons, toast } = window.ProCVXUI;

    const SAVE_DELAY_MS = 400;
    const DEFAULT_SECTION_ORDER = [
        'cv-section-summary',
        'cv-section-experience',
        'cv-section-projects',
        'cv-section-volunteer',
        'cv-section-education',
        'cv-section-certifications',
        'cv-section-softskills',
        'cv-section-skills',
        'cv-section-languages'
    ];
    // Section title inputs and the translation key of their default value
    const SECTION_TITLE_DEFAULTS = {
        profile: ['input-title-profile', 'def_profile'],
        experience: ['input-title-experience', 'def_experience'],
        projects: ['input-title-projects', 'def_projects'],
        volunteer: ['input-title-volunteer', 'def_volunteer'],
        education: ['input-title-education', 'def_education'],
        certifications: ['input-title-certifications', 'def_certifications'],
        skills: ['input-title-skills', 'def_skills'],
        softskills: ['input-title-softskills', 'def_softskills'],
        languages: ['input-title-languages', 'def_languages']
    };

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

    const inputTitleProfile = $('input-title-profile');
    const inputTitleExperience = $('input-title-experience');
    const inputTitleProjects = $('input-title-projects');
    const inputTitleEducation = $('input-title-education');
    const inputTitleSkills = $('input-title-skills');
    const inputTitleSoftSkills = $('input-title-softskills');
    const inputTitleLanguages = $('input-title-languages');

    const inputPhoto = $('input-photo');
    const btnRemovePhoto = $('btn-remove-photo');
    const previewPhoto = $('preview-photo');
    let currentPhoto = null;

    const experienceList = $('experience-list');
    const projectsList = $('projects-list');
    const educationList = $('education-list');
    const volunteerList = $('volunteer-list');
    const certificationsList = $('certifications-list');
    const skillsList = $('skills-list');
    const languagesList = $('languages-list');
    const dynamicLists = [experienceList, projectsList, educationList, volunteerList, certificationsList, skillsList, languagesList];

    const previewSkillsDynamic = $('preview-skills-dynamic');
    const previewSoftSkillsDesc = $('preview-softskills-desc');
    const previewLanguagesList = $('preview-languages-list');

    const btnSampleData = $('btn-sample-data');
    const btnClearData = $('btn-clear-data');
    const btnExportPdf = $('btn-export-pdf');
    const btnImportJson = $('btn-import-json');
    const btnExportJson = $('btn-export-json');
    const inputJsonFile = $('input-json-file');

    // ----------------------------------------------------
    // i18n
    // ----------------------------------------------------
    function getCurrentLanguage() {
        const savedLanguage = readStorage(STORAGE_KEYS.language);
        return savedLanguage && translations[savedLanguage] ? savedLanguage : DEFAULT_LANGUAGE;
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
    // Dynamic List Management
    // ----------------------------------------------------
    let expIdCounter = 0;
    let projIdCounter = 0;
    let eduIdCounter = 0;
    let langIdCounter = 0;
    let volIdCounter = 0;
    let certIdCounter = 0;

    function createDynamicItemContainer(id, innerHtml) {
        return `
            <div class="dynamic-item" id="${id}">
                <div class="item-controls">
                    <button type="button" class="btn-item-control btn-move-up" data-i18n-title="tt_up" data-i18n-aria="tt_up" title="Subir" aria-label="Subir"><i data-lucide="arrow-up"></i></button>
                    <button type="button" class="btn-item-control btn-move-down" data-i18n-title="tt_down" data-i18n-aria="tt_down" title="Bajar" aria-label="Bajar"><i data-lucide="arrow-down"></i></button>
                    <button type="button" class="btn-item-control btn-remove-item" data-i18n-title="tt_remove_item" data-i18n-aria="tt_remove_item" title="Eliminar" aria-label="Eliminar"><i data-lucide="x"></i></button>
                </div>
                ${innerHtml}
            </div>
        `;
    }

    // While > 0, adding items skips the per-item refresh (icons, translations, preview).
    // runBulk() does a single refresh at the end instead of one per item.
    let bulkDepth = 0;
    function runBulk(fn) {
        bulkDepth++;
        try {
            fn();
        } finally {
            bulkDepth--;
        }
        if (bulkDepth === 0) {
            createIcons();
            updateLanguage(getCurrentLanguage());
        }
    }

    function appendDynamicField(listElement, id, innerHtml) {
        if (!listElement) return;
        listElement.insertAdjacentHTML('beforeend', createDynamicItemContainer(id, innerHtml));
        setupItemListeners(id);
        if (bulkDepth === 0) {
            createIcons();
            updateLanguage(getCurrentLanguage());
        }
    }

    function clearDynamicLists() {
        dynamicLists.forEach(list => { if (list) list.innerHTML = ''; });
    }

    function addExperienceField(data = {}) {
        data = data || {};
        const id = `exp-${expIdCounter++}`;
        appendDynamicField(experienceList, id, `
                <div class="form-group grid-2">
                    <label for="${id}-role" data-i18n="lbl_exp_role">Puesto / Cargo</label>
                    <input type="text" id="${id}-role" class="exp-role" data-i18n="ph_exp_role" value="${escapeHtml(data.role)}" placeholder="Ej. Desarrollador Web Prácticas">
                </div>
                <div class="form-group">
                    <label for="${id}-company" data-i18n="lbl_exp_company">Empresa</label>
                    <input type="text" id="${id}-company" class="exp-company" data-i18n="ph_exp_company" value="${escapeHtml(data.company)}" placeholder="Ej. Innova Soft S.L.">
                </div>
                <div class="form-group">
                    <label for="${id}-dates" data-i18n="lbl_exp_dates">Periodo (Fechas)</label>
                    <input type="text" id="${id}-dates" class="exp-dates" data-i18n="ph_exp_dates" value="${escapeHtml(data.dates)}" placeholder="Ej. Ene 2025 - Mar 2026">
                </div>
                <div class="form-group">
                    <label for="${id}-desc" data-i18n="lbl_exp_desc">Descripción / Logros</label>
                    <textarea id="${id}-desc" class="exp-desc bullet-textarea" data-i18n="ph_exp_desc" rows="3" placeholder="Ej. Desarrollo de APIs en Java, diseño de vistas responsivas...">${escapeHtml(data.desc)}</textarea>
                </div>
        `);
    }

    function addProjectField(data = {}) {
        data = data || {};
        const id = `proj-${projIdCounter++}`;
        appendDynamicField(projectsList, id, `
                <div class="form-group">
                    <label for="${id}-title" data-i18n="lbl_proj_name">Nombre del Proyecto</label>
                    <input type="text" id="${id}-title" class="proj-title" data-i18n="ph_proj_name" value="${escapeHtml(data.title)}" placeholder="Ej. E-commerce App">
                </div>
                <div class="form-group">
                    <label for="${id}-tech" data-i18n="lbl_proj_tech">Tecnologías (Separadas por comas)</label>
                    <input type="text" id="${id}-tech" class="proj-tech" data-i18n="ph_proj_tech" value="${escapeHtml(data.tech)}" placeholder="Ej. Flutter, Firebase, Dart">
                </div>
                <div class="form-group">
                    <label for="${id}-desc" data-i18n="lbl_proj_desc">Descripción</label>
                    <textarea id="${id}-desc" class="proj-desc" rows="2" data-i18n="ph_proj_desc" placeholder="Ej. Aplicación móvil de gestión logística con base de datos local y offline...">${escapeHtml(data.desc)}</textarea>
                </div>
        `);
    }

    function addEducationField(data = {}) {
        data = data || {};
        const id = `edu-${eduIdCounter++}`;
        appendDynamicField(educationList, id, `
                <div class="form-group">
                    <label for="${id}-degree" data-i18n="lbl_edu_degree">Titulación / Grado / Certificación</label>
                    <input type="text" id="${id}-degree" class="edu-degree" data-i18n="ph_edu_degree" value="${escapeHtml(data.degree)}" placeholder="Ej. C.F.G.S. Desarrollo de Aplicaciones Web">
                </div>
                <div class="form-group">
                    <label for="${id}-school" data-i18n="lbl_edu_school">Centro de Estudios / Institución</label>
                    <input type="text" id="${id}-school" class="edu-school" data-i18n="ph_edu_school" value="${escapeHtml(data.school)}" placeholder="Ej. I.E.S. Tecnológico">
                </div>
                <div class="form-group">
                    <label for="${id}-dates" data-i18n="lbl_edu_dates">Periodo (Fechas)</label>
                    <input type="text" id="${id}-dates" class="edu-dates" data-i18n="ph_edu_dates" value="${escapeHtml(data.dates)}" placeholder="Ej. 2024 - 2026">
                </div>
        `);
    }

    function addVolunteerField(data = {}) {
        data = data || {};
        const id = `vol-${volIdCounter++}`;
        appendDynamicField(volunteerList, id, `
                <div class="form-group">
                    <label for="${id}-role" data-i18n="lbl_vol_role">Rol / Actividad</label>
                    <input type="text" id="${id}-role" class="vol-role" data-i18n="ph_vol_role" value="${escapeHtml(data.role)}" placeholder="Ej. Mentor de jóvenes">
                </div>
                <div class="form-group">
                    <label for="${id}-org" data-i18n="lbl_vol_org">Organización</label>
                    <input type="text" id="${id}-org" class="vol-org" data-i18n="ph_vol_org" value="${escapeHtml(data.organization)}" placeholder="Ej. Cruz Roja">
                </div>
                <div class="form-group">
                    <label for="${id}-dates" data-i18n="lbl_vol_dates">Periodo (Fechas)</label>
                    <input type="text" id="${id}-dates" class="vol-dates" data-i18n="ph_vol_dates" value="${escapeHtml(data.dates)}" placeholder="Ej. 2022 - Actualidad">
                </div>
                <div class="form-group">
                    <label for="${id}-desc" data-i18n="lbl_vol_desc">Descripción / Logros</label>
                    <textarea id="${id}-desc" class="vol-desc bullet-textarea" rows="2" data-i18n="ph_vol_desc" placeholder="Ej. Talleres de orientación laboral para jóvenes...">${escapeHtml(data.desc)}</textarea>
                </div>
        `);
    }

    function addCertificationField(data = {}) {
        data = data || {};
        const id = `cert-${certIdCounter++}`;
        appendDynamicField(certificationsList, id, `
                <div class="form-group">
                    <label for="${id}-name" data-i18n="lbl_cert_name">Certificación / Curso</label>
                    <input type="text" id="${id}-name" class="cert-name" data-i18n="ph_cert_name" value="${escapeHtml(data.name)}" placeholder="Ej. AWS Certified Cloud Practitioner">
                </div>
                <div class="form-group">
                    <label for="${id}-issuer" data-i18n="lbl_cert_issuer">Entidad emisora</label>
                    <input type="text" id="${id}-issuer" class="cert-issuer" data-i18n="ph_cert_issuer" value="${escapeHtml(data.issuer)}" placeholder="Ej. Amazon Web Services">
                </div>
                <div class="form-group">
                    <label for="${id}-date" data-i18n="lbl_cert_date">Fecha</label>
                    <input type="text" id="${id}-date" class="cert-date" data-i18n="ph_cert_date" value="${escapeHtml(data.date)}" placeholder="Ej. Mayo 2025">
                </div>
        `);
    }

    // The single comma-separated skills field
    function setSkillsField(name = '') {
        skillsList.innerHTML = `
            <div class="form-group">
                <label for="input-skills" data-i18n="lbl_skill_name">Habilidad / Tecnología (Separadas por comas)</label>
                <input type="text" id="input-skills" class="skill-name" data-i18n="ph_skill_name" value="${escapeHtml(name)}" placeholder="Ej. Liderazgo, React, Excel">
            </div>
        `;
        skillsList.querySelector('.skill-name').addEventListener('input', updatePreview);
        if (bulkDepth === 0) updateLanguage(getCurrentLanguage());
    }

    function addLanguageField(name = '', level = 'Básico') {
        level = normalizeLevel(level);
        const id = `lang-${langIdCounter++}`;
        const option = (value, key) =>
            `<option value="${value}" data-i18n="${key}" ${level === value ? 'selected' : ''}>${value}</option>`;
        appendDynamicField(languagesList, id, `
                <div class="form-group grid-2">
                    <div>
                        <label for="${id}-name" data-i18n="lbl_lang_name">Idioma</label>
                        <input type="text" id="${id}-name" class="lang-name" data-i18n="ph_lang_name" value="${escapeHtml(name)}" placeholder="Ej. Inglés">
                    </div>
                    <div>
                        <label for="${id}-level" data-i18n="lbl_lang_level">Nivel</label>
                        <select id="${id}-level" class="lang-level">
                            ${Object.entries(LEVEL_LABEL_KEYS).map(([value, key]) => option(value, key)).join('')}
                        </select>
                    </div>
                </div>
        `);
    }

    function setupItemListeners(itemId) {
        const item = $(itemId);
        if (!item) return;

        item.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('input', updatePreview);
        });

        item.querySelector('.btn-remove-item')?.addEventListener('click', () => {
            item.classList.add('removing');
            setTimeout(() => {
                item.remove();
                updatePreview();
            }, 150);
        });

        item.querySelector('.btn-move-up')?.addEventListener('click', () => {
            const prev = item.previousElementSibling;
            if (prev) {
                item.parentNode.insertBefore(item, prev);
                updatePreview();
            }
        });

        item.querySelector('.btn-move-down')?.addEventListener('click', () => {
            const next = item.nextElementSibling;
            if (next) {
                item.parentNode.insertBefore(next, item);
                updatePreview();
            }
        });
    }

    [
        ['btn-add-experience', addExperienceField],
        ['btn-add-project', addProjectField],
        ['btn-add-education', addEducationField],
        ['btn-add-language', addLanguageField],
        ['btn-add-volunteer', addVolunteerField],
        ['btn-add-certification', addCertificationField]
    ].forEach(([buttonId, addField]) => {
        $(buttonId)?.addEventListener('click', () => addField());
    });

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
    // Preview rendering
    // ----------------------------------------------------
    function updatePhotoPreview() {
        if (currentPhoto) {
            previewPhoto.src = currentPhoto;
            previewPhoto.alt = inputFullname.value.trim();
            previewPhoto.hidden = false;
            if (btnRemovePhoto) btnRemovePhoto.hidden = false;
        } else {
            previewPhoto.removeAttribute('src');
            previewPhoto.hidden = true;
            if (btnRemovePhoto) btnRemovePhoto.hidden = true;
            if (inputPhoto) inputPhoto.value = '';
        }
    }

    function updateSectionTitlesPreview() {
        const t = getTranslations();
        Object.entries(SECTION_TITLE_DEFAULTS).forEach(([section, [inputId, key]]) => {
            const span = document.querySelector(`#preview-title-${section}-header span`);
            if (span) span.textContent = $(inputId).value || t[key];
        });
    }

    function setText(id, value, fallback) {
        $(id).textContent = value.trim() !== '' ? value : fallback;
    }

    function setContact(id, containerId, value, type = 'text') {
        const container = $(containerId);
        const trimmed = value.trim();
        container.hidden = trimmed === '';
        if (!trimmed) return;
        const el = $(id);
        el.textContent = trimmed;
        if (el.tagName !== 'A') return;
        if (type === 'email') {
            el.href = 'mailto:' + trimmed;
        } else if (type === 'phone') {
            el.href = 'tel:' + trimmed.replace(/[^\d+]/g, '');
        } else if (type === 'url') {
            el.href = toSafeUrl(trimmed);
        }
    }

    function updateTextAndContactPreview() {
        const t = getTranslations();

        // Long names break after the second word so the header stays balanced
        let nameToDisplay = inputFullname.value.trim();
        const nameWords = nameToDisplay.split(/\s+/);
        if (nameWords.length > 2) {
            nameToDisplay = nameWords[0] + ' ' + nameWords[1] + '\n' + nameWords.slice(2).join(' ');
        }
        setText('preview-fullname', nameToDisplay, t.lbl_fullname);
        setText('preview-title', inputTitle.value, t.lbl_title);
        setText('preview-summary', inputSummary.value, t.lbl_summary + '...');

        setContact('preview-email', 'cv-contact-email-container', inputEmail.value, 'email');
        setContact('preview-phone', 'cv-contact-phone-container', inputPhone.value, 'phone');
        setContact('preview-location', 'cv-contact-location-container', inputLocation.value, 'text');
        setContact('preview-website', 'cv-contact-website-container', inputWebsite.value, 'url');
        setContact('preview-link', 'cv-contact-link-container', inputLink.value, 'url');
        setContact('preview-linkedin', 'cv-contact-linkedin-container', inputLinkedin.value, 'url');
    }

    function buildExperienceHtml(role, company, dates, desc) {
        const t = getTranslations();
        return `
            <div class="cv-item-block">
                <div class="cv-item-header">
                    <div class="cv-item-title">${role ? escapeHtml(role) : t.lbl_exp_role}</div>
                    <div class="cv-item-meta">${company ? escapeHtml(company) : t.lbl_exp_company}</div>
                </div>
                <div class="cv-item-dates">${escapeHtml(dates)}</div>
                ${hasRealText(desc) ? `<div class="cv-item-desc">${formatDescHtml(desc)}</div>` : ''}
            </div>
        `;
    }

    function buildProjectHtml(title, techString, desc) {
        const techBadges = parseCommaSeparated(techString)
            .map(tech => `<span class="cv-badge-tech">${escapeHtml(tech)}</span>`)
            .join('');
        return `
            <div class="cv-item-block">
                <div class="cv-item-header">
                    <div class="cv-item-title">${escapeHtml(title)}</div>
                </div>
                ${hasRealText(desc) ? `<div class="cv-item-desc">${formatDescHtml(desc)}</div>` : ''}
                ${techBadges ? `<div class="cv-item-tech">${techBadges}</div>` : ''}
            </div>
        `;
    }

    function buildEducationHtml(degree, school, dates) {
        const t = getTranslations();
        return `
            <div class="cv-item-block">
                <div class="cv-item-title">${degree ? escapeHtml(degree) : t.lbl_edu_degree}</div>
                <div class="cv-item-meta">${school ? escapeHtml(school) : t.lbl_edu_school}</div>
                <div class="cv-item-dates">${escapeHtml(dates)}</div>
            </div>
        `;
    }

    function buildVolunteerHtml(role, organization, dates, desc) {
        return `
            <div class="cv-item-block">
                <div class="cv-item-header">
                    <div class="cv-item-title">${escapeHtml(role)}</div>
                    <div class="cv-item-meta">${escapeHtml(organization)}</div>
                </div>
                ${dates.trim() ? `<div class="cv-item-dates">${escapeHtml(dates)}</div>` : ''}
                ${hasRealText(desc) ? `<div class="cv-item-desc">${formatDescHtml(desc)}</div>` : ''}
            </div>
        `;
    }

    function buildCertificationHtml(name, issuer, date) {
        return `
            <div class="cv-item-block">
                <div class="cv-item-title">${escapeHtml(name)}</div>
                ${issuer.trim() ? `<div class="cv-item-meta">${escapeHtml(issuer)}</div>` : ''}
                ${date.trim() ? `<div class="cv-item-dates">${escapeHtml(date)}</div>` : ''}
            </div>
        `;
    }

    // Renders one dynamic list into its preview container; hides the section when the list is empty.
    function renderListPreview(list, sectionId, containerId, readItem, buildHtml) {
        const items = list.querySelectorAll('.dynamic-item');
        const section = $(sectionId);
        if (items.length === 0) {
            section.style.display = 'none';
            $(containerId).innerHTML = '';
            return;
        }
        section.style.display = 'flex';
        $(containerId).innerHTML = Array.from(items)
            .map(readItem)
            .filter(Boolean)
            .map(values => buildHtml(...values))
            .join('');
    }

    const val = (item, selector) => item.querySelector(selector).value;

    function updateExperiencePreview() {
        renderListPreview(experienceList, 'cv-section-experience', 'preview-experience', item => {
            const values = [val(item, '.exp-role'), val(item, '.exp-company'), val(item, '.exp-dates'), val(item, '.exp-desc')];
            return values[0] || values[1] ? values : null;
        }, buildExperienceHtml);
    }

    function updateProjectsPreview() {
        renderListPreview(projectsList, 'cv-section-projects', 'preview-projects', item => {
            const values = [val(item, '.proj-title'), val(item, '.proj-tech'), val(item, '.proj-desc')];
            return values[0] ? values : null;
        }, buildProjectHtml);
    }

    function updateEducationPreview() {
        renderListPreview(educationList, 'cv-section-education', 'preview-education', item => {
            const values = [val(item, '.edu-degree'), val(item, '.edu-school'), val(item, '.edu-dates')];
            return values[0] || values[1] ? values : null;
        }, buildEducationHtml);
    }

    function updateVolunteerPreview() {
        renderListPreview(volunteerList, 'cv-section-volunteer', 'preview-volunteer', item => {
            const values = [val(item, '.vol-role'), val(item, '.vol-org'), val(item, '.vol-dates'), val(item, '.vol-desc')];
            return values[0] || values[1] ? values : null;
        }, buildVolunteerHtml);
    }

    function updateCertificationsPreview() {
        renderListPreview(certificationsList, 'cv-section-certifications', 'preview-certifications', item => {
            const values = [val(item, '.cert-name'), val(item, '.cert-issuer'), val(item, '.cert-date')];
            return values[0] ? values : null;
        }, buildCertificationHtml);
    }

    function getSkillNames() {
        const skillsInput = skillsList.querySelector('.skill-name');
        return skillsInput ? parseCommaSeparated(skillsInput.value) : [];
    }

    function updateSkillsPreview() {
        const skillNames = getSkillNames();
        const skillsSection = $('cv-section-skills');
        if (skillNames.length === 0) {
            skillsSection.style.display = 'none';
            return;
        }
        skillsSection.style.display = 'flex';
        previewSkillsDynamic.innerHTML = `<div class="cv-tags">${
            skillNames.map(name => `<span class="cv-tag">${escapeHtml(name)}</span>`).join('')
        }</div>`;
    }

    function updateSoftSkillsPreview() {
        const text = inputSoftSkillsDesc.value;
        const softSkillsSection = $('cv-section-softskills');
        if (!hasRealText(text)) {
            softSkillsSection.style.display = 'none';
            return;
        }
        softSkillsSection.style.display = 'flex';
        previewSoftSkillsDesc.innerHTML = formatDescHtml(text);
    }

    function updateLanguagesPreview() {
        const t = getTranslations();
        const langItems = languagesList.querySelectorAll('.dynamic-item');
        previewLanguagesList.innerHTML = '';
        langItems.forEach(item => {
            const name = val(item, '.lang-name').trim();
            if (!name) return;
            const level = val(item, '.lang-level').trim();
            const langDiv = document.createElement('div');
            langDiv.className = 'cv-language-row';
            const strong = document.createElement('strong');
            strong.textContent = name + ':';
            langDiv.append(strong, ' ' + (t[LEVEL_LABEL_KEYS[level]] || level));
            previewLanguagesList.appendChild(langDiv);
        });
        $('cv-section-languages').style.display = langItems.length === 0 ? 'none' : 'block';
    }

    function updateDynamicControlsState() {
        document.querySelectorAll('.dynamic-list').forEach(list => {
            const items = list.querySelectorAll('.dynamic-item');
            items.forEach((item, index) => {
                const upBtn = item.querySelector('.btn-move-up');
                const downBtn = item.querySelector('.btn-move-down');
                if (upBtn) upBtn.disabled = index === 0;
                if (downBtn) downBtn.disabled = index === items.length - 1;
            });
        });
    }

    function isSectionEnabled(sectionId) {
        const toggle = document.querySelector(`.section-toggle[data-section="${sectionId}"]`);
        return !toggle || toggle.checked;
    }

    // Progress bar telling the user which essential fields are still missing
    function updateCompleteness() {
        const bar = $('completeness-bar');
        if (!bar) return;
        const t = getTranslations();
        const anyItem = (list, selectors) => Array.from(list.querySelectorAll('.dynamic-item'))
            .some(item => selectors.some(sel => val(item, sel).trim()));

        const checks = [
            ['chk_name', inputFullname.value.trim()],
            ['chk_title', inputTitle.value.trim()],
            ['chk_email', inputEmail.value.trim()],
            ['chk_phone', inputPhone.value.trim()]
        ];
        if (isSectionEnabled('cv-section-summary')) checks.push(['chk_summary', inputSummary.value.trim()]);
        if (isSectionEnabled('cv-section-experience')) checks.push(['chk_experience', anyItem(experienceList, ['.exp-role', '.exp-company'])]);
        if (isSectionEnabled('cv-section-education')) checks.push(['chk_education', anyItem(educationList, ['.edu-degree', '.edu-school'])]);
        if (isSectionEnabled('cv-section-skills') || isSectionEnabled('cv-section-softskills')) {
            checks.push(['chk_skills', getSkillNames().length > 0 || hasRealText(inputSoftSkillsDesc.value)]);
        }
        if (isSectionEnabled('cv-section-languages')) checks.push(['chk_languages', anyItem(languagesList, ['.lang-name'])]);

        const missing = checks.filter(([, ok]) => !ok).map(([key]) => t[key]);
        const pct = Math.round(((checks.length - missing.length) / checks.length) * 100);

        bar.setAttribute('aria-valuenow', String(pct));
        $('completeness-fill').style.width = pct + '%';
        $('cv-completeness').classList.toggle('is-complete', missing.length === 0);
        const label = t.completeness_label.replace('{pct}', pct);
        $('completeness-text').textContent = missing.length === 0
            ? `${label} · ${t.completeness_done}`
            : `${label} · ${t.completeness_missing.replace('{items}', missing.join(', '))}`;
    }

    function updatePreview() {
        updatePhotoPreview();
        updateSectionTitlesPreview();
        updateTextAndContactPreview();
        updateExperiencePreview();
        updateProjectsPreview();
        updateEducationPreview();
        updateVolunteerPreview();
        updateCertificationsPreview();
        updateSkillsPreview();
        updateSoftSkillsPreview();
        updateLanguagesPreview();
        updateDynamicControlsState();
        updateCompleteness();
        scheduleSave();
    }

    [
        inputFullname, inputTitle, inputEmail, inputPhone, inputLink,
        inputLinkedin, inputWebsite, inputLocation, inputSummary,
        inputTitleProfile, inputTitleExperience, inputTitleProjects, inputTitleEducation,
        inputTitleSkills, inputTitleSoftSkills, inputSoftSkillsDesc, inputTitleLanguages
    ].filter(Boolean).forEach(element => element.addEventListener('input', updatePreview));

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
        writeStorage(STORAGE_KEYS.language, lang);
        markLanguage(lang);
        updateLanguage(lang);
        // If the untouched sample is showing, reload it in the new language
        if (isShowingSample()) loadSample();
    }));

    // ----------------------------------------------------
    // Section visibility & ordering
    // ----------------------------------------------------
    const sectionToggles = Array.from(document.querySelectorAll('.section-toggle'));

    function setSectionEnabled(toggle, enabled) {
        toggle.checked = enabled;
        const targetSection = $(toggle.getAttribute('data-section'));
        const accordionItem = toggle.closest('.accordion-item');
        targetSection?.classList.toggle('hidden-section', !enabled);
        accordionItem?.classList.toggle('section-disabled', !enabled);
    }

    sectionToggles.forEach(toggle => {
        // Clicking the checkbox must not open/close the accordion
        toggle.addEventListener('click', e => e.stopPropagation());
        toggle.addEventListener('change', () => {
            setSectionEnabled(toggle, toggle.checked);
            updateCompleteness();
            saveNow();
        });
    });

    // Clicks on the drag handle / arrows inside <summary> must not toggle the accordion
    document.querySelectorAll('.section-controls').forEach(el => {
        el.addEventListener('click', e => e.preventDefault());
    });

    function getSectionOrder() {
        // querySelectorAll returns document order, i.e. the current editor order
        return Array.from(document.querySelectorAll('.section-toggle'))
            .map(toggle => toggle.getAttribute('data-section'))
            .filter(Boolean);
    }

    function updatePreviewSectionOrder() {
        const orderedIds = getSectionOrder();
        document.querySelectorAll('#cv-preview-sheet .cv-section').forEach(sec => {
            const idx = orderedIds.indexOf(sec.id);
            sec.style.order = idx !== -1 ? idx : 99;
        });
    }

    function applySectionOrder(order) {
        if (!Array.isArray(order)) return;
        // Orders saved before a section existed don't list it: insert it after its default predecessor
        const fullOrder = order.map(String).filter(id => DEFAULT_SECTION_ORDER.includes(id));
        DEFAULT_SECTION_ORDER.forEach((sectionId, index) => {
            if (fullOrder.includes(sectionId)) return;
            const prevIndex = fullOrder.indexOf(DEFAULT_SECTION_ORDER[index - 1]);
            fullOrder.splice(prevIndex + 1, 0, sectionId);
        });
        fullOrder.forEach(sectionId => {
            const toggle = document.querySelector(`.section-toggle[data-section="${CSS.escape(String(sectionId))}"]`);
            const item = toggle?.closest('.accordion-item');
            if (item?.parentNode) item.parentNode.appendChild(item);
        });
        updatePreviewSectionOrder();
    }

    function resetSectionOrderToDefault() {
        applySectionOrder(DEFAULT_SECTION_ORDER);
        removeStorage(STORAGE_KEYS.sectionOrder);
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
        updatePreviewSectionOrder();
        saveNow();
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
    if (typeof Sortable !== 'undefined' && accordionContainer) {
        new Sortable(accordionContainer, {
            animation: 150,
            handle: '.accordion-trigger',
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
                updatePreviewSectionOrder();
                saveNow();
            }
        });
        document.querySelectorAll('.accordion-item:not([data-fixed="true"]) .accordion-trigger')
            .forEach(trigger => trigger.classList.add('is-draggable'));
    }

    // ----------------------------------------------------
    // State: collect / apply / persist
    // ----------------------------------------------------
    function collectState() {
        const items = (list, mapper) => Array.from(list.querySelectorAll('.dynamic-item')).map(mapper);
        const titles = {};
        Object.entries(SECTION_TITLE_DEFAULTS).forEach(([section, [inputId]]) => {
            titles[section] = $(inputId).value;
        });
        const toggles = {};
        sectionToggles.forEach(toggle => { toggles[toggle.getAttribute('data-section')] = toggle.checked; });

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
            skills: [{ name: skillsList.querySelector('.skill-name')?.value || '' }],
            titles,
            softskillsDesc: inputSoftSkillsDesc.value,
            photo: currentPhoto,
            experience: items(experienceList, item => ({
                role: val(item, '.exp-role'), company: val(item, '.exp-company'),
                dates: val(item, '.exp-dates'), desc: val(item, '.exp-desc')
            })),
            projects: items(projectsList, item => ({
                title: val(item, '.proj-title'), tech: val(item, '.proj-tech'), desc: val(item, '.proj-desc')
            })),
            education: items(educationList, item => ({
                degree: val(item, '.edu-degree'), school: val(item, '.edu-school'), dates: val(item, '.edu-dates')
            })),
            volunteer: items(volunteerList, item => ({
                role: val(item, '.vol-role'), organization: val(item, '.vol-org'),
                dates: val(item, '.vol-dates'), desc: val(item, '.vol-desc')
            })),
            certifications: items(certificationsList, item => ({
                name: val(item, '.cert-name'), issuer: val(item, '.cert-issuer'), date: val(item, '.cert-date')
            })),
            languages: items(languagesList, item => ({
                name: val(item, '.lang-name'), level: val(item, '.lang-level')
            })),
            toggles
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

        const toggles = state.toggles && typeof state.toggles === 'object' ? state.toggles : {};
        sectionToggles.forEach(toggle => {
            const saved = toggles[toggle.getAttribute('data-section')];
            setSectionEnabled(toggle, saved === undefined ? true : Boolean(saved));
        });

        clearDynamicLists();
        runBulk(() => {
            setSkillsField(validItems(state.skills).map(sk => str(sk.name)).filter(Boolean).join(', '));
            validItems(state.languages).forEach(lg => addLanguageField(str(lg.name), str(lg.level) || 'Básico'));
            validItems(state.experience).forEach(exp => addExperienceField(exp));
            validItems(state.projects).forEach(proj => addProjectField(proj));
            validItems(state.education).forEach(edu => addEducationField(edu));
            validItems(state.volunteer).forEach(vol => addVolunteerField(vol));
            validItems(state.certifications).forEach(cert => addCertificationField(cert));
        });
    }

    let saveFailedNotified = false;
    function saveNow() {
        scheduleSave.cancel();
        const ok = writeStorage(STORAGE_KEYS.state, JSON.stringify(collectState()));
        writeStorage(STORAGE_KEYS.sectionOrder, JSON.stringify(getSectionOrder()));
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
        window.addEventListener('afterprint', () => { document.title = originalTitle; }, { once: true });
        window.print();
    });

    // ----------------------------------------------------
    // Mobile: editor / preview switch and preview scaling
    // ----------------------------------------------------
    const previewPanel = document.querySelector('.preview-panel');
    const previewSheet = $('cv-preview-sheet');

    // Scales the A4 sheet down (never up) so it fits the preview panel without horizontal scroll
    function fitPreview() {
        if (!previewPanel || !previewSheet) return;
        previewSheet.style.zoom = '';
        const style = getComputedStyle(previewPanel);
        const available = previewPanel.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const sheetWidth = previewSheet.offsetWidth;
        if (available <= 0 || sheetWidth <= 0) return;
        const scale = Math.min(1, available / sheetWidth);
        if (scale < 1) previewSheet.style.zoom = scale.toFixed(4);
    }

    if (previewPanel && 'ResizeObserver' in window) {
        new ResizeObserver(() => fitPreview()).observe(previewPanel);
    }
    window.addEventListener('afterprint', fitPreview);
    window.addEventListener('beforeprint', () => { if (previewSheet) previewSheet.style.zoom = ''; });

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
        if (Array.isArray(order)) applySectionOrder(order);
        else updatePreviewSectionOrder();

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
