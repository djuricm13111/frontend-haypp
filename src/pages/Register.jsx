import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import CheckoutHeader from "../layouts/header/CheckoutHeader";
import { AuthUserContext } from "../context/AuthUserContext";
import { useNavigation } from "../utils/navigation";

const PageRoot = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  box-sizing: border-box;
  background: var(--bg-200);
  min-height: 100vh;
`;

const Page = styled.main`
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-sm) clamp(12px, 3vw, 24px) var(--spacing-xxl);
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: clamp(1.35rem, 4vw, 1.75rem);
  font-weight: 700;
  color: var(--text-100);
  margin: var(--spacing-sm) 0 var(--spacing-md);
  line-height: 1.25;
`;

const AccountHintBar = styled.div`
  width: 100%;
  margin: 0 0 var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  box-sizing: border-box;
  background-color: var(--bg-300);
  border-bottom: 1px solid #e4e4e4;
  border-radius: var(--border-radius-base) var(--border-radius-base) 0 0;
`;

const AccountHintTitle = styled.h2`
  margin: 0 0 var(--spacing-xs);
  padding: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-100);
  text-align: center;
  font-family: "Oswald-Medium", "Montserrat", sans-serif;
  line-height: 1.25;
`;

const AccountHintText = styled.p`
  margin: 0;
  font-size: var(--header-font-size-small, 13px);
  color: var(--text-200);
  line-height: 1.45;
  text-align: center;
  font-family: "Montserrat", sans-serif;
`;

const Card = styled.section`
  background: var(--bg-100);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--border-radius-large);
  padding: clamp(16px, 3vw, 24px);
  box-shadow: var(--shadow-small);
  max-width: min(440px, 100%);
  margin: 0 auto;
  box-sizing: border-box;
`;

const LoginLogoMark = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #001a57;
  text-transform: uppercase;
  line-height: 1;
  font-size: clamp(1.5rem, 5vw, 1.75rem);
  margin: 0 0 var(--spacing-lg);
`;

const inputBase = `
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: var(--border-radius-base);
  font-size: 15px;
  font-family: inherit;
  background: var(--bg-100);
  color: var(--text-100);
  &:focus {
    outline: 2px solid var(--primary-100);
    outline-offset: 0;
    border-color: var(--primary-200);
  }
`;

const Input = styled.input`
  ${inputBase}
`;

const Label = styled.label`
  font-size: 13px;
  text-transform: capitalize;
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--spacing-md);
  width: 100%;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-md);
  width: 100%;
  @media (max-width: 520px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const SectionTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-200);
  margin: var(--spacing-lg) 0 var(--spacing-sm);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--bg-300);
`;

const HintLine = styled.p`
  margin: 0 0 var(--spacing-md);
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-200);
`;

const OptionalBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--primary-200);
`;

const Button = styled.button`
  width: 100%;
  height: 44px;
  margin-top: var(--spacing-sm);
  border: none;
  background: var(--primary-100);
  color: var(--bg-100);
  font-size: 15px;
  font-weight: 600;
  font-family: "Montserrat", sans-serif;
  cursor: pointer;
  position: relative;
  &:hover {
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

const FooterRow = styled.div`
  margin-top: var(--spacing-lg);
  text-align: center;
  font-size: 13px;
  color: var(--text-100);
  font-family: "Montserrat", sans-serif;
`;

const InlineLink = styled(Link)`
  color: var(--primary-200);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  &:hover {
    color: var(--primary-100);
  }
`;

const EyeSpan = styled.span`
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
`;

const PasswordInput = styled(Input)`
  grid-column: 1;
  grid-row: 1;
  width: 100%;
  padding-right: 44px;
`;

const EyeSVG = styled.svg`
  grid-column: 1;
  grid-row: 1;
  justify-self: end;
  align-self: center;
  width: 22px;
  height: 22px;
  margin-right: 12px;
  cursor: pointer;
  z-index: 2;
`;

function formatErr(payload) {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (payload.detail) return String(payload.detail);
  const parts = [];
  Object.entries(payload).forEach(([k, v]) => {
    if (Array.isArray(v)) parts.push(`${k}: ${v.join(" ")}`);
    else if (v && typeof v === "object") parts.push(`${k}: ${JSON.stringify(v)}`);
    else parts.push(`${k}: ${v}`);
  });
  return parts.join(" · ");
}

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goToHome, goToShop } = useNavigation();
  const {
    registerUser,
    createAddressBook,
    fetchUserData,
    invalidateUserProfileCache,
  } = useContext(AuthUserContext);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [secondaryStreet, setSecondaryStreet] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t("REGISTER.PASSWORD_MISMATCH"));
      return;
    }
    setLoading(true);
    try {
      const registerResponse = await registerUser(
        email.trim().replace(/\s/g, ""),
        firstName.trim(),
        lastName.trim(),
        password,
        referralCode.trim() || null
      );

      const access = registerResponse?.access;
      if (!access) {
        throw new Error("No access token");
      }

      invalidateUserProfileCache();

      const hasFullAddress =
        country.trim() &&
        city.trim() &&
        postalCode.trim() &&
        street.trim();

      if (hasFullAddress) {
        try {
          await createAddressBook(
            {
              country: country.trim(),
              city: city.trim(),
              postal_code: postalCode.trim(),
              street: street.trim(),
              street_number: streetNumber.trim() || null,
              secondary_street: secondaryStreet.trim() || null,
              building_number: buildingNumber.trim() || null,
              phone_number: phoneNumber.trim() || null,
              type: "Home",
              is_primary: true,
            },
            access
          );
        } catch (addrErr) {
          console.error(addrErr);
        }
      }

      await fetchUserData(access);

      navigate(goToShop());
    } catch (err) {
      const data = err.response?.data;
      setError(formatErr(data) || err.message || t("REGISTER.ERROR_GENERIC"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageRoot>
      <Helmet>
        <title>{t("REGISTER.PAGE_TITLE")}</title>
      </Helmet>
      <CheckoutHeader onBack={() => navigate(goToHome())} />
      <Page>
        <Title>{t("REGISTER.TITLE")}</Title>

        <Card>
          <AccountHintBar>
            <AccountHintTitle>{t("REGISTER.HINT_SECTION_TITLE")}</AccountHintTitle>
            <AccountHintText>{t("REGISTER.ACCOUNT_HINT")}</AccountHintText>
          </AccountHintBar>

          <LoginLogoMark>{t("REGISTER.LOGO_MARK")}</LoginLogoMark>

          <form onSubmit={handleSubmit}>
            {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}

            <Label htmlFor="reg-email">
              {t("LABELS.EMAIL")}
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                placeholder={t("PLACEHOLDERS.EMAIL")}
                required
              />
            </Label>

            <Row>
              <Label htmlFor="reg-first">
                {t("LABELS.NAME")}
                <Input
                  id="reg-first"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("PLACEHOLDERS.NAME")}
                  required
                />
              </Label>
              <Label htmlFor="reg-last">
                {t("LABELS.SURNAME")}
                <Input
                  id="reg-last"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("PLACEHOLDERS.SURNAME")}
                  required
                />
              </Label>
            </Row>

            <Label htmlFor="reg-password">
              {t("LABELS.PASSWORD")}
              <EyeSpan>
                <PasswordInput
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("PLACEHOLDERS.PASSWORD")}
                  required
                  minLength={8}
                />
                <EyeSVG
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-hidden
                >
                  {showPassword ? (
                    <path
                      d="M15.6487 5.39465C14.4859 4.95229 13.2582 4.71997 12 4.71997C8.46997 4.71997 5.17997 6.54861 2.88997 9.71356C1.98997 10.9532 1.98997 13.0368 2.88997 14.2764C3.34474 14.9049 3.83895 15.4807 4.36664 16M19.3248 7.69629C19.9692 8.2894 20.5676 8.96401 21.11 9.71356C22.01 10.9532 22.01 13.0368 21.11 14.2764C18.82 17.4413 15.53 19.27 12 19.27C10.6143 19.27 9.26561 18.9882 7.99988 18.4544"
                      stroke="var(--text-200)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.0001 3.96997C8.19618 3.96997 4.69299 5.94267 2.28282 9.27342C1.721 10.0475 1.46509 11.0419 1.46509 11.995C1.46509 12.9478 1.7209 13.942 2.28246 14.716C4.69264 18.0471 8.19599 20.02 12.0001 20.02C15.804 20.02 19.3072 18.0473 21.7174 14.7165C22.2792 13.9424 22.5351 12.948 22.5351 11.995C22.5351 11.0421 22.2793 10.0479 21.7177 9.27392C19.3075 5.94286 15.8042 3.96997 12.0001 3.96997ZM9.75012 12C9.75012 10.755 10.7551 9.75 12.0001 9.75C13.2451 9.75 14.2501 10.755 14.2501 12C14.2501 13.245 13.2451 14.25 12.0001 14.25C10.7551 14.25 9.75012 13.245 9.75012 12Z"
                      fill="var(--text-200)"
                    />
                  )}
                </EyeSVG>
              </EyeSpan>
            </Label>

            <Label htmlFor="reg-confirm">
              {t("REGISTER.CONFIRM_PASSWORD")}
              <Input
                id="reg-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </Label>

            <Label htmlFor="reg-referral">
              {t("REGISTER.REFERRAL")}
              <Input
                id="reg-referral"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder={t("REGISTER.REFERRAL_PLACEHOLDER")}
              />
            </Label>

            <SectionTitle>
              {t("REGISTER.ADDRESS_SECTION_TITLE")}{" "}
              <OptionalBadge>({t("REGISTER.ADDRESS_OPTIONAL")})</OptionalBadge>
            </SectionTitle>
            <HintLine>{t("REGISTER.ADDRESS_HINT")}</HintLine>

            <Row>
              <Label htmlFor="reg-country">
                {t("LABELS.COUNTRY")}
                <Input
                  id="reg-country"
                  autoComplete="country-name"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t("PLACEHOLDERS.COUNTRY")}
                />
              </Label>
              <Label htmlFor="reg-city">
                {t("LABELS.CITY")}
                <Input
                  id="reg-city"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("PLACEHOLDERS.CITY")}
                />
              </Label>
            </Row>

            <Row>
              <Label htmlFor="reg-postal">
                {t("LABELS.POSTAL_CODE")}
                <Input
                  id="reg-postal"
                  autoComplete="postal-code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder={t("PLACEHOLDERS.POSTAL_CODE")}
                />
              </Label>
              <Label htmlFor="reg-phone">
                {t("LABELS.PHONE_NUMBER")}
                <Input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("PLACEHOLDERS.PHONE_NUMBER")}
                />
              </Label>
            </Row>

            <Label htmlFor="reg-street">
              {t("LABELS.STREET")}
              <Input
                id="reg-street"
                autoComplete="address-line1"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder={t("PLACEHOLDERS.STREET")}
              />
            </Label>

            <Row>
              <Label htmlFor="reg-streetnum">
                {t("LABELS.STREET_NUMBER")}
                <Input
                  id="reg-streetnum"
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  placeholder={t("LABELS.STREET_NUMBER")}
                />
              </Label>
              <Label htmlFor="reg-building">
                {t("LABELS.BUILDING_NUMBER")}
                <Input
                  id="reg-building"
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                />
              </Label>
            </Row>

            <Label htmlFor="reg-secondary">
              {t("LABELS.SECONDARY_STREET")}
              {t("LABELS.OPTIONAL")}
              <Input
                id="reg-secondary"
                value={secondaryStreet}
                onChange={(e) => setSecondaryStreet(e.target.value)}
              />
            </Label>

            <Button type="submit" disabled={loading}>
              {loading ? t("REGISTER.SUBMITTING") : t("REGISTER.SUBMIT")}
            </Button>
          </form>

          <FooterRow>
            {t("REGISTER.ALREADY_HAVE_ACCOUNT")}{" "}
            <InlineLink to={goToHome()}>{t("REGISTER.SIGN_IN")}</InlineLink>
          </FooterRow>
        </Card>
      </Page>
    </PageRoot>
  );
}

export default Register;
