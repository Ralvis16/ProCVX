// ProCVX - Preview rendering: turns the editor state (same shape as the saved JSON)
// into the A4 sheet, plus the completeness meter.
(function (global) {
    const { escapeHtml, formatDescHtml, hasRealText, parseCommaSeparated, toSafeUrl, levelLabelKeys: LEVEL_LABEL_KEYS } = global.ProCVXUtils;

    // Section title inputs and the translation key of their default value
    const SECTION_TITLE_DEFAULTS = Object.freeze({
        profile: ['input-title-profile', 'def_profile'],
        experience: ['input-title-experience', 'def_experience'],
        projects: ['input-title-projects', 'def_projects'],
        volunteer: ['input-title-volunteer', 'def_volunteer'],
        education: ['input-title-education', 'def_education'],
        certifications: ['input-title-certifications', 'def_certifications'],
        skills: ['input-title-skills', 'def_skills'],
        softskills: ['input-title-softskills', 'def_softskills'],
        languages: ['input-title-languages', 'def_languages']
    });

    // ---- HTML for one item of each list (pure: item + translations -> HTML string) ----
    const html = Object.freeze({
        experience({ role, company, dates, desc }, t) {
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
        },

        projects({ title, tech, desc }) {
            const techBadges = parseCommaSeparated(tech)
                .map(name => `<span class="cv-badge-tech">${escapeHtml(name)}</span>`)
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
        },

        education({ degree, school, dates }, t) {
            return `
            <div class="cv-item-block">
                <div class="cv-item-title">${degree ? escapeHtml(degree) : t.lbl_edu_degree}</div>
                <div class="cv-item-meta">${school ? escapeHtml(school) : t.lbl_edu_school}</div>
                <div class="cv-item-dates">${escapeHtml(dates)}</div>
            </div>
        `;
        },

        volunteer({ role, organization, dates, desc }) {
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
        },

        certifications({ name, issuer, date }) {
            return `
            <div class="cv-item-block">
                <div class="cv-item-title">${escapeHtml(name)}</div>
                ${issuer.trim() ? `<div class="cv-item-meta">${escapeHtml(issuer)}</div>` : ''}
                ${date.trim() ? `<div class="cv-item-dates">${escapeHtml(date)}</div>` : ''}
            </div>
        `;
        },

        skills(names) {
            return `<div class="cv-tags">${
                names.map(name => `<span class="cv-tag">${escapeHtml(name)}</span>`).join('')
            }</div>`;
        }
    });

    // Which items of each list are shown: the rest are still being filled in
    const LIST_SECTIONS = Object.freeze([
        ['experience', 'cv-section-experience', 'preview-experience', i => i.role || i.company],
        ['projects', 'cv-section-projects', 'preview-projects', i => i.title],
        ['education', 'cv-section-education', 'preview-education', i => i.degree || i.school],
        ['volunteer', 'cv-section-volunteer', 'preview-volunteer', i => i.role || i.organization],
        ['certifications', 'cv-section-certifications', 'preview-certifications', i => i.name]
    ]);

    const skillNames = state => parseCommaSeparated(state.skills?.[0]?.name);

    // getTranslations(): the translation table of the current language
    function create({ getTranslations }) {
        const document = global.document;
        const $ = id => document.getElementById(id);

        function renderPhoto(state) {
            const previewPhoto = $('preview-photo');
            const btnRemovePhoto = $('btn-remove-photo');
            const inputPhoto = $('input-photo');
            if (state.photo) {
                previewPhoto.src = state.photo;
                previewPhoto.alt = state.fullname.trim();
                previewPhoto.hidden = false;
                if (btnRemovePhoto) btnRemovePhoto.hidden = false;
            } else {
                previewPhoto.removeAttribute('src');
                previewPhoto.hidden = true;
                if (btnRemovePhoto) btnRemovePhoto.hidden = true;
                if (inputPhoto) inputPhoto.value = '';
            }
        }

        function renderSectionTitles(state, t) {
            Object.keys(SECTION_TITLE_DEFAULTS).forEach(section => {
                const span = document.querySelector(`#preview-title-${section}-header span`);
                if (span) span.textContent = state.titles[section] || t[SECTION_TITLE_DEFAULTS[section][1]];
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

        function renderTextAndContact(state, t) {
            // Long names break after the second word so the header stays balanced
            let nameToDisplay = state.fullname.trim();
            const nameWords = nameToDisplay.split(/\s+/);
            if (nameWords.length > 2) {
                nameToDisplay = nameWords[0] + ' ' + nameWords[1] + '\n' + nameWords.slice(2).join(' ');
            }
            setText('preview-fullname', nameToDisplay, t.lbl_fullname);
            setText('preview-title', state.title, t.lbl_title);
            setText('preview-summary', state.summary, t.lbl_summary + '...');

            setContact('preview-email', 'cv-contact-email-container', state.email, 'email');
            setContact('preview-phone', 'cv-contact-phone-container', state.phone, 'phone');
            setContact('preview-location', 'cv-contact-location-container', state.location, 'text');
            setContact('preview-website', 'cv-contact-website-container', state.website, 'url');
            setContact('preview-link', 'cv-contact-link-container', state.link, 'url');
            setContact('preview-linkedin', 'cv-contact-linkedin-container', state.linkedin, 'url');
        }

        // Renders one list into its preview container; hides the section when the list is empty.
        function renderLists(state, t) {
            LIST_SECTIONS.forEach(([key, sectionId, containerId, isShown]) => {
                const items = state[key];
                const section = $(sectionId);
                if (items.length === 0) {
                    section.style.display = 'none';
                    $(containerId).innerHTML = '';
                    return;
                }
                section.style.display = 'flex';
                $(containerId).innerHTML = items.filter(isShown).map(item => html[key](item, t)).join('');
            });
        }

        function renderSkills(state) {
            const names = skillNames(state);
            const section = $('cv-section-skills');
            if (names.length === 0) {
                section.style.display = 'none';
                return;
            }
            section.style.display = 'flex';
            $('preview-skills-dynamic').innerHTML = html.skills(names);
        }

        function renderSoftSkills(state) {
            const section = $('cv-section-softskills');
            if (!hasRealText(state.softskillsDesc)) {
                section.style.display = 'none';
                return;
            }
            section.style.display = 'flex';
            $('preview-softskills-desc').innerHTML = formatDescHtml(state.softskillsDesc);
        }

        function renderLanguages(state, t) {
            const container = $('preview-languages-list');
            container.innerHTML = '';
            state.languages.forEach(lang => {
                const name = lang.name.trim();
                if (!name) return;
                const level = lang.level.trim();
                const row = document.createElement('div');
                row.className = 'cv-language-row';
                const strong = document.createElement('strong');
                strong.textContent = name + ':';
                row.append(strong, ' ' + (t[LEVEL_LABEL_KEYS[level]] || level));
                container.appendChild(row);
            });
            $('cv-section-languages').style.display = state.languages.length === 0 ? 'none' : 'block';
        }

        // Progress bar telling the user which essential fields are still missing
        function renderCompleteness(state) {
            const bar = $('completeness-bar');
            if (!bar) return;
            const t = getTranslations();
            const enabled = sectionId => state.toggles[sectionId] !== false;
            const anyItem = (items, fields) => items.some(item => fields.some(field => item[field].trim()));

            const checks = [
                ['chk_name', state.fullname.trim()],
                ['chk_title', state.title.trim()],
                ['chk_email', state.email.trim()],
                ['chk_phone', state.phone.trim()]
            ];
            if (enabled('cv-section-summary')) checks.push(['chk_summary', state.summary.trim()]);
            if (enabled('cv-section-experience')) checks.push(['chk_experience', anyItem(state.experience, ['role', 'company'])]);
            if (enabled('cv-section-education')) checks.push(['chk_education', anyItem(state.education, ['degree', 'school'])]);
            if (enabled('cv-section-skills') || enabled('cv-section-softskills')) {
                checks.push(['chk_skills', skillNames(state).length > 0 || hasRealText(state.softskillsDesc)]);
            }
            if (enabled('cv-section-languages')) checks.push(['chk_languages', anyItem(state.languages, ['name'])]);

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

        function render(state) {
            const t = getTranslations();
            renderPhoto(state);
            renderSectionTitles(state, t);
            renderTextAndContact(state, t);
            renderLists(state, t);
            renderSkills(state);
            renderSoftSkills(state);
            renderLanguages(state, t);
            renderCompleteness(state);
        }

        return { render, renderCompleteness };
    }

    global.ProCVXRender = Object.freeze({ create, html, sectionTitleDefaults: SECTION_TITLE_DEFAULTS });
})(window);
