async function displayResults(search) {
  console.log('displayResults', search);
  const filtered = search ? window.pamSearch.filter(
    (item) => {
      const nameMatch = item.name.toLowerCase().includes(search.toLowerCase());
      if (!item.sku) return nameMatch;
      const skuMatch = item.sku.startsWith(search);
      return nameMatch || skuMatch;
    },
  ) : window.pamSearch;
  const result = document.querySelector('.pam-search-results');
  result.textContent = '';
  const details = document.querySelector('.pam-search-results-details');
  details.textContent = '';
  if (filtered.length === 0) {
    details.textContent = 'No results found';
  } else if (filtered.length === 1) {
    const { getProductDetails } = await import(`./modules/${PROFILE}.js`);
    document.getElementById('pam-search-results-loading').setAttribute('aria-hidden', 'false');
    const { title, images } = await getProductDetails(filtered[0].url);
    document.getElementById('pam-search-results-loading').setAttribute('aria-hidden', 'true');
    const div = document.createElement('div');
    div.classList.add('pam-search-details');
    const ul = document.createElement('ul');
    div.innerHTML = `<div>SKU "${filtered[0].sku}"</div><h3>${title}</h3>`;
    ul.classList.add('pam-search-images');
    images.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Product Image';
      const item = document.createElement('li');
      item.append(img);
      ul.append(item);
    });
    div.append(ul);
    details.append(div);
  } else {
    filtered.forEach((item, i) => {
      if (i > 100) return;
      const li = document.createElement('li');
      const highlightedSku = search ? item.sku.replace(
        new RegExp(`(${search})`, 'gi'),
        '<mark>$1</mark>',
      ) : item.sku;
      const highlighted = search ? item.name.replace(
        new RegExp(`(${search})`, 'gi'),
        '<mark>$1</mark>',
      ) : item.name;
      li.innerHTML = `<span class="pam-search-sku"><a href="${window.location.pathname}?search=${item.sku}">${highlightedSku}</a></span><span class="pam-search-name">${highlighted}</span>`;
      if (item.sku) {
        const img = document.createElement('img');
        img.src = item.image;
        img.loading = 'lazy';
        img.alt = item.name;
        li.prepend(img);
      }
      li.classList.add('pam-search-card');
      result.append(li);
    });
  }
}

function updateSearchResults(widget) {
  const { value } = widget.querySelector('input[name="search"]');
  document.querySelector('.pam-search-results').textContent = '';
  displayResults(value);
  const params = new URLSearchParams();
  if (value) params.set('search', value);
  if (value) {
    window.history.replaceState(null, '', `?${params.toString()}`);
  } else {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

async function initialLoad(widget) {
  const { loadData } = await import(`./modules/${PROFILE}.js`);
  const data = await loadData();
  window.pamSearch = data;
  updateSearchResults(widget);
}

let PROFILE;

export default async function decorate(widget) {
  PROFILE = widget.dataset.profile;
  console.log('PROFILE', PROFILE);
  console.log(widget.dataset);
  widget.querySelector('input[name="search"]').addEventListener('input', () => {
    updateSearchResults(widget);
  });

  const params = new URLSearchParams(window.location.search);
  const search = params.get('search');
  if (search) {
    widget.querySelector('input[name="search"]').value = search;
  }
  initialLoad(widget);
}
