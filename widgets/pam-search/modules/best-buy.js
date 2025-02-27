export async function loadData() {
  const resp = await fetch('/best-buy.json?limit=100000');
  const json = await resp.json();
  const data = json.data.map((loc, index) => {
    const url = new URL(loc.URL);
    const params = new URLSearchParams(url.search);
    const sku = url.pathname.split('/')[3].split('.')[0];
    const name = url.pathname.split('/')[2].replace(/-/g, ' ');
    const image = `https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${sku.substring(0, 3)}/${sku}_sa.jpg;maxHeight=640;maxWidth=550;format=webp`;
    return { sku, name, url: loc.URL, image };
  });
  const sorted = data.sort((a, b) => a.sku ? a.sku.localeCompare(b.sku || '') : -1);
  return sorted;
}

export async function getProductDetails(url) {
  const resp = await fetch(`https://little-forest-58aa.david8603.workers.dev/?url=${url}`);
  const html = await resp.text();
  const imgSrcs = html.matchAll(/<img[^>]+src="([^">]+)"/g);
  const title = html.match(/<title >(.*?)<\/title>/)?.[1].split('- Best Buy')[0].trim();
  const imageNames = [];
  const images = [];
  imgSrcs.forEach((match) => {
    const src = match[1];
    console.log(src);
    if (src.includes('/products/')) {
      const imgname = src.split('/').pop().split(';')[0];
      if (imageNames.includes(imgname)) return;
      imageNames.push(imgname);
      images.push (`https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${imgname.substring(0, 3)}/${imgname}_sa.jpg;maxHeight=640;maxWidth=550;format=webp`);
    }  
  });
  return { title, images };
}

