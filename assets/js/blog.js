(function () {
    document.querySelectorAll('img[data-fallback]').forEach((image) => {
        function useFallback() {
            if (image.dataset.fallback) {
                const fallback = image.dataset.fallback;
                delete image.dataset.fallback;
                image.src = fallback;
            }
        }
        image.addEventListener('error', useFallback);
        if (image.complete && !image.naturalWidth) useFallback();
    });

    const listing = document.querySelector('[data-blog-list]');
    if (listing) {
        const form = listing.querySelector('form');
        const search = form.querySelector('input');
        const category = form.querySelector('select');
        const cards = Array.from(listing.querySelectorAll('[data-blog-card]'));
        const more = listing.querySelector('.blog-load');
        const status = listing.querySelector('.blog-result-count');
        let limit = 6;
        function render() {
            const query = search.value.trim().toLocaleLowerCase();
            const matches = cards.filter((card) =>
                (!category.value || card.dataset.category === category.value) &&
                card.dataset.search.toLocaleLowerCase().includes(query)
            );
            cards.forEach((card) => { card.hidden = true; });
            matches.slice(0, limit).forEach((card) => { card.hidden = false; });
            status.textContent = `${matches.length} ${matches.length === 1 ? 'article' : 'articles'}${query || category.value ? ' found' : ' to explore'}`;
            listing.querySelector('.blog-empty').hidden = matches.length !== 0;
            more.hidden = matches.length <= limit;
        }
        form.hidden = false;
        form.addEventListener('submit', (event) => event.preventDefault());
        form.addEventListener('input', () => { limit = 6; render(); });
        form.addEventListener('reset', () => { setTimeout(() => { limit = 6; render(); search.focus(); }, 0); });
        more.addEventListener('click', () => {
            const hidden = cards.filter((card) => card.hidden);
            limit += 6;
            render();
            hidden.find((card) => !card.hidden)?.querySelector('h2 a').focus();
        });
        render();
    }
    const copy = document.querySelector('[data-copy-url]');
    if (copy && navigator.clipboard && window.isSecureContext) {
        copy.hidden = false;
        copy.addEventListener('click', async () => {
            const status = document.querySelector('[data-copy-status]');
            try {
                await navigator.clipboard.writeText(document.querySelector('link[rel="canonical"]').href);
                status.textContent = 'Link copied.';
            } catch {
                status.textContent = 'Could not copy. Copy the address from your browser.';
            }
        });
    }
})();
