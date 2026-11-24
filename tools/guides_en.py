"""English guides for tools/build-guides.py (content is plain HTML).

Each guide names its Spanish counterpart in 'es' so the pages link to each other with hreflang.
These are adaptations for an international audience, not literal translations.
"""

GUIDES_EN = [
    {
        'slug': 'resume-no-experience',
        'es': 'cv-sin-experiencia',
        'published': '2026-11-24',
        'title': 'How to write a resume with no experience (with examples)',
        'short': 'Resume with no experience',
        'description': 'Step-by-step guide to your first resume with no work experience: which sections to include, how to highlight education, projects and volunteering, with real examples.',
        'lead': 'Having no experience doesn’t mean having nothing to say. A good first resume shows what you can do through what you have already done: school, internships, projects, volunteering or odd jobs.',
        'body': '''
<nav class="toc" aria-label="Contents">
  <strong>In this guide</strong>
  <ol>
    <li><a href="#order">The order of the sections</a></li>
    <li><a href="#summary">A short, specific summary</a></li>
    <li><a href="#experience">What to list instead of experience</a></li>
    <li><a href="#skills">Skills that can be checked</a></li>
    <li><a href="#mistakes">Common mistakes</a></li>
  </ol>
</nav>

<h2 id="order">1. The order of the sections</h2>
<p>Recruiters spend a few seconds on the first look, so your strongest material goes at the top. Without work experience, this order works well:</p>
<ol>
  <li><strong>Contact details:</strong> name, phone, email and city. Add LinkedIn or a portfolio if you have one.</li>
  <li><strong>Summary:</strong> two or three lines about who you are and what you are looking for.</li>
  <li><strong>Education:</strong> your strong point right now.</li>
  <li><strong>Projects, internships or volunteering:</strong> these play the role of “experience”.</li>
  <li><strong>Skills, tools and languages.</strong></li>
</ol>
<p>One page is enough. A two-page first resume usually means filler.</p>

<h2 id="summary">2. A short, specific summary</h2>
<p>Avoid sentences anyone could write (“hard-working, responsible and eager to learn”). Say what you study or studied, what you can do and which job you are aiming for.</p>
<div class="compare">
  <div class="bad"><span class="label">Generic</span>Motivated, responsible young person, eager to learn and grow professionally.</div>
  <div class="good"><span class="label">Specific</span>Recent accounting graduate with advanced Excel and hands-on invoicing experience in QuickBooks. Looking for my first role in an accounts payable team.</div>
</div>

<h2 id="experience">3. What to list instead of experience</h2>
<p>Employers hiring junior profiles don’t expect years of work: they want proof that you can apply what you learned. All of this counts:</p>
<ul>
  <li><strong>Internships</strong> from your degree or course, even if they only lasted a few weeks.</li>
  <li><strong>Projects</strong>: class work, your final-year project or personal projects (a website, an app, a market study…).</li>
  <li><strong>Volunteering</strong> and activities in clubs, associations or events.</li>
  <li><strong>Part-time and seasonal jobs</strong> like waiting tables, camp counselor, retail or tutoring: they show responsibility and people skills.</li>
</ul>
<p>Describe them with action verbs and, when you can, a result.</p>
<div class="compare">
  <div class="bad"><span class="label">Vague</span>Did a website project in class.</div>
  <div class="good"><span class="label">With a result</span>Built a restaurant booking website in a team of three (HTML, CSS and JavaScript); final grade A.</div>
</div>
<div class="tip"><p><strong>Tip:</strong> in ProCVX you can rename any section. With no experience, rename “Work Experience” to “Internships”, or turn it off and use “Projects” and “Volunteering” instead.</p></div>

<h2 id="skills">4. Skills that can be checked</h2>
<p>Separate concrete tools (Excel, Photoshop, SQL, a language) from soft skills, and don’t just list them: where you can, show them in your projects.</p>
<ul>
  <li>For <strong>languages</strong>, give a realistic level (B1, B2… or “intermediate”/“fluent”). It can be tested in the interview.</li>
  <li>Short <strong>certifications and courses</strong> (office software, first aid, food safety, online courses) add up, especially when they relate to the job.</li>
</ul>

<h2 id="mistakes">5. Common mistakes</h2>
<ul>
  <li>An unprofessional email address. Use your first and last name.</li>
  <li>Typos. Read it out loud or ask someone to check it.</li>
  <li>Sending the same resume to every job. Adjust the summary and the order of your skills to each one.</li>
  <li>Sending it as a Word file. Export it to PDF so it looks the same on any device.</li>
</ul>
''',
    },
    {
        'slug': 'ats-resume',
        'es': 'cv-ats',
        'published': '2026-11-24',
        'title': 'ATS-friendly resume: how to get past the automatic filter',
        'short': 'ATS-friendly resume',
        'description': 'What an applicant tracking system (ATS) is, why it can bury your resume before a person reads it, and how to format a resume that these systems read without problems.',
        'lead': 'Many companies use applicant tracking systems (ATS) that read and rank resumes before a person sees them. If the software can’t understand your resume, it can end up at the bottom of the list even if you fit the job.',
        'body': '''
<nav class="toc" aria-label="Contents">
  <strong>In this guide</strong>
  <ol>
    <li><a href="#what">What an ATS is</a></li>
    <li><a href="#format">Formatting that ATS read well</a></li>
    <li><a href="#keywords">Keywords from the job posting</a></li>
    <li><a href="#check">How to check your resume</a></li>
  </ol>
</nav>

<h2 id="what">1. What an ATS is</h2>
<p>An <em>applicant tracking system</em> is the software a company uses to manage its openings: it receives resumes, extracts their text (name, job titles, dates, education, skills) and lets recruiters search and filter candidates. Everyone from large companies to job boards uses them.</p>
<p>The key point: an ATS works with the <strong>text</strong> of your resume. Anything it can’t extract as text doesn’t exist for it.</p>

<h2 id="format">2. Formatting that ATS read well</h2>
<ul>
  <li><strong>A single column</strong> is the safest choice. Some systems read columns mixed together.</li>
  <li><strong>Standard section headings:</strong> “Work Experience”, “Education”, “Skills”, “Languages”. A creative heading (“My Journey”) may not be recognized.</li>
  <li><strong>Real text, not images:</strong> no logo with your name, no screenshots of diplomas. Decorative icons are fine if the information is written next to them.</li>
  <li><strong>Contact details in the body of the document</strong>, not in the Word header or footer, which some systems ignore.</li>
  <li><strong>Clear, consistent dates</strong> (“Mar 2021 – Present”).</li>
  <li><strong>A PDF made from text</strong>, not a scan. If you can select and copy the words when you open it, an ATS can read them too.</li>
  <li>Avoid complex tables, text boxes and “skill level” graphics (bars or stars): they carry no readable information.</li>
</ul>
<div class="tip"><p><strong>In ProCVX:</strong> the <strong>Minimalist (ATS-friendly)</strong> layout uses a single column and exports to PDF with selectable text and bullet points in the right order.</p></div>

<h2 id="keywords">3. Keywords from the job posting</h2>
<p>Recruiters often search the ATS for terms from the posting: the job title, tools, degrees or certifications. If your resume doesn’t contain them, you won’t show up in those searches.</p>
<ol>
  <li>Read the posting and underline concrete requirements: “Salesforce”, “customer service”, “forklift certification”, “fluent Spanish”.</li>
  <li>Check which ones you really have and write them <strong>with the same words</strong> as the posting, in your summary, experience or skills.</li>
  <li>Include both the acronym and the full form when there is one: “Search Engine Optimization (SEO)”.</li>
</ol>
<div class="compare">
  <div class="bad"><span class="label">No match</span>Handled orders with the company’s software.</div>
  <div class="good"><span class="label">Matches the posting</span>Processed orders and invoices in SAP Business One.</div>
</div>
<p>Don’t stuff your resume with keywords you can’t back up: getting past the filter only helps if you can prove it in the interview.</p>

<h2 id="check">4. How to check your resume</h2>
<ul>
  <li>Open the PDF, select everything (Ctrl+A or Cmd+A) and paste it into a plain text editor. If the text comes out complete and in order, you’re fine.</li>
  <li>Make sure your name, email and phone number appear as text.</li>
  <li>Give the file a clear name: <code>First_Last_Resume.pdf</code>.</li>
</ul>
''',
    },
    {
        'slug': 'cover-letter',
        'es': 'carta-de-presentacion',
        'published': '2026-11-24',
        'title': 'How to write a cover letter (with an example)',
        'short': 'Cover letter',
        'description': 'How to write a cover letter people actually read: a four-paragraph structure, what goes in each part, a full example and the mistakes to avoid.',
        'lead': 'A cover letter doesn’t repeat your resume: it explains why you fit <em>this</em> job at <em>this</em> company. Done well, it takes a minute to read and sets you apart from everyone who only attached a resume.',
        'body': '''
<nav class="toc" aria-label="Contents">
  <strong>In this guide</strong>
  <ol>
    <li><a href="#when">When to send one</a></li>
    <li><a href="#structure">The four-paragraph structure</a></li>
    <li><a href="#example">A full example</a></li>
    <li><a href="#email">If you send it by email</a></li>
    <li><a href="#mistakes">Common mistakes</a></li>
  </ol>
</nav>

<h2 id="when">1. When to send one</h2>
<p>Send one whenever the posting asks for it, and also in these cases:</p>
<ul>
  <li><strong>Speculative applications:</strong> you write to a company that hasn’t posted a job. Without a letter, nobody knows what role you want.</li>
  <li><strong>Changing careers</strong>, or a gap in your history that is worth explaining in one sentence.</li>
  <li><strong>Small companies or niche roles</strong>, where the person hiring usually reads everything.</li>
</ul>
<p>On job boards with an optional cover letter field, a few tailored lines are worth more than leaving it empty or pasting a generic text.</p>

<h2 id="structure">2. The four-paragraph structure</h2>
<p>You don’t need more than a page; 200 to 300 words is ideal.</p>
<ol>
  <li><strong>Greeting and purpose.</strong> Address a person by name if you know it. Say which job you are applying for and where you saw it.</li>
  <li><strong>Why you fit.</strong> Pick two or three requirements from the posting and show you meet them with a fact or an achievement.</li>
  <li><strong>Why this company.</strong> One or two sentences that prove you know it: a product, a project, the way they work.</li>
  <li><strong>Closing.</strong> Availability, an invitation to interview and a sign-off.</li>
</ol>
<div class="compare">
  <div class="bad"><span class="label">Generic</span>I am writing to offer my services, as I am a hard-working person who is eager to learn.</div>
  <div class="good"><span class="label">Specific</span>I’m applying for the Administrative Assistant role posted on Indeed. During my internship at an accounting firm I processed over 200 invoices a month in QuickBooks, one of the tools you list.</div>
</div>

<h2 id="example">3. A full example</h2>
<div class="example">
  <p>Dear Ms. Garcia,</p>
  <p>I’m writing to apply for the Sales Associate position at your downtown store, posted on your website last week.</p>
  <p>For the last two summers I worked as a sales associate at a sporting goods store serving more than 300 customers a day, where I handled the register, restocking, and returns. During peak season I suggested a queue system for the fitting rooms that cut rush-hour lines noticeably. I also speak fluent Spanish, which helps in a neighborhood with so many visitors.</p>
  <p>I know your brand as a customer and I especially like the personal service your staff gives. I’d love to bring that same care to your team.</p>
  <p>I’m available to start right away and have a flexible schedule. I’d be glad to meet for an interview whenever it suits you.</p>
  <p>Best regards,<br>Laura Martinez · (555) 123-4567 · laura.martinez@email.com</p>
</div>

<h2 id="email">4. If you send it by email</h2>
<ul>
  <li><strong>Clear subject line:</strong> “Application: Sales Associate, Downtown – Laura Martinez”.</li>
  <li>You can write the letter in the <strong>body of the email</strong> (easier to read) and attach your resume as a PDF.</li>
  <li>Check the company’s and the person’s name before sending: it’s the easiest mistake to make when you reuse a letter.</li>
</ul>
<div class="tip"><p><strong>Tip:</strong> make sure what you say in the letter also appears in your resume. With ProCVX you can tailor your summary and experience to each job and export it to PDF in a minute.</p></div>

<h2 id="mistakes">5. Common mistakes</h2>
<ul>
  <li>Opening with “To whom it may concern” and a filler sentence. Get to the point in the first line.</li>
  <li>Rewriting your resume as paragraphs. The letter selects and explains; it doesn’t list.</li>
  <li>Talking only about what you want (“I’m looking to grow”) and not about what you bring.</li>
  <li>Sending the same letter to every company. It shows.</li>
</ul>
''',
    },
    {
        'slug': 'resume-summary',
        'es': 'perfil-profesional-cv',
        'published': '2026-11-24',
        'title': 'How to write a resume summary (10 examples)',
        'short': 'Resume summary',
        'description': 'How to write the professional summary at the top of your resume in three sentences, with a simple formula and 10 examples for different jobs and experience levels.',
        'lead': 'The resume summary is the two or three lines under your name. It’s the first thing people read, so it has to answer one question fast: why should I keep reading this resume?',
        'body': '''
<nav class="toc" aria-label="Contents">
  <strong>In this guide</strong>
  <ol>
    <li><a href="#formula">A three-sentence formula</a></li>
    <li><a href="#examples">10 resume summary examples</a></li>
    <li><a href="#tailor">How to tailor it to each job</a></li>
    <li><a href="#avoid">What to avoid</a></li>
  </ol>
</nav>

<h2 id="formula">1. A three-sentence formula</h2>
<ol>
  <li><strong>Who you are:</strong> your job title or qualification and, if you have them, your years of experience.</li>
  <li><strong>What you do well:</strong> two or three specialties, tools, or an achievement with a number.</li>
  <li><strong>What you want:</strong> the kind of role or company you are aiming for.</li>
</ol>
<p>Write it without pronouns (“Lab technician with…”) and keep the same voice throughout. 40 to 70 words is plenty.</p>
<div class="compare">
  <div class="bad"><span class="label">Generic</span>Proactive, results-driven professional with strong teamwork skills.</div>
  <div class="good"><span class="label">Specific</span>B2B sales rep with 6 years selling industrial supplies. Grew my territory’s client base by 30% in two years. Looking for a key account manager role.</div>
</div>

<h2 id="examples">2. 10 resume summary examples</h2>
<div class="example">
  <p><strong>No experience (recent graduate)</strong><br>
  Marketing and communications graduate with an internship at a digital agency, where I managed social media for three clients. Skilled in Meta Business Suite, Canva and Google Analytics. Looking for my first role on a digital marketing team.</p>
</div>
<div class="example">
  <p><strong>Student</strong><br>
  Second-year IT support student (graduating June 2026) with hands-on experience building PCs and helping users during my internship. Available for afternoon and weekend shifts.</p>
</div>
<div class="example">
  <p><strong>Administration</strong><br>
  Office administrator with 5 years of experience in bookkeeping and invoicing for small businesses. Advanced Excel and QuickBooks; handled quarterly tax filings. Looking for a stable role in a finance department.</p>
</div>
<div class="example">
  <p><strong>Customer service</strong><br>
  Call center agent with 3 years of customer support and issue resolution for a telecom provider, averaging 4.7/5 in customer ratings. Bilingual English–Spanish. Interested in tier-2 support roles.</p>
</div>
<div class="example">
  <p><strong>Hospitality</strong><br>
  Server with 4 years of floor and bar experience in restaurants of up to 120 covers. Food handler certified, with cocktail training. Looking for a steady role in a restaurant or hotel.</p>
</div>
<div class="example">
  <p><strong>Retail</strong><br>
  Sales associate with experience in fashion and electronics stores: register, restocking, visual merchandising and consultative selling. Beat my monthly sales target in 9 of the last 12 months.</p>
</div>
<div class="example">
  <p><strong>Logistics</strong><br>
  Warehouse associate with a forklift certification and 7 years of order picking with RF scanners and WMS. Used to rotating shifts and peak-season volume.</p>
</div>
<div class="example">
  <p><strong>Healthcare</strong><br>
  Certified nursing assistant with 2 years on an internal medicine ward and experience in elder care. Trained in safe patient handling and first aid.</p>
</div>
<div class="example">
  <p><strong>Tech</strong><br>
  Web developer with 4 years of experience in JavaScript, React and Node.js. Led the migration of an online store with 50,000 monthly users. Looking for a role on a product team.</p>
</div>
<div class="example">
  <p><strong>Career change</strong><br>
  After 8 years as a high school teacher, I’ve specialized in corporate training with a course in instructional design. Experienced in building content, public speaking and measuring results. Looking for a corporate trainer role.</p>
</div>

<h2 id="tailor">3. How to tailor it to each job</h2>
<p>The summary is the part of your resume most worth changing from one application to the next:</p>
<ul>
  <li>Use the <strong>same job title</strong> as the posting if it matches your experience.</li>
  <li>Lead with the tools or requirements the posting mentions. That also helps you get past <a href="../ats-resume/">ATS filters</a>.</li>
  <li>Change the last sentence (“what you want”) to suit the kind of company.</li>
</ul>
<div class="tip"><p><strong>Tip:</strong> in ProCVX, save a JSON copy of your resume before tailoring it. That way you can keep one version per industry and load it when you need it.</p></div>

<h2 id="avoid">4. What to avoid</h2>
<ul>
  <li>Adjectives without proof: “dynamic”, “proactive”, “self-starter”. Replace them with a fact.</li>
  <li>Objectives that are only about you (“seeking to develop my career”). Say what you bring.</li>
  <li>Paragraphs longer than four lines. If it can’t be read at a glance, it won’t be read.</li>
  <li>Personal details (age, marital status, photo in many countries): they add nothing and can work against you.</li>
</ul>
''',
    },
    {
        'slug': 'hospitality-resume',
        'es': 'cv-hosteleria',
        'published': '2026-11-24',
        'title': 'Hospitality resume: server, kitchen and front desk',
        'short': 'Hospitality resume',
        'description': 'How to write a hospitality resume: what to highlight for server, line cook or front desk jobs, example bullet points for each role and which certifications to include.',
        'lead': 'Hospitality hires fast and reads fast. Managers want to know in seconds where you’ve worked, how busy it was and whether you can start now. Your resume should make that obvious at a glance.',
        'body': '''
<nav class="toc" aria-label="Contents">
  <strong>In this guide</strong>
  <ol>
    <li><a href="#basics">What can’t be missing</a></li>
    <li><a href="#experience">How to describe your experience</a></li>
    <li><a href="#roles">Examples by role</a></li>
    <li><a href="#certifications">Certifications and languages</a></li>
    <li><a href="#first-job">If it’s your first hospitality job</a></li>
  </ol>
</nav>

<h2 id="basics">1. What can’t be missing</h2>
<ul>
  <li><strong>Your phone number</strong> right at the top. In hospitality, managers call more than they email.</li>
  <li><strong>Availability:</strong> immediate start, weekends, summer season, split shifts… Put it in your summary.</li>
  <li><strong>Area or city</strong>, and whether you have your own transportation, especially for late shifts.</li>
  <li><strong>One page</strong>, most recent experience first.</li>
</ul>

<h2 id="experience">2. How to describe your experience</h2>
<p>“Server at Bar X” doesn’t say much. The type of venue and how busy it was make the difference: a quiet café is not a 200-cover restaurant.</p>
<ul>
  <li>Type of venue: café, casual dining, fine dining, hotel, beach bar, catering, events.</li>
  <li>Volume: covers per service, tables in your section, rooms in the hotel.</li>
  <li>Concrete duties and tools (POS systems, hotel PMS, digital ordering).</li>
</ul>
<div class="compare">
  <div class="bad"><span class="label">Unclear</span>Server. Waited tables and served drinks.</div>
  <div class="good"><span class="label">Clear</span>Server at a 90-cover à la carte restaurant. Ran a 6-table section, recommended wine pairings, handled payments on Toast POS and set up the dining room.</div>
</div>

<h2 id="roles">3. Examples by role</h2>
<div class="example">
  <p><strong>Server or bartender</strong><br>
  • Floor and bar service on shifts of up to 150 covers.<br>
  • Prepared espresso drinks, mixed drinks and classic cocktails.<br>
  • Took orders and payments on the POS; closed out the register.</p>
</div>
<div class="example">
  <p><strong>Line or prep cook</strong><br>
  • Mise en place, sides and plating on the cold station.<br>
  • Logged temperatures and followed HACCP food safety procedures.<br>
  • Received deliveries, rotated stock (FIFO) and kept the kitchen clean.</p>
</div>
<div class="example">
  <p><strong>Front desk agent</strong><br>
  • Check-in and check-out at a 120-room 4-star hotel.<br>
  • Managed reservations in the PMS and on Booking.com.<br>
  • Assisted guests in English, Spanish and French.</p>
</div>

<h2 id="certifications">4. Certifications and languages</h2>
<p>Give them their own <strong>Certifications</strong> section; in this industry, managers look for it:</p>
<ul>
  <li><strong>Food handler or food hygiene certificate</strong> (for example ServSafe in the US or Level 2 Food Hygiene in the UK). Many venues require one to work with food.</li>
  <li>Responsible alcohol service, allergen awareness, HACCP, barista or sommelier courses.</li>
  <li>First aid.</li>
  <li><strong>Languages</strong> with a real level: in tourist areas, a second language can decide the hire.</li>
</ul>
<div class="tip"><p><strong>In ProCVX:</strong> the Certifications section shows each course with its issuer and date in the side column, so it’s visible without taking space from your experience.</p></div>

<h2 id="first-job">5. If it’s your first hospitality job</h2>
<p>Attitude and availability count for a lot, but you can also show that you’re good with people and work well under pressure:</p>
<ul>
  <li>Customer-facing jobs (retail, camp counselor, events).</li>
  <li>Volunteering at food banks, festivals or community events.</li>
  <li>A food handler course: it’s short and shows you’re serious.</li>
</ul>
<p>More ideas in the guide to writing a <a href="../resume-no-experience/">resume with no experience</a>.</p>
''',
    },
]
