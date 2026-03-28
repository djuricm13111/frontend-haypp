import React, { useEffect, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import FilterData from "./FilterData";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "../../hooks/useMediaQuery";

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

/** Samo padding — bez pozadine; senka je na samom dugmetu. */
const MobileFilterDock = styled.div`
  @media (max-width: 767px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: calc(var(--zindex-sticky) - 1);
    padding: 12px 14px;
    padding-bottom: max(12px, env(safe-area-inset-bottom, 0px));
    background: transparent;
    box-sizing: border-box;
    pointer-events: none;
    & > * {
      pointer-events: auto;
    }
  }
  @media (min-width: 768px) {
    display: contents;
  }
`;

const Container = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  z-index: var(--zindex-fixed);
  min-width: 100%;
  height: 100vh;
  height: 100dvh;
  box-sizing: border-box;
  overflow-x: hidden;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  transition: opacity 400ms ease-in-out;
  visibility: ${(props) => (props.$shouldBeVisible ? "visible" : "hidden")};
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background-color: #0000003a;
`;

const Wrapper = styled.div`
  z-index: calc(var(--zindex-fixed) + 1);
  background-color: var(--bg-100);
  box-sizing: border-box;
  width: 90%;
  max-width: min(90vw, 100%);
  height: 100%;
  max-height: 100dvh;
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateX(100%);
  visibility: ${(props) => (props.$shouldBeVisible ? "visible" : "hidden")};
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  ${({ $isOpen }) =>
    $isOpen
      ? css`
          animation: ${slideIn} 0.4s ease-out forwards;
        `
      : css`
          animation: ${slideOut} 0.12s ease-in forwards;
        `}

  @media (min-width: 768px) {
    width: 100%;
    max-width: var(--sidebar-width);
    box-shadow: var(--shadow-large);
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  min-height: var(--navbar-height);
  padding: 0 8px 0 4px;
  background-color: var(--primary-100);
  color: var(--bg-100);
  flex-shrink: 0;
`;

const CloseBtn = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  cursor: pointer;
  box-sizing: border-box;
  &:focus-visible {
    outline: 2px solid var(--bg-100);
    outline-offset: -4px;
  }
`;

const PanelTitle = styled.div`
  flex: 1;
  text-align: center;
  padding-right: 40px;
  font-family: "Montserrat", sans-serif;
  font-size: var(--header-dropdown-heading-size);
  font-weight: 400;
  color: var(--bg-100);
  letter-spacing: -0.02em;
`;

const ScrollBody = styled.div`
  flex: 1 1 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
  display: flex;
  flex-direction: column;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--text-200);
    border-radius: 4px;
  }
`;

/* Plutajuća kartica — senka ispod, stranica ostaje „vazdušna“. */
const FilterTrigger = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--font-size-base);
  color: var(--text-100);
  background-color: var(--bg-100);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 12px 28px rgba(0, 0, 0, 0.12);
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    transform 0.2s ease;

  ${(props) =>
    props.$isOpen &&
    css`
      border-color: var(--primary-100);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.06), 0 14px 32px rgba(0, 0, 0, 0.14),
        0 0 0 1px var(--primary-100);
    `}

  ${(props) =>
    props.$hasActiveFilters &&
    !props.$isOpen &&
    css`
      border-color: rgba(0, 80, 120, 0.35);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.06), 0 12px 28px rgba(0, 0, 0, 0.12),
        0 0 0 1px var(--primary-100);
    `}

  &:hover {
    border-color: ${(props) =>
      props.$isOpen || props.$hasActiveFilters
        ? "var(--primary-100)"
        : "rgba(0, 0, 0, 0.12)"};
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.07), 0 16px 36px rgba(0, 0, 0, 0.14);
  }

  &:active {
    transform: scale(0.995);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 3px;
  }
`;

const FilterTriggerMain = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  flex: 1;
  text-align: left;
`;

const FilterTriggerHint = styled.span`
  font-size: var(--font-size-small, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-200);
  line-height: 1.2;
`;

const FilterTriggerValue = styled.span`
  font-weight: 500;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  color: var(--text-100);
`;

const FilterChevronWrap = styled.span`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  transition: background-color 0.18s ease;
  ${FilterTrigger}:hover & {
    background-color: rgba(0, 0, 0, 0.09);
  }
`;

const FilterChevron = styled.svg`
  width: 18px;
  height: 18px;
  color: var(--text-100);
  transition: transform 0.22s ease;
  transform: rotate(${(props) => (props.$isOpen ? "180deg" : "0deg")});
`;

const SelectedFilterNumber = styled.div`
  position: absolute;
  right: 54px;
  top: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  padding: 2px;
  background-color: var(--primary-100);
  font-size: var(--font-size-small);
  color: var(--bg-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const Filter = () => {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const [shouldBeVisible, setShouldBeVisible] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShouldBeVisible(true);
    } else {
      const timer = setTimeout(() => {
        setShouldBeVisible(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const totalSelectedFilters = activeFilterCount;

  if (isDesktop) {
    return <FilterData variant="desktop" toggleMenu={() => {}} />;
  }

  return (
    <>
      <MobileFilterDock>
        <FilterTrigger
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          $isOpen={isOpen}
          $hasActiveFilters={totalSelectedFilters > 0}
        >
          <FilterTriggerMain>
            <FilterTriggerHint>{t("FILTER.TITLE")}</FilterTriggerHint>
            <FilterTriggerValue>
              {t("FILTER.TRIGGER_SUBTITLE")}
            </FilterTriggerValue>
          </FilterTriggerMain>
          {totalSelectedFilters > 0 && (
            <SelectedFilterNumber>
              {totalSelectedFilters > 10
                ? totalSelectedFilters
                : `0${totalSelectedFilters}`}
            </SelectedFilterNumber>
          )}
          <FilterChevronWrap>
            <FilterChevron
              $isOpen={isOpen}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </FilterChevron>
          </FilterChevronWrap>
        </FilterTrigger>
      </MobileFilterDock>

      <Container
        onClick={toggleMenu}
        $isOpen={isOpen}
        $shouldBeVisible={shouldBeVisible}
      >
        <Backdrop aria-hidden />
        <Wrapper
          $isOpen={isOpen}
          $shouldBeVisible={shouldBeVisible}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <PanelHeader>
            <CloseBtn
              type="button"
              onClick={toggleMenu}
              aria-label={t("HEADER.CLOSE_MENU")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  stroke="var(--bg-100)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  stroke="var(--bg-100)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </CloseBtn>
            <PanelTitle>{t("FILTER.TITLE")}</PanelTitle>
          </PanelHeader>
          <ScrollBody>
            <FilterData
              variant="mobile"
              toggleMenu={toggleMenu}
              onActiveFilterCountChange={setActiveFilterCount}
            />
          </ScrollBody>
        </Wrapper>
      </Container>
    </>
  );
};

export default Filter;
