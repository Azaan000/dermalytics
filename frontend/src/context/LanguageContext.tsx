import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ur';

export interface SkinDiagnosisDetail {
  code: string;
  simpleNameEn: string;
  simpleNameUr: string;
  easyMeaningEn: string;
  easyMeaningUr: string;
  adviceEn: string;
  adviceUr: string;
  isFriendly: boolean;
}

export interface HairDiagnosisDetail {
  simpleNameEn: string;
  simpleNameUr: string;
  easyMeaningEn: string;
  easyMeaningUr: string;
  adviceEn: string;
  adviceUr: string;
}

export const SKIN_DIAGNOSES: Record<string, SkinDiagnosisDetail> = {
  nv: {
    code: 'nv',
    simpleNameEn: 'Common Normal Mole',
    simpleNameUr: 'عام اور بے ضرر قدرتی تل',
    easyMeaningEn: 'A normal, healthy beauty mark. It is completely harmless and not cancer. Just check it once a month for changes.',
    easyMeaningUr: 'یہ جلد پر ایک عام اور محفوظ قدرتی تل ہے۔ یہ کینسر نہیں ہے اور مکمل بے ضرر ہے۔ مہینے میں ایک بار اس کا جائزہ لیں۔',
    adviceEn: 'No medical action needed. Use SPF 30+ sunscreen when outdoors.',
    adviceUr: 'کسی طبی علاج کی ضرورت نہیں۔ دھوپ میں سن سکرین کا استعمال جاری رکھیں۔',
    isFriendly: true,
  },
  mel: {
    code: 'mel',
    simpleNameEn: 'Melanoma (Needs Immediate Doctor Check)',
    simpleNameUr: 'میلان стро (فوری طور پر ڈاکٹر سے چیک کروائیں)',
    easyMeaningEn: 'A serious skin spot that requires prompt attention. Please see a skin doctor (dermatologist) right away for an in-person look.',
    easyMeaningUr: 'یہ جلد کا ایک حساس اور سنجیدہ نشان ہے جس پر فوری توجہ درکار ہے۔ تصدیق اور مشورے کے لیے جلد کے ماہر ڈاکٹر سے فوری رجوع کریں۔',
    adviceEn: 'Book an appointment with a certified dermatologist within 48 hours. Avoid scratching or picking.',
    adviceUr: 'اگلے 48 گھنٹوں میں جلد کے ماہر ڈاکٹر سے معائنہ کروائیں۔ نشان کو چھیڑنے سے گریز کریں۔',
    isFriendly: false,
  },
  bcc: {
    code: 'bcc',
    simpleNameEn: 'Basal Cell Skin Spot (Common & Treatable)',
    simpleNameUr: 'بیسل سیل نشان (عام اور باآسانی قابلِ علاج)',
    easyMeaningEn: 'A very common, slow-growing skin condition. It rarely spreads elsewhere and is easy for a doctor to treat when found early.',
    easyMeaningUr: 'یہ جلد کا ایک بہت عام نشان ہے جو آہستہ آہستہ بڑھتا ہے۔ بروقت معلوم ہونے پر ڈاکٹر اس کا باآسانی علاج کر لیتے ہیں۔',
    adviceEn: 'Schedule a routine dermatology visit for simple treatment.',
    adviceUr: 'معمولی اور آسان علاج کے لیے جلد کے ڈاکٹر سے وقت لیں۔',
    isFriendly: false,
  },
  akiec: {
    code: 'akiec',
    simpleNameEn: 'Rough Sun Spot (Sun-Damaged Patch)',
    simpleNameUr: 'دھوپ کی وجہ سے کھردرا نشان (احتیاط درکار)',
    easyMeaningEn: 'A dry, scaly patch from long sun exposure. It is good to have a doctor treat it now so it does not turn into something worse.',
    easyMeaningUr: 'زیادہ دھوپ میں رہنے سے بننے والا خشک اور کھردرا نشان۔ ڈاکٹر سے معائنہ کروانا بہتر ہے تاکہ یہ آگے جا کر خراب نہ ہو۔',
    adviceEn: 'Keep the area moisturized and wear a wide-brim hat in sunlight.',
    adviceUr: 'جلد پر موئسچرائزر لگائیں اور تیز دھوپ میں ٹوپی یا چھتری استعمال کریں۔',
    isFriendly: false,
  },
  bkl: {
    code: 'bkl',
    simpleNameEn: 'Harmless Natural Age Spot',
    simpleNameUr: 'عمر بڑھنے کے ساتھ قدرتی بے ضرر نشان',
    easyMeaningEn: 'A very common, harmless spot that appears naturally as we get older. It is not dangerous and needs no treatment.',
    easyMeaningUr: 'عمر بڑھنے کے ساتھ قدرتی طور پر نمودار ہونے والا بے ضرر نشان۔ یہ بالکل محفوظ ہے اور علاج کی ضرورت نہیں۔',
    adviceEn: 'Harmless. Can be ignored or moisturized.',
    adviceUr: 'مکمل محفوظ ہے۔ کوئی پریشانی کی بات نہیں۔',
    isFriendly: true,
  },
  df: {
    code: 'df',
    simpleNameEn: 'Harmless Small Skin Bump',
    simpleNameUr: 'بے ضرر چھوٹا دانہ یا ابھار',
    easyMeaningEn: 'A small, firm bump that is completely harmless. Often appears after a small mosquito bite or scrape.',
    easyMeaningUr: 'جلد کا ایک چھوٹا، سخت ابھار جو عموماً مچھر کے کاٹنے یا ہلکی خراش کے بعد بنتا ہے۔ یہ بالکل بے ضرر ہے۔',
    adviceEn: 'Benign. No medical procedure required.',
    adviceUr: 'بے ضرر ہے۔ کسی علاج یا آپریشن کی ضرورت نہیں۔',
    isFriendly: true,
  },
  vasc: {
    code: 'vasc',
    simpleNameEn: 'Harmless Blood Vessel Mark',
    simpleNameUr: 'خون کی رگوں کا بے ضرر سرخ نشان',
    easyMeaningEn: 'A tiny cluster of tiny blood vessels under the skin. Looks red or purple, but is completely safe.',
    easyMeaningUr: 'جلد کے نیچے خون کی باریک نالیوں کا بے ضرر چھوٹا سرخ یا نیلا نشان۔ یہ خطرناک نہیں ہوتا۔',
    adviceEn: 'Safe and benign. Harmless capillary mark.',
    adviceUr: 'قدرتی اور محفوظ نشان ہے۔',
    isFriendly: true,
  },
};

