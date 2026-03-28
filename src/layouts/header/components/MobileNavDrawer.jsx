import { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useNavigation } from "../../../utils/navigation";
import Language from "./Language";
import { navItems, buildDropdownData } from "./HeaderList";

const PANEL_TRANSITION = "transform 0.28s ease";
const BACKDROP_TRANSITION = "opacity 0.28s ease";

/* $visible = isOpen || entered: dim odmah pri otvaranju, ne čekati entered (2× rAF). */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--zindex-modal-background);
  background-color: rgba(0, 0, 0, 0.45);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: ${BACKDROP_TRANSITION};
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
`;

const Panel = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--zindex-modal);
  width: min(95vw, 361px);
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  transform: translateX(${(props) => (props.$visible ? "0" : "-100%")});
  transition: ${PANEL_TRANSITION};
  font-family: "Montserrat", sans-serif;
  will-change: transform;
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  background-color: #001a57;
  color: #fff;
  padding: 12px 14px;
  gap: 8px;
`;

const DrawerTitle = styled.h2`
  margin: 0;
  font-size: var(--header-dropdown-heading-size);
  font-weight: 700;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  color:var(--bg-100);
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: -8px -8px -8px 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

const BackHeaderButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: -8px 0 -8px -8px;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
`;

const ScrollBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const NavRow = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px 20px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background-color: ${(props) => props.$surface ?? "#f5f5f5"};
  color: var(--text-100);
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;

  &:active {
    background-color: #ebebeb;
  }
`;

const SubNavRow = styled.a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background-color: ${(props) => props.$surface ?? "#f5f5f5"};
  color: #333;
  font-size: var(--header-dropdown-link-size);
  font-weight: ${(props) => (props.$isSection ? 600 : 400)};
  text-align: left;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  text-decoration: none;
  box-sizing: border-box;

  &:active {
    background-color: #ebebeb;
  }
`;

const RowArrow = styled.span`
  color: var(--primary-200);
  font-size: 18px;
  line-height: 1;
`;

const OtherSectionTitle = styled.div`
  padding: 14px 16px 12px;
  font-size: var(--header-dropdown-heading-size);
  font-weight: 700;
  color: #111;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  font-family: "Montserrat", sans-serif;
`;

const OtherAccountIconSlot = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: #333;
`;

const OtherAccountButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  color: var(--text-100);
  font-size: var(--header-dropdown-link-size);
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  box-sizing: border-box;

  &:active {
    background-color: #f5f5f5;
  }
`;

const OtherAccountLabel = styled.span`
  flex: 0 1 auto;
  text-align: left;
`;

const DrawerLogoDock = styled.div`
  flex-shrink: 0;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
  padding-bottom: env(safe-area-inset-bottom, 0px);
`;

const FooterLogo = styled.div`
  padding: 24px 16px 20px;
  text-align: center;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #001a57;
  font-family: "Montserrat", sans-serif;
  background-color: #fff;
`;

const BreadcrumbBar = styled.div`
  padding: 10px 16px;
  background-color: #e8eaf0;
  color: #001a57;
  font-size: var(--header-dropdown-title-size);
  font-weight: 500;
  line-height: 1.35;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  font-family: "Montserrat", sans-serif;
`;

const ShowAllRow = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background-color: #dfe1ea;
  color: #111;
  font-size: var(--header-dropdown-link-size);
  font-weight: 700;
  text-align: left;
  text-decoration: underline;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  line-height: 1.35;

  &:active {
    background-color: #d0d3de;
  }
`;

const LeafLinkRow = styled.a`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background-color: ${(props) => props.$surface ?? "#fff"};
  color: #333;
  font-size: var(--header-dropdown-link-size);
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  text-decoration: none;
  box-sizing: border-box;

  &:active {
    background-color: #f5f5f5;
  }
