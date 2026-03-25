import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";
import { languages } from "../../../utils/global_const";

const Mask = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--zindex-modal-background);
  background-color: rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
`;

const ItemContainer = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  width: 100%;
  overflow: visible;

  font-family: "Oswald-Medium";
  text-transform: uppercase;
  font-size: var(--header-link-size);
  font-weight: 500;
  justify-content: space-between;
  flex-direction: column;
  padding: 0;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: auto;
    min-height: 36px;
    box-sizing: border-box;
  }
`;

const Span = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--header-link-size);

  @media (min-width: 1024px) {
    line-height: 1;
  }
`;

const Picture = styled.picture`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
`;

const SVGArrow = styled.svg``;

const RadioContainer = styled.div`
  position: fixed;
  z-index: var(--zindex-popover);

  display: flex;
  flex-direction: column;
  align-items: stretch;

  font-family: "Montserrat", sans-serif;

  min-width: 200px;
  max-width: min(320px, calc(100vw - 24px));
  padding: 8px 0;
  margin: 0;

  background-color: var(--bg-100);
  border: 1px solid var(--bg-300);

  box-shadow: var(--shadow-large);
 
`;

const StyledLabel = styled.label`
  width: 94%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-family: "Montserrat", sans-serif;
  cursor: pointer;
  margin: 8px auto;
  font-size: var(--header-dropdown-link-size);
  gap: 12px;

  &:hover {
    color: var(--primary-200);
  }

  ${(props) =>
    props.$isSelected &&
    css`
      cursor: default;
      color: var(--text-100);

      &:hover {
        color: var(--text-100);
      }
    `}
`;

const TickIcon = styled.svg`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  fill: var(--text-100);
`;

const FlagTitleRadio = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--spacing-sm);
  max-width: 100%;
  font-family: "Montserrat", sans-serif;
`;

const DrawerRoot = styled.div`
  width: 100%;
`;

const DrawerTrigger = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background-color: #f5f5f5;
  color: #333;
  font-size: var(--header-dropdown-title-size);
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;

  &:active {
    background-color: #ebebeb;
  }
`;

const DrawerTriggerInner = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const HayppDrawerTrigger = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  color: #333;
  font-size: var(--header-dropdown-title-size);
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  box-sizing: border-box;

  &:active {
    background-color: #f5f5f5;
  }
`;

const FlagCircleWrap = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f0f0f0;
`;

const HayppFlagImg = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HayppTriggerLead = styled.span`
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  gap: 12px;
`;

const HayppRowArrow = styled.span`
  color: #001a57;
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  transform: ${(p) => (p.$open ? "rotate(90deg)" : "none")};
`;

const DrawerOptions = styled.div`
  background-color: ${(p) => (p.$onWhite ? "#fff" : "#ebebeb")};
  border-top: 1px solid #e0e0e0;
  padding: 4px 0 8px;
`;

const DrawerLangButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: "Montserrat", sans-serif;
  font-size: var(--header-dropdown-link-size);
  color: var(--text-100);
  text-align: left;

  &:hover {
    color: var(--primary-200);
  }

  ${(props) =>
    props.$isSelected &&
    css`
      cursor: default;
      color: var(--text-100);
      &:hover {
        color: var(--text-100);
      }
    `}
`;

/**
 * @param {object} props
 * @param {boolean} [props.embedInDrawer]
 * @param {'default' | 'hayppRow'} [props.embedVariant] — hayppRow: region label, round flag, → (mobile drawer footer)
 */
