const CATALOGUE_PROJECTS = [
    {
        name: "School OS",
        category: "School Management",
        icon: "bi-mortarboard",
        featured: true,
        impact: "Complete school operations in one dashboard",
        description: "A complete school management system designed to manage students, staff, attendance, fees, examinations, transport, communication and school administration from one unified platform.",
        suitableFor: "Schools, academies, private institutions and multi-branch education groups.",
        tags: ["JavaScript", "Firebase", "HTML", "CSS", "Cloud Database"],
        features: ["Student management", "Staff management", "Attendance", "Fee collection", "Examination management", "Report generation", "Notifications", "Role-based access", "Dashboard analytics"]
    },
    {
        name: "HR Management System",
        category: "HR Management",
        icon: "bi-people",
        featured: true,
        impact: "Manage employees, attendance, salary and HR records",
        description: "A professional HR management solution for handling employee profiles, attendance, leave requests, payroll records, documents, roles and performance tracking from a clean admin dashboard.",
        suitableFor: "Companies, schools, institutes, agencies, factories, service teams and organizations with staff operations.",
        tags: ["JavaScript", "Firebase", "HTML", "CSS", "Dashboard"],
        features: ["Employee profiles", "Department and role management", "Staff attendance", "Leave management", "Salary records", "Document storage", "Performance notes", "HR reports", "Admin dashboard"]
    },
    {
        name: "Inventory Management Solution",
        category: "Inventory Solution",
        icon: "bi-box-seam",
        featured: true,
        impact: "Track stock, purchases, sales and low inventory alerts",
        description: "A smart inventory system for shops, distributors, warehouses and service businesses to manage stock movement, suppliers, purchases, sales, billing records and inventory reports.",
        suitableFor: "Retail shops, wholesalers, warehouses, schools, offices, distributors and small businesses.",
        tags: ["JavaScript", "Firebase", "HTML", "CSS", "Reports"],
        features: ["Product catalogue", "Stock in and stock out", "Supplier management", "Purchase records", "Sales records", "Low-stock alerts", "Inventory valuation", "Barcode-ready workflow", "Exportable reports"]
    },
    {
        name: "ID Card Solution",
        category: "ID Card Solution",
        icon: "bi-person-badge",
        featured: true,
        impact: "Design, manage and print professional ID cards faster",
        description: "A digital ID card solution for schools, colleges, offices and organizations to manage member details, card designs, photo records, bulk generation and print-ready ID card output.",
        suitableFor: "Schools, colleges, coaching institutes, offices, NGOs, events, staff teams and membership-based organizations.",
        tags: ["HTML", "CSS", "JavaScript", "Print Layout", "Data Management"],
        features: ["Student and staff ID cards", "Photo and profile records", "Custom card templates", "Bulk ID generation", "Print-ready layout", "QR or barcode-ready design", "Search and filters", "Class or department grouping", "Fast reprint workflow"]
    },
    {
        name: "School Mobile App",
        category: "Mobile Applications",
        icon: "bi-phone",
        impact: "Real-time school updates on mobile",
        description: "A dedicated mobile application for students, parents, teachers and school administrators with real-time academic and communication features.",
        suitableFor: "Schools that need parent communication, mobile access and real-time updates.",
        tags: ["Android", "Java", "Firebase", "REST API"],
        features: ["Student profile", "Attendance records", "Fee information", "Homework and notices", "Examination results", "Push notifications", "Parent communication", "Secure login"]
    },
    {
        name: "Fee Management System",
        category: "School Management",
        icon: "bi-receipt",
        impact: "Fast fee collection with clear dues reports",
        description: "A secure fee collection and accounting system for managing student fees, discounts, dues, receipts, reports and financial records.",
        suitableFor: "Schools, colleges, coaching institutes and education finance offices.",
        tags: ["JavaScript", "Firebase", "HTML", "CSS"],
        features: ["Fee structure management", "Online and offline collection", "Automatic receipt generation", "Discount management", "Pending dues tracking", "Daily collection report", "Accounting reports", "Student ledger"]
    },
    {
        name: "Attendance Management System",
        category: "Automation Tools",
        icon: "bi-calendar2-check",
        impact: "Daily attendance and reports without manual registers",
        description: "An attendance solution for schools, offices and organizations with real-time records and detailed reports.",
        suitableFor: "Schools, offices, NGOs, teams and field organizations.",
        tags: ["JavaScript", "Firebase", "Cloud Database"],
        features: ["Daily attendance", "Student and staff attendance", "Monthly reports", "Late arrival records", "Absence tracking", "Dashboard statistics", "Export reports"]
    },
    {
        name: "Business Management System",
        category: "Business Management",
        icon: "bi-briefcase",
        impact: "Customers, sales, expenses and team work in one place",
        description: "A customizable business management solution for handling customers, employees, sales, expenses, payments and reports.",
        suitableFor: "Small businesses, service providers, agencies, shops and growing teams.",
        tags: ["JavaScript", "Firebase", "HTML", "CSS"],
        features: ["Customer management", "Employee management", "Sales tracking", "Expense tracking", "Payment records", "Reports", "Dashboard analytics", "User roles"]
    },
    {
        name: "Portfolio and Business Website",
        category: "Websites",
        icon: "bi-window-stack",
        impact: "Modern online presence built for trust and enquiries",
        description: "Modern responsive websites for businesses, schools, institutes, professionals and organizations.",
        suitableFor: "Brands, founders, schools, institutes, professionals and local businesses.",
        tags: ["HTML", "CSS", "JavaScript", "SEO"],
        features: ["Responsive design", "SEO optimization", "Contact forms", "Social integration", "Service pages", "Project showcase", "Fast performance", "Mobile-friendly layout"]
    },
    {
        name: "Admission Enquiry System",
        category: "Automation Tools",
        icon: "bi-person-lines-fill",
        impact: "Capture leads and never miss follow-ups",
        description: "A digital admission enquiry management system that records leads, follow-ups, student details and admission status.",
        suitableFor: "Schools, colleges, institutes and coaching admission teams.",
        tags: ["JavaScript", "Google Apps Script", "Google Sheets"],
        features: ["Enquiry registration", "Lead source tracking", "Follow-up reminders", "Admission status", "Contact history", "Reports", "Search and filters", "Google Sheets integration"]
    },
    {
        name: "Custom Software Development",
        category: "Custom Software",
        icon: "bi-code-square",
        impact: "Build exactly around your workflow",
        description: "Customized software development services designed according to specific organizational and operational requirements.",
        suitableFor: "Organizations with specific workflows, reporting needs or automation requirements.",
        tags: ["JavaScript", "Firebase", "APIs", "Cloud Services"],
        features: ["Requirement analysis", "Custom dashboard", "Workflow automation", "Role management", "Database integration", "Reporting system", "API integration", "Technical support"]
    }
];

