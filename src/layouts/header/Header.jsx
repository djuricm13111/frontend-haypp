import styled, { css } from "styled-components";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchInput from "./components/SearchInput";
import HeaderList from "./components/HeaderList";
import Search from "./components/Search";
import CartMenu from "./components/CartMenu";
import Language from "./components/Language";
import Login from "./components/Login";
import MobileNavDrawer from "./components/MobileNavDrawer";
/** Sadrži sve što je iznad glavnog belog headera — visina = tačan prag skrola. */
const PreHeaderStack = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  /**
   * Dok je mobilni drawer otvoren, ceo pre-header (uklj. Trustpilot) mora ispod
   * modalnog sloja (1040+). Inače TopHeaderSection (1000) vizuelno „probija“
   * providan backdrop dok entered ne postane true.
   */
  z-index: ${(props) => (props.$mobileNavOpen ? 10 : "auto")};
`;

const TopBlock = styled.div`
  height: 36px;
  background-color: var(--success-color);
  color: var(--bg-100);
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: underline;
`;
const TopHeaderSection = styled.div`
  min-height: 36px;
  background-color: var(--primary-100);
  color: var(--bg-100);
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  position: relative;
  z-index: var(--zindex-dropdown);

  @media (max-width: 1023px) {
    height: auto;
    background-color: #003057;
  }
`;
const TopHeaderWrapper = styled.div`
  width: 100%;
  max-width: var(--max-width-container);
  overflow: visible;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    column-gap: 12px;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
  }

  @media (max-width: 1023px) {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    justify-content: center;
  }
`;

const TopBarDesktopLeft = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;

  @media (min-width: 1024px) {
    grid-column: 1;
    flex-wrap: nowrap;
    flex-shrink: 0;
  }

  @media (max-width: 1023px) {
    display: none;
  }
`;

const TopBarDesktopRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;

  @media (min-width: 1024px) {
    grid-column: 3;
  }

  @media (max-width: 1023px) {
    display: none;
  }
`;

const TopBarLanguageSlot = styled.div`
  display: flex;
  align-items: center;
`;

const MobileTrustPilotBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 600;
  font-family: "Montserrat", sans-serif;

  @media (min-width: 1024px) {
    grid-column: 2;
    justify-self: center;
    padding: 0 8px;
    color: var(--bg-100);
  }

  @media (max-width: 1023px) {
    width: 100%;
    padding: 8px 12px;
    color: #fff;
  }
`;

const ExcellentLabel = styled.span`
  text-decoration: underline;
  font-weight: 600;
`;

const StarsRow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const StarCell = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #00b67a;
  color: #fff;
  font-size: 14px;
  line-height: 1;
`;

const TrustpilotWordmark = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 2px;
  font-weight: 600;
  letter-spacing: 0.02em;
`;
const IconText = styled.div`
  font-size: var(--header-font-size-small);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;

  @media (min-width: 1024px) {
    flex-shrink: 0;
    white-space: nowrap;
  }
`;
const Container = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: ${(props) =>
    props.$isScrolled ? "0 4px 12px rgba(0,0,0,0.12)" : "none"};
  transition: all 0.2s ease;
  background-color: var(--bg-100);

  z-index: 9;

  //position: sticky;
  position: ${(props) => (props.$isScrolled ? "sticky" : "static")};
  top: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  flex-direction: row;
  position: relative;

  padding: 0;
  margin: 0;

  width: 100%;
  max-width: var(--max-width-container);

  box-sizing: border-box;

  @media (max-width: 1023px) {
    height: var(--navbar-height);
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    max-width: 100%;
    min-width: 0;
    overflow-x: clip;
  }

  @media (min-width: 1024px) {
    flex-direction: ${(props) =>
      props.$isScrolled ? "row-reverse" : "column"};

    min-height: ${(props) => (props.$isScrolled ? "62px" : "86px")};
  }
`;

const MobileHeaderTools = styled.div`
  @media (min-width: 1024px) {
    display: contents;
  }

  @media (max-width: 1023px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0;
    min-width: 0;

    ${(props) =>
      props.$mobileScrolled
        ? css`
            flex: 1 1 auto;
            justify-content: flex-start;
            gap: 6px;

            & > *:not(:first-child) {
              flex-shrink: 0;
            }
          `
        : css`
            flex: 0 0 auto;
            justify-content: flex-end;
          `}
  }
`;

const DesktopNavSection = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    margin-top: ${(props) => (props.$isScrolled ? "0" : "10px")};
    justify-content: center;
    align-items: center;
    min-width: 0;
    ${(props) =>
      props.$isScrolled
        ? css`
            flex: 1 1 auto;
            width: auto;
          `
        : css`
            flex: none;
            width: 100%;
          `}
  }
`;

