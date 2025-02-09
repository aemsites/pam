async function loadData() {
  const resp = await fetch('/best-buy.json?limit=100000');
  const json = await resp.json();
  const data = json.data.map((loc, index) => {
    const url = new URL(loc.URL);
    const params = new URLSearchParams(url.search);
    const sku = url.pathname.split('/')[3].split('.')[0];
    const name = url.pathname.split('/')[2].replace(/-/g, ' ');
    return { sku, name, url: loc.URL };
  });
  const sorted = data.sort((a, b) => a.sku ? a.sku.localeCompare(b.sku || '') : -1);
  return sorted;
}

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
  if (filtered.length === 1) {
    const div = document.createElement('div');
    div.classList.add('pam-search-details');
    const resp = await fetch(`https://little-forest-58aa.david8603.workers.dev/?url=${filtered[0].url}`);
    const html = await resp.text();
    const imgSrcs = html.matchAll(/<img[^>]+src="([^">]+)"/g);
    const title = html.match(/<title >(.*?)<\/title>/)?.[1].split('- Best Buy')[0].trim();
    const images = [];
    const ul = document.createElement('ul');
    div.innerHTML = `<div>SKU "${filtered[0].sku}"</div><h2>${title}</h2>`;
    ul.classList.add('pam-search-images');
    imgSrcs.forEach((match) => {
      const src = match[1];
      console.log(src);
      if (src.includes('/products/')) {
        const img = document.createElement('img');
        const imgname = src.split('/').pop().split(';')[0];
        if (images.includes(imgname)) return;
        images.push(imgname);
        console.log(imgname);
        img.src = `https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${imgname.substring(0, 3)}/${imgname}_sa.jpg;maxHeight=640;maxWidth=550;format=webp`;
        img.alt = 'Product Image';
        const item = document.createElement('li');
        item.append(img);
        ul.append(item);
      }
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
        img.src = `https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${item.sku.substring(0, 3)}/${item.sku}_sa.jpg;maxHeight=640;maxWidth=550;format=webp`;
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
  const data = await loadData();
  window.pamSearch = data;
  updateSearchResults(widget);
}

export default async function decorate(widget) {
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