const CATEGORIES = ["All Projects", "School Management", "HR Management", "Inventory Solution", "ID Card Solution", "Business Management", "Websites", "Mobile Applications", "Automation Tools", "Custom Software"];
const grid = document.getElementById("projectGrid");
const filters = document.getElementById("categoryFilters");
const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("projectModalTitle");
const modalContent = document.getElementById("projectModalContent");
const modalClose = document.querySelector(".modal-close");
let currentCategory = "All Projects";
let lastFocus = null;

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function projectBookUrl(name) {
    return `book-demo.html?project=${encodeURIComponent(name)}`;
}

function renderFilters() {
    filters.innerHTML = CATEGORIES.map((category) => `
        <button class="filter-btn${category === currentCategory ? " active" : ""}" type="button" data-category="${escapeHtml(category)}" aria-pressed="${category === currentCategory}">
            ${escapeHtml(category)}
        </button>
    `).join("");
}

function renderProjects() {
    const items = currentCategory === "All Projects"
        ? CATALOGUE_PROJECTS
        : CATALOGUE_PROJECTS.filter((project) => project.category === currentCategory);

    grid.innerHTML = items.map((project, index) => `
        <article class="project-card${project.featured ? " featured-project" : ""}" data-aos="fade-up">
            <div class="project-image" role="img" aria-label="${escapeHtml(project.name)} project placeholder">
                <i class="bi ${escapeHtml(project.icon)}" aria-hidden="true"></i>
            </div>
            <div class="project-body">
                <div class="project-meta">
                    <span class="category-pill">${escapeHtml(project.category)}</span>
                    ${project.featured ? '<span class="demo-ready-pill">Demo Ready</span>' : ""}
                </div>
                <h2>${escapeHtml(project.name)}</h2>
                <div class="impact-line"><i class="bi bi-lightning-charge" aria-hidden="true"></i> ${escapeHtml(project.impact || "Built for practical daily operations")}</div>
                <p>${escapeHtml(project.description)}</p>
                <ul class="tag-list" aria-label="Technology tags">
                    ${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
                </ul>
                <ul class="feature-list" aria-label="Main features">
                    ${project.features.slice(0, 4).map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
                </ul>
                <div class="project-actions">
                    <button class="btn-small btn-outline" type="button" data-detail="${index}">View Details</button>
                    <a class="btn-small btn-accent" href="${projectBookUrl(project.name)}">Book Demo</a>
                </div>
            </div>
        </article>
    `).join("");

    if (window.AOS) window.AOS.refresh();
}

function findProjectIndex(project) {
    return CATALOGUE_PROJECTS.findIndex((item) => item.name === project.name);
}

function openProjectModal(project) {
    lastFocus = document.activeElement;
    modalTitle.textContent = project.name;
    modalContent.innerHTML = `
        <p>${escapeHtml(project.description)}</p>
        <div class="impact-line modal-impact"><i class="bi bi-lightning-charge" aria-hidden="true"></i> ${escapeHtml(project.impact || "Built for practical daily operations")}</div>
        <div class="modal-grid">
            <div>
                <h3>Key Features</h3>
                <ul class="feature-list modal-feature-list">${project.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
            </div>
            <div>
                <h3>Technology</h3>
                <ul class="tag-list">${project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>
                <h3 class="modal-subtitle">Suitable For</h3>
                <p>${escapeHtml(project.suitableFor)}</p>
            </div>
        </div>
        <a class="btn-main btn-accent" href="${projectBookUrl(project.name)}">Book Demo</a>
    `;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
}

function closeProjectModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
}

filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    currentCategory = button.dataset.category;
    renderFilters();
    renderProjects();
});

grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-detail]");
    if (!button) return;
    const visibleProjects = currentCategory === "All Projects"
        ? CATALOGUE_PROJECTS
        : CATALOGUE_PROJECTS.filter((project) => project.category === currentCategory);
    openProjectModal(visibleProjects[Number(button.dataset.detail)]);
});

modalClose.addEventListener("click", closeProjectModal);
modal.addEventListener("click", (event) => {
    if (event.target === modal) closeProjectModal();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeProjectModal();
});

const params = new URLSearchParams(window.location.search);
const categoryParam = params.get("category");
const projectParam = params.get("project");
if (categoryParam && CATEGORIES.includes(categoryParam)) {
    currentCategory = categoryParam;
}

renderFilters();
renderProjects();

if (projectParam) {
    const project = CATALOGUE_PROJECTS.find((item) => item.name.toLowerCase() === projectParam.toLowerCase());
    if (project) {
        currentCategory = project.category;
        renderFilters();
        renderProjects();
        setTimeout(() => openProjectModal(project), 150);
    }
}