/** Isti wordmark kao FooterLogo u MobileNavDrawer (bez SVG-a). Polimorfni: Link na početnu ili div kad je sakriven pri skrolu. */
const Logo = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #001a57;
  text-transform: uppercase;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease, max-width 0.25s ease, margin 0.25s ease,
    padding 0.25s ease;

  ${(props) =>
    props.$isScrolled &&
    css`
      max-width: 0;
      min-width: 0;
      width: 0;
      opacity: 0;
      margin: 0 !important;
      padding: 0 !important;
      pointer-events: none;
    `}

  @media (max-width: 1023px) {
    font-size: 24px;
    margin: 0;
    padding: 0 4px 0 0;
    max-width: min(52%, 240px);
    min-width: 0;
  }

  @media (min-width: 1024px) {
    font-size: 30px;
    margin-bottom: var(--spacing-md);
    padding-top: 22px;
  }
`;

const MobileNavToolSlot = styled.div`
  @media (min-width: 1024px) {
    display: none;
  }

  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 44px;
    width: 44px;
    min-width: 44px;
    max-width: 44px;
    height: 44px;
    position: relative;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--primary-100);
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 4px;

  &:focus-visible {
    outline: 2px solid var(--primary-200);
    outline-offset: 2px;
  }
`;

const HamburgerBar = styled.span`
  display: block;
  width: 22px;
  height: 2px;
  background-color: currentColor;
  border-radius: 1px;
