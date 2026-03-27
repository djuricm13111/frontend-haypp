import {
  useState,
  useContext,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import styled, { css, keyframes } from "styled-components";
import ButtonLoading from "../../../components/animations/ButtonLoading";

import { useTranslation } from "react-i18next";
import { AuthUserContext } from "../../../context/AuthUserContext";
import { useNavigate } from "react-router-dom";
import { useNavigation } from "../../../utils/navigation";

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

const Shell = styled.div``;

const FullscreenOverlay = styled.div`
  margin-top: var(--spacing-xxs);
  background-color: transparent;
  position: fixed;
  right: 0;
  top: 0;
  z-index: var(--zindex-modal-background);
  min-width: 100%;
  height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  transition: opacity 400ms ease-in-out;
  visibility: ${(props) => (props.$shouldBeVisible ? "visible" : "hidden")};
`;

const Panel = styled.div`
  z-index: var(--zindex-modal);
  background-color: var(--bg-100);
  width: 100%;
  height: 100%;
  min-height: 100%;
  position: fixed;
  right: 0;
  top: 0;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  visibility: ${(props) => (props.$shouldBeVisible ? "visible" : "hidden")};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  ${({ $isOpen }) =>
    $isOpen
      ? css`
          animation: ${slideIn} 0.4s ease-out forwards;
        `
      : css`
          animation: ${slideOut} 0.1s ease-in forwards;
        `}

  @media (max-width: 767px) {
    width: 90%;
    max-width: min(90vw, 100%);
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    width: min(360px, 68vw);
    max-width: min(360px, 68vw);
  }

  @media (min-width: 1024px) {
    width: 400px;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
    box-shadow: var(--shadow-large);
    ${({ $isOpen }) =>
      $isOpen
        ? css`
            animation: ${slideIn} 0.4s ease-out forwards;
          `
        : css`
            animation: ${slideOut} 0.1s ease-in forwards;
          `};
  }
`;

const BackdropMask = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  z-index: var(--zindex-modal-background);
  min-width: 100%;
  height: 100vh;
  background-color: #0000003a;
  display: none;

  @media (min-width: 1024px) {
    display: ${(props) => (props.$isOpen ? "block" : "none")};
  }
`;

const TriggerWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 8px;
  height: 30px;
  min-width: 30px;
  cursor: pointer;
  box-sizing: border-box;
  color: var(--primary-100);
  background-color: transparent;
  padding: 0 4px;

  @media (max-width: 1023px) {
    width: 44px;
    min-width: 44px;
    max-width: 44px;
    height: 44px;
    padding: 0;
    gap: 0;
    box-sizing: border-box;
  }

  @media (min-width: 1024px) {
    height: 40px;
    min-width: auto;
    padding: 0 14px;
    gap: 10px;
    color: var(--bg-100);
    background-color: var(--primary-100);
  }
`;

const TriggerLabel = styled.span`
  display: none;
  font-size: var(--header-dropdown-title-size);
  font-weight: 600;
  line-height: 1;
  color: currentColor;
  white-space: nowrap;

  @media (min-width: 1024px) {
    display: inline;
  }
`;

const UserTriggerIcon = styled.svg`
  flex-shrink: 0;
  width: 22px;
  height: 22px;

  @media (min-width: 768px) and (max-width: 1023px) {
    width: 20px;
    height: 20px;
  }

  path {
    stroke: currentColor;
    fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

const PanelHeader = styled.div`
  padding: 0 var(--spacing-md);
  cursor: pointer;
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: var(--primary-100);
  color: var(--bg-100);
  flex-shrink: 0;
`;

const IconDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
`;

const PanelTitle = styled.div`
  flex: 1.4;
  color: var(--bg-100);
  font-size: var(--header-dropdown-heading-size);
  font-weight: 400;
  letter-spacing: -0.438px;
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  justify-content: flex-start;
  font-family: "Montserrat", sans-serif;
`;

const ScrollBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  padding: 0 0 32px;
  background-color: var(--bg-100);

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--text-200);
    border-radius: 5px;
  }
`;

/** Blago tamnija traka, ivica dole — puna širina panela (kompenzuje padding ScrollBody). */
const AccountHintBar = styled.div`
  width: 100%;
  margin: 0 0 var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm);
  box-sizing: border-box;
  background-color: var(--bg-300);
  border-bottom: 1px solid #e4e4e4;
