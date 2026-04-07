import React, { useContext, useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { useSelector } from "react-redux";
import CartProduct from "./CartProduct";
import {
  DEFAULT_CURRENCY,
  amountUntilFreeShipping,
  freeShippingThreshold,
  getCartMerchandiseSubtotal,
  getShippingCostPrice,
  qualifiesForFreeShipping,
} from "../../../utils/global_const";
import { ProductContext } from "../../../context/ProductContext";
import { useNavigate } from "react-router-dom";
import { useNavigation } from "../../../utils/navigation";
import { useTranslation } from "react-i18next";

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(100%);
  }
`;
const slideInD = keyframes`
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
`;

const slideOutD = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }

  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const freeShippingUnlockPop = keyframes`
  0% {
    transform: scale(0.92);
    opacity: 0.88;
  }
  55% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const freeShippingUnlockGlow = keyframes`
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(0, 100, 80, 0);
  }
  45% {
    box-shadow: 0 0 26px 10px rgba(0, 160, 120, 0.28);
  }
`;

const ContainerX = styled.div`
  //position: relative;
`;
const Container = styled.div`
  margin-top: var(--spacing-xxs);
  background-color: transparent;
  position: fixed;
  right: 0;
  top: 0;
  /* Iznad shop filtera / sorta na mobilnom; ista porodica kao modal */
  z-index: var(--zindex-modal-background);

  min-width: 100%;
  height: 100vh;

  box-sizing: border-box;
  overflow-x: hidden;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  transition: opacity 400ms ease-in-out;
  visibility: ${(props) => (props.$shouldBeVisible ? "visible" : "hidden")};
`;
const Wrapper = styled.div`
  z-index: var(--zindex-modal);
  background-color: var(--bg-100);
  box-sizing: border-box;

  width: 100%;
  height: 100%;
  min-height: 0;
  max-height: 100dvh;
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  visibility: ${(props) => (props.$shouldBeVisible ? "visible" : "hidden")};
  ${({ $isOpen }) =>
    $isOpen
      ? css`
          animation: ${slideIn} 0.4s ease-out forwards; // Duže trajanje za slide-in
        `
      : css`
          animation: ${slideOut} 0.1s ease-in forwards; // Kraće trajanje za slide-out
        `}
  @media (min-width: 1024px) {
    position: fixed;
    right: 0%;
    top: 0;
    width: 400px;
    height: 100vh;
    max-height: 100vh;
    box-shadow: var(--shadow-large);
    ${({ $isOpen }) =>
      $isOpen
        ? css`
            animation: ${slideIn} 0.4s ease-out forwards; // Duže trajanje za slide-in
          `
        : css`
            animation: ${slideOut} 0.1s ease-in forwards; // Kraće trajanje za slide-out
          `};
  }

  @media (max-width: 767px) {
    width: 90%;
    max-width: min(90vw, 100%);
    height: 100vh;
    max-height: 100dvh;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    width: min(360px, 68vw);
    max-width: min(360px, 68vw);
    height: 100vh;
    max-height: 100dvh;
  }
`;

const CartContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 30px;
  min-width: 30px;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    /* Usklađeno sa Login TriggerWrap (40px) */
    height: 40px;
    min-height: 40px;
    min-width: 36px;
  }

  background-color: var(--bg-100);
  padding: 0 12px;

  /* Kompakt beli header: ista visina kao red (MainHeaderWrapper) */
  @media (max-width: 1023px) {
    height: var(--navbar-height);
    min-height: var(--navbar-height);
    min-width: 44px;
    padding: 0 4px;
    gap: 0;
    box-sizing: border-box;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    padding: 0 2px;
  }

  ${({ $bounce }) =>
    $bounce &&
    `
    animation: bounce 0.6s ease;
  `}

  @keyframes bounce {
    0% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-6px);
    }
    50% {
      transform: translateY(0);
    }
    70% {
      transform: translateY(-3px);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

const CartHeaderIcon = styled.svg`
  flex-shrink: 0;

  path {
    stroke: var(--text-100);
  }

  @media (max-width: 1023px) {
    path {
      stroke: var(--primary-100);
    }
  }

  @media (min-width: 1024px) {
    path {
      stroke: var(--text-200);
    }
  }
`;

const CartText = styled.h4`
  display: none;
  cursor: pointer;
  @media (min-width: 1024px) {
    display: inline-block;
  }
  font-size: var(--header-dropdown-heading-size);
  font-weight: 400;
  color: var(--primary-100);
`;

/** Omotač oko ikone — badge u gornjem desnom uglu, preklapanje sa ručkom korpe. */
const CartIconWrap = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
  margin: 0 1px 0 0;
`;

/** Referenca: pun crven krug, beli broj, meka senka nadole-desno; „99+“ kao uža pilula. */
const SumQuantity = styled.span`
  pointer-events: none;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  transform: translate(44%, -44%);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  padding: 0;

  background: #e53935;
  color: #ffffff;
  border-radius: 50%;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.22), 0 1px 2px rgba(0, 0, 0, 0.12);

  /* Broj odvojen od Montserrat u headeru — sistemski / Helvetica stack */
  font-family: var(--font-family);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.02em;

  ${(p) =>
    p.$twoChar &&
    !p.$wide &&
    css`
      font-size: 10px;
    `}

  ${(p) =>
    p.$wide &&
    css`
      width: auto;
      min-width: 26px;
      height: 18px;
      min-height: 18px;
      padding: 0 5px;
      border-radius: 999px;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: -0.04em;
    `}
