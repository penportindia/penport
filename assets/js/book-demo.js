const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzuUPnKkXH47CZ7ndvZ6TMvrk5fUe_wKnRRifxV3ZgiBXAJTGYGvUfoSLI3jx8ENCez/exec";

(function () {
    const form = document.getElementById("demoForm");
    if (!form) return;

    const startedAt = Date.now();
    let isSubmitting = false;
    const submitButton = document.getElementById("submitButton");
    const buttonText = submitButton.querySelector(".button-text");
    const status = document.getElementById("formStatus");
    const dateField = document.getElementById("preferredDemoDate");

    const fields = {
        fullName: document.getElementById("fullName"),
        mobileNumber: document.getElementById("mobileNumber"),
        whatsappNumber: document.getElementById("whatsappNumber"),
        emailAddress: document.getElementById("emailAddress"),
        organizationName: document.getElementById("organizationName"),
        organizationType: document.getElementById("organizationType"),
        interestedProject: document.getElementById("interestedProject"),
        requirementType: document.getElementById("requirementType"),
        preferredDemoDate: document.getElementById("preferredDemoDate"),
        preferredDemoTime: document.getElementById("preferredDemoTime"),
        preferredDemoMode: document.getElementById("preferredDemoMode"),
        city: document.getElementById("city"),
        state: document.getElementById("state"),
        estimatedBudget: document.getElementById("estimatedBudget"),
        detailedRequirement: document.getElementById("detailedRequirement"),
        consent: document.getElementById("consent"),
        companyWebsite: document.getElementById("companyWebsite")
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayValue = today.toISOString().slice(0, 10);
    dateField.min = todayValue;

    const projectAlias = {
        "Portfolio and Business Website": "Website Development"
    };

    const selectedProject = new URLSearchParams(window.location.search).get("project");
    if (selectedProject) {
        const wanted = projectAlias[selectedProject] || selectedProject;
        const option = Array.from(fields.interestedProject.options).find((item) => item.value.toLowerCase() === wanted.toLowerCase());
        if (option) fields.interestedProject.value = option.value;
    }

    function setError(name, message) {
        const input = fields[name];
        const error = document.getElementById(`${name}Error`);
        if (!input || !error) return;
        error.textContent = message;
        input.setAttribute("aria-invalid", message ? "true" : "false");
        input.closest(".field")?.classList.toggle("invalid", Boolean(message));
    }

    function setStatus(message, type) {
        status.textContent = message;
        status.className = `form-status ${type || ""}`.trim();
    }

    function onlyDigits(value) {
        return value.replace(/\D/g, "");
    }

    function trimValue(name) {
        return fields[name].value.trim();
    }

    function isValidEmail(value) {
        return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validateForm() {
        let valid = true;
        Object.keys(fields).forEach((name) => setError(name, ""));

        if (!trimValue("fullName")) {
            setError("fullName", "Full name is required.");
            valid = false;
        }

        const mobile = onlyDigits(fields.mobileNumber.value);
        fields.mobileNumber.value = mobile;
        if (!mobile) {
            setError("mobileNumber", "Mobile number is required.");
            valid = false;
        } else if (!/^\d{10}$/.test(mobile)) {
            setError("mobileNumber", "Mobile number must be exactly 10 digits.");
            valid = false;
        }

        const whatsapp = onlyDigits(fields.whatsappNumber.value);
        fields.whatsappNumber.value = whatsapp;
        if (whatsapp && !/^\d{10}$/.test(whatsapp)) {
            setError("whatsappNumber", "WhatsApp number must be exactly 10 digits.");
            valid = false;
        }

        if (!isValidEmail(trimValue("emailAddress"))) {
            setError("emailAddress", "Enter a valid email address.");
            valid = false;
        }

        ["organizationType", "interestedProject", "requirementType", "preferredDemoMode"].forEach((name) => {
            if (!trimValue(name)) {
                setError(name, "This field is required.");
                valid = false;
            }
        });

        if (trimValue("preferredDemoDate")) {
            const chosenDate = new Date(`${trimValue("preferredDemoDate")}T00:00:00`);
            if (chosenDate < today) {
                setError("preferredDemoDate", "Preferred demo date cannot be in the past.");
                valid = false;
            }
        }

        if (!trimValue("detailedRequirement")) {
            setError("detailedRequirement", "Detailed requirement is required.");
            valid = false;
        }

        if (!fields.consent.checked) {
            document.getElementById("consentError").textContent = "Consent is required.";
            fields.consent.setAttribute("aria-invalid", "true");
            valid = false;
        } else {
            document.getElementById("consentError").textContent = "";
            fields.consent.setAttribute("aria-invalid", "false");
        }

        if (fields.companyWebsite.value.trim()) {
            valid = false;
        }

        if (Date.now() - startedAt < 3000) {
            setStatus("Please take a moment to review your details before submitting.", "error");
            valid = false;
        }

        return valid;
    }

    function collectPayload() {
        return {
            fullName: trimValue("fullName"),
            mobileNumber: trimValue("mobileNumber"),
            whatsappNumber: trimValue("whatsappNumber"),
            emailAddress: trimValue("emailAddress"),
            organizationName: trimValue("organizationName"),
            organizationType: trimValue("organizationType"),
            interestedProject: trimValue("interestedProject"),
            requirementType: trimValue("requirementType"),
            preferredDemoDate: trimValue("preferredDemoDate"),
            preferredDemoTime: trimValue("preferredDemoTime"),
            preferredDemoMode: trimValue("preferredDemoMode"),
            city: trimValue("city"),
            state: trimValue("state"),
            estimatedBudget: trimValue("estimatedBudget"),
            detailedRequirement: trimValue("detailedRequirement"),
            pageUrl: window.location.href,
            userAgent: navigator.userAgent
        };
    }

    function setSubmitting(active) {
        isSubmitting = active;
        submitButton.disabled = active;
        submitButton.classList.toggle("loading", active);
        buttonText.textContent = active ? "Submitting..." : "Submit Demo Request";
    }

    form.addEventListener("input", (event) => {
        const name = event.target.name;
        if (name && fields[name]) setError(name, "");
        if (name === "consent") document.getElementById("consentError").textContent = "";
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        setStatus("", "");

        if (!validateForm()) {
            if (!status.textContent) setStatus("Please correct the highlighted fields.", "error");
            return;
        }

        if (GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
            setStatus("Google Apps Script Web App URL is not configured yet.", "error");
            return;
        }

        setSubmitting(true);
        setStatus("Submitting your demo request...", "");

        try {
            const payload = collectPayload();
            const body = new URLSearchParams();
            Object.entries(payload).forEach(([key, value]) => body.append(key, value));

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                body
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Submission failed");
            }

            setStatus("Your demo request has been submitted successfully.", "success");
            if (result.whatsapp) {
                sessionStorage.setItem("penportWhatsappLinks", JSON.stringify({
                    submissionId: result.submissionId || "",
                    adminUrl: result.whatsapp.adminUrl || "",
                    customerUrl: result.whatsapp.customerUrl || ""
                }));
            }
            form.reset();
            const id = encodeURIComponent(result.submissionId || "");
            window.location.href = id ? `thank-you.html?id=${id}` : "thank-you.html";
        } catch (error) {
            setStatus("We could not submit your request. Please check your internet connection and try again.", "error");
        } finally {
            setSubmitting(false);
        }
    });
})();