const TRANSLATIONS: Record<string, { en: string; ur: string }> = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  'nav.skinAnalysis': { en: 'Skin Lesion AI', ur: 'جلد کا معائنہ' },
  'nav.hairAnalysis': { en: 'Scalp & Hair AI', ur: 'بالوں کا معائنہ' },
  'nav.history': { en: 'Timeline History', ur: 'سابقہ ریکارڈ' },
  'nav.progress': { en: 'Track Progress', ur: 'ترقی اور موازنہ' },
  'nav.admin': { en: 'Admin Panel', ur: 'ایڈمن پینل' },
  'nav.profile': { en: 'My Profile', ur: 'میری پروفائل' },
  'nav.brandSubtitle': { en: 'Skin & Hair Health Assessment Platform', ur: 'جلد اور بالوں کی مصنوعی ذہانت سے تشخیص کا پلیٹ فارم' },

  // Auth & Actions
  'auth.signIn': { en: 'Sign In / Register', ur: 'لاگ ان / نیا اکاؤنٹ' },
  'auth.demoPatient': { en: 'Demo Patient', ur: 'ڈیمو مریض' },
  'auth.signOut': { en: 'Log Out', ur: 'لاگ آؤٹ' },

  // Common UI
  'common.close': { en: 'Close', ur: 'بند کریں' },
  'common.save': { en: 'Save', ur: 'محفوظ کریں' },
  'common.cancel': { en: 'Cancel', ur: 'منسوخ' },
  'common.printPdf': { en: 'Download Clinical PDF Report', ur: 'ڈاکٹر کے لیے کلینیکل رپورٹ (PDF)' },
  'common.listen': { en: 'Listen in Urdu', ur: 'آواز میں سنیں' },
  'common.speaking': { en: 'Speaking...', ur: 'آواز جاری ہے...' },
  'common.stopAudio': { en: 'Stop Audio', ur: 'آواز بند کریں' },
  'common.checkAnother': { en: 'Check Another Picture', ur: 'ایک اور تصویر چیک کریں' },
  'common.accuracy': { en: 'AI Confidence', ur: 'مصنوعی ذہانت کا اعتماد' },
  'common.riskLevel': { en: 'Risk Level', ur: 'خطرے کا درجہ' },
  'common.lowRisk': { en: 'Low Risk (Safe & Normal)', ur: 'کم خطرہ (محفوظ اور عام)' },
  'common.mediumRisk': { en: 'Medium Risk (Monitor Closely)', ur: 'درمیانہ خطرہ (نگرانی رکھیں)' },
  'common.highRisk': { en: 'Attention Needed (See Doctor)', ur: 'فوری توجہ درکار (ڈاکٹر کو دکھائیں)' },
  'common.disclaimerTitle': { en: 'Important Medical Note', ur: 'اہم طبی وضاحت' },
  'common.disclaimerText': {
    en: 'This tool uses AI to guide you in simple words. It does not replace an in-person doctor visit. When in doubt, consult a certified dermatologist.',
    ur: 'یہ ایپلیکیشن آپ کی رہنمائی کے لیے مصنوعی ذہانت استعمال کرتی ہے۔ یہ باقاعدہ ڈاکٹر کے معائنے کا نعم البدل نہیں۔ شک کی صورت میں ماہر امراضِ جلد سے ضرور ملیں۔'
  },

  // Results terms
  'results.whatMeans': { en: 'What This Means in Plain English', ur: 'آسان الفاظ میں اس کا کیا مطلب ہے؟' },
  'results.recommendedSteps': { en: 'Recommended Next Steps', ur: 'اگلے تجویز کردہ اقدامات' },
  'results.cameraGuide': { en: 'Explainable AI Heatmap (Grad-CAM)', ur: 'مصنوعی ذہانت کا توجہ کا نقشہ (Grad-CAM)' },
  'results.heatmapTip': {
    en: 'Bright red and yellow areas highlight exactly what the AI looked at to form this assessment.',
    ur: 'سرخ اور پیلے حصے دکھاتے ہیں کہ کمپیوٹر نے فیصلہ کرتے وقت تصویر کے کن حصوں پر سب سے زیادہ غور کیا۔'
  },

  // Coach & Routine
  'coach.assistantTitle': { en: 'Daily Health & Routine Coach', ur: 'روزمرہ رہنمائی اور سن کیئر اسسٹنٹ' },
  'coach.uvNudge': { en: 'Today’s UV & Sun Protection Alert', ur: 'آج دھوپ کی شدت اور حفاظتی مشورہ' },
  'coach.streakTitle': { en: 'Consistency Streak', ur: 'مسلسل معائنے کا تسلسل' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  getSkinInfo: (code?: string) => { name: string; meaning: string; advice: string; isFriendly: boolean };
  getHairInfo: (stage?: string, score?: number) => { name: string; meaning: string; advice: string };
  getRiskDisplay: (level?: string) => { label: string; badgeClass: string; iconColor: string };
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dermalytics_language');
    return (saved === 'ur' || saved === 'en') ? saved : 'en';
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('dermalytics_language', language);
    // Apply lang attribute to root HTML
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    stopSpeaking();
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    const item = TRANSLATIONS[key];
    if (item) {
      return item[language] || item.en || fallback || key;
    }
    return fallback || key;
  };

  const getSkinInfo = (code?: string) => {
    const c = (code || 'nv').toLowerCase().trim();
    const match = SKIN_DIAGNOSES[c] || SKIN_DIAGNOSES.nv;
    return {
      name: language === 'ur' ? match.simpleNameUr : match.simpleNameEn,
      meaning: language === 'ur' ? match.easyMeaningUr : match.easyMeaningEn,
      advice: language === 'ur' ? match.adviceUr : match.adviceEn,
      isFriendly: match.isFriendly,
    };
  };

  const getHairInfo = (stage?: string, score?: number) => {
    const s = score ?? 85;
    if (s >= 80) {
      return {
        name: language === 'ur' ? 'بال مکمل گھنے اور صحت مند ہیں' : 'Healthy & Dense Hair',
        meaning: language === 'ur' 
          ? 'آپ کی کھوپڑی پر بالوں کی جڑیں مضبوط اور قدرتی کثافت میں ہیں۔ کوئی قابلِ تشویش بات نہیں۔'
          : 'Great follicular coverage and strong hair shaft density. No significant thinning detected.',
        advice: language === 'ur'
          ? 'ہفتے میں دو سے تین بار نرم شیمپو سے دھوئیں اور متوازن غذا جاری رکھیں۔'
          : 'Maintain your current routine with a mild sulfate-free shampoo and balanced nutrition.',
      };
    } else if (s >= 55) {
      return {
        name: language === 'ur' ? 'ابتدائی بال گرنا (ہلکی کمزوری)' : 'Mild / Early Thinning',
        meaning: language === 'ur'
          ? 'بالوں میں معمولی سی کمی یا ہلکا پن دیکھا گیا ہے۔ بروقت احتیاط سے اسے روکا جا سکتا ہے۔'
          : 'Slight spacing between follicles observed. Early intervention helps maintain baseline thickness.',
        advice: language === 'ur'
          ? 'گرم پانی کے زیادہ استعمال سے بچیں، سر کا ہلکا مساج کریں اور وٹامن بی / بائیوٹن والی غذائیں لیں۔'
          : 'Avoid hot showers on scalp, consider gentle scalp massages, and monitor every 30 days.',
      };
    } else {
      return {
        name: language === 'ur' ? 'نمایاں کمزوری اور بال گرنا' : 'Noticeable Thinning Pattern',
        meaning: language === 'ur'
          ? 'کھوپڑی کے مخصوص حصوں پر بالوں کی تعداد میں واضح کمی محسوس ہو رہی ہے۔'
          : 'Lower follicular density and wider scalp exposure detected in this region.',
        advice: language === 'ur'
          ? 'جلد اور بالوں کے معالج (Trichologist / Dermatologist) سے معائنہ کروائیں تاکہ موزوں سیرم یا علاج تجویز کیا جا سکے۔'
          : 'Consult a dermatologist or trichologist for evidence-based treatments (like topical minoxidil).',
      };
    }
  };

  const getRiskDisplay = (level?: string) => {
    const l = (level || 'low').toLowerCase();
    if (l === 'high') {
      return {
        label: language === 'ur' ? 'فوری توجہ درکار (ڈاکٹر کو دکھائیں)' : 'Attention Needed - Doctor Check Recommended',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        iconColor: 'text-rose-600',
      };
    } else if (l === 'medium') {
      return {
        label: language === 'ur' ? 'درمیانہ خطرہ (نگرانی رکھیں)' : 'Medium Risk - Keep an Eye on It',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        iconColor: 'text-amber-600',
      };
    }
    return {
      label: language === 'ur' ? 'کم خطرہ (محفوظ اور عام نشان)' : 'Low Risk - Looks Normal & Harmless',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconColor: 'text-emerald-600',
    };
  };

  // Text-to-speech audio reader
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = 0.95; // Slightly slower for clear medical understanding
    utterance.pitch = 1.0;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    if (language === 'ur') {
      const urVoice = voices.find(v => v.lang.startsWith('ur'));
      if (urVoice) utterance.voice = urVoice;
    } else {
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google')));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getSkinInfo,
        getHairInfo,
        getRiskDisplay,
        speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
