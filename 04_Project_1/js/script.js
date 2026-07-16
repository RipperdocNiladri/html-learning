/* ==========================================================================
   FOOD HUB — front-end interactions
   - shrinks the header on scroll
   - reveals each section as it enters the viewport
   - animates the stat numbers counting up once, when visible
   - adds a soft glow-follow to the search bar and a nav-tap ripple
   - respects prefers-reduced-motion throughout
   ========================================================================== */

(function() {
    "use strict";

    var prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        setupHeaderScroll();
        setupScrollReveal();
        setupStatCounters();
        setupSearchInteractions();
        setupNavRipple();
    }

    /* ------------------------------------------------------------------ */
    /* Header: condense + blur once the page scrolls                       */
    /* ------------------------------------------------------------------ */

    function setupHeaderScroll() {
        var header = document.querySelector("header");
        if (!header) return;

        var ticking = false;

        function update() {
            header.classList.toggle("scrolled", window.scrollY > 12);
            ticking = false;
        }

        window.addEventListener("scroll", function() {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        });

        update();
    }

    /* ------------------------------------------------------------------ */
    /* Scroll reveal for each main section                                  */
    /* ------------------------------------------------------------------ */

    function setupScrollReveal() {
        var sections = document.querySelectorAll("main > section");
        if (!sections.length) return;

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            sections.forEach(function(el) { el.classList.add("is-visible"); });
            return;
        }

        sections.forEach(function(el) { el.classList.add("reveal"); });

        var observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 }
        );

        sections.forEach(function(el) { observer.observe(el); });
    }

    /* ------------------------------------------------------------------ */
    /* Stats: count up from 0 to the real figure once in view               */
    /* ------------------------------------------------------------------ */

    function setupStatCounters() {
        var stats = document.querySelectorAll(".stat-number[data-target]");
        if (!stats.length) return;

        if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

        var observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        animateCount(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.6 }
        );

        stats.forEach(function(el) { observer.observe(el); });
    }

    function animateCount(el) {
        var target = parseFloat(el.getAttribute("data-target"), 10) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1400;
        var start = null;

        function frame(timestamp) {
            if (start === null) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            var current = Math.floor(eased * target);
            el.textContent = current.toLocaleString("en-IN") + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(frame);
            } else {
                el.textContent = target.toLocaleString("en-IN") + suffix;
            }
        }

        window.requestAnimationFrame(frame);
    }

    /* ------------------------------------------------------------------ */
    /* Search bar: gentle focus glow that tracks the cursor                 */
    /* ------------------------------------------------------------------ */

    function setupSearchInteractions() {
        var input = document.querySelector(".hero-section input");
        if (!input) return;

        input.addEventListener("keydown", function(e) {
            if (e.key === "Enter" && input.value.trim().length > 0) {
                input.style.transition = "transform 0.15s ease";
                input.style.transform = "scale(0.985)";
                setTimeout(function() {
                    input.style.transform = "translateY(-2px)";
                }, 150);
            }
        });

        if (!prefersReducedMotion) {
            input.addEventListener("mousemove", function(e) {
                var rect = input.getBoundingClientRect();
                var x = ((e.clientX - rect.left) / rect.width) * 100;
                input.style.background =
                    "radial-gradient(circle at " + x + "% 50%, rgba(255,201,60,0.10), var(--black-soft) 55%)";
            });

            input.addEventListener("mouseleave", function() {
                input.style.background = "";
            });
        }
    }

    /* ------------------------------------------------------------------ */
    /* Nav: quiet tap feedback on the Login / Signup pills                  */
    /* ------------------------------------------------------------------ */

    function setupNavRipple() {
        var items = document.querySelectorAll("header ul li");
        if (!items.length || prefersReducedMotion) return;

        items.forEach(function(li) {
            li.addEventListener("click", function() {
                li.style.transition = "transform 0.15s ease";
                li.style.transform = "scale(0.96)";
                setTimeout(function() {
                    li.style.transform = "scale(1)";
                }, 150);
            });
        });
    }
})();