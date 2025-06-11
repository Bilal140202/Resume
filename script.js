document.addEventListener('DOMContentLoaded', () => {
    // Form and Input Elements
    const resumeForm = document.getElementById('resume-form');
    const nameInput = document.getElementById('name');
    const jobTitleInput = document.getElementById('job-title');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const linkedinInput = document.getElementById('linkedin');
    const summaryInput = document.getElementById('summary');
    const skillsInput = document.getElementById('skills');

    // Dynamic Entry Containers and Buttons
    const experienceEntriesContainer = document.getElementById('experience-entries');
    const addExperienceButton = document.getElementById('add-experience');
    const educationEntriesContainer = document.getElementById('education-entries');
    const addEducationButton = document.getElementById('add-education');

    // Templates for Dynamic Entries
    const experienceEntryTemplate = document.getElementById('experience-entry-template');
    const educationEntryTemplate = document.getElementById('education-entry-template');

    // Preview Area
    const resumePreviewContainer = document.getElementById('resume-preview-container'); // Outer container for PDF
    const resumePreview = document.getElementById('resume-preview'); // Inner container for template HTML

    // Template Selection
    const templateSelect = document.getElementById('template-select');
    const resumeTemplate1 = document.getElementById('template1-html');
    const resumeTemplate2 = document.getElementById('template2-html');

    // Other Controls
    const modeToggleButton = document.getElementById('mode-toggle');
    const downloadPdfButton = document.getElementById('download-pdf');
    const htmlElement = document.documentElement;

    const LOCAL_STORAGE_KEY = 'resumeBuilderData';
    const SELECTED_TEMPLATE_KEY = 'resumeBuilderSelectedTemplate';

    // --- DATA HANDLING (LocalStorage) ---
    function getFormData() {
        const data = {
            name: nameInput.value,
            jobTitle: jobTitleInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            linkedin: linkedinInput.value,
            summary: summaryInput.value,
            skills: skillsInput.value,
            experience: [],
            education: [],
        };

        experienceEntriesContainer.querySelectorAll('.experience-entry').forEach(entry => {
            data.experience.push({
                job_title: entry.querySelector('[name="exp_job_title"]').value,
                company: entry.querySelector('[name="exp_company"]').value,
                start_date: entry.querySelector('[name="exp_start_date"]').value,
                end_date: entry.querySelector('[name="exp_end_date"]').value,
                description: entry.querySelector('[name="exp_description"]').value,
            });
        });

        educationEntriesContainer.querySelectorAll('.education-entry').forEach(entry => {
            data.education.push({
                degree: entry.querySelector('[name="edu_degree"]').value,
                institution: entry.querySelector('[name="edu_institution"]').value,
                start_date: entry.querySelector('[name="edu_start_date"]').value,
                end_date: entry.querySelector('[name="edu_end_date"]').value,
                details: entry.querySelector('[name="edu_details"]').value,
            });
        });
        return data;
    }

    function saveDataToLocalStorage() {
        const data = getFormData();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }

    function loadDataFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        if (!data) return;

        nameInput.value = data.name || '';
        jobTitleInput.value = data.jobTitle || '';
        emailInput.value = data.email || '';
        phoneInput.value = data.phone || '';
        linkedinInput.value = data.linkedin || '';
        summaryInput.value = data.summary || '';
        skillsInput.value = data.skills || '';

        // Clear existing dynamic entries before loading
        experienceEntriesContainer.innerHTML = '';
        educationEntriesContainer.innerHTML = '';

        (data.experience || []).forEach(exp => addExperienceEntry(exp));
        (data.education || []).forEach(edu => addEducationEntry(edu));
    }

    // --- DYNAMIC FIELD MANAGEMENT (Experience & Education) ---
    function createEntry(template, data, container, type) {
        const clone = template.content.cloneNode(true);
        const entryDiv = clone.querySelector(`.${type}-entry`);

        if (data) {
            Object.keys(data).forEach(key => {
                const input = entryDiv.querySelector(`[name="${type === 'experience' ? 'exp' : 'edu'}_${key}"]`);
                if (input) input.value = data[key];
            });
        }

        const removeButton = entryDiv.querySelector('.remove-entry-btn');
        removeButton.addEventListener('click', () => {
            entryDiv.remove();
            saveDataToLocalStorage();
            updatePreview();
        });

        entryDiv.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                saveDataToLocalStorage();
                updatePreview();
            });
        });

        container.appendChild(clone);
    }

    function addExperienceEntry(data = null) {
        createEntry(experienceEntryTemplate, data, experienceEntriesContainer, 'experience');
    }

    function addEducationEntry(data = null) {
        createEntry(educationEntryTemplate, data, educationEntriesContainer, 'education');
    }

    addExperienceButton.addEventListener('click', () => {
        addExperienceEntry();
        saveDataToLocalStorage(); // Save after adding a new blank entry
        updatePreview();
    });

    addEducationButton.addEventListener('click', () => {
        addEducationEntry();
        saveDataToLocalStorage(); // Save after adding a new blank entry
        updatePreview();
    });


    // --- TEMPLATE SWITCHING ---
    function applyTemplate(templateId) {
        let templateContent;
        if (templateId === 'template1') {
            templateContent = resumeTemplate1.innerHTML;
        } else if (templateId === 'template2') {
            templateContent = resumeTemplate2.innerHTML;
        } else {
            templateContent = resumeTemplate1.innerHTML; // Default
        }
        resumePreview.innerHTML = templateContent;
        localStorage.setItem(SELECTED_TEMPLATE_KEY, templateId);
        updatePreview(); // Update preview with current data after template change
    }

    templateSelect.addEventListener('change', (event) => {
        applyTemplate(event.target.value);
    });

    function loadSelectedTemplate() {
        return localStorage.getItem(SELECTED_TEMPLATE_KEY) || 'template1';
    }

    // --- REAL-TIME PREVIEW UPDATE ---
    function updatePreview() {
        const data = getFormData();
        const currentTemplateId = templateSelect.value; // Or loadSelectedTemplate() if needed for consistency

        // General Fields (common across templates, using IDs from template HTML)
        const previewName = resumePreview.querySelector("#preview-name");
        if (previewName) previewName.textContent = data.name || 'Your Name';

        const previewJobTitle = resumePreview.querySelector("#preview-job-title");
        if (previewJobTitle) previewJobTitle.textContent = data.jobTitle || 'Your Job Title';

        const previewEmail = resumePreview.querySelector("#preview-email");
        if (previewEmail) previewEmail.textContent = data.email || 'your.email@example.com';

        const previewPhone = resumePreview.querySelector("#preview-phone");
        if (previewPhone) previewPhone.textContent = data.phone || '(123) 456-7890';

        const previewLinkedin = resumePreview.querySelector("#preview-linkedin"); // This is now an <a> tag in both templates
        if (previewLinkedin) {
            previewLinkedin.textContent = data.linkedin || 'linkedin.com/in/yourprofile';
            previewLinkedin.href = data.linkedin ? `https://${data.linkedin.replace(/^https?:\/\//,'')}` : '#';
        }

        const previewSummary = resumePreview.querySelector("#preview-summary");
        if (previewSummary) previewSummary.innerHTML = data.summary.replace(/\n/g, '<br>') || 'Your professional summary...';

        const previewSkills = resumePreview.querySelector("#preview-skills");
        if (previewSkills) previewSkills.innerHTML = data.skills.replace(/,/g, ', ').replace(/\n/g, '<br>') || 'Your skills...';

        // Dynamic Experience Entries
        const expPreviewContainer = resumePreview.querySelector("#preview-experience-entries");
        if (expPreviewContainer) {
            expPreviewContainer.innerHTML = ''; // Clear previous entries
            data.experience.forEach(exp => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'mb-3 entry-item'; // Tailwind classes for spacing, and a marker class

                const descriptionPoints = (exp.description || 'Description')
                    .split('\n')
                    .map(line => `<li>${line.trim()}</li>`)
                    .join('');

                if (currentTemplateId === 'template1') {
                    entryDiv.innerHTML = `
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">${exp.job_title || 'Job Title'}</h3>
                        <p class="text-md text-gray-600 dark:text-gray-400">${exp.company || 'Company Name'} | ${exp.start_date || 'Start Date'} - ${exp.end_date || 'End Date'}</p>
                        <ul class="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mt-1 space-y-0.5">
                            ${descriptionPoints}
                        </ul>
                    `;
                } else { // template2 (Modern) or any other
                    entryDiv.innerHTML = `
                        <h3 class="text-md font-semibold text-gray-800 dark:text-gray-100">${exp.job_title || 'Job Title'}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${exp.company || 'Company Name'} | ${exp.start_date || 'Start Date'} - ${exp.end_date || 'End Date'}</p>
                        <ul class="list-disc list-inside text-xs text-gray-700 dark:text-gray-300 mt-1 space-y-0.5">
                            ${descriptionPoints}
                        </ul>
                    `;
                }
                expPreviewContainer.appendChild(entryDiv);
            });
        }

        // Dynamic Education Entries
        const eduPreviewContainer = resumePreview.querySelector("#preview-education-entries");
        if (eduPreviewContainer) {
            eduPreviewContainer.innerHTML = ''; // Clear previous entries
            data.education.forEach(edu => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'mb-3 entry-item'; // Tailwind classes for spacing, and a marker class

                const detailsFormatted = (edu.details || 'Details/Honors').replace(/\n/g, '<br>');

                if (currentTemplateId === 'template1') {
                    entryDiv.innerHTML = `
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">${edu.degree || 'Degree/Certificate'}</h3>
                        <p class="text-md text-gray-600 dark:text-gray-400">${edu.institution || 'Institution Name'} | ${edu.start_date || 'Start Date'} - ${edu.end_date || 'End Date'}</p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">${detailsFormatted}</p>
                    `;
                } else { // template2 (Modern) or any other
                     entryDiv.innerHTML = `
                        <h3 class="text-md font-semibold text-gray-800 dark:text-gray-100">${edu.degree || 'Degree/Certificate'}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${edu.institution || 'Institution Name'} | ${edu.start_date || 'Start Date'} - ${edu.end_date || 'End Date'}</p>
                        <p class="text-xs text-gray-700 dark:text-gray-300 mt-1">${detailsFormatted}</p>
                    `;
                }
                eduPreviewContainer.appendChild(entryDiv);
            });
        }
    }

    // Attach event listeners to static form inputs
    resumeForm.querySelectorAll('input, textarea').forEach(input => {
        if (!input.closest('.experience-entry') && !input.closest('.education-entry')) { // Avoid double-binding for dynamic ones
            input.addEventListener('input', () => {
                saveDataToLocalStorage();
                updatePreview();
            });
        }
    });

    // --- DARK/LIGHT MODE ---
    modeToggleButton.addEventListener('click', () => {
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            htmlElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark'); // Default to light
        }
    }

    // --- PDF GENERATION ---
    downloadPdfButton.addEventListener('click', () => {
        const isDarkMode = htmlElement.classList.contains('dark');
        if (isDarkMode) {
            htmlElement.classList.remove('dark');
            // brief pause to allow DOM to re-render before PDF generation
            // This might be needed if styles are complex.
            // setTimeout(() => generatePdf(isDarkMode), 50);
            generatePdf(isDarkMode);
        } else {
            generatePdf(isDarkMode);
        }
    });

    function generatePdf(wasDarkMode) {
        // Ensure preview is up-to-date with the latest data.
        // applyTemplate(loadSelectedTemplate()); // Re-apply to ensure structure is fresh
        updatePreview(); // This is crucial to populate the template with data

        const elementToPrint = resumePreview; // We print the content of the selected template

        const opt = {
            margin:       [0.5, 0.3, 0.5, 0.3], // top, left, bottom, right
            filename:     `${(nameInput.value || 'resume').replace(/\s+/g, '_')}_${templateSelect.value}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: true, scrollY: -window.scrollY }, // Use scrollY to fix top cutoff
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(elementToPrint).save().then(() => {
            if (wasDarkMode) {
                htmlElement.classList.add('dark');
            }
        }).catch(err => {
            console.error("PDF generation error:", err);
            if (wasDarkMode) { // Ensure theme is restored even on error
                htmlElement.classList.add('dark');
            }
        });
    }


    // --- INITIALIZATION ---
    applySavedTheme();
    const selectedTemplate = loadSelectedTemplate();
    templateSelect.value = selectedTemplate; // Set dropdown to stored/default value
    applyTemplate(selectedTemplate); // Apply the HTML structure of the template first
    loadDataFromLocalStorage(); // Load data into form fields and dynamic sections
    // updatePreview(); // updatePreview is called within applyTemplate and loadData, so might be redundant here
                      // but good to call once after all setup to ensure consistency.
    updatePreview(); // Ensure the preview is populated with loaded data and template.

});