const Language = ({ embedInDrawer = false, embedVariant = "default" }) => {
  const { i18n, t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);

  const [currentLang, setCurrentLang] = useState(
    languages.find(
      (lang) => lang.code.toLowerCase() === i18n.language.toLowerCase()
    ) || languages[0]
  );

  useEffect(() => {
    const foundLang = languages.find(
      (lang) => lang.code.toLowerCase() === i18n.language.toLowerCase()
    );
    setCurrentLang(foundLang || languages[0]);
  }, [i18n.language]);

  const updateDropdownPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 6,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  };

  useLayoutEffect(() => {
    if (embedInDrawer || !showMenu) return;

    updateDropdownPosition();

    const onScrollOrResize = () => updateDropdownPosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [showMenu, embedInDrawer]);

  const toggleMenu = () => {
    setShowMenu((open) => !open);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang.code);
    setCurrentLang(lang);
    setShowMenu(false);

    const currentUrl = window.location.pathname;
    const urlSegments = currentUrl.split("/").filter((segment) => segment);

    const newUrlSegments = urlSegments.filter(
      (segment) =>
        !languages.some(
          (language) => language.code.toLowerCase() === segment.toLowerCase()
        )
    );

    newUrlSegments.unshift(lang.code.toLowerCase());

    const newUrl = `/${newUrlSegments.join("/")}`;

    window.history.pushState({}, "", newUrl);
  };

  const portal =
    !embedInDrawer &&
    showMenu &&
    typeof document !== "undefined"
      ? createPortal(
          <>
            <Mask onClick={toggleMenu} aria-hidden="true" />
            <RadioContainer
              role="listbox"
              aria-label="Choose language"
              style={{
                top: dropdownPos.top,
                right: dropdownPos.right,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {languages.map((lang) => {
                const isSelected =
                  currentLang &&
                  lang.code.toLowerCase() ===
                    currentLang.code.toLowerCase();

                return (
                  <StyledLabel
                    key={lang.code}
                    $isSelected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLanguageChange(lang);
                    }}
                  >
                    <FlagTitleRadio>
                      <Picture>
                        <Image
                          width={20}
                          height={20}
                          src={lang.flag}
                          alt={`${lang.code} flag`}
                        />
                      </Picture>
                      {lang.label}
                    </FlagTitleRadio>
                    {isSelected && (
                      <TickIcon
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z" />
                      </TickIcon>
                    )}
                  </StyledLabel>
                );
              })}
            </RadioContainer>
          </>,
          document.body
        )
      : null;

  if (embedInDrawer && currentLang) {
    const regionLabel =
      "regionLabel" in currentLang && currentLang.regionLabel
        ? currentLang.regionLabel
        : currentLang.label;

    if (embedVariant === "hayppRow") {
      return (
        <DrawerRoot>
          <HayppDrawerTrigger
            ref={triggerRef}
            type="button"
            onClick={toggleMenu}
            aria-expanded={showMenu}
            aria-haspopup="listbox"
            aria-label={t("HEADER.LANGUAGE")}
          >
            <HayppTriggerLead>
              <FlagCircleWrap>
                <HayppFlagImg
                  src={currentLang.flag}
                  alt=""
                  loading="lazy"
                  width={26}
                  height={26}
                />
              </FlagCircleWrap>
              <span>{regionLabel}</span>
            </HayppTriggerLead>
            <HayppRowArrow aria-hidden="true" $open={showMenu}>
              →
            </HayppRowArrow>
          </HayppDrawerTrigger>
          {showMenu && (
            <DrawerOptions
              $onWhite
              role="listbox"
              aria-label={t("HEADER.LANGUAGE")}
            >
              {languages.map((lang) => {
                const isSelected =
                  currentLang &&
                  lang.code.toLowerCase() === currentLang.code.toLowerCase();
                const rowLabel =
                  "regionLabel" in lang && lang.regionLabel
                    ? lang.regionLabel
                    : lang.label;
                return (
                  <DrawerLangButton
                    key={lang.code}
                    type="button"
                    $isSelected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLanguageChange(lang);
                    }}
                  >
                    <FlagTitleRadio>
                      <FlagCircleWrap>
                        <HayppFlagImg
                          src={lang.flag}
                          alt={`${lang.code} flag`}
                          width={26}
                          height={26}
                        />
                      </FlagCircleWrap>
                      {rowLabel}
                    </FlagTitleRadio>
                    {isSelected && (
                      <TickIcon
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z" />
                      </TickIcon>
                    )}
                  </DrawerLangButton>
                );
              })}
            </DrawerOptions>
          )}
        </DrawerRoot>
      );
    }

    return (
      <DrawerRoot>
        <DrawerTrigger
          ref={triggerRef}
          type="button"
          onClick={toggleMenu}
          aria-expanded={showMenu}
          aria-haspopup="listbox"
        >
          <DrawerTriggerInner>
            <Picture>
              <Image
                width={20}
                height={20}
                src={currentLang.flag}
                alt=""
                loading="lazy"
              />
            </Picture>
            <span>{t("HEADER.LANGUAGE")}</span>
          </DrawerTriggerInner>
          <SVGArrow
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={showMenu ? { transform: "rotate(180deg)" } : {}}
          >
            <path
              d="M-0.000325203 0.333496L4.66634 5.66683L9.33301 0.333496L-0.000325203 0.333496Z"
              fill="var(--text-color)"
            />
          </SVGArrow>
        </DrawerTrigger>
        {showMenu && (
          <DrawerOptions role="listbox" aria-label={t("HEADER.LANGUAGE")}>
            {languages.map((lang) => {
              const isSelected =
                currentLang &&
                lang.code.toLowerCase() === currentLang.code.toLowerCase();
              return (
                <DrawerLangButton
                  key={lang.code}
                  type="button"
                  $isSelected={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLanguageChange(lang);
                  }}
                >
                  <FlagTitleRadio>
                    <Picture>
                      <Image
                        width={20}
                        height={20}
                        src={lang.flag}
                        alt={`${lang.code} flag`}
                      />
                    </Picture>
                    {lang.label}
                  </FlagTitleRadio>
                  {isSelected && (
                    <TickIcon
                      viewBox="0 0 1024 1024"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z" />
                    </TickIcon>
                  )}
                </DrawerLangButton>
              );
            })}
          </DrawerOptions>
        )}
      </DrawerRoot>
    );
  }

  return (
    <>
      {portal}
      {currentLang && (
        <ItemContainer ref={triggerRef} onClick={toggleMenu}>
          <Span>
            <Picture>
              <Image
                width={20}
                height={20}
                src={currentLang.flag}
                alt={`${currentLang.code}`}
                loading="lazy"
              />
            </Picture>
            {currentLang.code}
          </Span>
          <SVGArrow
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={showMenu ? { transform: "rotate(180deg)" } : {}}
          >
            <path
              d="M-0.000325203 0.333496L4.66634 5.66683L9.33301 0.333496L-0.000325203 0.333496Z"
              fill="var(--text-color)"
            />
          </SVGArrow>
        </ItemContainer>
      )}
    </>
  );
};

export default Language;
