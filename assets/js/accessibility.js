(function () {
    document.querySelectorAll(".modal").forEach(function (modal) {
        let returnFocus = null;
        document.addEventListener("focusin", function (event) {
            if (!modal.classList.contains("open") && !modal.contains(event.target))
                returnFocus = event.target;
        });
        modal.addEventListener("keydown", function (event) {
            if (event.key !== "Tab" || !modal.classList.contains("open")) return;
            const elements = Array.from(
                modal.querySelectorAll(
                    'a[href], button:not([disabled]), iframe, input, select, textarea, [tabindex="0"]'
                )
            ).filter(function (element) {
                return element.getClientRects().length;
            });
            if (!elements.length) return;
            const first = elements[0],
                last = elements[elements.length - 1];
            if (
                event.shiftKey &&
                (document.activeElement === first || !modal.contains(document.activeElement))
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                (document.activeElement === last || !modal.contains(document.activeElement))
            ) {
                event.preventDefault();
                first.focus();
            }
        });
        const observer = new MutationObserver(function () {
            const open = modal.classList.contains("open");
            document
                .querySelectorAll(
                    "body > header, body > main, body > footer, body > .container, body > .floating-actions"
                )
                .forEach(function (element) {
                    element.inert = open;
                });
            if (!open && returnFocus && returnFocus.isConnected) returnFocus.focus();
        });
        observer.observe(modal, { attributes: true, attributeFilter: ["class"] });
    });
    document
        .querySelectorAll(".field input, .field select, .field textarea")
        .forEach(function (field) {
            const error = document.getElementById(field.id + "Error");
            if (error) field.setAttribute("aria-describedby", error.id);
        });
    const consent = document.getElementById("consent");
    if (consent) consent.setAttribute("aria-describedby", "consentError");
})();
