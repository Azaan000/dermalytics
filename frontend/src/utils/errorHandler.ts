export class AppError extends Error {
  code: string;
  details?: any;
  statusCode?: number;
  requestId?: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: any, statusCode?: number) {
    super(message);
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  
  const code = error.code || (error.response?.data?.error?.code);
  const serverMsg = error.response?.data?.error?.message || error.message;

  const errorMessages: Record<string, string> = {
    'AUTH_1001': 'Invalid email or password. Please try again.',
    'AUTH_1002': 'Please verify your email before logging in.',
    'AUTH_1003': 'Your account has been deactivated or locked. Contact support.',
    'AUTH_1004': 'Your session has expired. Please log in again.',
    'AUTH_1005': 'Invalid authentication token.',
    'AUTH_1006': 'Password must be at least 8 characters with upper, lower, and numbers.',
    'AUTH_1007': 'This email address is already registered.',
    'AUTH_1008': 'This username is already taken.',
    'VAL_2001': 'Please enter a valid email address.',
    'VAL_2002': 'Please upload a valid JPEG, PNG, or WebP image.',
    'VAL_2003': 'The image file size exceeds the 10MB limit.',
    'VAL_2004': 'Image dimensions too small. Minimum resolution is 200x200.',
    'AI_4005': 'Low confidence prediction. Please upload a clearer, well-lit photo.',
    'NETWORK_ERROR': 'Unable to connect to server. Running in interactive demo mode.',
  };

  return errorMessages[code] || serverMsg || 'An unexpected error occurred.';
};
