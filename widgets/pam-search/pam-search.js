async function loadData() {
  const resp = await fetch('/best-buy.json?limit=100000');
  const json = await resp.json();
  const data = json.data.map((loc, index) => {
    const url = new URL(loc.URL);
    const params = new URLSearchParams(url.search);
    const sku = url.pathname.split('/')[3].split('.')[0];
    const name = url.pathname.split('/')[2].replace(/-/g, ' ');
    console.log(index, name, sku);
    return { sku, name, url: loc.URL };
  });
  const sorted = data.sort((a, b) => a.sku ? a.sku.localeCompare(b.sku || '') : -1);
  return sorted;
}

function displayResults(search) {
  const result = document.querySelector('.pam-search-results');
  const filtered = search ? window.pamSearch.filter(
    (item) => {
      const nameMatch = item.name.toLowerCase().includes(search.toLowerCase());
      if (!item.sku) return nameMatch;
      const skuMatch = item.sku.startsWith(search);
      return nameMatch || skuMatch;
    },
  ) : window.pamSearch;
  result.textContent = '';
  filtered.forEach((item, i) => {
    if (i > 100) return;
    const div = document.createElement('div');
    const highlightedSku = search ? item.sku.replace(
      new RegExp(`(${search})`, 'gi'),
      '<mark>$1</mark>',
    ) : item.sku;
    const highlighted = search ? item.name.replace(
      new RegExp(`(${search})`, 'gi'),
      '<mark>$1</mark>',
    ) : item.name;
    const a = document.createElement('a');
    a.href = item.url;
    a.target = '_blank';
    a.textContent = 'View';
    div.innerHTML = `<span class="pam-search-sku">${highlightedSku}</span><span class="pam-search-name">${highlighted}</span>`;
    div.append(a);
    if (item.sku) {
      const img = document.createElement('img');
      img.src = `https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${item.sku.substring(0, 3)}/${item.sku}_sa.jpg;maxHeight=640;maxWidth=550;format=webp`;
      img.loading = 'lazy';
      img.alt = item.name;
      div.prepend(img);
    }
    div.classList.add('pam-search-card');
    result.append(div);
  });
}

function updateSearchResults(widget) {
  const { value } = widget.querySelector('input[name="search"]');
  const status = widget.querySelector('input[name="status"]').value;
  document.querySelector('.pam-search-results').textContent = '';
  displayResults(value, status);
  const params = new URLSearchParams();
  if (value) params.set('search', value);
  if (status) params.set('status', status);
  if (status || value) {
    window.history.replaceState(null, '', `?${params.toString()}`);
  } else {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

async function initialLoad(widget) {
  const data = await loadData();
  window.pamSearch = data;
  updateSearchResults(widget);
}

export default async function decorate(widget) {
  widget.querySelector('input[name="search"]').addEventListener('input', () => {
    updateSearchResults(widget);
  });
  widget.querySelector('input[name="status"]').addEventListener('input', () => {
    updateSearchResults(widget);
  });
  widget.querySelector('input[name="allocated"]').addEventListener('change', (event) => {
    if (event.target.checked) widget.querySelector('input[name="status"]').value = 'A';
    else widget.querySelector('input[name="status"]').value = '';
    updateSearchResults(widget);
  });

  const params = new URLSearchParams(window.location.search);
  const search = params.get('search');
  if (search) {
    widget.querySelector('input[name="search"]').value = search;
  }
  const status = params.get('status');
  if (status) {
    widget.querySelector('input[name="status"]').value = status;
    if (status === 'A') {
      widget.querySelector('input[name="allocated"]').checked = true;
    }
  }
  initialLoad(widget);
}
