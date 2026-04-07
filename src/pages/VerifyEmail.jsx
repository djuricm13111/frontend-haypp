import { useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import CheckoutHeader from "../layouts/header/CheckoutHeader";
import { AuthUserContext } from "../context/AuthUserContext";
import { isAccountEmailVerified } from "../utils/emailVerification";

const PageRoot = styled.div`
  width: 100%;
  min-height: 100vh;
  background: var(--bg-200);
  overflow-x: clip;
  box-sizing: border-box;
`;

const Page = styled.main`
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-md) clamp(12px, 3vw, 24px) var(--spacing-xxl);
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: clamp(1.25rem, 3.5vw, 1.5rem);
  font-weight: 700;
  color: var(--text-100);
  margin: 0 0 var(--spacing-sm);
  text-align: center;
`;

const Lead = styled.p`
  margin: 0 auto var(--spacing-lg);
  max-width: 42ch;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-200);
  text-align: center;
`;

const Card = styled.section`
  background: var(--bg-100);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--border-radius-large);
  padding: clamp(20px, 3vw, 28px);
  box-shadow: var(--shadow-small);
  max-width: min(420px, 100%);
  margin: 0 auto;
  box-sizing: border-box;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-200);
  margin-bottom: var(--spacing-md);
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid var(--bg-300);
  border-radius: var(--border-radius-base);
  font-size: 1.125rem;
  letter-spacing: 0.2em;
  text-align: center;
  font-family: inherit;
  background: var(--bg-100);
  color: var(--text-100);
  &:focus {
    outline: 2px solid var(--primary-100);
    border-color: var(--primary-200);
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 46px;
  margin-top: var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-base);
  background: var(--primary-100);
  color: var(--bg-100);
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: var(--primary-200);
  }
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const ErrorBox = styled.div`
  background: #ffebee;
  color: #b71c1c;
  padding: 12px 14px;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  margin-bottom: var(--spacing-md);
`;

const SuccessBox = styled.div`
  background: #e8f5e9;
  color: #1b5e20;
  padding: 14px 16px;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  margin-bottom: var(--spacing-md);
  text-align: center;
`;

const ResendRow = styled.p`
  margin: var(--spacing-lg) 0 0;
  font-size: 14px;
  color: var(--text-200);
  text-align: center;
  line-height: 1.5;
`;

const LinkButton = styled.button`
  display: inline;
  padding: 0;
  border: none;
  background: none;
  color: var(--primary-200);
  font-weight: 600;
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  &:hover {
    color: var(--primary-100);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

function formatVerifyErr(err) {
  const d = err?.response?.data;
  if (!d) return err?.message || null;
  if (typeof d === "string") return d;
  if (d.detail) return String(d.detail);
  if (d.code) return String(Array.isArray(d.code) ? d.code.join(" ") : d.code);
  if (d.non_field_errors) return String(d.non_field_errors.join(" "));
  return null;
}

const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    authTokens,
    verifyEmailWithCode,
    resendVerificationEmail,
    userProfile,
  } = useContext(AuthUserContext);

  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendSec, setResendSec] = useState(0);

  const accessToken = authTokens?.access;

  const email = useMemo(() => {
    if (userProfile?.email) return userProfile.email;
    if (!accessToken) return "";
    try {
      return jwtDecode(accessToken).email || "";
    } catch {
      return "";
    }
  }, [userProfile, accessToken]);

  const alreadyVerified = useMemo(
    () => isAccountEmailVerified(accessToken, userProfile),
    [accessToken, userProfile]
  );

  useEffect(() => {
    if (resendSec <= 0) return undefined;
    const id = setInterval(() => setResendSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendSec]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError(t("VERIFICATION.CODE_REQUIRED"));
      return;
    }
    setLoading(true);
    try {
      await verifyEmailWithCode(trimmed);
      setSuccess(true);
      window.setTimeout(() => navigate("/account", { replace: true }), 1200);
    } catch (err) {
      setError(formatVerifyErr(err) || t("VERIFICATION.ERROR_GENERIC"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendSec > 0) return;
    setError(null);
    try {
      await resendVerificationEmail(email);
      setResendSec(60);
    } catch (err) {
      setError(formatVerifyErr(err) || t("VERIFICATION.RESEND_ERROR"));
    }
  };

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  if (alreadyVerified) {
    return <Navigate to="/account" replace />;
  }

  return (
    <PageRoot>
      <Helmet>
        <title>{t("VERIFICATION.PAGE_TITLE")}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <CheckoutHeader
        onBack={() => navigate("/account")}
        mobileContextI18nKey="VERIFICATION.HEADER_BADGE"
      />
      <Page>
        <Title>{t("VERIFICATION.TITLE")}</Title>
        <Lead>
          {t("VERIFICATION.SUBTITLE", { email: email || "—" })}
        </Lead>

        <Card>
          {success ? (
            <SuccessBox role="status">{t("VERIFICATION.SUCCESS")}</SuccessBox>
          ) : (
            <form onSubmit={handleSubmit}>
              {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
              <Label htmlFor="verify-code">
                {t("VERIFICATION.CODE_LABEL")}
                <Input
                  id="verify-code"
                  name="verification-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\s/g, "").slice(0, 12))
                  }
                  placeholder={t("VERIFICATION.CODE_PLACEHOLDER")}
                  autoFocus
                />
              </Label>
              <SubmitBtn type="submit" disabled={loading}>
                {loading ? t("VERIFICATION.SUBMITTING") : t("VERIFICATION.SUBMIT")}
              </SubmitBtn>
            </form>
          )}

          <ResendRow>
            {t("VERIFICATION.RESEND_INFO")}{" "}
            <LinkButton
              type="button"
              onClick={handleResend}
              disabled={resendSec > 0 || !email}
            >
              {t("VERIFICATION.RESEND_LINK")}
            </LinkButton>
            {resendSec > 0
              ? ` · ${t("VERIFICATION.TIMER_INFO", { timer: resendSec })}`
              : null}
          </ResendRow>
        </Card>
      </Page>
    </PageRoot>
  );
};

export default VerifyEmail;
