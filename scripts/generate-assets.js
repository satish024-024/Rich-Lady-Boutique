const fs = require('fs');
const path = require('path');

const dirs = [
  'public/images',
  'public/images/reels',
  'public/videos',
  'public/icons',
  'public/patterns',
  'public/illustrations',
  'public/logos'
];

// Create directories if they don't exist
dirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Helper to write SVG
function writeSvg(filePath, svgContent) {
  fs.writeFileSync(path.join(process.cwd(), filePath), svgContent.trim());
}

// 1. Hero Fallback Image (Editorial Cotton Branch Sketch)
writeSvg('public/images/hero-fallback.svg', `
<svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1920" height="1080" fill="#FAF8F3"/>
  <!-- Decorative background circle -->
  <circle cx="1400" cy="540" r="400" fill="#F2ECE3" opacity="0.6"/>
  
  <!-- Handcrafted Cotton Branch Drawing -->
  <g stroke="#23352D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8">
    <!-- Branch -->
    <path d="M700 900 C800 800 1100 600 1300 300 C1350 220 1450 150 1500 100" />
    <path d="M950 700 C1000 620 1100 550 1150 500" />
    <path d="M1120 540 C1180 480 1250 420 1280 380" />
    <path d="M1280 320 C1220 280 1150 260 1100 250" />
    
    <!-- Cotton Pods (Cotton Balls) -->
    <!-- Pod 1 -->
    <g transform="translate(1300, 300)">
      <circle cx="0" cy="0" r="50" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <circle cx="-30" cy="-20" r="40" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <circle cx="30" cy="-20" r="40" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <circle cx="0" cy="-45" r="45" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <!-- Sepals -->
      <path d="M-50 10 C-30 40 0 50 0 50 C0 50 30 40 50 10 C30 20 0 30 -50 10 Z" fill="#23352D" />
    </g>
    
    <!-- Pod 2 -->
    <g transform="translate(1150, 500)">
      <circle cx="0" cy="0" r="40" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <circle cx="-25" cy="-15" r="32" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <circle cx="25" cy="-15" r="32" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <circle cx="0" cy="-35" r="35" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <path d="M-40 8 C-24 32 0 40 0 40 C0 40 24 32 40 8 C24 16 0 24 -40 8 Z" fill="#23352D" />
    </g>

    <!-- Pod 3 -->
    <g transform="translate(1100, 250)">
      <circle cx="0" cy="0" r="35" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <circle cx="-20" cy="-12" r="28" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <circle cx="20" cy="-12" r="28" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <circle cx="0" cy="-30" r="30" fill="#FFFDF9" stroke="#B8904A" stroke-width="1.5" />
      <path d="M-35 6 C-21 28 0 35 0 35 C0 35 21 28 35 6 C21 14 0 21 -35 6 Z" fill="#23352D" />
    </g>
  </g>

  <!-- Editorial Text overlay indicator for demo -->
  <text x="100" y="980" font-family="Georgia, serif" font-size="14" fill="#5B5046" letter-spacing="3" opacity="0.5">RICH LADY BOUTIQUE © 2011</text>
  <text x="100" y="1010" font-family="Georgia, serif" font-size="12" fill="#B8904A" letter-spacing="1" opacity="0.6">FINEST HANDLOOM COTTON SELECTION</text>
</svg>
`);

// 2. Categories SVGs (Arched, Warm background with gold sketching)
const categories = [
  { id: 'sarees', title: 'Sarees', path: 'M40 120 C50 80 80 60 100 130 C120 200 140 220 160 150 C180 80 190 60 210 140' },
  { id: 'kurtis', title: 'Kurtis', path: 'M70 70 L90 50 L110 70 H130 L115 130 H85 L70 70 Z M100 50 V110' },
  { id: 'dress_materials', title: 'Dress Materials', path: 'M60 80 H140 V150 H60 V80 Z M60 105 H140 M60 130 H140' },
  { id: 'lehengas', title: 'Lehengas', path: 'M80 60 L120 60 L140 150 H60 L80 60 Z M100 60 V150' },
  { id: 'gowns', title: 'Gowns', path: 'M85 50 H115 L145 160 H55 L85 50 Z M100 50 V160' },
  { id: 'accessories', title: 'Accessories', path: 'M70 120 C70 90 130 90 130 120 C130 150 70 150 70 120 Z M100 70 C80 70 80 90 100 90 C120 90 120 70 100 70 Z' },
  { id: 'new_arrivals', title: 'New Arrivals', path: 'M85 60 C85 50 115 50 115 60 L140 70 H60 L85 60 Z M100 45 V90 M70 120 L100 140 L130 120' }
];