`;

const AccountHintTitle = styled.h2`
  margin: 0 0 var(--spacing-xs);
  padding: 0;
  font-size: var(--header-font-size-base);
  font-weight: 600;
  color: var(--text-100);
  text-align: center;
  font-family: "Montserrat", sans-serif;
  line-height: 1.25;
  font-family: "Oswald-Medium";
  font-size:14px;
`;

const AccountHintText = styled.p`
  margin: 0;
  font-size: var(--header-font-size-small);
  color: var(--text-200);
  line-height: 1.45;
  text-align: center;
  font-family: "Montserrat", sans-serif;
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

const FormSurface = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  background-color: var(--bg-100);
  position: relative;
  padding: 0 12px 24px;
  box-sizing: border-box;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-width: 0;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
`;

const Form = styled.form`
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  flex-direction: column;
  margin: 10px 0 0;
  width: 100%;
  gap: 0;
`;

const Input = styled.input`
  outline: none;
  padding: var(--spacing-sm) 0 var(--spacing-sm) var(--spacing-xs);
  border: 1px solid #ccc;
  width: calc(100% - 8px);
  font-size: var(--header-font-size-small);
  color: var(--text-200);
  background-color: var(--bg-100);
  margin: var(--spacing-xxs) 0 var(--spacing-md) 0;
  box-sizing: border-box;
  ::placeholder {
    font-size: var(--header-font-size-small);
    color: var(--text-200);
  }
`;

/** Prostor za ikonu oka desno; širina 100% u grid ćeliji. */
const PasswordInput = styled(Input)`
  grid-column: 1;
  grid-row: 1;
  width: 100%;
  max-width: 100%;
  padding-right: 44px;
  box-sizing: border-box;
`;

const Label = styled.label`
  font-size: var(--header-font-size-base);
  text-transform: capitalize;
  color: var(--text-200);
  text-align: left;
  min-width: 100%;
  font-family: "Montserrat", sans-serif;
`;

const ButtonWrapper = styled.div`
  position: relative;
  display: block;
  width: 100%;
  text-align: center;
  margin: var(--spacing-md) 0 0;
`;

const Button = styled.button`
  width: 100%;
  height: 40px;
  text-transform: capitalize;
  border-radius: 0;
  font-size: var(--header-font-size-base);
`;

const EyeSVG = styled.svg`
  grid-column: 1;
  grid-row: 1;
  justify-self: end;
  align-self: center;
  width: var(--font-size-xlarge);
  height: var(--font-size-xlarge);
  margin-right: 14px;
  cursor: pointer;
  z-index: 2;
  pointer-events: auto;
  flex-shrink: 0;
`;

const EyeSpan = styled.span`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  width: 100%;
  align-items: center;
`;

const AuthFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  margin-top: var(--spacing-md);
  gap: var(--spacing-md);
`;

const ForgotPasswordRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const ForgotPasswordButton = styled.button`
  color: var(--primary-200);
  font-size: var(--header-font-size-small);
  font-weight: 600;
  border: none;
  background: transparent;
  padding: var(--spacing-xxs) var(--spacing-sm);
  margin: 0;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  text-align: center;
  line-height: 1.35;
  width: 100%;
  max-width: 100%;

  &:hover {
    color: var(--primary-100);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const GoogleWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  min-height: 0;

  #signInDivLogin {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  #signInDivLogin > div {
    width: 100% !important;
  }
`;

const RegisterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  column-gap: 0.35em;
  row-gap: var(--spacing-xxs);
  width: 100%;
  text-align: center;
  font-size: var(--header-font-size-small);
  color: var(--text-100);
  font-family: "Montserrat", sans-serif;
  line-height: 1.4;
`;

const RegisterPrompt = styled.span`
  color: var(--text-100);
`;

const SignUpButton = styled.button`
  display: inline;
  color: var(--primary-200);
  font-size: inherit;
  font-weight: 600;
  font-family: inherit;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: var(--primary-100);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const GOOGLE_CLIENT_ID =
  "1073769483725-9r694i6s793d9ccmtfc2nh4tq4379s5a.apps.googleusercontent.com";

/** Jednom po tab sesiji — ne prikazuj ponovo obaveštenje posle zatvaranja / Sign in. */
const SESSION_NUDGE_KEY = "snusco_login_reorder_nudge_dismissed";

/** Omotač oko user ikone — badge kao na korpi (CartMenu SumQuantity). */
const UserIconBadgeWrap = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
`;

const NudgeBadge = styled.span`
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

  font-family: var(--font-family);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.02em;
