(() => {
  const STORAGE_KEY = 'contentRecords';
  const contentRoot = document.getElementById('content-list');

  if (!contentRoot) {
    return;
  }

  function readStoredRecords() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatDate(isoDate) {
    if (!isoDate) {
      return 'No date';
    }

    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return isoDate;
    }

    return parsed.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function renderEmptyState() {
    contentRoot.innerHTML = `
      <div class="col-12">
        <div class="alert alert-light border mb-0" role="status">
          No saved content yet. Add an entry from the form page.
        </div>
      </div>
    `;
  }

  function renderCards(records) {
    if (!records.length) {
      renderEmptyState();
      return;
    }

    contentRoot.innerHTML = records
      .map((record) => {
        const safeTitle = escapeHtml(record.title || 'Untitled');
        const safeAuthor = escapeHtml(record.author || 'Unknown author');
        const safeDate = escapeHtml(formatDate(record.date));
        const safeDescription = escapeHtml(record.description || '');
        const safeImage = escapeHtml(record.image || 'https://picsum.photos/800/420?grayscale');

        const linksMarkup = (record.links || [])
          .map((link) => {
            const safeUrl = escapeHtml(link.url || '#');
            const safeLabel = escapeHtml(link.description || link.url || 'Open link');
            if (!link.url) {
              return `<span class="badge text-bg-light border">${safeLabel}</span>`;
            }

            return `<a class="badge text-bg-light border text-decoration-none" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
          })
          .join(' ');

        return `
          <div class="col-12">
            <article class="card shadow-sm">
              <div class="card-header">
                <h5 class="card-title mb-1">${safeTitle}</h5>
                <p class="card-text text-secondary fw-semibold opacity-75 mb-0">by ${safeAuthor} | ${safeDate}</p>
              </div>

              <div class="card-body">
                <img class="img-fluid rounded" src="${safeImage}" alt="${safeTitle}">
                <p class="card-text pt-3 mb-2">${safeDescription}</p>
                ${linksMarkup ? `<div class="d-flex flex-wrap gap-2">${linksMarkup}</div>` : ''}
              </div>
            </article>
          </div>
        `;
      })
      .join('');
  }

  renderCards(readStoredRecords());
})();
