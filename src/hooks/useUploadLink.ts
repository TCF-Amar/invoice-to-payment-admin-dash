import { useState, useCallback } from 'react';
import { UploadLinkState } from '@/types';

/**
 * Custom hook for managing upload link state
 * Encapsulates all state management logic for the upload link feature
 * 
 * @param initialVendorEmail - Initial vendor email (typically from PO)
 * @param initialPoNumber - Initial PO number (typically from PO)
 * @returns Object containing all state variables and setter functions
 */
export const useUploadLink = (initialVendorEmail: string = '', initialPoNumber: string = '') => {
  // Form inputs
  const [vendorEmail, setVendorEmail] = useState(initialVendorEmail);
  const [poNumber, setPoNumber] = useState(initialPoNumber);
  const [expiresIn, setExpiresIn] = useState<'1h' | '24h' | '7d'>('24h');

  // Generated link
  const [generatedToken, setGeneratedToken] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  /**
   * Get current state as UploadLinkState object
   */
  const getState = useCallback((): UploadLinkState => ({
    vendorEmail,
    poNumber,
    expiresIn,
    generatedToken,
    generatedUrl,
    expiresAt,
    isGenerating,
    isSendingEmail,
    emailSent,
    formDisabled,
    error,
  }), [
    vendorEmail,
    poNumber,
    expiresIn,
    generatedToken,
    generatedUrl,
    expiresAt,
    isGenerating,
    isSendingEmail,
    emailSent,
    formDisabled,
    error,
  ]);

  /**
   * Update form state after successful link generation
   */
  const setGeneratedLinkState = useCallback((
    token: string,
    url: string,
    expiresAtTime: string
  ) => {
    setGeneratedToken(token);
    setGeneratedUrl(url);
    setExpiresAt(expiresAtTime);
    setFormDisabled(true);
    setEmailSent(false);
    setError(null);
  }, []);

  /**
   * Update UI state for generating link
   */
  const setGeneratingState = useCallback((isGenerating: boolean) => {
    setIsGenerating(isGenerating);
  }, []);

  /**
   * Update UI state for sending email
   */
  const setSendingEmailState = useCallback((isSending: boolean) => {
    setIsSendingEmail(isSending);
  }, []);

  /**
   * Mark email as sent
   */
  const markEmailAsSent = useCallback(() => {
    setEmailSent(true);
    setError(null);
  }, []);

  /**
   * Set error state
   */
  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  /**
   * Reset all state to initial values
   * Clears generated link, form state, and error state
   */
  const reset = useCallback(() => {
    setVendorEmail(initialVendorEmail);
    setPoNumber(initialPoNumber);
    setExpiresIn('24h');
    setGeneratedToken('');
    setGeneratedUrl('');
    setExpiresAt(null);
    setIsGenerating(false);
    setIsSendingEmail(false);
    setEmailSent(false);
    setFormDisabled(false);
    setError(null);
  }, [initialVendorEmail, initialPoNumber]);

  /**
   * Reset only the generated link state (for "Generate New Link" button)
   * Keeps form inputs but clears generated link and email sent state
   */
  const resetGeneratedLink = useCallback(() => {
    setGeneratedToken('');
    setGeneratedUrl('');
    setExpiresAt(null);
    setEmailSent(false);
    setFormDisabled(false);
    setError(null);
  }, []);

  /**
   * Update vendor email
   */
  const updateVendorEmail = useCallback((email: string) => {
    setVendorEmail(email);
  }, []);

  /**
   * Update expires in duration
   */
  const updateExpiresIn = useCallback((duration: '1h' | '24h' | '7d') => {
    setExpiresIn(duration);
  }, []);

  return {
    // Form inputs
    vendorEmail,
    poNumber,
    expiresIn,
    updateVendorEmail,
    updateExpiresIn,

    // Generated link
    generatedToken,
    generatedUrl,
    expiresAt,
    setGeneratedLinkState,

    // UI state
    isGenerating,
    isSendingEmail,
    emailSent,
    formDisabled,
    setGeneratingState,
    setSendingEmailState,
    markEmailAsSent,

    // Error state
    error,
    setErrorState,

    // State management
    getState,
    reset,
    resetGeneratedLink,
  };
};

export default useUploadLink;
