import {
  useState,
  useContext,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
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

  @media (min-width: 768px) {
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

  @media (min-width: 768px) {
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

  @media (max-width: 767px) {
    width: 44px;
    min-width: 44px;
    max-width: 44px;
    height: 44px;
    padding: 0;
    gap: 0;
    box-sizing: border-box;
  }

  @media (min-width: 768px) {
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

  @media (min-width: 768px) {
    display: inline;
  }
`;

const UserTriggerIcon = styled.svg`
  flex-shrink: 0;
  width: 22px;
  height: 22px;

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
  padding: 16px 12px 32px;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--text-200);
    border-radius: 5px;
  }
`;

const FormSurface = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  background-color: var(--bg-200);
  position: relative;
  padding: 8px 0 24px;
  box-sizing: border-box;
`;

const FormWrapper = styled.div`
  min-width: 90%;
  max-width: 90%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 100%;
`;

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 10px 0;
  width: 100%;
`;

const Subtitle = styled.div`
  font-size: var(--header-font-size-small);
  color: var(--text-100);
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-family: "Montserrat", sans-serif;
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

const Label = styled.label`
  font-size: var(--header-font-size-base);
  text-transform: capitalize;
  color: var(--text-200);
  text-align: left;
  min-width: 100%;
  font-family: "Montserrat", sans-serif;
`;

const SmallTitle = styled.div`
  text-align: center;
  font-size: var(--header-font-size-small);
  margin: 12px 0;
  color: var(--text-100);
  font-family: "Montserrat", sans-serif;
`;

const ButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 90%;
  text-align: center;
  margin: var(--spacing-md) 0;
`;

const Button = styled.button`
  width: 100%;
  height: 40px;
  text-transform: capitalize;
  border-radius: 0;
  font-size: var(--header-font-size-base);
`;

const EyeSVG = styled.svg`
  position: absolute;
  right: 40px;
  top: 0;
  width: var(--font-size-xlarge);
  height: var(--font-size-xlarge);
`;

const EyeSpan = styled.span`
  position: relative;
`;

const ButtonLink = styled.button`
  align-self: center;
  color: var(--primary-200);
  font-size: var(--header-font-size-small);
  font-weight: 500;
  border: none;
  background-color: transparent;
  padding: 0;
  margin: 8px 0;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  &:hover {
    background-color: transparent;
    color: var(--primary-100);
  }
`;

const GoogleWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 16px;
  gap: 10px;
  width: 100%;
`;

const GOOGLE_CLIENT_ID =
  "1073769483725-9r694i6s793d9ccmtfc2nh4tq4379s5a.apps.googleusercontent.com";

const Login = forwardRef(function Login(_, ref) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goToRegister, goToForgotPassword } = useNavigation();

  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setIsOpen(true),
    }),
    []
  );
  const [shouldBeVisible, setShouldBeVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, handleGoogleLogin } = useContext(AuthUserContext);

  const [isAnimating, setIsAnimating] = useState(false);

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
        onClick={togglePanel}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            togglePanel();
          }
        }}
        aria-label={t("LOGIN.SIGN_IN")}
        aria-expanded={isOpen}
      >
        <TriggerLabel>{t("LOGIN.SIGN_IN")}</TriggerLabel>
        <UserTriggerIcon
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1" />
        </UserTriggerIcon>
      </TriggerWrap>

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
          <FormSurface>
            <FormContainer>
              <Subtitle>{t("LOGIN.SUBTITLE")}</Subtitle>
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
                    <Input
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

              <ButtonLink
                type="button"
                onClick={() => {
                  navigate(goToForgotPassword());
                  setIsOpen(false);
                }}
              >
                <strong>{t("LOGIN.FORGOT_PASSWORD")}</strong>
              </ButtonLink>

              <GoogleWrap>
                <div id="signInDivLogin" style={{ width: "100%" }} />
              </GoogleWrap>

              <SmallTitle>
                {t("LOGIN.DONT_HAVE_ACCOUNT")}{" "}
                <ButtonLink
                  type="button"
                  onClick={() => {
                    navigate(goToRegister());
                    setIsOpen(false);
                  }}
                >
                  {t("LOGIN.SIGN_UP")}
                </ButtonLink>
              </SmallTitle>
            </FormContainer>
          </FormSurface>
        </ScrollBody>
      </Panel>

      <BackdropMask $isOpen={isOpen} onClick={togglePanel} />
    </Shell>
  );
});

export default Login;