categories.forEach(cat => {
  writeSvg(`public/images/cat_${cat.id}.svg`, `
<svg width="400" height="600" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Arched shape border simulation within background -->
  <rect width="400" height="600" fill="#FAF8F3"/>
  <path d="M40 240 C40 120 120 40 200 40 C280 40 360 120 360 240 V560 H40 V240 Z" fill="#FFFDF9" stroke="#E5D8C9" stroke-width="1"/>
  
  <!-- Sketch Drawing -->
  <g transform="translate(100, 180)" stroke="#B8904A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8">
    <path d="${cat.path}" />
  </g>

  <!-- Editorial Info -->
  <text x="200" y="460" font-family="Georgia, serif" font-size="20" fill="#2D221C" text-anchor="middle" letter-spacing="2" font-weight="500">${cat.title.toUpperCase()}</text>
  <text x="200" y="490" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#5B5046" text-anchor="middle" letter-spacing="1">RICH LADY BOUTIQUE</text>
</svg>
  `);
});

// 3. Products SVGs
const products = [
  { id: 'floral_kurti', title: 'Floral Kurti', path: 'M80 60 L100 45 L120 60 H140 L125 150 H75 L60 60 Z M100 45 V150 M75 80 Q100 100 125 80 M75 110 Q100 130 125 110' },
  { id: 'silk_saree', title: 'Silk Saree', path: 'M50 140 C60 90 90 70 110 150 C130 230 150 250 170 170 C190 90 200 70 220 160 M70 100 H170' },
  { id: 'anarkali_kurti', title: 'Anarkali Kurti', path: 'M85 50 H115 L145 160 H55 L85 50 Z M100 50 V160 M60 140 H140' },
  { id: 'suit_set', title: 'Suit Set', path: 'M70 70 H130 V150 H70 Z M70 95 H130 M70 120 H130 M100 70 V150' },
  { id: 'party_gown', title: 'Party Gown', path: 'M90 40 H110 L150 170 H50 L90 40 Z M100 40 V170 M60 140 Q100 150 140 140' }
];

products.forEach(prod => {
  writeSvg(`public/images/prod_${prod.id}.svg`, `
<svg width="500" height="700" viewBox="0 0 500 700" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="500" height="700" fill="#FFFDF9"/>
  <!-- Thin luxury border -->
  <rect x="20" y="20" width="460" height="660" stroke="#E5D8C9" stroke-width="1"/>
  
  <!-- Sketch Drawing -->
  <g transform="translate(150, 180) scale(1.1)" stroke="#23352D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
    <path d="${prod.path}" />
  </g>

  <!-- Editorial Info -->
  <text x="250" y="520" font-family="Georgia, serif" font-size="18" fill="#2D221C" text-anchor="middle" letter-spacing="1.5">${prod.title}</text>
  <text x="250" y="550" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#B8904A" text-anchor="middle" letter-spacing="2">AUTHENTIC CRAFT</text>
</svg>
  `);
});

// 4. Instagram Reels SVGs
for (let i = 1; i <= 6; i++) {
  writeSvg(`public/images/reels/reels_${i}.svg`, `
<svg width="400" height="700" viewBox="0 0 400 700" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="700" fill="#FAF8F3"/>
  <rect x="15" y="15" width="370" height="670" stroke="#E5D8C9" stroke-width="0.75" />
  <!-- Pattern inside -->
  <circle cx="200" cy="350" r="120" stroke="#F2ECE3" stroke-width="1"/>
  
  <!-- Video Indicator (Play button icon for even indexes) -->
  ${i % 2 === 0 ? `
  <g transform="translate(170, 320)">
    <circle cx="30" cy="30" r="30" fill="#23352D" opacity="0.9" />
    <path d="M25 20 L45 30 L25 40 Z" fill="#FFFDF9" />
  </g>
  ` : `
  <g transform="translate(180, 330)" stroke="#B8904A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 20 L20 10 L30 20 M20 10 V30" />
    <circle cx="20" cy="30" r="5" />
  </g>
  `}

  <!-- Handle & Detail -->
  <text x="200" y="560" font-family="Georgia, serif" font-size="14" fill="#2D221C" text-anchor="middle" letter-spacing="1">@richlady_rjy</text>
  <text x="200" y="590" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#5B5046" text-anchor="middle" letter-spacing="2">REEL #${i} • STORYTELLING</text>
</svg>
  `);
}

// 5. Video Placeholder
// Since we can't easily write a binary mp4, we write a text notice in it or a tiny mock file, but for Next.js to not error
// we don't strictly need a real mp4 file since we will just render a fallback video tag or video card, but let's create a 0-byte file or placeholder.
fs.writeFileSync(path.join(process.cwd(), 'public/videos/hero-placeholder.mp4'), 'MOCK_VIDEO_DATA');

console.log('Premium editorial assets successfully generated in public/ directories.');
