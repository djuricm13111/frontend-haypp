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

const OrderTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  overflow-x: auto;
`;

const OrderHead = styled.div`
  display: grid;
  grid-template-columns: minmax(60px, 0.8fr) minmax(100px, 1fr) minmax(80px, 1fr) minmax(70px, 1fr);
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-200);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--bg-300);
`;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: minmax(60px, 0.8fr) minmax(100px, 1fr) minmax(80px, 1fr) minmax(70px, 1fr);
  gap: 8px;
  font-size: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--bg-300);
  color: var(--text-100);
  &:last-child {
    border-bottom: none;
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

function formatOrderDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(iso);
  }
}

function formatOrderTotal(order) {
  const tp = order?.total_price;
  if (tp == null) return "—";
  if (typeof tp === "string") return tp;
  if (typeof tp === "object") {
    if (tp.amount != null) {
      const cur = tp.currency || "";
      return `${tp.amount} ${cur}`.trim();
    }
  }
  return String(tp);
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

        <>
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

            <Card>
              <SectionTitle>{t("ACCOUNT.ORDERS_TITLE")}</SectionTitle>
              {orders.length === 0 ? (
                <Muted>{t("ACCOUNT.NO_ORDERS")}</Muted>
              ) : (
                <OrderTable>
                  <OrderHead>
                    <span>{t("ACCOUNT.ORDER_NUMBER")}</span>
                    <span>{t("ACCOUNT.ORDER_DATE")}</span>
                    <span>{t("ACCOUNT.ORDER_STATUS")}</span>
                    <span>{t("ACCOUNT.ORDER_TOTAL")}</span>
                  </OrderHead>
                  {orders.slice(0, 20).map((order) => (
                    <OrderRow key={order.id}>
                      <span>#{order.id}</span>
                      <span>{formatOrderDate(order.created_at)}</span>
                      <span>{order.order_status ?? "—"}</span>
                      <span>
                        {order.currency_symbol ? `${order.currency_symbol} ` : ""}
                        {formatOrderTotal(order)}
                      </span>
                    </OrderRow>
                  ))}
                </OrderTable>
              )}
            </Card>

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
