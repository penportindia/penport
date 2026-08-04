(function () {
    if (window.AOS) {
        window.AOS.init({ duration: 1000, once: true, easing: "ease-out-quad" });
    }

    if (window.Typed && document.querySelector("#typed")) {
        new window.Typed("#typed", {
            strings: ["Raushan.", "a Developer.", "a Designer."],
            typeSpeed: 50,
            backSpeed: 30,
            loop: true,
            backDelay: 2000
        });
    }

    const projectDemos = [
        { title: "School ERP Management System", url: "https://www.youtube.com/embed/g8d15z4o5yA", project: "School OS" },
        { title: "Campaign Design Portfolio", url: "https://www.youtube.com/embed/g8d15z4o5yA", project: "Website Development" },
        { title: "Custom Enterprise Software", url: "https://www.youtube.com/embed/xJ6vRzU_4dE", project: "Custom Software Development" },
        { title: "Smart ID Card Solutions", url: "https://drive.google.com/file/d/1rqNv5hwVHLTSgbDALQnN7UOfFu1-J7mC/preview", project: "ID Card Solution" },
        { title: "HR Management System (Pro)", url: "https://www.youtube.com/embed/Lw99S63YfJk", project: "HR Management System" }
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
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openVideoModal(card.dataset.id);
            }
        });
    });

    closeVideo?.addEventListener("click", closeVideoModal);
    videoModal?.addEventListener("click", (event) => {
        if (event.target === videoModal) closeVideoModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeVideoModal();
        }
    });

    const submissionId = document.getElementById("submissionId");
    if (submissionId) {
        const id = new URLSearchParams(window.location.search).get("id");
        submissionId.textContent = id ? id : "Your confirmation has been recorded.";
    }
})();
