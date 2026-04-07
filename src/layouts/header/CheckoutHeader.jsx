import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

/** Isti font stack kao ProductMain (PDP age blok). */
const checkoutBodyFont = `"Montserrat", var(--font-family)`;

const MOBILE_MAX = "767px";

const Bar = styled.header`
  width: 100%;
  box-sizing: border-box;
  background-color: var(--bg-100);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  padding-top: env(safe-area-inset-top, 0);

  @media (max-width: ${MOBILE_MAX}) {
    box-shadow: 0 1px 0 rgba(0, 32, 105, 0.08);
    background: linear-gradient(180deg, var(--bg-100) 0%, var(--bg-200) 100%);
  }
`;

/** Širina i osećaj belog reda kao MainHeaderWrapper u Header.jsx */
const Inner = styled.div`
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: 0 12px;
  box-sizing: border-box;
  min-height: var(--navbar-height);
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content minmax(0, 1fr);
  align-items: center;
  column-gap: clamp(8px, 2vw, 16px);

  @media (max-width: ${MOBILE_MAX}) {
    min-height: auto;
    padding: 10px 12px 12px;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
  }

  @media (min-width: 1024px) {
    padding: 0 16px;
  }
`;

const LeftSlot = styled.div`
  grid-column: 1;
  justify-self: start;
  min-width: 0;
  max-width: min(100%, 300px);

  @media (max-width: ${MOBILE_MAX}) {
    max-width: none;
  }
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 8px 4px 8px 0;
  border: none;
  background: transparent;
  color: #333333;
  font-size: 13px;
  font-weight: 400;
  font-family: inherit;
  line-height: 1.3;
  cursor: pointer;
  text-align: left;
  max-width: 100%;

  &:hover {
    color: var(--primary-100);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-200);
    outline-offset: 2px;
    border-radius: 4px;
  }

  @media (max-width: ${MOBILE_MAX}) {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    padding: 0;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: var(--bg-100);
    box-shadow: 0 1px 3px rgba(0, 32, 105, 0.12);
    color: var(--text-100);

    &:hover {
      background: var(--bg-300);
      color: var(--primary-100);
    }

    &:active {
      transform: scale(0.97);
    }
  }
`;

const BackArrow = styled.span`
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1;

  @media (max-width: ${MOBILE_MAX}) {
    font-size: 18px;
    font-weight: 600;
  }
`;

const BackLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;

  @media (max-width: ${MOBILE_MAX}) {
    display: none;
  }
`;

/** Centar: na mobilnom — naslov + logo; na desktopu samo logo */
const CenterStack = styled.div`
  grid-column: 2;
  justify-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  max-width: 100%;

  @media (min-width: 768px) {
    gap: 0;
  }
`;

/** Mali naslov iznad loga — checkout / register; vidljivo do širokog desktopa */
const CheckoutTitle = styled.span`
  display: none;

  @media (max-width: 1023px) {
    display: block;
    font-family: "Montserrat", sans-serif;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-200);
    line-height: 1.2;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    font-size: 0.6875rem;
  }
`;

/**
 * Isti wordmark kao Logo u Header.jsx (bez skrol stanja).
 * @see Header.jsx — styled(Link) Logo
 */
const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #001a57;
  text-transform: uppercase;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;

  @media (max-width: ${MOBILE_MAX}) {
    font-size: clamp(1.125rem, 5vw, 1.25rem);
    letter-spacing: 0.12em;
    padding: 2px 0 0;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    font-size: 24px;
    margin: 0;
    padding: 0;
  }

  @media (min-width: 1024px) {
    font-size: 30px;
    padding: 0;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-200);
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const RightSlot = styled.div`
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
`;

/** Samo ikonica štita (bez VERIFY teksta ispod). */
const AgeIconWrap = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-100);

  @media (max-width: ${MOBILE_MAX}) {
    opacity: 0.92;
  }
`;

/** Štit + „18+“ — isti markup kao na PDP (ProductMain). */
const AgeShieldFrame = styled.div`
  position: relative;
  width: 42px;
  height: 42px;
  flex-shrink: 0;

  @media (max-width: ${MOBILE_MAX}) {
    width: 36px;
    height: 36px;
  }
`;

const AgeShieldOutline = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
  color: var(--text-100);
`;

const AgeIconNumber = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -52%);
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: "Oswald-Medium", ${checkoutBodyFont};
  letter-spacing: 0.02em;
  color: var(--text-100);
  line-height: 1;
  pointer-events: none;

  @media (max-width: ${MOBILE_MAX}) {
    font-size: 0.625rem;
  }
`;

/**
 * Checkout header: Back | SNUSCO (kao glavni Header) | štit 18+ kao ProductMain
 * @param {{ onBack: () => void, mobileContextI18nKey?: string }} props
 */
function CheckoutHeader({
  onBack,
  mobileContextI18nKey = "CHECKOUT_HEADER.TITLE",
}) {
  const { t } = useTranslation();

  return (
    <Bar>
      <Inner>
        <LeftSlot>
          <BackBtn
            type="button"
            onClick={onBack}
            aria-label={t("CHECKOUT_HEADER.BACK_ARIA")}
          >
            <BackArrow aria-hidden>←</BackArrow>
            <BackLabel>{t("CHECKOUT_HEADER.BACK_LINK")}</BackLabel>
          </BackBtn>
        </LeftSlot>

        <CenterStack>
          <CheckoutTitle>{t(mobileContextI18nKey)}</CheckoutTitle>
          <LogoLink to="/" aria-label={t("HEADER.LOGO_HOME")}>
            SNUSCO
          </LogoLink>
        </CenterStack>

        <RightSlot>
          <AgeIconWrap
            role="img"
            aria-label={t("CHECKOUT_HEADER.AGE_ARIA")}
            title={t("CHECKOUT_HEADER.AGE_TOOLTIP")}
          >
            <AgeShieldFrame aria-hidden>
              <AgeShieldOutline
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </AgeShieldOutline>
              <AgeIconNumber>18+</AgeIconNumber>
            </AgeShieldFrame>
          </AgeIconWrap>
        </RightSlot>
      </Inner>
    </Bar>
  );
}

export default CheckoutHeader;
