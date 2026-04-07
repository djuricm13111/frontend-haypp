import { useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import styled from "styled-components";
import Header from "../layouts/header/Header";
import { AuthUserContext } from "../context/AuthUserContext";
import { useNavigation } from "../utils/navigation";
import { shopBasePath, normalizeShopLang } from "../utils/shopRoutes";
import UserAddressBookSection from "../components/account/UserAddressBookSection";
import OrderHistorySection from "../components/account/OrderHistorySection";
import { isAccountEmailVerified } from "../utils/emailVerification";

const PageRoot = styled.div`
  width: 100%;
  background: var(--bg-200);
  min-height: 60vh;
`;

const Page = styled.main`
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-md) clamp(12px, 3vw, 24px) var(--spacing-xxl);
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: clamp(1.35rem, 4vw, 1.75rem);
  font-weight: 700;
  color: var(--text-100);
  margin: 0 0 var(--spacing-sm);
`;

const Card = styled.section`
  background: var(--bg-100);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--border-radius-large);
  padding: clamp(16px, 3vw, 24px);
  box-shadow: var(--shadow-small);
  margin-bottom: var(--spacing-lg);
`;

const SectionTitle = styled.h2`
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-200);
  margin: 0 0 var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--bg-300);
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-200);
  margin-bottom: var(--spacing-md);
`;

const inputBase = `
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--bg-300);
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

const ReadOnly = styled.div`
  ${inputBase}
  background: var(--bg-200);
  color: var(--text-200);
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
  margin-top: var(--spacing-md);
`;

const Button = styled.button`
  padding: 10px 18px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  background: var(--primary-200);
  color: var(--bg-100);
  &:hover {
    background: var(--primary-100);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GhostButton = styled.button`
  padding: 10px 18px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--text-300);
  background: transparent;
  color: var(--text-100);
  &:hover {
    background: var(--bg-200);
  }
`;

const RouterLinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: var(--border-radius-base);
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  border: 1px solid var(--primary-200);
  color: var(--primary-200);
  &:hover {
    background: var(--bg-200);
  }
`;

const Muted = styled.p`
  margin: 0 0 var(--spacing-md);
  font-size: 14px;
  color: var(--text-200);
  line-height: 1.5;
`;

const VerifyBanner = styled.div`
  box-sizing: border-box;
  width: 100%;
  margin: 0 0 var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-md);
  border-radius: var(--border-radius-large);
  border: 1px solid rgba(0, 32, 105, 0.14);
  background: linear-gradient(
    135deg,
    rgba(0, 32, 105, 0.07) 0%,
    var(--bg-100) 55%
  );
  box-shadow: var(--shadow-small);

  strong {
    display: block;
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--text-100);
    margin-bottom: var(--spacing-xs);
    font-family: "Montserrat", sans-serif;
  }

  p {
    margin: 0 0 var(--spacing-sm);
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-200);
  }
