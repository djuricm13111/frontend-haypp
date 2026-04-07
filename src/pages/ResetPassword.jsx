import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import CheckoutHeader from "../layouts/header/CheckoutHeader";
import { useNavigation } from "../utils/navigation";
import APIService from "../services/APIService";
import { AuthUserContext } from "../context/AuthUserContext";

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
  max-width: 46ch;
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

const InputWrap = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 12px 44px 12px 14px;
  border: 1px solid var(--bg-300);
  border-radius: var(--border-radius-base);
  font-size: 1rem;
  font-family: inherit;
  background: var(--bg-100);
  color: var(--text-100);
  &:focus {
    outline: 2px solid var(--primary-100);
    border-color: var(--primary-200);
  }
`;

const TogglePw = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  padding: 8px;
  cursor: pointer;
  color: var(--text-200);
  line-height: 0;
  &:hover {
    color: var(--text-100);
  }
`;

const EyeSVG = styled.svg`
  display: block;
  width: 22px;
  height: 22px;
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

function formatApiErr(err) {
  const d = err?.response?.data;
  if (!d) return err?.message || null;
  if (typeof d === "string") return d;
  if (d.detail) return String(d.detail);
  if (d.error) return String(d.error);
  if (d.message) return String(d.message);
  if (d.password) return String(Array.isArray(d.password) ? d.password.join(" ") : d.password);
  if (d.non_field_errors) return String(d.non_field_errors.join(" "));
  return null;
}

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { goToHome } = useNavigation();
  const { lang, uid, token } = useParams();
  const { setAuthTokens, invalidateUserProfileCache } =
    useContext(AuthUserContext);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const l = String(lang || "")
      .toLowerCase()
      .split("-")[0];
    if (l === "de" || l === "en") {
      i18n.changeLanguage(l);
    }
  }, [lang, i18n]);

  if (!uid || !token) {
    return <Navigate to={goToHome()} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError(t("PASSWORD_RESET.ERROR_PASSWORD_REQUIRED"));
      return;
    }
    if (password !== confirm) {
      setError(t("REGISTER.PASSWORD_MISMATCH"));
      return;
    }
    setLoading(true);
    try {
      await APIService.ResetPassword(uid, token, password);
      invalidateUserProfileCache();
      setAuthTokens(null);
      localStorage.removeItem("authTokens");
      setSuccess(true);
      window.setTimeout(() => navigate(goToHome(), { replace: true }), 1600);
    } catch (err) {
      setError(formatApiErr(err) || t("PASSWORD_RESET.ERROR_TOKEN"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageRoot>
      <Helmet>
        <title>{t("PASSWORD_RESET.CONFIRM_PAGE_TITLE")}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <CheckoutHeader
        onBack={() => navigate(goToHome())}
        mobileContextI18nKey="PASSWORD_RESET.CONFIRM_HEADER_BADGE"
      />
      <Page>
        <Title>{t("PASSWORD_RESET.CONFIRM_TITLE")}</Title>
        <Lead>{t("PASSWORD_RESET.CONFIRM_LEAD")}</Lead>

        <Card>
          {success ? (
            <SuccessBox role="status">{t("PASSWORD_RESET.SUCCESS_REDIRECT")}</SuccessBox>
          ) : (
            <form onSubmit={handleSubmit}>
              {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}
              <Label htmlFor="reset-new-password">
                {t("LABELS.NEW_PASSWORD")}
                <InputWrap>
                  <Input
                    id="reset-new-password"
                    name="new-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("PLACEHOLDERS.PASSWORD")}
                    autoFocus
                  />
                  <TogglePw
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={
                      showPw
                        ? t("PASSWORD_RESET.A11Y_HIDE_PASSWORD")
                        : t("PASSWORD_RESET.A11Y_SHOW_PASSWORD")
                    }
                  >
                    {showPw ? (
                      <EyeSVG
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path
                          d="M15.6487 5.39465C14.4859 4.95229 13.2582 4.71997 12 4.71997C8.46997 4.71997 5.17997 6.54861 2.88997 9.71356C1.98997 10.9532 1.98997 13.0368 2.88997 14.2764C3.34474 14.9049 3.83895 15.4807 4.36664 16M19.3248 7.69629C19.9692 8.2894 20.5676 8.96401 21.11 9.71356C22.01 10.9532 22.01 13.0368 21.11 14.2764C18.82 17.4413 15.53 19.27 12 19.27C10.6143 19.27 9.26561 18.9882 7.99988 18.4544"
                          stroke="var(--text-200)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </EyeSVG>
                    ) : (
                      <EyeSVG
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.0001 3.96997C8.19618 3.96997 4.69299 5.94267 2.28282 9.27342C1.721 10.0475 1.46509 11.0419 1.46509 11.995C1.46509 12.9478 1.7209 13.942 2.28246 14.716C4.69264 18.0471 8.19599 20.02 12.0001 20.02C15.804 20.02 19.3072 18.0473 21.7174 14.7165C22.2792 13.9424 22.5351 12.948 22.5351 11.995C22.5351 11.0421 22.2793 10.0479 21.7177 9.27392C19.3075 5.94286 15.8042 3.96997 12.0001 3.96997ZM9.75012 12C9.75012 10.755 10.7551 9.75 12.0001 9.75C13.2451 9.75 14.2501 10.755 14.2501 12C14.2501 13.245 13.2451 14.25 12.0001 14.25C10.7551 14.25 9.75012 13.245 9.75012 12Z"
                          fill="var(--text-200)"
                        />
                      </EyeSVG>
                    )}
                  </TogglePw>
                </InputWrap>
              </Label>
              <Label htmlFor="reset-confirm-password">
                {t("LABELS.CONFIRM_PASSWORD")}
                <Input
                  id="reset-confirm-password"
                  name="confirm-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t("PLACEHOLDERS.CONFIRM_PASSWORD")}
                />
              </Label>
              <SubmitBtn type="submit" disabled={loading}>
                {loading
                  ? t("PASSWORD_RESET.SET_PASSWORD_SUBMITTING")
                  : t("PASSWORD_RESET.SET_PASSWORD_SUBMIT")}
              </SubmitBtn>
            </form>
          )}
        </Card>
      </Page>
    </PageRoot>
  );
};

export default ResetPassword;
