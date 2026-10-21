import QRCode from 'qrcode';

export interface ReportVerificationData {
  reportId: string;
  patientName: string;
  assessmentType: 'skin' | 'hair';
  predictedClass: string;
  confidence: number | string;
  riskTier: string;
  timestamp: string;
  verificationHash: string;
}

export async function generateReportQRCode(data: ReportVerificationData): Promise<string> {
  const verificationUrl = `https://dermalytics.health/verify/report?id=${encodeURIComponent(data.reportId)}&hash=${encodeURIComponent(data.verificationHash)}&risk=${encodeURIComponent(data.riskTier)}`;
  
  try {
    const dataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate verification QR code:', err);
    // Return a basic SVG or fallback
    return '';
  }
}

export function generateVerificationHash(reportId: string, timestamp: string): string {
  // Simple deterministic hash simulation for clinical telemetry verification
  let hash = 0;
  const str = `${reportId}:${timestamp}:DERMALYTICS:HAMDARD_UNIVERSITY:2026`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `DL-AUTH-${hex}-${timestamp.slice(0, 10).replace(/-/g, '')}`;
}