`;
const Span = styled.span`
  font-weight: 500;
  font-size: var(--header-font-size-small);
`;
const XDiv = styled.div`
  padding: 0 var(--spacing-md);
  cursor: pointer;
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  //margin-bottom: var(--spacing-md);
  background-color: var(--primary-100);
  color: var(--bg-100);
  flex-shrink: 0;
`;
const MiddleDiv = styled.div`
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--text-200);
    border-radius: 5px;
  }
  padding: 0 12px;
`;

const Logo = styled.div`
  flex: 1.4;
  color: var(--bg-100);

  font-size: var(--header-dropdown-heading-size);
  font-style: normal;
  font-weight: 400;
  letter-spacing: -0.438px;
  display: flex;
  gap: var(--spacing-xs);

  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  font-family: "Montserrat";
`;
const IconDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
`;

const FreeDelivery = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--navbar-height) * 2);
  border-top: 1px solid var(--bg-200);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  background-color: var(--bg-300);
  flex-shrink: 0;
  @media (max-width: 1023px) {
    position: static;
    height: auto;
    min-height: calc(var(--navbar-height) * 2);
  }
  @media (min-width: 1024px) {
    position: static;
  }
`;
const FreeDeliveryWrapper = styled.div`
  width: 96%;
  height: calc(100% - 20px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const FreeDeliveryText = styled.div`
  color: var(--text-100);
  font-family: "Montserrat", sans-serif;
  font-size: var(--header-dropdown-link-size);
  line-height: 1.35;
`;

const ShippingProgressBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
`;

const ShippingProgressMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`;

const ShippingProgressPercent = styled.span`
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--primary-100);
  font-size: calc(var(--header-dropdown-link-size) + 1px);
`;

const ShippingProgressHint = styled.span`
  font-size: 12px;
  color: var(--text-200);
  text-align: right;
`;

const ShippingProgressTrack = styled.div`
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background-color: var(--bg-200);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
`;

const ShippingProgressFill = styled.div`
  height: 100%;
  width: ${(p) => p.$pct}%;
  max-width: 100%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--primary-200),
    var(--primary-100)
  );
  transition: width 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
`;

const FreeDeliveryAchievedBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 12px 8px;
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(0, 160, 120, 0.08),
    transparent 65%
  );
  animation:
    ${freeShippingUnlockPop} 0.75s cubic-bezier(0.34, 1.45, 0.64, 1) forwards,
    ${freeShippingUnlockGlow} 1.15s ease-out 0.08s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SuccessCheckSvg = styled.svg`
  flex-shrink: 0;
  animation: ${freeShippingUnlockPop} 0.65s ease-out 0.1s both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Bottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(var(--navbar-height) * 2);
  border-top: 1px solid var(--bg-300);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  background-color: var(--bg-200);
  margin-bottom: 14px;
  flex-shrink: 0;
  @media (max-width: 1023px) {
    position: static;
    margin-bottom: 0;
    padding-bottom: max(14px, env(safe-area-inset-bottom, 0px));
  }
  @media (min-width: 1024px) {
    position: static;
  }
`;

