(function () {
    const toggle = document.querySelector(".menu-toggle");
    const navigation = document.getElementById("navigation");
    function closeMenu() {
        navigation.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
    }
    toggle.addEventListener("click", function () {
        const open = navigation.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    navigation.addEventListener("click", function (event) {
        if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && navigation.classList.contains("open")) {
            closeMenu();
            toggle.focus();
        }
    });
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".nav")) closeMenu();
    });
    window.matchMedia("(min-width: 801px)").addEventListener("change", closeMenu);
    document.getElementById("year").textContent = new Date().getFullYear();
})();