`;

const SuccessText = styled.p`
  margin: 0 0 var(--spacing-sm);
  font-size: 14px;
  color: var(--secondary-color, #357a50);
`;

const PointsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: 15px;
  color: var(--text-100);
`;

const TabBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0 0 var(--spacing-lg);
  padding: 4px;
  border-radius: var(--border-radius-large);
  background: var(--bg-300);
  box-sizing: border-box;

  @media (min-width: 1024px) {
    width: fit-content;
    max-width: 100%;
    padding: 5px;
    gap: 5px;
  }
`;

const TabButton = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 12px 16px;
  border: none;
  border-radius: var(--border-radius-base);
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-200);
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;

  &[aria-selected="true"] {
    background: var(--bg-100);
    color: var(--text-100);
    box-shadow: var(--shadow-small);
  }

  &:hover {
    color: var(--text-100);
  }

  @media (min-width: 1024px) {
    flex: 0 1 auto;
    min-width: 0;
    padding: 10px 22px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.35;
  }
`;

const LoadingText = styled.p`
  margin: 0;
  color: var(--text-200);
  font-size: 15px;
`;

function readStoredUserProfile() {
  try {
    const raw = localStorage.getItem("userProfileData");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Stranica naloga za ulogovanog korisnika — podaci iz API-ja `getUserProfile`.
 */
const UserProfile = () => {
  const { t, i18n } = useTranslation();
  const { goToCheckout } = useNavigation();
  const lang = normalizeShopLang(i18n.language);
  const shopPath = shopBasePath(lang);

  const {
    authTokens,
    userProfile,
    fetchUserData,
    updateUserInfo,
    logoutUser,
    invalidateUserProfileCache,
  } = useContext(AuthUserContext);

  const [bootstrap] = useState(() =>
    typeof window !== "undefined" ? readStoredUserProfile() : null
  );

  const accessToken = useMemo(() => {
    const a = authTokens?.access;
    if (a) return a;
    try {
      const raw = localStorage.getItem("authTokens");
      if (!raw) return null;
      return JSON.parse(raw)?.access || null;
    } catch {
      return null;
    }
  }, [authTokens]);

  const effectiveProfile = userProfile || bootstrap;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [saveErr, setSaveErr] = useState(null);
  const [accountTab, setAccountTab] = useState("orders");

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        invalidateUserProfileCache();
        await fetchUserData();
      } catch {
        /* fetchUserData loguje */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- jednokratno učitavanje pri promeni tokena
  }, [accessToken]);

  useEffect(() => {
    if (!effectiveProfile) return;
    setFirstName(effectiveProfile.first_name || "");
    setLastName(effectiveProfile.last_name || "");
    setPhone(effectiveProfile.phone_number || "");
  }, [effectiveProfile]);

  const emailDisplay = useMemo(() => {
    if (effectiveProfile?.email) return effectiveProfile.email;
    if (!accessToken) return "";
    try {
      return jwtDecode(accessToken).email || "";
    } catch {
      return "";
    }
  }, [effectiveProfile, accessToken]);

  const userPoints = effectiveProfile?.user_points;
  const orders = effectiveProfile?.order_history || [];

  const isEmailVerified = useMemo(
    () => isAccountEmailVerified(accessToken, effectiveProfile),
    [accessToken, effectiveProfile]
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveOk(false);
    setSaveErr(null);
    setSaving(true);
    try {
      await updateUserInfo({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
      });
      setSaveOk(true);
    } catch {
      setSaveErr(t("ACCOUNT.SAVE_ERROR"));
    } finally {
      setSaving(false);
    }
  };

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageRoot>
      <Helmet>
        <title>{t("ACCOUNT.PAGE_TITLE")}</title>
        <meta name="description" content={t("ACCOUNT.META_DESCRIPTION")} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Header />
      <Page>
        <Title>{t("ACCOUNT.HEADING")}</Title>
        {loading && !effectiveProfile && (
          <LoadingText>{t("ACCOUNT.LOADING")}</LoadingText>
        )}

        {!loading && !isEmailVerified && (
          <VerifyBanner role="status">
            <strong>{t("ACCOUNT.VERIFY_BANNER_TITLE")}</strong>
            <p>{t("ACCOUNT.VERIFY_BANNER_BODY")}</p>
            <RouterLinkButton to="/verify">{t("ACCOUNT.VERIFY_EMAIL_CTA")}</RouterLinkButton>
          </VerifyBanner>
        )}

        <>
          <TabBar role="tablist" aria-label={t("ACCOUNT.TABLIST_LABEL")}>
            <TabButton
              type="button"
              role="tab"
              id="account-tab-orders"
              aria-selected={accountTab === "orders"}
              aria-controls="account-panel-orders"
              onClick={() => setAccountTab("orders")}
            >
              {t("ACCOUNT.TAB_ORDERS")}
            </TabButton>
            <TabButton
              type="button"
              role="tab"
              id="account-tab-details"
              aria-selected={accountTab === "details"}
              aria-controls="account-panel-details"
              onClick={() => setAccountTab("details")}
            >
              {t("ACCOUNT.TAB_DETAILS")}
            </TabButton>
          </TabBar>

          {accountTab === "orders" && (
            <Card
              role="tabpanel"
              id="account-panel-orders"
              aria-labelledby="account-tab-orders"
            >
              <SectionTitle>{t("ACCOUNT.ORDERS_TITLE")}</SectionTitle>
              <OrderHistorySection
                orders={orders}
                isEmailVerified={isEmailVerified}
              />
            </Card>
          )}

          {accountTab === "details" && (
          <div
            role="tabpanel"
            id="account-panel-details"
            aria-labelledby="account-tab-details"
          >
          <Card>
            <form onSubmit={handleSave}>
              <SectionTitle>{t("ACCOUNT.DETAILS_TITLE")}</SectionTitle>
              <Field>
                {t("ACCOUNT.EMAIL")}
                <ReadOnly>{emailDisplay}</ReadOnly>
              </Field>
              <Field>
                {t("ACCOUNT.FIRST_NAME")}
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </Field>
              <Field>
                {t("ACCOUNT.LAST_NAME")}
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </Field>
              <Field>
                {t("ACCOUNT.PHONE")}
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  type="tel"
                />
              </Field>
              {saveOk && <SuccessText>{t("ACCOUNT.SAVED")}</SuccessText>}
              {saveErr && <Muted role="alert">{saveErr}</Muted>}
              {effectiveProfile?.referral_code && (
                <Muted>
                  {t("ACCOUNT.REFERRAL")}: {effectiveProfile.referral_code}
                </Muted>
              )}
              <Actions>
                <Button type="submit" disabled={saving}>
                  {saving ? "…" : t("ACCOUNT.SAVE")}
                </Button>
              </Actions>
            </form>
          </Card>

          {userPoints && (
            <Card>
              <SectionTitle>{t("ACCOUNT.POINTS_TITLE")}</SectionTitle>
              <PointsRow>
                <span>
                  {t("ACCOUNT.POINTS")}: <strong>{userPoints.points ?? 0}</strong>
                </span>
                <span>
                  {t("ACCOUNT.LEVEL")}: <strong>{userPoints.level ?? 1}</strong>
                </span>
                {userPoints.vip_points != null && (
                  <span>
                    {t("ACCOUNT.VIP")}: <strong>{userPoints.vip_points}</strong>
                  </span>
                )}
              </PointsRow>
            </Card>
          )}

            <Card>
              <SectionTitle>{t("ACCOUNT.ADDRESSES_TITLE")}</SectionTitle>
              <UserAddressBookSection />
            </Card>
          </div>
          )}

          <Actions>
            <RouterLinkButton to={shopPath}>{t("ACCOUNT.CONTINUE_SHOPPING")}</RouterLinkButton>
            <RouterLinkButton to={goToCheckout()}>{t("ACCOUNT.GO_CHECKOUT")}</RouterLinkButton>
            <GhostButton type="button" onClick={() => logoutUser()}>
              {t("ACCOUNT.LOGOUT")}
            </GhostButton>
          </Actions>
        </>
      </Page>
    </PageRoot>
  );
};

export default UserProfile;