`;

/** @type {Record<number, 'first' | 'second'>} */
const NAV_INDEX_TO_SUB = {
  0: "first",
  6: "second",
};

function UserOutlineIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {React.RefObject<{ open: () => void } | null>} props.loginRef
 */
const MobileNavDrawer = ({ isOpen, onClose, loginRef }) => {
  const { t, i18n } = useTranslation();
  const lang =
    i18n.language?.split("-")[0]?.toLowerCase() === "de" ? "de" : "en";
  const shopBase = `/${lang}/snus-verkauf`;
  const dropdownData = useMemo(() => buildDropdownData(shopBase), [shopBase]);

  const navigate = useNavigate();
  const { goToCategory } = useNavigation();

  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [navState, setNavState] = useState(
    /** @type {null | { view: 'first' } | { view: 'firstDrill', sectionIndex: number } | { view: 'second' }} */
    (null)
  );

  const goBackNav = useCallback(() => {
    setNavState((prev) => {
      if (!prev) return null;
      if (prev.view === "firstDrill") return { view: "first" };
      return null;
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setNavState(null);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setEntered(false);
  }, [isOpen]);

  const handlePanelTransitionEnd = useCallback(
    (e) => {
      if (e.propertyName !== "transform") return;
      if (!isOpen) {
        setMounted(false);
        setNavState(null);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (!mounted) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (navState) {
        goBackNav();
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, navState, onClose, goBackNav]);

  const handleNav = (label) => {
    navigate(goToCategory(label));
    onClose();
  };

  const handleLoginClick = () => {
    onClose();
    window.setTimeout(() => {
      loginRef?.current?.open?.();
    }, 0);
  };

  const openSub = (key) => {
    if (key === "first") setNavState({ view: "first" });
    if (key === "second") setNavState({ view: "second" });
  };

  const goSubLink = (href) => {
    navigate(href);
    onClose();
  };

  const secondRows = dropdownData.second.map((row) => ({
    kind: "section",
    label: row.title,
    href: row.href,
  }));

  if (!mounted || typeof document === "undefined") return null;

  const showMainList = !navState;
  const subTitle =
    navState?.view === "firstDrill" && dropdownData.first[navState.sectionIndex]
      ? dropdownData.first[navState.sectionIndex].title
      : navState?.view === "first"
        ? navItems[0]
        : navState?.view === "second"
          ? navItems[6]
          : "";

  const renderCategoryList = () => (
    <>
      {navItems.map((item, index) => {
        const subKey = NAV_INDEX_TO_SUB[index];
        if (subKey) {
          return (
            <NavRow
              key={item}
              type="button"
              onClick={() => openSub(subKey)}
            >
              <span>{item}</span>
              <RowArrow aria-hidden="true">→</RowArrow>
            </NavRow>
          );
        }
        return (
          <NavRow
            key={item}
            type="button"
            onClick={() => handleNav(item)}
          >
            <span>{item}</span>
          </NavRow>
        );
      })}
    </>
  );

  const renderOtherBelowCategories = () => (
    <>
      <OtherSectionTitle>
        {t("HEADER.MOBILE_NAV_OTHER")}
      </OtherSectionTitle>
      <OtherAccountButton
        type="button"
        onClick={handleLoginClick}
      >
        <OtherAccountIconSlot>
          <UserOutlineIcon />
        </OtherAccountIconSlot>
        <OtherAccountLabel>{t("MENU.MY_ACCOUNT")}</OtherAccountLabel>
      </OtherAccountButton>
      <Language embedInDrawer embedVariant="hayppRow" />
    </>
  );

  const renderFirstRoot = () => {
    const rootTitle = t("HEADER.NICOTINE_POUCHES");
    const rootCategoryHref = goToCategory(navItems[0]);
    return (
      <>
        <BreadcrumbBar>{rootTitle}</BreadcrumbBar>
        <ShowAllRow
          type="button"
          onClick={() => goSubLink(rootCategoryHref)}
        >
          {t("HEADER.MOBILE_SHOW_ALL_IN", { name: rootTitle })}
        </ShowAllRow>
        {dropdownData.first.map((section, i) => {
          const hasNested = Boolean(section.items?.length);
          const surface = i % 2 === 0 ? "#fff" : "#f5f5f5";
          if (hasNested) {
            return (
              <NavRow
                key={`${section.href}-${i}`}
                type="button"
                $surface={surface}
                onClick={() =>
                  setNavState({ view: "firstDrill", sectionIndex: i })
                }
              >
                <span>{section.title}</span>
                <RowArrow aria-hidden="true">→</RowArrow>
              </NavRow>
            );
          }
          return (
            <SubNavRow
              key={`${section.href}-${i}`}
              href={section.href}
              $isSection
              $surface={surface}
              onClick={(e) => {
                e.preventDefault();
                goSubLink(section.href);
              }}
            >
              <span>{section.title}</span>
            </SubNavRow>
          );
        })}
      </>
    );
  };

  const renderFirstDrill = (sectionIndex) => {
    const section = dropdownData.first[sectionIndex];
    if (!section?.items?.length) return null;
    const parentTitle = navItems[0];
    return (
      <>
        <BreadcrumbBar>
          {t("HEADER.MOBILE_NAV_SUBPATH", {
            parent: parentTitle,
            child: section.title,
          })}
        </BreadcrumbBar>
        <ShowAllRow
          type="button"
          onClick={() => goSubLink(section.href)}
        >
          {t("HEADER.MOBILE_SHOW_ALL_IN", { name: section.title })}
        </ShowAllRow>
        {section.items.map((item, j) => (
          <LeafLinkRow
            key={`${item.href}-${j}`}
            href={item.href}
            $surface={j % 2 === 0 ? "#fff" : "#f5f5f5"}
            onClick={(e) => {
              e.preventDefault();
              goSubLink(item.href);
            }}
          >
            {item.label}
          </LeafLinkRow>
        ))}
      </>
    );
  };

  const renderSecondList = () => (
    <>
      <BreadcrumbBar>{navItems[6]}</BreadcrumbBar>
      {secondRows.map((row, i) => (
        <SubNavRow
          key={`${row.kind}-${row.label}-${i}`}
          href={row.href}
          $isSection={row.kind === "section"}
          $surface={i % 2 === 0 ? "#fff" : "#f5f5f5"}
          onClick={(e) => {
            e.preventDefault();
            goSubLink(row.href);
          }}
        >
          <span>{row.label}</span>
        </SubNavRow>
      ))}
    </>
  );

  const renderSubList = () => {
    if (!navState) return null;
    if (navState.view === "first") return renderFirstRoot();
    if (navState.view === "firstDrill")
      return renderFirstDrill(navState.sectionIndex);
    if (navState.view === "second") return renderSecondList();
    return null;
  };

  return createPortal(
    <>
      <Backdrop
        $visible={isOpen || entered}
        onClick={navState ? goBackNav : onClose}
        aria-hidden="true"
      />
      <Panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title"
        $visible={entered}
        onTransitionEnd={handlePanelTransitionEnd}
      >
        <DrawerHeader>
          {navState ? (
            <>
              <BackHeaderButton
                type="button"
                onClick={goBackNav}
                aria-label={t("HEADER.GO_BACK")}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </BackHeaderButton>
              <DrawerTitle id="mobile-nav-title">{subTitle}</DrawerTitle>
              <IconButton
                type="button"
                onClick={onClose}
                aria-label={t("HEADER.CLOSE_MENU")}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </IconButton>
            </>
          ) : (
            <>
              <DrawerTitle id="mobile-nav-title">
                {t("HEADER.PRODUCT_CATEGORIES")}
              </DrawerTitle>
              <IconButton
                type="button"
                onClick={onClose}
                aria-label={t("HEADER.CLOSE_MENU")}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </IconButton>
            </>
          )}
        </DrawerHeader>

        <ScrollBody>
          {showMainList ? (
            <>
              {renderCategoryList()}
              {renderOtherBelowCategories()}
            </>
          ) : (
            renderSubList()
          )}
        </ScrollBody>
        {showMainList && (
          <DrawerLogoDock>
            <FooterLogo>SNUSCO</FooterLogo>
          </DrawerLogoDock>
        )}
      </Panel>
    </>,
    document.body
  );
};

export default MobileNavDrawer;
