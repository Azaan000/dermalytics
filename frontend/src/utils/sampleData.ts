// Benchmark Clinical Presets & Sample Test Cases

export interface SampleCase {
  id: string;
  name: string;
  category: 'skin' | 'hair';
  title: string;
  description: string;
  image_url: string;
  expectedClass: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  details: string;
}

// Procedural SVG image generators for realistic clinical sample previews
function createDermoscopicSkinSVG(color: string, radius: number, spots: boolean = true) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#e8beac"/>
    <circle cx="200" cy="200" r="180" fill="#dfb3a0" opacity="0.4"/>
    <ellipse cx="200" cy="200" rx="${radius}" ry="${radius * 0.85}" fill="${color}" opacity="0.88" transform="rotate(-15 200 200)"/>
    <ellipse cx="195" cy="195" rx="${radius * 0.7}" ry="${radius * 0.6}" fill="${color}" opacity="0.95"/>
    ${spots ? `<circle cx="180" cy="180" r="8" fill="#2c1810" opacity="0.7"/>
    <circle cx="220" cy="210" r="6" fill="#3a1e16" opacity="0.6"/>
    <circle cx="190" cy="225" r="10" fill="#1f120c" opacity="0.8"/>` : ''}
    <circle cx="200" cy="200" r="195" fill="none" stroke="#2a2a2a" stroke-width="10" opacity="0.85"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createTrichoscopyScalpSVG(density: 'dense' | 'medium' | 'thin') {
  const strandCount = density === 'dense' ? 120 : density === 'medium' ? 65 : 30;
  let strands = '';
  for (let i = 0; i < strandCount; i++) {
    const x = 50 + (i * 17) % 300 + (Math.random() * 15);
    const y = 50 + (i * 23) % 300 + (Math.random() * 15);
    const len = 30 + Math.random() * 40;
    const angle = -30 + Math.random() * 60;
    strands += `<line x1="${x}" y1="${y}" x2="${x + len * Math.cos(angle * Math.PI/180)}" y2="${y + len * Math.sin(angle * Math.PI/180)}" stroke="#231a15" stroke-width="${density === 'thin' ? '1.5' : '2.5'}" stroke-linecap="round" opacity="0.85"/>
    <circle cx="${x}" cy="${y}" r="2" fill="#5c3a21" opacity="0.7"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#f4dfd4"/>
    <circle cx="200" cy="200" r="160" fill="#edd0c2" opacity="0.6"/>
    ${strands}
    <circle cx="200" cy="200" r="195" fill="none" stroke="#1e293b" stroke-width="10" opacity="0.8"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'sample-skin-1',
    name: 'Nevus (Mole)',
    category: 'skin',
    title: 'Melanocytic Nevus Benchmark (HAM10000)',
    description: 'Symmetric benign pigmented lesion with uniform border.',
    image_url: createDermoscopicSkinSVG('#543321', 65, false),
    expectedClass: 'Melanocytic Nevus',
    confidence: 94.8,
    risk: 'low',
    details: 'Regular pigment network with benign structural architecture.'
  },
  {
    id: 'sample-skin-2',
    name: 'Malignant Melanoma',
    category: 'skin',
    title: 'Suspected Melanoma Screening (ISIC Benchmark)',
    description: 'Asymmetric lesion with variegated darker tones and irregular margins.',
    image_url: createDermoscopicSkinSVG('#23140f', 80, true),
    expectedClass: 'Melanoma',
    confidence: 88.3,
    risk: 'high',
    details: 'High saliency around asymmetric border and deep pigmentation cluster.'
  },
  {
    id: 'sample-skin-3',
    name: 'Basal Cell Carcinoma',
    category: 'skin',
    title: 'Basal Cell Carcinoma (BCC)',
    description: 'Translucent nodular lesion with arborizing micro-vessels.',
    image_url: createDermoscopicSkinSVG('#853b34', 55, true),
    expectedClass: 'Basal Cell Carcinoma',
    confidence: 86.1,
    risk: 'high',
    details: 'Erythematous base with focal ulceration signature.'
  },
  {
    id: 'sample-hair-1',
    name: 'Dense Scalp (Normal)',
    category: 'hair',
    title: 'Healthy Trichoscopy Baseline',
    description: 'High follicular unit count with minimal scalp visibility.',
    image_url: createTrichoscopyScalpSVG('dense'),
    expectedClass: 'Normal / Dense (Norwood Stage I)',
    confidence: 91.5,
    risk: 'low',
    details: 'Follicular density measured at 92 units/cm² with uniform shaft caliber.'
  },
  {
    id: 'sample-hair-2',
    name: 'Moderate Thinning (Vertex)',
    category: 'hair',
    title: 'Androgenetic Alopecia (Norwood III/IV)',
    description: 'Noticeable reduction in hair shaft caliber and widening of part line.',
    image_url: createTrichoscopyScalpSVG('medium'),
    expectedClass: 'Moderate Thinning (Norwood Stage III)',
    confidence: 76.4,
    risk: 'medium',
    details: 'Grad-CAM highlights lower shaft count in the vertex scalp apex.'
  },
  {
    id: 'sample-hair-3',
    name: 'Advanced Scalp Thinning',
    category: 'hair',
    title: 'Advanced Follicular Miniaturization',
    description: 'Significant scalp transmission with high percentage of single-hair follicles.',
    image_url: createTrichoscopyScalpSVG('thin'),
    expectedClass: 'Advanced Thinning (Norwood Stage V+)',
    confidence: 84.2,
    risk: 'high',
    details: 'Scalp visibility at 58% with widespread miniaturized hairs.'
  }
];
