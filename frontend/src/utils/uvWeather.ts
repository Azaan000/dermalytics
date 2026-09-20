// Open-Meteo UV Index & Weather Utility (free, no API key required)

export interface WeatherData {
  uv_index: number;
  uv_level: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  temperature: number;
  weather_code: number;
  weather_desc: string;
  city?: string;
  lat: number;
  lon: number;
}

export interface UVNudge {
  title: string;
  message: string;
  emoji: string;
  urgency: 'info' | 'warning' | 'danger';
  action?: string;
}

const UV_LEVELS = (uv: number): WeatherData['uv_level'] => {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very High';
  return 'Extreme';
};

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  77: 'Snow grains', 80: 'Slight showers', 81: 'Moderate showers',
  82: 'Heavy showers', 85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ hail', 99: 'Heavy thunderstorm w/ hail',
};

export async function getCoordinates(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Default to Karachi, Pakistan for the project's regional context
      resolve({ lat: 24.8607, lon: 67.0011 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: 24.8607, lon: 67.0011 }), // Fallback: Karachi
      { timeout: 5000 }
    );
  });
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&hourly=uv_index,temperature_2m,weathercode` +
    `&current_weather=true` +
    `&timezone=auto&forecast_days=1`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();

  const hour = new Date().getHours();
  const uv = Math.max(0, data.hourly?.uv_index?.[hour] ?? 0);
  const temp = data.hourly?.temperature_2m?.[hour] ?? data.current_weather?.temperature ?? 0;
  const wcode = data.current_weather?.weathercode ?? 0;

  return {
    uv_index: Math.round(uv * 10) / 10,
    uv_level: UV_LEVELS(uv),
    temperature: Math.round(temp),
    weather_code: wcode,
    weather_desc: WMO_CODES[wcode] ?? 'Unknown',
    lat,
    lon,
  };
}

export function getTimeBasedNudges(hour: number): UVNudge[] {
  const nudges: UVNudge[] = [];
  if (hour >= 6 && hour <= 9) {
    nudges.push({
      title: 'Morning Skincare Window',
      message: 'Best time to apply moisturizer and SPF before sun exposure peaks.',
      emoji: '🌅',
      urgency: 'info',
      action: 'View your morning routine tips',
    });
  }
  if (hour >= 10 && hour <= 15) {
    nudges.push({
      title: 'Peak UV Hours',
      message: 'Sun is at its highest. Reapply SPF 50+ every 2 hours if outdoors.',
      emoji: '☀️',
      urgency: 'warning',
    });
  }
  if (hour >= 19 && hour <= 22) {
    nudges.push({
      title: 'Evening Scan Reminder',
      message: 'Perfect lighting time! Consider uploading a new skin or scalp scan tonight.',
      emoji: '🔬',
      urgency: 'info',
      action: 'Start new scan',
    });
  }
  if (hour >= 21 || hour <= 3) {
    nudges.push({
      title: 'Overnight Hair Care',
      message: 'Apply nourishing scalp oil now for overnight follicle stimulation.',
      emoji: '💆',
      urgency: 'info',
    });
  }
  return nudges;
}

export function getUVNudge(uv: number, level: WeatherData['uv_level']): UVNudge {
  if (level === 'Low') {
    return {
      title: `Low UV Index (${uv})`,
      message: 'Minimal UV risk today. Great day for a skin assessment without sun interference.',
      emoji: '🌤️',
      urgency: 'info',
    };
  }
  if (level === 'Moderate') {
    return {
      title: `Moderate UV Index (${uv})`,
      message: 'UV is building up. Apply SPF 30+ and wear a hat if spending time outdoors.',
      emoji: '🧴',
      urgency: 'info',
      action: 'Learn SPF guidelines',
    };
  }
  if (level === 'High') {
    return {
      title: `High UV Index (${uv}) ⚠️`,
      message: 'High UV today! Apply SPF 50+, wear protective clothing, and avoid 10am–4pm sun.',
      emoji: '⚠️',
      urgency: 'warning',
      action: 'Schedule your evening skin scan',
    };
  }
  if (level === 'Very High') {
    return {
      title: `Very High UV (${uv}) — Sun Protection Critical`,
      message: 'Very high UV exposure risk. If you have a history of skin lesions, avoid direct sun. SPF 50+ every 90 min.',
      emoji: '🚨',
      urgency: 'danger',
    };
  }
  return {
    title: `Extreme UV Alert (${uv})`,
    message: 'EXTREME UV levels. Stay indoors during peak hours. High-risk lesion patients should consult dermatologist.',
    emoji: '🔴',
    urgency: 'danger',
  };
}

// Weekly routine suggestions
export const WEEKLY_TIPS = [
  { day: 'Monday',   tip: 'Start the week with a scalp massage to stimulate blood circulation and follicle health.' },
  { day: 'Tuesday',  tip: 'Check your ABCDE self-examination. Any new asymmetry or border changes since last week?' },
  { day: 'Wednesday',tip: 'Hydration day — aim for 2L of water to support skin elasticity and barrier function.' },
  { day: 'Thursday', tip: 'Review your last Dermalytics scan. Has your hair density score changed this month?' },
  { day: 'Friday',   tip: 'Apply a deep conditioning treatment tonight to strengthen hair shafts before the weekend.' },
  { day: 'Saturday', tip: 'Weekend scan day! Capture a new skin or scalp image in good lighting for progress tracking.' },
  { day: 'Sunday',   tip: 'Rest and recovery. Light scalp massage with argan or jojoba oil promotes follicle health.' },
];

export const FAQS = [
  {
    q: 'What is the ABCDE rule for moles?',
    a: 'A = Asymmetry (one half differs from the other), B = Border (irregular or jagged edges), C = Color (multiple shades of brown, black, red, or white), D = Diameter (larger than 6mm / pencil eraser), E = Evolution (any change in size, shape, or color over time). If you notice any ABCDE sign, consult a dermatologist promptly.',
  },
  {
    q: 'How often should I upload a skin scan?',
    a: 'For active monitoring of a known lesion, we recommend every 14 days. For routine preventive screening, once a month is sufficient. Ensure consistent lighting, same distance, and same angle for accurate trend tracking.',
  },
  {
    q: 'What SPF should I use?',
    a: 'SPF 30 blocks ~97% of UVB rays and is sufficient for daily indoor/low-exposure use. SPF 50 or higher is recommended for outdoor activities, beach, or UV Index ≥6. Reapply every 2 hours when sweating or in water.',
  },
  {
    q: 'How is the hair density score calculated?',
    a: 'Dermalytics calculates a density score (0–100) based on follicular unit analysis per cm², hair shaft diameter uniformity (anisotrichosis %), scalp visibility, and multi-hair follicle counts. A score of 80–100 indicates a healthy, dense scalp.',
  },
  {
    q: 'What does Grad-CAM red highlighting mean?',
    a: 'Red and orange regions in the Grad-CAM heatmap represent the areas of your image that had the highest neural network activation for the predicted diagnosis. In other words — those are the exact features the AI "looked at" most when making its assessment.',
  },
  {
    q: 'When should I see a dermatologist?',
    a: 'Seek professional evaluation if: a lesion scores high-risk in Dermalytics, you notice rapid size/color change, a spot bleeds without injury, hair loss exceeds 150 hairs/day for >3 months, or you have a personal/family history of melanoma.',
  },
  {
    q: 'Can UV rays worsen hair loss?',
    a: 'Yes. Chronic UV exposure damages the follicle stem cells and oxidizes melanin, contributing to hair thinning and premature greying. UV protective hair products and hats are recommended, especially in coastal areas like Karachi with high UV indexes.',
  },
  {
    q: 'What is Norwood Stage III?',
    a: 'Norwood Stage III is the minimum threshold considered clinical baldness. It shows deep symmetrical frontotemporal recession extending beyond 2cm anterior to the coronal plane. Treatment with minoxidil or finasteride is most effective at this stage.',
  },
];
