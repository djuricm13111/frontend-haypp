import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Helmet } from "react-helmet-async";
import CheckoutHeader from "../layouts/header/CheckoutHeader";
import { AuthUserContext } from "../context/AuthUserContext";
import { ProductContext } from "../context/ProductContext";
import { useNavigation } from "../utils/navigation";
import { cartActions } from "../store/cart-slice";
import { calculatePrice } from "../utils/discount";

const TRANSPORT_OPTIONS = [
  { value: "Post - AT", i18n: "CHECKOUT.TRANSPORT_POST" },
  { value: "DHL Standard", i18n: "CHECKOUT.TRANSPORT_DHL" },
  { value: "DHL Express Saver", i18n: "CHECKOUT.TRANSPORT_DHL_EXP" },
];

const PAYMENT_OPTIONS = [
  { value: "cod", i18n: "CHECKOUT.PAY_COD" },
  { value: "card", i18n: "CHECKOUT.PAY_CARD" },
  { value: "paypal", i18n: "CHECKOUT.PAY_PAYPAL" },
];

/** Sprečava horizontalni scroll od duge sadržaja unutar layout-a. */
const CheckoutRoot = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: clip;
  box-sizing: border-box;
  background: var(--bg-200);
`;

const Page = styled.main`
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-sm) clamp(12px, 3vw, 24px) var(--spacing-xxl);
  box-sizing: border-box;
`;

const PageHeader = styled.div`
  margin-bottom: var(--spacing-md);
`;

const Title = styled.h1`
  font-size: clamp(1.35rem, 4vw, 1.75rem);
  font-weight: 700;
  color: var(--text-100);
  margin: var(--spacing-sm) 0 0;
  line-height: 1.25;
  word-break: break-word;
`;

const Grid = styled.div`
  display: grid;
  gap: var(--spacing-lg);
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
  min-width: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
    align-items: start;
  }
`;

const FormColumn = styled.div`
  min-width: 0;
  width: 100%;
`;

const Card = styled.section`
  background: var(--bg-100);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--border-radius-large);
  padding: clamp(16px, 3vw, 24px);
  box-shadow: var(--shadow-small);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
`;

const StickySummary = styled(Card)`
  @media (min-width: 960px) {
    position: sticky;
    top: calc(var(--navbar-height-desktop, 76px) + 12px);
  }
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
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const inputBase = `
  width: 100%;
  min-width: 0;
  max-width: 100%;
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

const HintText = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-200);
  line-height: 1.35;
`;

const AddressSummaryBox = styled.div`
  margin-top: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-base);
  background: var(--bg-200);
  border: 1px solid var(--bg-300);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-100);
  white-space: pre-line;
`;

const Select = styled.select`
  ${inputBase}
  cursor: pointer;
`;

const TextArea = styled.textarea`
  ${inputBase}
  min-height: 80px;
  resize: vertical;
  max-width: 100%;
`;

const ErrorBox = styled.div`
  background: #ffebee;
  color: #b71c1c;
  padding: 12px 14px;
  border-radius: var(--border-radius-base);
  font-size: 14px;
  line-height: 1.45;
  margin-bottom: var(--spacing-md);
  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 100%;
  box-sizing: border-box;
`;

const SuccessBox = styled.div`
  background: #e8f5e9;
  color: #1b5e20;
  padding: 14px 16px;
  border-radius: var(--border-radius-base);
  margin-bottom: var(--spacing-md);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const SuccessOrderIdRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  font-size: clamp(1rem, 3vw, 1.2rem);
  font-weight: 700;
  line-height: 1.45;
  text-align: center;
  letter-spacing: 0.03em;
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-md);
  width: 100%;
  min-width: 0;

  @media (max-width: 520px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const SummaryLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--spacing-md);
  font-size: 14px;
  color: var(--text-200);
  margin-bottom: 8px;
  min-width: 0;

  span:last-child {
    flex-shrink: 0;
    text-align: right;
  }
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--spacing-md);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-100);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--bg-300);
  min-width: 0;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
  min-width: 0;
`;

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.div`
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-100);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: var(--text-200);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Thumb = styled.img`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: var(--border-radius-small);
  background: var(--bg-200);
`;

const RadioRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.4;
  color: var(--text-100);
  cursor: pointer;
  min-width: 0;

  input[type="radio"] {
    flex-shrink: 0;
    margin-top: 3px;
  }

  span {
    min-width: 0;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
`;

