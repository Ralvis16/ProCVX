// ProCVX - Dynamic editor forms (experience, projects, education, volunteer, certifications,
// skills and languages): creates the blocks, wires their controls and reads their values back.
(function (global) {
    const { escapeHtml, normalizeLevel, levelLabelKeys: LEVEL_LABEL_KEYS } = global.ProCVXUtils;

    // hooks.onChange(): a field changed or an item was removed / moved (re-render the preview)
    // hooks.onItemsAdded(): new items are in the DOM (render icons and translate their labels)
    function create(hooks) {
        const document = global.document;
        const $ = id => document.getElementById(id);

        const lists = {
            experience: $('experience-list'),
            projects: $('projects-list'),
            education: $('education-list'),
            volunteer: $('volunteer-list'),
            certifications: $('certifications-list'),
            skills: $('skills-list'),
            languages: $('languages-list')
        };

        const idCounters = { exp: 0, proj: 0, edu: 0, vol: 0, cert: 0, lang: 0 };
        const nextId = prefix => `${prefix}-${idCounters[prefix]++}`;

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
            if (bulkDepth === 0) hooks.onItemsAdded();
        }

        function setupItemListeners(itemId) {
            const item = $(itemId);
            if (!item) return;

            item.querySelectorAll('input, textarea, select').forEach(input => {
                input.addEventListener('input', hooks.onChange);
            });

            item.querySelector('.btn-remove-item')?.addEventListener('click', () => {
                item.classList.add('removing');
                setTimeout(() => {
                    item.remove();
                    hooks.onChange();
                }, 150);
            });

            item.querySelector('.btn-move-up')?.addEventListener('click', () => {
                const prev = item.previousElementSibling;
                if (prev) {
                    item.parentNode.insertBefore(item, prev);
                    hooks.onChange();
                }
            });

            item.querySelector('.btn-move-down')?.addEventListener('click', () => {
                const next = item.nextElementSibling;
                if (next) {
                    item.parentNode.insertBefore(next, item);
                    hooks.onChange();
                }
            });
        }

        function appendDynamicField(listElement, id, innerHtml) {
            if (!listElement) return;
            listElement.insertAdjacentHTML('beforeend', createDynamicItemContainer(id, innerHtml));
            setupItemListeners(id);
            if (bulkDepth === 0) hooks.onItemsAdded();
        }

        function clear() {
            Object.values(lists).forEach(list => { if (list) list.innerHTML = ''; });
        }

        function addExperience(data = {}) {
            data = data || {};
            const id = nextId('exp');
            appendDynamicField(lists.experience, id, `
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

        function addProject(data = {}) {
            data = data || {};
            const id = nextId('proj');
            appendDynamicField(lists.projects, id, `
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

        function addEducation(data = {}) {
            data = data || {};
            const id = nextId('edu');
            appendDynamicField(lists.education, id, `
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

        function addVolunteer(data = {}) {
            data = data || {};
            const id = nextId('vol');
            appendDynamicField(lists.volunteer, id, `
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

        function addCertification(data = {}) {
            data = data || {};
            const id = nextId('cert');
            appendDynamicField(lists.certifications, id, `
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
        function setSkills(name = '') {
            lists.skills.innerHTML = `
            <div class="form-group">
                <label for="input-skills" data-i18n="lbl_skill_name">Habilidad / Tecnología (Separadas por comas)</label>
                <input type="text" id="input-skills" class="skill-name" data-i18n="ph_skill_name" value="${escapeHtml(name)}" placeholder="Ej. Liderazgo, React, Excel">
            </div>
        `;
            lists.skills.querySelector('.skill-name').addEventListener('input', hooks.onChange);
            if (bulkDepth === 0) hooks.onItemsAdded();
        }

        function addLanguage(name = '', level = 'Básico') {
            level = normalizeLevel(level);
            const id = nextId('lang');
            const option = (value, key) =>
                `<option value="${value}" data-i18n="${key}" ${level === value ? 'selected' : ''}>${value}</option>`;
            appendDynamicField(lists.languages, id, `
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

        // Up/down arrows are disabled on the first/last item of each list
        function updateControlsState() {
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

        // Reads every list back, in editor order. Same shape as the saved / exported JSON.
        function collect() {
            const val = (item, selector) => item.querySelector(selector).value;
            const items = (list, mapper) => Array.from(list.querySelectorAll('.dynamic-item')).map(mapper);
            return {
                skills: [{ name: lists.skills.querySelector('.skill-name')?.value || '' }],
                experience: items(lists.experience, item => ({
                    role: val(item, '.exp-role'), company: val(item, '.exp-company'),
                    dates: val(item, '.exp-dates'), desc: val(item, '.exp-desc')
                })),
                projects: items(lists.projects, item => ({
                    title: val(item, '.proj-title'), tech: val(item, '.proj-tech'), desc: val(item, '.proj-desc')
                })),
                education: items(lists.education, item => ({
                    degree: val(item, '.edu-degree'), school: val(item, '.edu-school'), dates: val(item, '.edu-dates')
                })),
                volunteer: items(lists.volunteer, item => ({
                    role: val(item, '.vol-role'), organization: val(item, '.vol-org'),
                    dates: val(item, '.vol-dates'), desc: val(item, '.vol-desc')
                })),
                certifications: items(lists.certifications, item => ({
                    name: val(item, '.cert-name'), issuer: val(item, '.cert-issuer'), date: val(item, '.cert-date')
                })),
                languages: items(lists.languages, item => ({
                    name: val(item, '.lang-name'), level: val(item, '.lang-level')
                }))
            };
        }

        [
            ['btn-add-experience', addExperience],
            ['btn-add-project', addProject],
            ['btn-add-education', addEducation],
            ['btn-add-language', addLanguage],
            ['btn-add-volunteer', addVolunteer],
            ['btn-add-certification', addCertification]
        ].forEach(([buttonId, addField]) => {
            $(buttonId)?.addEventListener('click', () => addField());
        });

        return {
            runBulk, clear, collect, updateControlsState, setSkills,
            addExperience, addProject, addEducation, addVolunteer, addCertification, addLanguage
        };
    }

    global.ProCVXForms = Object.freeze({ create });
})(window);
