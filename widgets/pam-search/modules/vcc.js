export async function loadData() {
    const resp = await fetch('https://little-forest-58aa.david8603.workers.dev/?url=https://www.visualcomfort.com/media/sitemap_product.xml');
    const xml = await resp.text();
    const dom = new DOMParser().parseFromString(xml, 'text/xml');
    const urls = [...dom.querySelectorAll('urlset > url')];
    const extractSku = (path, image) => {
        if (image) {
            const url = new URL(image);
            const splits = url.pathname.split('/');
            return splits[6].split('.')[0].split('_')[0];
        }
        if (path.endsWith('/')) {
            const splits = path.split('/');
            return splits[splits.length - 2].split('-').pop();
        }
        return path.split('/').pop().split('-').pop();
    }
    const data = urls.map((urlElem) => {
      const loc = urlElem.querySelector('loc');
      const url = new URL(loc.textContent);
      const name = url.pathname.split('/')[1].replace(/-/g, ' ');
      const imageElem = urlElem.querySelector('image loc');
      const image = imageElem ? imageElem.textContent : '';
      const sku = extractSku(url.pathname, image)
      return { sku, name, url: loc.textContent, image };
    });
    const sorted = data.sort((a, b) => a.sku ? a.sku.localeCompare(b.sku || '') : -1);
    return sorted;
  }
  

  export async function getProductDetails(url) {

    const chop = (open, close, string) => {
        const startIndex = string.indexOf(open);
        const endIndex = string.indexOf(close, startIndex + open.length);
        return string.substring(startIndex + open.length, endIndex);
      }    
    
    const resp = await fetch(`https://little-forest-58aa.david8603.workers.dev/?url=${url}`);
    const html = await resp.text();
    const magentoJson = chop('"spConfig": ', '"gallerySwitchStrategy"', html).trim();
    const imageSources = JSON.parse(magentoJson.substring(0, magentoJson.length - 1)).images;
    const title = html.match(/<title>(.*?)<\/title>/)?.[1].split('|')[0].trim();
    const images = [];
    const keys = Object.keys(imageSources);
    keys.forEach((key) => {
        console.log(imageSources[key]);
        images.push(...imageSources[key].map((img) => img.thumb));
    });
    return { title, images };
  }
  