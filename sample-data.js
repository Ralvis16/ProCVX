// ProCVX - Sample resume data (same shape as the saved / exported JSON state)
(function (global) {
    const es = {
        fullname: 'Alex Torto Ramos',
        title: 'Gestor de Proyectos Senior · Consultor Estratégico',
        email: 'alextorto@correo.com',
        phone: '+34 612 345 678',
        location: 'Barcelona, España',
        website: 'alextorto.com',
        link: '',
        linkedin: 'linkedin.com/in/alextorto',
        summary: 'Gestor de proyectos con más de 10 años de experiencia liderando equipos multidisciplinares y optimizando procesos. Combino la gestión ágil con el análisis de datos para cumplir objetivos de negocio.',
        skills: [{ name: 'Jira, Microsoft Project, Power BI, Excel avanzado, SAP ERP, SQL' }],
        softskillsDesc: '• Gestión ágil (Scrum, Kanban)\n• Liderazgo de equipos\n• Comunicación y negociación\n• Resolución de problemas',
        photo: null,
        languages: [
            { name: 'Español', level: 'Nativo' },
            { name: 'Inglés', level: 'Avanzado' },
            { name: 'Francés', level: 'Intermedio' }
        ],
        projects: [
            {
                title: 'Transformación Digital Departamental',
                tech: 'Gestión del cambio, CRM, Formación',
                desc: 'Estrategia de transformación digital del área de ventas: 95 % de adopción del nuevo CRM en 3 meses.'
            }
        ],
        experience: [
            {
                role: 'Gestor de Proyectos Senior',
                company: 'Innovación Global S.A.',
                dates: 'Mar 2021 - Actualidad',
                desc: '• Liderazgo de un equipo de 15 personas en nuevos procesos operativos.\n• Reducción de los costes operativos en un 20 % el primer año.'
            },
            {
                role: 'Consultor de Estrategia',
                company: 'Estrategias Empresariales S.L.',
                dates: 'Mar 2018 - Feb 2021',
                desc: '• Análisis de mercado e informes para clientes del sector retail.\n• Apoyo en la reestructuración de departamentos financieros.'
            },
            {
                role: 'Analista de Datos',
                company: 'DataTech Solutions',
                dates: 'Sep 2011 - Feb 2018',
                desc: '• Desarrollo de cuadros de mando interactivos en Power BI.\n• Presentación de conclusiones a la dirección ejecutiva.'
            }
        ],
        education: [
            { degree: 'Máster en Dirección de Empresas (MBA)', school: 'Universidad de Barcelona', dates: '2016 - 2018' },
            { degree: 'Grado en Administración y Dirección de Empresas', school: 'Universidad de Barcelona', dates: '2007 - 2011' }
        ]
    };

    const en = {
        fullname: 'Alex Torto Ramos',
        title: 'Senior Project Manager · Strategy Consultant',
        email: 'alextorto@email.com',
        phone: '+1 234 567 890',
        location: 'New York, USA',
        website: 'alextorto.com',
        link: '',
        linkedin: 'linkedin.com/in/alextorto',
        summary: 'Project manager with over 10 years of experience leading cross-functional teams and optimizing processes. I combine agile management with data analysis to deliver business goals.',
        skills: [{ name: 'Jira, Microsoft Project, Power BI, Advanced Excel, SAP ERP, SQL' }],
        softskillsDesc: '• Agile management (Scrum, Kanban)\n• Team leadership\n• Communication and negotiation\n• Problem-solving',
        photo: null,
        languages: [
            { name: 'English', level: 'Nativo' },
            { name: 'Spanish', level: 'Avanzado' },
            { name: 'French', level: 'Intermedio' }
        ],
        projects: [
            {
                title: 'Departmental Digital Transformation',
                tech: 'Change management, CRM, Training',
                desc: 'Digital transformation strategy for the sales department: 95% adoption of the new CRM in 3 months.'
            }
        ],
        experience: [
            {
                role: 'Senior Project Manager',
                company: 'Global Innovation Inc.',
                dates: 'Mar 2021 - Present',
                desc: '• Led a 15-person team implementing new operational processes.\n• Reduced operational costs by 20% in the first year.'
            },
            {
                role: 'Strategy Consultant',
                company: 'Business Strategies LLC',
                dates: 'Mar 2018 - Feb 2021',
                desc: '• Market analysis and reports for key retail clients.\n• Supported the restructuring of finance departments.'
            },
            {
                role: 'Data Analyst',
                company: 'DataTech Solutions',
                dates: 'Sep 2011 - Feb 2018',
                desc: '• Built interactive dashboards in Power BI.\n• Presented insights to executive management.'
            }
        ],
        education: [
            { degree: 'Master of Business Administration (MBA)', school: 'New York University', dates: '2016 - 2018' },
            { degree: 'B.S. in Business Administration', school: 'New York University', dates: '2007 - 2011' }
        ]
    };

    global.ProCVXSampleData = Object.freeze({ es, en });
})(window);
