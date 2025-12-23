/**
 * Email whitelist configuration for restricting user access.
 *
 * Set the ALLOWED_EMAILS environment variable with a comma-separated list
 * of email addresses that are allowed to sign up/login.
 *
 * Example: ALLOWED_EMAILS=mom@gmail.com,dad@gmail.com,sister@gmail.com
 *
 * If ALLOWED_EMAILS is not set or empty, all emails will be allowed (open registration).
 */

export function getAllowedEmails(): string[] {
  const allowedEmails = process.env.ALLOWED_EMAILS;

  if (!allowedEmails || allowedEmails.trim() === '') {
    return [];
  }

  return allowedEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

export function isEmailAllowed(email: string): boolean {
  const allowedEmails = getAllowedEmails();

  // If no whitelist is configured, allow all emails (backward compatible)
  if (allowedEmails.length === 0) {
    return true;
  }

  return allowedEmails.includes(email.toLowerCase());
}