`;

const NudgePopoverBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--zindex-popover);
  background: rgba(0, 0, 0, 0.04);
`;

/** Svetla plava zona naslova — drugačija od belog donjeg dela */
const nudgeTopBg = "#e8eef9";
const NUDGE_POPOVER_MAX_WIDTH = 212;

const NudgePopoverSurface = styled.div`
  position: fixed;
  z-index: calc(var(--zindex-popover) + 1);
  background: var(--bg-100);
  border-radius: 4px;
  border: 1px solid rgba(0, 48, 130, 0.18);
  box-shadow:
    0 2px 4px rgba(0, 20, 50, 0.04),
    0 10px 22px rgba(0, 20, 50, 0.07);
  padding: 0;
  overflow: visible;
  box-sizing: border-box;
  max-width: min(${NUDGE_POPOVER_MAX_WIDTH}px, calc(100vw - 40px));

  /* Spoljašnji trougao — ista boja kao ivica prozora */
  &::after {
    content: "";
    position: absolute;
    top: -9px;
    left: var(--nudge-arrow-x, 50%);
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 9px solid rgba(0, 48, 130, 0.18);
    z-index: 0;
    pointer-events: none;
  }

  /* Unutrašnji trougao — nastavlja plavu zonu (overflow:hidden bi ga sekao) */
  &::before {
    content: "";
    position: absolute;
    top: -8px;
    left: var(--nudge-arrow-x, 50%);
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid ${nudgeTopBg};
    z-index: 1;
    pointer-events: none;
    filter: drop-shadow(0 -0.5px 0 rgba(0, 48, 130, 0.06));
  }
`;

const NudgeTopSection = styled.div`
  position: relative;
  z-index: 2;
  background: ${nudgeTopBg};
  border-radius: 3px 3px 0 0;
  padding: var(--spacing-sm) var(--spacing-sm) 6px;
  box-sizing: border-box;
`;

const NudgeBottomSection = styled.div`
  position: relative;
  z-index: 2;
  background: var(--bg-100);
  border-radius: 0 0 3px 3px;
  padding: 6px var(--spacing-sm) var(--spacing-sm);
  box-sizing: border-box;
`;

const NudgeTitle = styled.h3`
  margin: 0;
  font-family: "Montserrat", sans-serif;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--primary-100);
  text-align: center;
  line-height: 1.35;
`;

const NudgeBody = styled.p`
  margin: 0 0 6px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.75rem;
  color: var(--text-100);
  text-align: center;
  line-height: 1.5;
`;

const NudgePrimaryBtn = styled.button`
  width: 100%;
  padding: 8px var(--spacing-sm);
  border: none;
  outline: none;
  border-radius: 0;
  background: var(--primary-100);
  color: var(--bg-100);
  font-family: "Montserrat", sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 6px;
  transition: background var(--transition-fast);
  box-shadow: none;

  &:hover {
    background: var(--primary-200);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--bg-100), 0 0 0 4px var(--primary-200);
  }
`;

const NudgeCloseLink = styled.button`
  display: block;
  width: 100%;
  margin: 0;
  padding: 4px var(--spacing-xs);
  border: none;
  outline: none;
  border-radius: 0;
  background: none;
  font-family: "Montserrat", sans-serif;
  font-size: 0.75rem;
  color: var(--text-200);
  cursor: pointer;
  text-align: center;
  box-shadow: none;

  &:hover {
    color: var(--text-100);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary-100);
  }
`;

