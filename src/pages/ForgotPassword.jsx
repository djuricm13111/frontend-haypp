import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import CheckoutHeader from "../layouts/header/CheckoutHeader";
import { useNavigation } from "../utils/navigation";
import APIService from "../services/APIService";

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

const inputBase = `
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #ccc;
  border-radius: var(--border-radius-base);
  font-size: 15px;
  font-family: "Montserrat", sans-serif;
  background: var(--bg-100);
  color: var(--text-100);
  line-height: 1.4;
  &:focus {
    outline: 2px solid var(--primary-100);
    outline-offset: 0;
    border-color: var(--primary-200);
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
  margin-bottom: var(--spacing-md);
  width: 100%;
  text-align: left;
`;

const Input = styled.input`
  ${inputBase}
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 44px;
  margin-top: var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-base);
  background: var(--primary-100);
  color: var(--bg-100);
  font-size: 15px;
  font-weight: 600;
  font-family: "Montserrat", sans-serif;
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
  line-height: 1.5;
`;

const FooterRow = styled.p`
  margin: var(--spacing-lg) 0 0;
  font-size: 14px;
  font-family: "Montserrat", sans-serif;
  color: var(--text-200);
  text-align: center;
`;

const TextLink = styled(Link)`
  color: var(--primary-200);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  &:hover {
    color: var(--primary-100);
  }
`;

function formatApiErr(err) {
  const d = err?.response?.data;
  if (!d) return err?.message || null;
  if (typeof d === "string") return d;
  if (d.detail) return String(d.detail);
  if (d.error) return String(d.error);
  if (d.message) return String(d.message);
  if (d.email) return String(Array.isArray(d.email) ? d.email.join(" ") : d.email);
  if (d.non_field_errors) return String(d.non_field_errors.join(" "));
  return null;
}

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goToHome } = useNavigation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t("PASSWORD_RESET.ERROR_EMAIL_REQUIRED"));
      return;
    }
    setLoading(true);
    try {
      await APIService.ResetPasswordRequest(trimmed.replace(/\s/g, ""));
      setDone(true);
    } catch (err) {
      const status = err?.response?.status;
      const msg = formatApiErr(err);
      if (status === 404) {
        setError(t("PASSWORD_RESET.ERROR_USER_NOT_FOUND"));
      } else {
        setError(msg || t("PASSWORD_RESET.ERROR_GENERIC"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageRoot>
      <Helmet>
        <title>{t("PASSWORD_RESET.FORGOT_PAGE_TITLE")}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <CheckoutHeader
        onBack={() => navigate(goToHome())}
        mobileContextI18nKey="PASSWORD_RESET.FORGOT_HEADER_BADGE"
      />
      <Page>
        <Title>{t("PASSWORD_RESET.FORGOT_TITLE")}</Title>
        <Lead>{t("PASSWORD_RESET.FORGOT_LEAD")}</Lead>

        <Card>
          {done ? (
            <SuccessBox role="status">
              {t("PASSWORD_RESET.REQUEST_SUCCESS_TITLE")}
              <br />
              <span style={{ fontWeight: 400, fontSize: "0.95em" }}>
                {t("PASSWORD_RESET.REQUEST_SUCCESS_DETAIL")}
              </span>
            </SuccessBox>
          ) : (
            <form onSubmit={handleSubmit}>
              {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
              <Label htmlFor="forgot-email">
                {t("LABELS.EMAIL")}
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("PLACEHOLDERS.EMAIL")}
                  autoFocus
                />
              </Label>
              <SubmitBtn type="submit" disabled={loading}>
                {loading
                  ? t("PASSWORD_RESET.REQUEST_SUBMITTING")
                  : t("PASSWORD_RESET.REQUEST_SUBMIT")}
              </SubmitBtn>
            </form>
          )}

          <FooterRow>
            <TextLink to={goToHome()}>{t("PASSWORD_RESET.BACK_HOME")}</TextLink>
          </FooterRow>
        </Card>
      </Page>
    </PageRoot>
  );
};

export default ForgotPassword;
