(() => {
  const AUTH_KEY = 'sessionAuthN';
  const STORAGE_KEY = 'contentRecords';

  if (sessionStorage.getItem(AUTH_KEY) !== 'true') {
    window.location.assign('./auth.html');
    return;
  }

  const form = document.getElementById('content-form');
  const dateInput = document.getElementById('date');
  const linksContainer = document.getElementById('links-container');
  const addLinkButton = document.getElementById('add-link');
  const output = document.getElementById('output');

  if (!form || !dateInput || !linksContainer || !addLinkButton || !output) {
    return;
  }

  let linkIndex = 0;

  function setDateToToday() {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    const localToday = new Date(today.getTime() - timezoneOffset)
      .toISOString()
      .split('T')[0];
    dateInput.value = localToday;
  }

  function buildLinkRow(urlValue = '', descriptionValue = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'row g-2 align-items-start link-row';
    wrapper.dataset.index = String(linkIndex);

    const urlCol = document.createElement('div');
    urlCol.className = 'col-12 col-md-6';

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'form-control';
    urlInput.name = `linkUrl-${linkIndex}`;
    urlInput.placeholder = 'https://example.com';
    urlInput.value = urlValue;

    const descriptionCol = document.createElement('div');
    descriptionCol.className = 'col-12 col-md-5';

    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.className = 'form-control';
    descriptionInput.name = `linkDescription-${linkIndex}`;
    descriptionInput.placeholder = 'Link description';
    descriptionInput.value = descriptionValue;

    const buttonCol = document.createElement('div');
    buttonCol.className = 'col-12 col-md-1 d-grid';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn btn-outline-danger remove-link';
    removeButton.setAttribute('aria-label', 'Remove link');
    removeButton.innerHTML = '<i class="bi bi-trash" aria-hidden="true"></i>';

    urlCol.appendChild(urlInput);
    descriptionCol.appendChild(descriptionInput);
    buttonCol.appendChild(removeButton);
    wrapper.append(urlCol, descriptionCol, buttonCol);
    linkIndex += 1;

    return wrapper;
  }

  function addLink(urlValue = '', descriptionValue = '') {
    linksContainer.appendChild(buildLinkRow(urlValue, descriptionValue));
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

  function saveRecord(record) {
    const records = readStoredRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  setDateToToday();
  addLink();

  addLinkButton.addEventListener('click', () => {
    addLink();
  });

  linksContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('.remove-link');
    if (!button) {
      return;
    }

    const row = button.closest('.link-row');
    if (!row) {
      return;
    }

    row.remove();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const data = {
      id: `entry-${Date.now()}`,
      title: form.title.value.trim(),
      author: form.author.value.trim(),
      date: form.date.value,
      image: form.image.value.trim(),
      description: form.description.value.trim(),
      links: Array.from(linksContainer.querySelectorAll('.link-row'))
        .map((row) => {
          const urlInput = row.querySelector('input[name^="linkUrl-"]');
          const descriptionInput = row.querySelector('input[name^="linkDescription-"]');
          const url = urlInput instanceof HTMLInputElement ? urlInput.value.trim() : '';
          const linkDescription =
            descriptionInput instanceof HTMLInputElement ? descriptionInput.value.trim() : '';

          return {
            url,
            description: linkDescription,
          };
        })
        .filter((link) => link.url.length > 0 || link.description.length > 0),
      createdAt: new Date().toISOString(),
    };

    saveRecord(data);
    output.textContent = JSON.stringify(data, null, 2);
    form.classList.add('was-validated');
  });

  form.addEventListener('reset', () => {
    form.classList.remove('was-validated');
    linksContainer.innerHTML = '';
    addLink();
    setDateToToday();
    output.textContent = 'Submit the form to see data here.';
  });
})();