const BottomWrapper = styled.div`
  width: 96%;
  height: calc(100% - 20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
`;
const FlexDiv = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const Button = styled.button`
  //height: 100%;
  border-radius: 4px;
  font-size: var(--header-dropdown-link-size);
  border: 1px solid var(--primary-100);
  background-color: var(--bg-100);
  color: var(--text-100);
  width: 100%;
  padding: 12px 0;
  &:hover {
    background-color: var(--primary-100);
    color: var(--bg-100);
  }
`;
const Notice = styled.p`
  margin: 16px 0;
  font-style: italic;
  text-align: center;
  font-size: var(--header-dropdown-link-size);
`;

const CartPanelHeading = styled.h3`
  font-family: "Montserrat", sans-serif;
  font-size: var(--header-dropdown-heading-size);
  font-weight: 600;
  margin: 0;
`;

const CartTotalAmount = styled.h2`
  margin: 0;
  font-size: calc(1.5rem + 2px);
  font-weight: 700;
  line-height: 1.2;
`;

const MaskContainer = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  z-index: calc(var(--zindex-modal-background) - 1);
  min-width: 100%;
  height: 100vh;
  background-color: #0000003a;
  display: none;

  @media (min-width: 1024px) {
    display: ${(props) => (props.$isOpen ? "block" : "none")};
  }