`;

const Header = () => {
  const { t } = useTranslation();
  const loginRef = useRef(null);
  const preHeaderRef = useRef(null);
  /** ≥1024px: vrh DesktopNavSection (HeaderList). ≤1023px: kompakt red (MobileHeaderTools). */
  const desktopNavListRef = useRef(null);
  const mainHeaderToolsRef = useRef(null);
  /** Dok je kompakt header, ne ažurirati prag (layout pomera anchor). */
  const isScrolledRef = useRef(false);

  /**
   * Kompakt (telefon + tablet, ≤1023px): threshold = h(PreHeaderStack) — vrh belog headera.
   * Desktop (≥1024): threshold = document Y vrha DesktopNavSection (HeaderList).
   * Usporedba: scrollY >= threshold kada vrh tog elementa dođe do vrha viewporta.
   */
  const scrollThresholdPxRef = useRef(Number.POSITIVE_INFINITY);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  /** Kompakt viewport (telefon + tablet, ≤1023px) — isti header kao na telefonu. */
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 1023px)").matches
      : false
  );

  isScrolledRef.current = isScrolled;

  const syncScrolledFromScrollY = () => {
    const y = window.scrollY;
    const t = scrollThresholdPxRef.current;
    setIsScrolled(Number.isFinite(t) && y >= t);
  };

  const measureScrollThreshold = () => {
    if (typeof window === "undefined") return;

    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (mobile) {
      const h = preHeaderRef.current?.offsetHeight ?? 0;
      scrollThresholdPxRef.current = h;
      syncScrolledFromScrollY();
      return;
    }

    if (isScrolledRef.current) {
      syncScrolledFromScrollY();
      return;
    }

    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const anchor = wide ? desktopNavListRef.current : mainHeaderToolsRef.current;
    if (anchor) {
      scrollThresholdPxRef.current =
        anchor.getBoundingClientRect().top + window.scrollY;
    } else {
      scrollThresholdPxRef.current =
        preHeaderRef.current?.offsetHeight ?? Number.POSITIVE_INFINITY;
    }
    syncScrolledFromScrollY();
  };

  useLayoutEffect(() => {
    measureScrollThreshold();
  }, [isScrolled]);

  useLayoutEffect(() => {
    const pre = preHeaderRef.current;
    const nav = desktopNavListRef.current;
    const tools = mainHeaderToolsRef.current;

    measureScrollThreshold();

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measureScrollThreshold());
      if (pre) ro.observe(pre);
      if (nav) ro.observe(nav);
      if (tools) ro.observe(tools);
    }

    const onResize = () => measureScrollThreshold();
    window.addEventListener("resize", onResize);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      syncScrolledFromScrollY();
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const onViewport = () => setIsMobile(mq.matches);
    onViewport();
    mq.addEventListener("change", onViewport);
    return () => mq.removeEventListener("change", onViewport);
  }, []);

  return (
    <>
      <PreHeaderStack ref={preHeaderRef} $mobileNavOpen={mobileNavOpen}>
        <TopBlock>VELO from £2.49 + 17% off with code: LUCKY17 ☘️</TopBlock>
        <TopHeaderSection>
        <TopHeaderWrapper>
          <TopBarDesktopLeft>
            <IconText>
              {" "}
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.9 4.5C15.9 3 14.418 2 13.26 2c-.806 0-.869.612-.993 1.82-.055.53-.121 1.174-.267 1.93-.386 2.002-1.72 4.56-2.996 5.325V17C9 19.25 9.75 20 13 20h3.773c2.176 0 2.703-1.433 2.899-1.964l.013-.036c.114-.306.358-.547.638-.82.31-.306.664-.653.927-1.18.311-.623.27-1.177.233-1.67-.023-.299-.044-.575.017-.83.064-.27.146-.475.225-.671.143-.356.275-.686.275-1.329 0-1.5-.748-2.498-2.315-2.498H15.5S15.9 6 15.9 4.5zM5.5 10A1.5 1.5 0 0 0 4 11.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 5.5 10z"
                  fill="var(--bg-100)"
                />
              </svg>
              Free Delivery over £4.99
            </IconText>
            <IconText>
              <svg
                width="24px"
                height="24px"
                viewBox="-2.98 0 20.004 20.004"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="thunder" transform="translate(-4.967 -1.996)">
                  <path
                    id="secondary"
                    fill="var(--bg-100)"
                    d="M17.76,10.63,9,21l2.14-8H7.05a1,1,0,0,1-1-1.36l3.23-8a1.05,1.05,0,0,1,1-.64h4.34a1,1,0,0,1,1,1.36L13.7,9H17a1,1,0,0,1,.76,1.63Z"
                  />
                  <path
                    id="primary"
                    d="M17.76,10.63,9,21l2.14-8H7.05a1,1,0,0,1-1-1.36l3.23-8a1.05,1.05,0,0,1,1-.64h4.34a1,1,0,0,1,1,1.36L13.7,9H17a1,1,0,0,1,.76,1.63Z"
                    fill="none"
                    stroke="var(--bg-100)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="0"
                  />
                </g>
              </svg>
              Pay with Klarna
            </IconText>
          </TopBarDesktopLeft>

          <MobileTrustPilotBar role="presentation">
            <ExcellentLabel>{t("HEADER.TRUSTPILOT_EXCELLENT")}</ExcellentLabel>
            <StarsRow aria-hidden="true">
              {[1, 2, 3, 4, 5].map((i) => (
                <StarCell key={i}>★</StarCell>
              ))}
            </StarsRow>
            <TrustpilotWordmark>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fill="#00b67a"
                  d="M12 17.3l-6.2 3.7 1.6-7L2 9.2l7.2-.6L12 2l2.8 6.6 7.2.6-5.4 4.8 1.6 7z"
                />
              </svg>
              {t("HEADER.TRUSTPILOT_BRAND")}
            </TrustpilotWordmark>
          </MobileTrustPilotBar>

          <TopBarDesktopRight>
            <TopBarLanguageSlot>
              <Language />
            </TopBarLanguageSlot>
            <Login />
            <CartMenu isScrolled={isScrolled} />
          </TopBarDesktopRight>
        </TopHeaderWrapper>
      </TopHeaderSection>
      </PreHeaderStack>

      <Container $isScrolled={isScrolled}>
        <MainHeaderWrapper $isScrolled={isScrolled}>
          <Logo
            $isScrolled={isScrolled}
            {...(isScrolled ? { as: "div" } : { to: "/" })}
            aria-hidden={isScrolled}
            {...(!isScrolled && { "aria-label": t("HEADER.LOGO_HOME") })}
          >
            SNUSCO
          </Logo>

          <MobileHeaderTools
            ref={mainHeaderToolsRef}
            $mobileScrolled={isMobile && isScrolled}
          >
            <Search isScrolled={isScrolled} />
            {isMobile && <Login ref={loginRef} />}
            {(isScrolled || isMobile) && (
              <CartMenu isScrolled={isMobile || isScrolled} />
            )}
            {isMobile && (
              <MobileNavToolSlot>
                <MobileMenuButton
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label={t("HEADER.NAV_OPEN_MENU")}
                  aria-expanded={mobileNavOpen}
                >
                  <HamburgerBar />
                  <HamburgerBar />
                  <HamburgerBar />
                </MobileMenuButton>
                <MobileNavDrawer
                  isOpen={mobileNavOpen}
                  onClose={() => setMobileNavOpen(false)}
                  loginRef={loginRef}
                />
              </MobileNavToolSlot>
            )}
          </MobileHeaderTools>

          <DesktopNavSection ref={desktopNavListRef} $isScrolled={isScrolled}>
            <HeaderList isScrolled={isScrolled} />
          </DesktopNavSection>
        </MainHeaderWrapper>
      </Container>
    </>
  );
};

export default Header;