const Login = forwardRef(function Login(_, ref) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goToRegister, goToForgotPassword } = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [shouldBeVisible, setShouldBeVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, handleGoogleLogin, authTokens } = useContext(AuthUserContext);

  const triggerRef = useRef(null);
  const nudgeIconRef = useRef(null);
  const [nudgePopoverOpen, setNudgePopoverOpen] = useState(false);
  const [nudgePos, setNudgePos] = useState({
    top: 0,
    left: 0,
    width: NUDGE_POPOVER_MAX_WIDTH,
    arrowX: NUDGE_POPOVER_MAX_WIDTH / 2,
  });
  const [nudgeDismissed, setNudgeDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_NUDGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const dismissNudge = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_NUDGE_KEY, "1");
    } catch {
      /* private mode */
    }
    setNudgeDismissed(true);
    setNudgePopoverOpen(false);
  }, []);

  const showNudgeBadge = !authTokens && !nudgeDismissed;

  useLayoutEffect(() => {
    if (!nudgePopoverOpen || !triggerRef.current) return;

    const place = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const w = Math.min(NUDGE_POPOVER_MAX_WIDTH, window.innerWidth - 40);
      const left = Math.max(
        20,
        Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 20)
      );
      const iconEl = nudgeIconRef.current;
      const ir = iconEl ? iconEl.getBoundingClientRect() : r;
      const iconCenterX = ir.left + ir.width / 2;
      let arrowX = iconCenterX - left;
      const pad = 12;
      arrowX = Math.min(Math.max(arrowX, pad), w - pad);
      setNudgePos({ top: r.bottom + 8, left, width: w, arrowX });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [nudgePopoverOpen]);

  useEffect(() => {
    if (authTokens) setNudgePopoverOpen(false);
  }, [authTokens]);

  useEffect(() => {
    if (!nudgePopoverOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") dismissNudge();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nudgePopoverOpen, dismissNudge]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setNudgePopoverOpen(false);
        try {
          sessionStorage.setItem(SESSION_NUDGE_KEY, "1");
        } catch {
          /* ignore */
        }
        setNudgeDismissed(true);
        setIsOpen(true);
      },
    }),
    []
  );

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

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

  const togglePanel = () => {
    setIsOpen((o) => !o);
  };

  const handleTriggerClick = () => {
    if (!authTokens && !nudgeDismissed) {
      setNudgePopoverOpen(true);
      return;
    }
    togglePanel();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnimating(true);
    try {
      await loginUser(email, password);
      setIsOpen(false);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        /* auth failed */
      } else {
        /* other */
      }
    }
  };

  const handleCallbackResponse = useCallback(
    async (response) => {
      try {
        await handleGoogleLogin(response.credential);
        setIsOpen(false);
      } catch (err) {
        console.error(err);
      }
    },
    [handleGoogleLogin]
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    const el = document.getElementById("signInDivLogin");
    if (!el) return undefined;

    let cancelled = false;
    let intervalId = null;

    const mountGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id) return false;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCallbackResponse,
        });
        el.innerHTML = "";
        window.google.accounts.id.renderButton(el, {
          theme: "outlined",
          size: "large",
          width: Math.min(el.offsetWidth || 320, 360),
        });
      } catch (e) {
        console.error(e);
      }
      return true;
    };

    if (!mountGoogleButton()) {
      intervalId = window.setInterval(() => {
        if (mountGoogleButton() && intervalId) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      el.innerHTML = "";
    };
  }, [isOpen, handleCallbackResponse]);

  return (
    <Shell>
      <TriggerWrap
        ref={triggerRef}
        onClick={handleTriggerClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTriggerClick();
          }
        }}
        aria-label={t("LOGIN.SIGN_IN")}
        aria-expanded={isOpen}
        aria-haspopup={showNudgeBadge ? "dialog" : undefined}
      >
        <TriggerLabel>{t("LOGIN.SIGN_IN")}</TriggerLabel>
        <UserIconBadgeWrap ref={nudgeIconRef}>
          <UserTriggerIcon
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1" />
          </UserTriggerIcon>
          {showNudgeBadge && <NudgeBadge aria-hidden>1</NudgeBadge>}
        </UserIconBadgeWrap>
      </TriggerWrap>

      {nudgePopoverOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <NudgePopoverBackdrop onClick={dismissNudge} />
            <NudgePopoverSurface
              style={{
                top: nudgePos.top,
                left: nudgePos.left,
                width: nudgePos.width,
                ["--nudge-arrow-x"]: `${nudgePos.arrowX}px`,
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="login-reorder-nudge-title"
              onClick={(e) => e.stopPropagation()}
            >
              <NudgeTopSection>
                <NudgeTitle id="login-reorder-nudge-title">
                  {t("LOGIN.REORDER_NUDGE_TITLE")}
                </NudgeTitle>
              </NudgeTopSection>
              <NudgeBottomSection>
                <NudgeBody>{t("LOGIN.REORDER_NUDGE_BODY")}</NudgeBody>
                <NudgePrimaryBtn
                  type="button"
                  onClick={() => {
                    dismissNudge();
                    setIsOpen(true);
                  }}
                >
                  {t("LOGIN.SIGN_IN")}
                </NudgePrimaryBtn>
                <NudgeCloseLink type="button" onClick={dismissNudge}>
                  {t("LOGIN.REORDER_NUDGE_CLOSE")}
                </NudgeCloseLink>
              </NudgeBottomSection>
            </NudgePopoverSurface>
          </>,
          document.body
        )}

      <FullscreenOverlay
        onClick={togglePanel}
        $isOpen={isOpen}
        $shouldBeVisible={shouldBeVisible}
      />

      <Panel
        $isOpen={isOpen}
        $shouldBeVisible={shouldBeVisible}
        onClick={(event) => {
          event.stopPropagation();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={t("LOGIN.TITLE")}
      >
        <PanelHeader>
          <IconDiv>
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              onClick={togglePanel}
              aria-hidden="true"
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
          <PanelTitle>{t("LOGIN.TITLE")}</PanelTitle>
        </PanelHeader>

        <ScrollBody>
          <AccountHintBar>
            <AccountHintTitle>{t("LOGIN.HINT_SECTION_TITLE")}</AccountHintTitle>
            <AccountHintText>{t("LOGIN.ACCOUNT_HINT")}</AccountHintText>
          </AccountHintBar>
          <FormSurface>
            <FormContainer>
              <LoginLogoMark>{t("LOGIN.LOGO_MARK")}</LoginLogoMark>
              <Form onSubmit={handleSubmit}>
                <FormWrapper>
                  <Label htmlFor="login-email">{t("LABELS.EMAIL")}</Label>
                  <Input
                    type="email"
                    id="login-email"
                    autoComplete="email"
                    value={email}
                    placeholder={t("PLACEHOLDERS.EMAIL")}
                    onChange={(e) =>
                      setEmail(e.target.value.replace(/\s/g, ""))
                    }
                    required
                  />
                </FormWrapper>

                <FormWrapper>
                  <Label htmlFor="login-password">{t("LABELS.PASSWORD")}</Label>
                  <EyeSpan>
                    <PasswordInput
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      autoComplete="current-password"
                      placeholder={t("PLACEHOLDERS.PASSWORD")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {showPassword ? (
                      <EyeSVG
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => setShowPassword(!showPassword)}
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
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.0001 3.96997C8.19618 3.96997 4.69299 5.94267 2.28282 9.27342C1.721 10.0475 1.46509 11.0419 1.46509 11.995C1.46509 12.9478 1.7209 13.942 2.28246 14.716C4.69264 18.0471 8.19599 20.02 12.0001 20.02C15.804 20.02 19.3072 18.0473 21.7174 14.7165C22.2792 13.9424 22.5351 12.948 22.5351 11.995C22.5351 11.0421 22.2793 10.0479 21.7177 9.27392C19.3075 5.94286 15.8042 3.96997 12.0001 3.96997ZM9.75012 12C9.75012 10.755 10.7551 9.75 12.0001 9.75C13.2451 9.75 14.2501 10.755 14.2501 12C14.2501 13.245 13.2451 14.25 12.0001 14.25C10.7551 14.25 9.75012 13.245 9.75012 12Z"
                          fill="var(--text-200)"
                        />
                      </EyeSVG>
                    )}
                  </EyeSpan>
                </FormWrapper>

                <ButtonWrapper>
                  <Button type="submit">{t("BUTTONS.SUBMIT")}</Button>
                  {isAnimating && (
                    <ButtonLoading
                      isAnimating={isAnimating}
                      onComplete={handleAnimationComplete}
                    />
                  )}
                </ButtonWrapper>
              </Form>

              <AuthFooter>
                <ForgotPasswordRow>
                  <ForgotPasswordButton
                    type="button"
                    onClick={() => {
                      navigate(goToForgotPassword());
                      setIsOpen(false);
                    }}
                  >
                    {t("LOGIN.FORGOT_PASSWORD")}
                  </ForgotPasswordButton>
                </ForgotPasswordRow>

                <GoogleWrap>
                  <div id="signInDivLogin" style={{ width: "100%" }} />
                </GoogleWrap>

                <RegisterRow>
                  <RegisterPrompt>{t("LOGIN.DONT_HAVE_ACCOUNT")}</RegisterPrompt>
                  <SignUpButton
                    type="button"
                    onClick={() => {
                      navigate(goToRegister());
                      setIsOpen(false);
                    }}
                  >
                    {t("LOGIN.SIGN_UP")}
                  </SignUpButton>
                </RegisterRow>
              </AuthFooter>
            </FormContainer>
          </FormSurface>
        </ScrollBody>
      </Panel>

      <BackdropMask $isOpen={isOpen} onClick={togglePanel} />
    </Shell>
  );
});

export default Login;
