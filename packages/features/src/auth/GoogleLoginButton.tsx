/**
 * GoogleLoginButton — Google OAuth login button component
 *
 * Uses @react-oauth/google's GoogleLogin component
 * and dispatches auth actions through useAuth hook.
 */
import React, { useCallback } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "./useAuth";

interface GoogleLoginButtonProps {
  /** Called after successful login */
  onSuccess?: () => void;
  /** Called after failed login */
  onError?: (error: string) => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const { login, isLoading } = useAuth();

  const handleSuccess = useCallback(
    async (credentialResponse: CredentialResponse) => {
      const idToken = credentialResponse.credential;
      if (!idToken) {
        onError?.("No credential received from Google");
        return;
      }

      try {
        await login(idToken);
        onSuccess?.();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Authentication failed";
        onError?.(message);
      }
    },
    [login, onSuccess, onError],
  );

  const handleError = useCallback(() => {
    onError?.("Google sign-in was cancelled or failed");
  }, [onError]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "12px",
        }}
      >
        <span>Authenticating...</span>
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap={false}
      theme="outline"
      shape="rectangular"
      size="large"
      text="continue_with"
      width="320"
    />
  );
};