`;

const CartMenu = ({ isScrolled }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldBeVisible, setShouldBeVisible] = useState(false);
  const { currencyTag } = useContext(ProductContext);
  const navigate = useNavigate();
  const { goToCheckout } = useNavigation();
  const [bounce, setBounce] = useState(false);
  const prevQuantityRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setShouldBeVisible(true);
    } else {
      const timer = setTimeout(() => {
        setShouldBeVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const cartItems = useSelector((state) => state.cart.itemsList);
  let totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  /** Samo roba; bez poštarine — isto kao prag za besplatnu dostavu */
  const subtotalRounded = getCartMerchandiseSubtotal(cartItems);
  const freeShippingProgressPct = Math.min(
    100,
    freeShippingThreshold > 0
      ? (subtotalRounded / freeShippingThreshold) * 100
      : 100
  );
  const savings = cartItems.reduce(
    (totalSavings, item) =>
      totalSavings +
      (item.product.price - item.product.discount_price) * item.quantity,
    0
  );
  const savingsRounded = parseFloat(savings.toFixed(2));
  const [shippingCost, setShippingCost] = useState(0.0);
  const currency = localStorage.getItem("currency") || DEFAULT_CURRENCY;
  useEffect(() => {
    if (totalQuantity === 0) {
      setShippingCost(0);
      return;
    }
    if (qualifiesForFreeShipping(subtotalRounded)) {
      setShippingCost(0);
    } else {
      setShippingCost(getShippingCostPrice(DEFAULT_CURRENCY, currency));
    }
  }, [subtotalRounded, totalQuantity, currency]);

  const grandTotal = subtotalRounded + shippingCost;
  const grandTotalRounded = parseFloat(grandTotal.toFixed(2));
  const totalDisplay =
    totalQuantity === 0 ? "0.00" : grandTotalRounded.toFixed(2);

  const cartBadgeLabel =
    totalQuantity > 99 ? "99+" : String(totalQuantity);

  const inStockItems = cartItems.filter(
    (item) => item.product.is_in_stock === "in_stock"
  );
  const otherItems = cartItems.filter(
    (item) => item.product.is_in_stock !== "in_stock"
  );

  useEffect(() => {
    if (totalQuantity > prevQuantityRef.current) {
      setBounce(true);

      const timer = setTimeout(() => {
        setBounce(false);
      }, 600); // trajanje animacije

      return () => clearTimeout(timer);
    }

    prevQuantityRef.current = totalQuantity;
  }, [totalQuantity]);

  return (
    <ContainerX>
      {!isScrolled ? (
        <CartContainer $bounce={bounce} onClick={toggleMenu}>
          <CartText>
            {currencyTag}
            {totalDisplay}
          </CartText>
          <CartIconWrap>
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
                stroke="var(--primary-100)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {totalQuantity !== 0 && (
              <SumQuantity
                aria-hidden
                $wide={cartBadgeLabel.length > 2}
                $twoChar={cartBadgeLabel.length === 2}
              >
                {cartBadgeLabel}
              </SumQuantity>
            )}
          </CartIconWrap>
        </CartContainer>
      ) : (
        <CartContainer onClick={toggleMenu} style={{ cursor: "pointer" }}>
          <CartIconWrap>
            <CartHeaderIcon
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
                fill="none"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </CartHeaderIcon>
            {totalQuantity !== 0 && (
              <SumQuantity
                aria-hidden
                $wide={cartBadgeLabel.length > 2}
                $twoChar={cartBadgeLabel.length === 2}
              >
                {cartBadgeLabel}
              </SumQuantity>
            )}
          </CartIconWrap>
        </CartContainer>
      )}

      <Container
        onClick={toggleMenu}
        $isOpen={isOpen}
        $shouldBeVisible={shouldBeVisible}
      />
      <Wrapper
        $isOpen={isOpen}
        $shouldBeVisible={shouldBeVisible}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <XDiv>
          <IconDiv>
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              onClick={toggleMenu}
            >
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="var(--bg-100)"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="var(--bg-100)"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </IconDiv>
          <Logo>Basket</Logo>
        </XDiv>
        <FreeDelivery>
          <FreeDeliveryWrapper>
            {totalQuantity === 0 ? (
              <FreeDeliveryText style={{ textAlign: "left" }}>
                You have no items in the cart. Add products to continue.
              </FreeDeliveryText>
            ) : qualifiesForFreeShipping(subtotalRounded) ? (
              <FreeDeliveryAchievedBox>
                <SuccessCheckSvg
                  fill="var(--text-100)"
                  width="32"
                  height="32"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z" />
                </SuccessCheckSvg>
                <FreeDeliveryText style={{ textAlign: "center", fontWeight: 600 }}>
                  {t("CART.FREE_SHIPPING_UNLOCKED")}
                </FreeDeliveryText>
              </FreeDeliveryAchievedBox>
            ) : (
              <ShippingProgressBlock>
                <ShippingProgressMeta>
                  <ShippingProgressPercent>
                    {t("CART.FREE_SHIPPING_PROGRESS", {
                      percent: Math.min(
                        99,
                        Math.floor(freeShippingProgressPct)
                      ),
                    })}
                  </ShippingProgressPercent>
                  <ShippingProgressHint>
                    {currencyTag}
                    {subtotalRounded.toFixed(2)} / {currencyTag}
                    {freeShippingThreshold.toFixed(0)}
                  </ShippingProgressHint>
                </ShippingProgressMeta>
                <ShippingProgressTrack
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(freeShippingProgressPct)}
                  aria-label={t("CART.FREE_SHIPPING_PROGRESS", {
                    percent: Math.min(99, Math.floor(freeShippingProgressPct)),
                  })}
                >
                  <ShippingProgressFill $pct={freeShippingProgressPct} />
                </ShippingProgressTrack>
                <FreeDeliveryText style={{ textAlign: "center" }}>
                  {t("CART.FREE_SHIPPING_AWAY", {
                    amount: amountUntilFreeShipping(subtotalRounded).toFixed(2),
                    currency: currencyTag,
                  })}
                </FreeDeliveryText>
              </ShippingProgressBlock>
            )}
          </FreeDeliveryWrapper>
        </FreeDelivery>
        <Bottom>
          <BottomWrapper>
            <FlexDiv>
              <h3 style={{ fontFamily: "Montserrat" }}>In Total:</h3>
              <h2>
                {currencyTag}
                {totalDisplay}
              </h2>
            </FlexDiv>
            {/* <FlexDiv>
              <p style={{ padding: "0", margin: "0" }}>{t("CART.VAT")}</p>
              <p style={{ padding: "0", margin: "0" }}>{t("CART.INCLUDED")}</p> 
            </FlexDiv> */}
            <Button
              onClick={() => navigate(goToCheckout())}
              disabled={totalQuantity == 0}
            >
              {t("CART.CHECKOUT")}
            </Button>
          </BottomWrapper>
        </Bottom>
        <MiddleDiv>
          <CartPanelHeading>Your products</CartPanelHeading>
          {inStockItems.map((item, index) => (
            <CartProduct item={item} key={index} />
          ))}
          {otherItems.length > 0 && (
            <>
              <Notice>{t("CART.NOTICE")}</Notice>
              {otherItems.map((item, idx) => (
                <CartProduct item={item} key={`out-${idx}`} />
              ))}
            </>
          )}
        </MiddleDiv>
      </Wrapper>
      <MaskContainer $isOpen={isOpen} onClick={toggleMenu} />
    </ContainerX>
  );
};

export default CartMenu;