const NewAddressToggle = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: var(--spacing-sm) 0 var(--spacing-md);
  font-size: 14px;
  color: var(--text-100);
  cursor: pointer;
  max-width: 100%;

  input {
    flex-shrink: 0;
    margin-top: 3px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: var(--spacing-lg);
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  border: none;
  border-radius: var(--border-radius-base);
  background: var(--primary-100);
  color: var(--bg-100);
  cursor: pointer;
  box-sizing: border-box;
  transition: background var(--transition-fast);

  &:hover:not(:disabled) {
    background: var(--primary-200);
  }
  &:disabled {
    opacity: 0.75;
    cursor: wait;
  }
`;

const CartList = styled.div`
  max-height: min(50vh, 420px);
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: var(--spacing-md);
  padding-right: 2px;
  -webkit-overflow-scrolling: touch;
`;

function formatErr(payload) {
  if (!payload || typeof payload !== "object") return null;
  const parts = [];
  for (const [k, v] of Object.entries(payload)) {
    if (Array.isArray(v)) parts.push(`${k}: ${v.join(" ")}`);
    else if (typeof v === "object" && v !== null) parts.push(formatErr(v));
    else parts.push(`${k}: ${v}`);
  }
  return parts.filter(Boolean).join(" · ");
}

/** Prikaz sačuvane adrese (API AddressBook). */
function formatSavedAddressText(a) {
  if (!a) return "";
  const parts = [];
  const line1 = [a.street, a.street_number].filter(Boolean).join(" ");
  if (line1) parts.push(line1);
  if (a.secondary_street) parts.push(a.secondary_street);
  const line2 = [a.postal_code, a.city].filter(Boolean).join(" ");
  if (line2) parts.push(line2);
  if (a.country) parts.push(a.country);
  if (a.building_number) parts.push(a.building_number);
  if (a.phone_number) parts.push(`${a.phone_number}`);
  return parts.join("\n");
}

/** Keš iz APIService.getUserProfile — isti ključ kao u servisu. */
function readStoredUserProfile() {
  try {
    const raw = localStorage.getItem("userProfileData");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function applyAddressToFormFields(addr, setters) {
  if (!addr) return;
  const {
    setCountry,
    setCity,
    setPostalCode,
    setStreet,
    setStreetNumber,
    setBuildingNumber,
    setSecondaryStreet,
    setPhoneNumber,
  } = setters;
  setCountry(addr.country || "");
  setCity(addr.city || "");
  setPostalCode(addr.postal_code || "");
  setStreet(addr.street || "");
  setStreetNumber(addr.street_number || "");
  setBuildingNumber(addr.building_number || "");
  setSecondaryStreet(addr.secondary_street || "");
  setPhoneNumber(addr.phone_number || "");
}

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { goToShop } = useNavigation();
  const {
    authTokens,
    userProfile,
    fetchUserData,
    createAddressBook,
    updateAddressBook,
    updateUserInfo,
    invalidateUserProfileCache,
  } = useContext(AuthUserContext);
  const { createOrder } = useContext(ProductContext);

  const cartItems = useSelector((state) => state.cart.itemsList);
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState(null);

  const [transportMethod, setTransportMethod] = useState(TRANSPORT_OPTIONS[0].value);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");

  const [guestEmail, setGuestEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [secondaryStreet, setSecondaryStreet] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [savedAddressId, setSavedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");

  const prevUseNewAddressRef = useRef(false);
  const profileEmailSyncedRef = useRef(false);

  /**
   * Token u kontekstu ili odmah iz localStorage (isti izvor kao pri loginu).
   * Rešava slučaj kada je korisnik prijavljen ali kontekst još nije ažuriran.
   */
  const accessToken = authTokens?.access || null;
  const tokenFromStorage = useMemo(() => {
    try {
      const raw = localStorage.getItem("authTokens");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.access || null;
    } catch {
      return null;
    }
  }, [authTokens]);

  /** Za API pozive — uvek isti token kao u kontekstu ili iz storage-a. */
  const accessTokenForApi = accessToken || tokenFromStorage;

  const isLoggedIn = Boolean(accessTokenForApi);

  /** Lokalni keš profila dok API / context ne dostave svež podatak. */
  const [profileBootstrap, setProfileBootstrap] = useState(() =>
    typeof window !== "undefined" ? readStoredUserProfile() : null
  );

  const effectiveProfile = useMemo(
    () => userProfile || profileBootstrap,
    [userProfile, profileBootstrap]
  );

  const emailFromToken = useMemo(() => {
    if (!accessTokenForApi) return "";
    try {
      const d = jwtDecode(accessTokenForApi);
      return d.email || "";
    } catch {
      return "";
    }
  }, [accessTokenForApi]);

  const displayAccountEmail =
    effectiveProfile?.email || emailFromToken || "";

  /** Jednokratno punjenje e-adrese za ulogovanog (pre izmene od strane korisnika). */
  useEffect(() => {
    if (!isLoggedIn) {
      profileEmailSyncedRef.current = false;
      setAccountEmail("");
      return;
    }
    const src = displayAccountEmail;
    if (!src || profileEmailSyncedRef.current) return;
    setAccountEmail(src);
    profileEmailSyncedRef.current = true;
  }, [isLoggedIn, displayAccountEmail]);

  const addresses = useMemo(
    () => effectiveProfile?.addresses || [],
    [effectiveProfile]
  );

  /** Ime/prezime: API može stići u userProfile, keš u profileBootstrap — spoji da polja nisu prazna ako je jedan izvor pun. */
  const profileFirstName = useMemo(() => {
    const u = userProfile?.first_name ?? userProfile?.firstName;
    if (u != null && String(u).trim() !== "") return String(u).trim();
    const b = profileBootstrap?.first_name ?? profileBootstrap?.firstName;
    return b != null && String(b).trim() !== "" ? String(b).trim() : "";
  }, [userProfile, profileBootstrap]);

  const profileLastName = useMemo(() => {
    const u = userProfile?.last_name ?? userProfile?.lastName;
    if (u != null && String(u).trim() !== "") return String(u).trim();
    const b = profileBootstrap?.last_name ?? profileBootstrap?.lastName;
    return b != null && String(b).trim() !== "" ? String(b).trim() : "";
  }, [userProfile, profileBootstrap]);

  /** Pri otvaranju kase / promeni tokena: keš + API (samo `access` u deps da nema petlje sa fetchUserData referencom). */
  useEffect(() => {
    if (!accessTokenForApi) {
      setProfileBootstrap(null);
      return;
    }
    const cached = readStoredUserProfile();
    if (cached) setProfileBootstrap(cached);
    if (!authTokens?.access) return;
    invalidateUserProfileCache();
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchUserData se menja svaki render
  }, [authTokens?.access, accessTokenForApi]);

  useEffect(() => {
    if (addresses.length && !savedAddressId) {
      const primary = addresses.find((a) => a.is_primary);
      setSavedAddressId((primary || addresses[0]).id);
    }
  }, [addresses, savedAddressId]);

  /** Ime, prezime, email iz spojenog profila (API + keš). */
  useEffect(() => {
    if (!isLoggedIn) return;
    if (profileFirstName !== "") setFirstName(profileFirstName);
    if (profileLastName !== "") setLastName(profileLastName);
    const em =
      userProfile?.email ||
      profileBootstrap?.email ||
      emailFromToken ||
      "";
    if (em) setGuestEmail(em);
  }, [
    isLoggedIn,
    profileFirstName,
    profileLastName,
    userProfile?.email,
    profileBootstrap?.email,
    emailFromToken,
  ]);

  /** Nema sačuvane adrese: telefon iz profila ako postoji. */
  useEffect(() => {
    if (!isLoggedIn || !effectiveProfile || addresses.length > 0) return;
    if (effectiveProfile.phone_number) {
      setPhoneNumber((prev) => prev || String(effectiveProfile.phone_number));
    }
  }, [isLoggedIn, effectiveProfile, addresses.length]);

  /**
   * Ulogovan + lista adresa: stanje forme uvek odražava izabranu sačuvanu adresu
   * (polja su popunjena i kad je izbor radio, da korisnik vidi konzistentne podatke
   * i kad uključi „druga adresa“).
   */
  useEffect(() => {
    if (!isLoggedIn || !addresses.length || useNewAddress) return;
    const addr =
      addresses.find((a) => String(a.id) === String(savedAddressId)) ||
      addresses.find((a) => a.is_primary) ||
      addresses[0];
    if (!addr) return;
    applyAddressToFormFields(addr, {
      setCountry,
      setCity,
      setPostalCode,
      setStreet,
      setStreetNumber,
      setBuildingNumber,
      setSecondaryStreet,
      setPhoneNumber,
    });
  }, [isLoggedIn, addresses, savedAddressId, useNewAddress]);

  /**
   * Uključivanje „druga adresa“: preuzmi polja sa trenutno izabrane (ili primarne) adrese
   * da korisnik može da ispravi ili unese novu.
   */
  useEffect(() => {
    if (!isLoggedIn || !useNewAddress) {
      prevUseNewAddressRef.current = useNewAddress;
      return;
    }
    const justEnabled = useNewAddress && !prevUseNewAddressRef.current;
    prevUseNewAddressRef.current = useNewAddress;
    if (!justEnabled || !addresses.length) return;

    const src =
      addresses.find((a) => String(a.id) === String(savedAddressId)) ||
      addresses.find((a) => a.is_primary) ||
      addresses[0];

    applyAddressToFormFields(src, {
      setCountry,
      setCity,
      setPostalCode,
      setStreet,
      setStreetNumber,
      setBuildingNumber,
      setSecondaryStreet,
      setPhoneNumber,
    });
  }, [
    isLoggedIn,
    useNewAddress,
    savedAddressId,
    addresses,
  ]);

  const selectedSavedAddress = useMemo(() => {
    if (!savedAddressId || !addresses.length) return null;
    return addresses.find((a) => String(a.id) === String(savedAddressId)) || null;
  }, [savedAddressId, addresses]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, { product, quantity }) => {
      const unit = calculatePrice(product.price, totalQuantity);
      return sum + unit * quantity;
    }, 0);
  }, [cartItems, totalQuantity]);

  const orderItemsPayload = useMemo(
    () =>
      cartItems.map(({ product, quantity }) => ({
        product: product.id,
        quantity,
      })),
    [cartItems]
  );

  const handleHeaderBack = useCallback(() => {
    if (success) {
      navigate(goToShop());
      return;
    }
    if (!cartItems.length) {
      navigate(goToShop());
      return;
    }
    navigate(-1);
  }, [success, cartItems.length, navigate, goToShop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!cartItems.length) {
      setError(t("CHECKOUT.EMPTY_CART"));
      return;
    }

    if (
      isLoggedIn &&
      addresses.length > 0 &&
      !useNewAddress &&
      !savedAddressId
    ) {
      setError(t("CHECKOUT.SELECT_ADDRESS"));
      return;
    }

    setLoading(true);
    try {
      let data;
      if (isLoggedIn) {
        if (!accessTokenForApi) {
          setError(t("CHECKOUT.ERROR_GENERIC"));
          setLoading(false);
          return;
        }

        await updateUserInfo(
          {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            ...(phoneNumber.trim()
              ? { phone_number: phoneNumber.trim() }
              : {}),
          },
          accessTokenForApi
        );

        let addressId = savedAddressId;
        if (!addresses.length || useNewAddress) {
          if (
            useNewAddress &&
            savedAddressId &&
            addresses.length > 0
          ) {
            await updateAddressBook(
              savedAddressId,
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
              accessTokenForApi
            );
            addressId = savedAddressId;
          } else {
            const created = await createAddressBook(
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
                is_primary: addresses.length === 0,
              },
              accessTokenForApi
            );
            addressId = created.id;
          }
        }

        data = await createOrder(
          {
            address: addressId,
            order_items: orderItemsPayload,
            payment_method: paymentMethod,
            transport_method: transportMethod,
            use_points: false,
            note: note.trim() || undefined,
            confirmation_email: accountEmail.trim(),
          },
          accessTokenForApi
        );
      } else {
        data = await createOrder({
          order_items: orderItemsPayload,
          payment_method: paymentMethod,
          transport_method: transportMethod,
          use_points: false,
          note: note.trim() || undefined,
          guest_email: guestEmail.trim(),
          guest_first_name: firstName.trim(),
          guest_last_name: lastName.trim(),
          shipping_address: {
            country: country.trim(),
            city: city.trim(),
            postal_code: postalCode.trim(),
            street: street.trim(),
            street_number: streetNumber.trim() || undefined,
            building_number: buildingNumber.trim() || undefined,
            secondary_street: secondaryStreet.trim() || undefined,
            phone_number: phoneNumber.trim() || undefined,
            type: "Home",
          },
        });
      }

      dispatch(cartActions.resetCart());
      setCompletedOrderId(data?.id || null);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      const data = err.response?.data;
      setError(formatErr(data) || err.message || t("CHECKOUT.ERROR_GENERIC"));
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length && !success) {
    return (
      <CheckoutRoot>
        <Helmet>
          <title>{t("CHECKOUT.PAGE_TITLE")}</title>
        </Helmet>
        <CheckoutHeader onBack={handleHeaderBack} />
        <Page>
          <PageHeader>
            <Title>{t("CHECKOUT.TITLE")}</Title>
          </PageHeader>
          <Card>
            <p
              style={{
                margin: 0,
                color: "var(--text-200)",
                lineHeight: 1.5,
              }}
            >
              {t("CHECKOUT.EMPTY_CART")}
            </p>
          </Card>
        </Page>
      </CheckoutRoot>
    );
  }

  return (
    <CheckoutRoot>
      <Helmet>
        <title>{t("CHECKOUT.PAGE_TITLE")}</title>
      </Helmet>
      <CheckoutHeader onBack={handleHeaderBack} />
      <Page>
        <PageHeader>
          <Title>{t("CHECKOUT.TITLE")}</Title>
          {isLoggedIn && !success ? (
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 14,
                color: "var(--text-200)",
                lineHeight: 1.45,
              }}
            >
              {t("CHECKOUT.SIGNED_IN_NOTICE")}
            </p>
          ) : null}
        </PageHeader>

        {success ? (
          <SuccessBox>
            <SuccessOrderIdRow>{completedOrderId || "—"}</SuccessOrderIdRow>
          </SuccessBox>
        ) : null}

        {!success && (
          <form onSubmit={handleSubmit}>
            {error ? <ErrorBox role="alert">{error}</ErrorBox> : null}

            <Grid>
              <FormColumn>
                <Card>
                  <SectionTitle>
                    {isLoggedIn
                      ? t("CHECKOUT.CONTACT_SIGNED_IN")
                      : t("CHECKOUT.CONTACT_GUEST")}
                  </SectionTitle>

                  {isLoggedIn && (
                    <Field>
                      {t("CHECKOUT.ACCOUNT_EMAIL")}
                      <Input
                        type="email"
                        required
                        autoComplete="email"
                        value={accountEmail}
                        onChange={(e) => setAccountEmail(e.target.value)}
                      />
                      <HintText>{t("CHECKOUT.ACCOUNT_EMAIL_HINT")}</HintText>
                    </Field>
                  )}

                  {!isLoggedIn && (
                    <Field>
                      {t("CHECKOUT.EMAIL")}
                      <Input
                        type="email"
                        autoComplete="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    </Field>
                  )}

                  <Row>
                    <Field>
                      {t("CHECKOUT.FIRST_NAME")}
                      <Input
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </Field>
                    <Field>
                      {t("CHECKOUT.LAST_NAME")}
                      <Input
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </Field>
                  </Row>

                  {isLoggedIn && addresses.length > 0 && !useNewAddress && (
                    <>
                      <SectionTitle>{t("CHECKOUT.DELIVERY_SAVED_TITLE")}</SectionTitle>
                      <p
                        style={{
                          margin: "0 0 12px",
                          fontSize: 14,
                          color: "var(--text-200)",
                          lineHeight: 1.45,
                        }}
                      >
                        {t("CHECKOUT.DELIVERY_SAVED_INTRO")}
                      </p>
                      {addresses.map((a) => (
                        <RadioRow key={a.id}>
                          <input
                            type="radio"
                            name="savedAddr"
                            checked={String(savedAddressId) === String(a.id)}
                            onChange={() => setSavedAddressId(a.id)}
                          />
                          <span>
                            {a.street} {a.street_number || ""}, {a.postal_code}{" "}
                            {a.city}, {a.country}
                            {a.is_primary ? ` · ${t("CHECKOUT.PRIMARY_BADGE")}` : ""}
                          </span>
                        </RadioRow>
                      ))}
                      {selectedSavedAddress && (
                        <AddressSummaryBox>
                          {formatSavedAddressText(selectedSavedAddress)}
                        </AddressSummaryBox>
                      )}
                      <NewAddressToggle>
                        <input
                          type="checkbox"
                          checked={useNewAddress}
                          onChange={(e) => {
                            setUseNewAddress(e.target.checked);
                            if (!e.target.checked) {
                              prevUseNewAddressRef.current = false;
                            }
                          }}
                        />
                        <span>{t("CHECKOUT.NEW_ADDRESS")}</span>
                      </NewAddressToggle>
                    </>
                  )}

                  {(!isLoggedIn || !addresses.length || useNewAddress) && (
                    <>
                      <SectionTitle>{t("CHECKOUT.SHIPPING_TITLE")}</SectionTitle>
                      {isLoggedIn && addresses.length > 0 && useNewAddress && (
                        <p
                          style={{
                            margin: "0 0 var(--spacing-md)",
                            fontSize: 14,
                            color: "var(--text-200)",
                            lineHeight: 1.45,
                          }}
                        >
                          {t("CHECKOUT.SHIPPING_EDIT_INTRO")}
                        </p>
                      )}
                      <Row>
                        <Field>
                          {t("CHECKOUT.COUNTRY")}
                          <Input
                            autoComplete="country-name"
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                          />
                        </Field>
                        <Field>
                          {t("CHECKOUT.CITY")}
                          <Input
                            autoComplete="address-level2"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </Field>
                      </Row>
                      <Row>
                        <Field>
                          {t("CHECKOUT.POSTAL")}
                          <Input
                            autoComplete="postal-code"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                          />
                        </Field>
                        <Field>
                          {t("CHECKOUT.PHONE")}
                          <Input
                            type="tel"
                            autoComplete="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </Field>
                      </Row>
                      <Field>
                        {t("CHECKOUT.STREET")}
                        <Input
                          autoComplete="address-line1"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                        />
                      </Field>
                      <Row>
                        <Field>
                          {t("CHECKOUT.STREET_NUMBER")}
                          <Input
                            value={streetNumber}
                            onChange={(e) => setStreetNumber(e.target.value)}
                          />
                        </Field>
                        <Field>
                          {t("CHECKOUT.BUILDING")}
                          <Input
                            value={buildingNumber}
                            onChange={(e) => setBuildingNumber(e.target.value)}
                          />
                        </Field>
                      </Row>
                      <Field>
                        {t("CHECKOUT.SECONDARY")}
                        <Input
                          value={secondaryStreet}
                          onChange={(e) => setSecondaryStreet(e.target.value)}
                        />
                      </Field>
                    </>
                  )}

                  <SectionTitle>{t("CHECKOUT.DELIVERY_PAYMENT")}</SectionTitle>
                  <Field>
                    {t("CHECKOUT.TRANSPORT")}
                    <Select
                      value={transportMethod}
                      onChange={(e) => setTransportMethod(e.target.value)}
                    >
                      {TRANSPORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {t(o.i18n)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    {t("CHECKOUT.PAYMENT")}
                    <Select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      {PAYMENT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {t(o.i18n)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    {t("CHECKOUT.NOTE")}
                    <TextArea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t("CHECKOUT.NOTE_PLACEHOLDER")}
                    />
                  </Field>
                </Card>
              </FormColumn>

              <StickySummary>
                <SectionTitle>{t("CHECKOUT.SUMMARY")}</SectionTitle>
                <CartList>
                  {cartItems.map(({ product, quantity }) => {
                    const primaryImage =
                      product.images?.find((img) => img.is_primary) ||
                      product.images?.[0];
                    return (
                      <ItemRow key={product.id}>
                        {primaryImage?.thumbnail ? (
                          <Thumb
                            src={primaryImage.thumbnail}
                            alt=""
                            width={48}
                            height={48}
                          />
                        ) : null}
                        <ItemBody>
                          <ItemTitle>
                            {product.category_name} {product.name}
                          </ItemTitle>
                          <ItemMeta>
                            ×{quantity} ·{" "}
                            {Number(
                              calculatePrice(product.price, totalQuantity)
                            ).toFixed(2)}
                          </ItemMeta>
                        </ItemBody>
                      </ItemRow>
                    );
                  })}
                </CartList>
                <SummaryLine>
                  <span>{t("CHECKOUT.SUBTOTAL")}</span>
                  <span>{subtotal.toFixed(2)}</span>
                </SummaryLine>
                <SummaryLine>
                  <span>{t("CART.VAT")}</span>
                  <span>{t("CART.INCLUDED")}</span>
                </SummaryLine>
                <SummaryTotal>
                  <span>{t("CHECKOUT.TOTAL_EST")}</span>
                  <span>{subtotal.toFixed(2)}</span>
                </SummaryTotal>

                <SubmitButton type="submit" disabled={loading}>
                  {loading ? t("CHECKOUT.SUBMITTING") : t("CHECKOUT.PLACE_ORDER")}
                </SubmitButton>
              </StickySummary>
            </Grid>
          </form>
        )}
      </Page>
    </CheckoutRoot>
  );
};

export default Checkout;
