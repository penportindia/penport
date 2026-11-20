(function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const menu = document.querySelector(".site-menu-toggle");
    const navigation = document.getElementById("siteNavigation");

    if (menu && navigation) {
        const mobile = window.matchMedia("(max-width: 42rem)");
        function syncMenu() {
            menu.hidden = !mobile.matches;
            navigation.hidden = mobile.matches;
            menu.setAttribute("aria-expanded", "false");
        }
        menu.addEventListener("click", () => {
            const open = navigation.hidden;
            navigation.hidden = !open;
            menu.setAttribute("aria-expanded", String(open));
        });
        menu.closest("header").addEventListener("keydown", (event) => {
            if (event.key !== "Escape" || navigation.hidden || !mobile.matches) return;
            syncMenu();
            menu.focus();
        });
        mobile.addEventListener("change", syncMenu);
        syncMenu();
    }

    if ("IntersectionObserver" in window && !reduceMotion.matches) {
        const reveal = new IntersectionObserver((entries, observer) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });
        document.querySelectorAll("[data-reveal], .blog-card, .showcase-card").forEach((element) => reveal.observe(element));
    }

    const roleDisplay = document.querySelector(".profile-roles");
    if (roleDisplay) {
        const roles = Array.from(roleDisplay.children, (element) => element.textContent);
        const activeRole = roleDisplay.firstElementChild;
        let timer;

        function startRoleAnimation() {
            clearTimeout(timer);
            activeRole.textContent = roles[0];
            roleDisplay.classList.toggle("is-typing", !reduceMotion.matches);
            if (reduceMotion.matches) return;

            let index = 0;
            let length = roles[0].length;
            let deleting = true;

            function typeRole() {
                length += deleting ? -1 : 1;
                activeRole.textContent = roles[index].slice(0, length);
                let delay = deleting ? 65 : 105;
                if (length === 0) {
                    index = (index + 1) % roles.length;
                    deleting = false;
                    delay = 220;
                } else if (length === roles[index].length) {
                    deleting = true;
                    delay = 1500;
                }
                timer = setTimeout(typeRole, delay);
            }

            timer = setTimeout(typeRole, 1500);
        }

        startRoleAnimation();
        reduceMotion.addEventListener("change", startRoleAnimation);
    }

    const projectDemos = [
        {
            title: "School ERP Management System",
            url: "https://www.youtube.com/embed/g8d15z4o5yA",
            project: "School MS"
        },
        {
            title: "Campaign Design Portfolio",
            url: "https://www.youtube.com/embed/g8d15z4o5yA",
            project: "Website Development"
        },
        {
            title: "Custom Enterprise Software",
            url: "https://www.youtube.com/embed/xJ6vRzU_4dE",
            project: "Custom Software Development"
        },
        {
            title: "Smart ID Card Solutions",
            url: "https://drive.google.com/file/d/1rqNv5hwVHLTSgbDALQnN7UOfFu1-J7mC/preview",
            project: "ID Card Solution"
        },
        {
            title: "HR Management System (Pro)",
            url: "https://www.youtube.com/embed/Lw99S63YfJk",
            project: "HR Management System"
        }
    ];

    const videoModal = document.getElementById("vModal");
    const videoFrame = document.getElementById("vFrame");
    const videoTitle = document.getElementById("vTitle");
    const videoBookDemo = document.getElementById("vBookDemo");
    const closeVideo = document.querySelector(".close-v");
    let lastFocusedElement = null;

    function openVideoModal(id) {
        const demo = projectDemos[id];
        if (!demo || !videoModal || !videoFrame || !videoTitle) return;
        lastFocusedElement = document.activeElement;
        videoFrame.src = demo.url + (demo.url.includes("?") ? "&" : "?") + "autoplay=1";
        videoTitle.textContent = demo.title;
        if (videoBookDemo) {
            videoBookDemo.href = `book-demo.html?project=${encodeURIComponent(demo.project)}`;
        }
        videoModal.classList.add("open");
        videoModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        closeVideo?.focus();
    }

    function closeVideoModal() {
        if (!videoModal || !videoFrame) return;
        videoModal.classList.remove("open");
        videoModal.setAttribute("aria-hidden", "true");
        videoFrame.src = "";
        document.body.style.overflow = "";
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    document.querySelectorAll(".open-demo").forEach((card) => {
        card.addEventListener("click", (event) => {
            if (event.target.closest("a")) return;
            openVideoModal(card.dataset.id);
        });
    });

    closeVideo?.addEventListener("click", closeVideoModal);
    videoModal?.addEventListener("click", (event) => {
        if (event.target === videoModal) closeVideoModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && videoModal?.classList.contains("open")) {
            closeVideoModal();
        }
    });

    const submissionId = document.getElementById("submissionId");
    if (submissionId) {
        const id = new URLSearchParams(window.location.search).get("id");
        submissionId.textContent = id ? id : "Your confirmation has been recorded.";
    }
})();
