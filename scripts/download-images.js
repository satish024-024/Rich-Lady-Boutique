const fs = require('fs');
const path = require('path');
const https = require('https');

const imagesToDownload = [
  {
    name: 'public/images/hero-fallback.jpg',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1920&q=85'
  },
  // Categories
  {
    name: 'public/images/cat_sarees.jpg',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/cat_kurtis.jpg',
    url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/cat_dress_materials.jpg',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/cat_lehengas.jpg',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/cat_gowns.jpg',
    url: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/cat_accessories.jpg',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/cat_new_arrivals.jpg',
    url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'
  },
  // Products
  {
    name: 'public/images/prod_floral_kurti.jpg',
    url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/prod_silk_saree.jpg',
    url: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/prod_anarkali_kurti.jpg',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/prod_suit_set.jpg',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'public/images/prod_party_gown.jpg',
    url: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80'
  },
  // Instagram Reels
  {
    name: 'public/images/reels/reels_1.jpg',
    url: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'public/images/reels/reels_2.jpg',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'public/images/reels/reels_3.jpg',
    url: 'https://images.unsplash.com/photo-1608962914077-7c9f6dd172ed?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'public/images/reels/reels_4.jpg',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'public/images/reels/reels_5.jpg',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'public/images/reels/reels_6.jpg',
    url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80'
  }
];

// Ensure target directories exist
const dirs = ['public/images', 'public/images/reels'];
dirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Download helper using redirect support
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle HTTP redirects (very common on Unsplash images.unsplash.com)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: Status Code ${res.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${destPath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Download all images sequentially
async function main() {
  console.log('Starting image downloads from Unsplash...');
  for (const img of imagesToDownload) {
    const destPath = path.join(process.cwd(), img.name);
    try {
      await downloadImage(img.url, destPath);
    } catch (err) {
      console.error(`Error downloading ${img.name}: ${err.message}`);
    }
  }
  console.log('All image downloads completed!');
}

main();
