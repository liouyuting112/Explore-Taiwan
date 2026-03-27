/**
 * Visitor and Click Tracking for Explore Taiwan 
 * Monitors unique/non-unique visits and clicks.
 * Sends data to a Google Apps Script web app.
 */

(function () {
    // --- CONFIGURATION ---
    // The user MUST replace this with their deployed Google Apps Script URL
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzrCk4nZzN9ESJrAIAY0OAXdQJQ0q96gsiXLcM2uQKI6b-gQ36YpbDws-vx6fZjeNc/exec";
    
    if (GAS_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
        console.warn("Tracking: Please set the GAS_URL in tracking.js to enable Google Sheets logging.");
    }

    // --- VISITOR ID ---
    let visitorId = localStorage.getItem('et_visitor_id');
    let isNewVisitor = false;
    if (!visitorId) {
        visitorId = 'v-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
        localStorage.setItem('et_visitor_id', visitorId);
        isNewVisitor = true;
    }

    // --- TRACKING FUNCTION ---
    async function trackEvent(eventType, targetName, details = "") {
        if (!GAS_URL || GAS_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") return;

        const payload = {
            visitor_id: visitorId,
            event_type: eventType,
            target_name: targetName,
            details: details,
            is_new_visitor: isNewVisitor,
            language: localStorage.getItem('tw_lang') || 'zh-TW',
            userAgent: navigator.userAgent
        };

        try {
            // Use fetch with no-cors for Google Apps Script compatibility
            fetch(GAS_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Reset isNewVisitor after the first tracking event in this session
            // Note: In reality, isNewVisitor should only be true for the very first event ever.
            // But since we track it per load, we can keep it true for the 'visit' event.
            if (eventType === 'visit') {
                isNewVisitor = false;
            }
        } catch (e) {
            console.error("Tracking Error:", e);
        }
    }

    // --- AUTO-TRACK VISIT ---
    // Track when the page finishes loading
    if (document.readyState === 'complete') {
        trackEvent('visit', 'page_load', window.location.pathname);
    } else {
        window.addEventListener('load', () => {
            trackEvent('visit', 'page_load', window.location.pathname);
        });
    }

    // --- GLOBAL CLICK TRACKER ---
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a, .nav-link, .feat-card, .chip, .bnav-item, .swiper-slide, .check-row, .lang-option');
        if (!target) return;

        // Try to find a meaningful name
        let name = target.id ||
            target.getAttribute('data-i18n') ||
            target.getAttribute('data-lang') ||
            target.innerText.trim().substring(0, 30).replace(/\n/g, ' ');

        let details = "";

        // Categorize the click
        if (target.classList.contains('nav-link')) {
            name = "[Nav] " + name;
        } else if (target.classList.contains('feat-card')) {
            name = "[Feature] " + name;
        } else if (target.classList.contains('chip')) {
            name = "[Filter] " + name;
        } else if (target.classList.contains('bnav-item')) {
            name = "[BottomNav] " + name;
        } else if (target.classList.contains('lang-option')) {
            name = "[Lang] " + name;
        } else if (target.tagName === 'A') {
            name = "[Link] " + (target.href || name);
        }

        trackEvent('click', name, details);
    }, true);

})();
