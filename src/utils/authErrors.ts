import { AxiosError } from 'axios';

/**
 * Shape of an API error response body that may include a server-provided
 * user-facing message.
 */
interface ApiErrorData {
  message?: string;
}

/**
 * Maps an error thrown by an Axios request (or any unknown error) to a
 * user-friendly message suitable for display in auth UI.
 *
 * Mapping rules (per design "Error Mapping Utility"):
 * - Network errors (`ERR_NETWORK` or no response):
 *     "Unable to connect. Please check your internet connection"
 * - HTTP 401: "Invalid email or password"
 * - HTTP 500: "Server error. Please try again later"
 * - Default: API-provided `response.data.message` if present,
 *     otherwise "An unexpected error occurred"
 *
 * @param error - The error caught from an API call. Typically an
 *   `AxiosError`, but accepts `unknown` to be safe at call sites.
 * @returns A user-friendly error message string.
 */
export function mapApiErrorToMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorData> | undefined;

  // Network errors: no response received from the server
  if (axiosError?.code === 'ERR_NETWORK' || !axiosError?.response) {
    return 'Unable to connect. Please check your internet connection';
  }

  const status = axiosError.response.status;

  if (status === 401) {
    return 'Invalid email or password';
  }

  if (status === 500) {
    return 'Server error. Please try again later';
  }

  // Fall back to an API-provided message, otherwise a generic error
  return axiosError.response.data?.message || 'An unexpected error occurred';
}
