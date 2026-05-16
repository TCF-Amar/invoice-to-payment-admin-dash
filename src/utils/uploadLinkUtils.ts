import { addHours, addDays, format, parseISO } from 'date-fns';

/**
 * Constructs the vendor upload portal URL with the provided token
 * @param token - JWT token for the upload link
 * @param poNumber - Optional PO number to include as a parameter
 * @returns Complete upload URL with token and optional PO number
 * @example
 * buildUploadUrl('eyJhbGc...', 'PO-2024-001')
 * // Returns: 'https://example.com/vendor-upload?token=eyJhbGc...&po=PO-2024-001'
 */
export function buildUploadUrl(token: string, poNumber?: string): string {
  if (!token || token.trim() === '') {
    throw new Error('Token is required to build upload URL');
  }

  const base = window.location.origin;
  const params = new URLSearchParams({ token });

  if (poNumber && poNumber.trim() !== '') {
    params.set('po', poNumber);
  }

  return `${base}/vendor-upload?${params.toString()}`;
}

/**
 * Calculates the expiration time based on the selected duration
 * @param expiresIn - Duration string: '1h', '24h', or '7d'
 * @param baseTime - Optional base time to calculate from (defaults to current time)
 * @returns ISO 8601 formatted expiration timestamp
 * @throws Error if expiresIn is not a valid duration
 * @example
 * calculateExpirationTime('24h')
 * // Returns: '2024-12-25T14:30:00.000Z' (24 hours from now)
 */
export function calculateExpirationTime(
  expiresIn: '1h' | '24h' | '7d',
  baseTime: Date = new Date()
): string {
  let expirationDate: Date;

  switch (expiresIn) {
    case '1h':
      expirationDate = addHours(baseTime, 1);
      break;
    case '24h':
      expirationDate = addHours(baseTime, 24);
      break;
    case '7d':
      expirationDate = addDays(baseTime, 7);
      break;
    default:
      throw new Error(`Invalid expiration duration: ${expiresIn}`);
  }

  return expirationDate.toISOString();
}

/**
 * Formats the expiration time for UI display in human-readable format
 * @param expiresAt - ISO 8601 formatted expiration timestamp
 * @param format - Optional format string (defaults to 'MMM dd, yyyy HH:mm:ss')
 * @returns Human-readable expiration time string
 * @example
 * formatExpirationDisplay('2024-12-25T14:30:00.000Z')
 * // Returns: 'Dec 25, 2024 14:30:00'
 */
export function formatExpirationDisplay(expiresAt: string, formatStr: string = 'MMM dd, yyyy HH:mm:ss'): string {
  try {
    if (!expiresAt || expiresAt.trim() === '') {
      return '';
    }

    const expirationDate = parseISO(expiresAt);

    // Validate that the date is valid
    if (isNaN(expirationDate.getTime())) {
      return '';
    }

    return format(expirationDate, formatStr);
  } catch {
    return '';
  }
}

/**
 * Formats the expiration time as a relative duration (e.g., "Expires in 24 hours")
 * @param expiresAt - ISO 8601 formatted expiration timestamp
 * @returns Relative expiration string
 * @example
 * formatExpirationRelative('2024-12-25T14:30:00.000Z')
 * // Returns: 'Expires in 24 hours' or 'Expires in 7 days'
 */
export function formatExpirationRelative(expiresAt: string): string {
  try {
    if (!expiresAt || expiresAt.trim() === '') {
      return '';
    }

    const expirationDate = parseISO(expiresAt);
    const now = new Date();

    // Validate that the date is valid
    if (isNaN(expirationDate.getTime())) {
      return '';
    }

    const diffMs = expirationDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return 'Expired';
    }

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `Expires in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }

    if (diffHours < 24) {
      return `Expires in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }

    return `Expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } catch {
    return '';
  }
}

/**
 * Validates vendor email format on the client-side
 * @param email - Email address to validate
 * @returns Object with isValid boolean and optional error message
 * @example
 * validateVendorEmail('vendor@example.com')
 * // Returns: { isValid: true }
 *
 * validateVendorEmail('')
 * // Returns: { isValid: false, error: 'Email is required' }
 *
 * validateVendorEmail('invalid-email')
 * // Returns: { isValid: false, error: 'Please enter a valid email address' }
 */
export function validateVendorEmail(email: string): { isValid: boolean; error?: string } {
  // Check if email is empty or only whitespace
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  // Basic email format validation using regex
  // This regex checks for: local-part@domain.extension
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  // Additional validation: check for common issues
  const trimmedEmail = email.trim();

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return {
      isValid: false,
      error: 'Email address is invalid',
    };
  }

  // Check if email starts or ends with a dot
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email address is invalid',
    };
  }

  // Check if local part (before @) is too long (max 64 characters per RFC 5321)
  const [localPart] = trimmedEmail.split('@');
  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email address is too long',
    };
  }

  // Check if domain part (after @) is too long (max 255 characters per RFC 5321)
  const domainPart = trimmedEmail.split('@')[1];
  if (domainPart.length > 255) {
    return {
      isValid: false,
      error: 'Email domain is too long',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Checks if an upload link is expiring soon (less than 1 hour remaining)
 * @param expiresAt - ISO 8601 formatted expiration timestamp
 * @returns true if link expires in less than 1 hour, false otherwise
 * @example
 * isExpiringsoon('2024-12-25T14:30:00.000Z')
 * // Returns: true or false depending on current time
 */
export function isExpiringSoon(expiresAt: string): boolean {
  try {
    if (!expiresAt || expiresAt.trim() === '') {
      return false;
    }

    const expirationDate = parseISO(expiresAt);
    const now = new Date();

    // Validate that the date is valid
    if (isNaN(expirationDate.getTime())) {
      return false;
    }

    const diffMs = expirationDate.getTime() - now.getTime();
    const oneHourMs = 1000 * 60 * 60;

    return diffMs > 0 && diffMs < oneHourMs;
  } catch {
    return false;
  }
}

/**
 * Checks if an upload link has expired
 * @param expiresAt - ISO 8601 formatted expiration timestamp
 * @returns true if link has expired, false otherwise
 * @example
 * isExpired('2024-12-25T14:30:00.000Z')
 * // Returns: true or false depending on current time
 */
export function isExpired(expiresAt: string): boolean {
  try {
    if (!expiresAt || expiresAt.trim() === '') {
      return false;
    }

    const expirationDate = parseISO(expiresAt);
    const now = new Date();

    // Validate that the date is valid
    if (isNaN(expirationDate.getTime())) {
      return false;
    }

    return now.getTime() > expirationDate.getTime();
  } catch {
    return false;
  }
}
