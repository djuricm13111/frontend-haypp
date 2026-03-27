import React, { useEffect, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import FilterData from "./FilterData";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const slideInFromRight = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;
const slideOutRight = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

const Container = styled.div`
  margin-top: var(--spacing-xxs);
  background-color: transparent;
  position: fixed;
  left: 0;
  top: 0;
  z-index: var(--zindex-default);
  min-width: 100%;
  height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  transition: opacity 300ms ease-in-out;
  visibility: ${(props) => (props.$shouldBeVisible ? "visible" : "hidden")};
  z-index: 9999;
  background-color: #00000028;
`;

const Wrapper = styled.div`
  background-color: var(--bg-100);
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  ${({ $isOpen }) =>
    $isOpen
      ? css`
          animation: ${slideInFromRight} 0.5s ease-out forwards;
        `
      : css`
          animation: ${slideOutRight} 0.2s ease-in forwards;
        `}
  @media (min-width: 768px) {
    max-width: var(--sidebar-width);
  }
  overflow: auto;
`;

const IconContainer = styled.div`
  text-align: center;
  @media (min-width: 768px) {
    text-align: left;
  }
`;

/* Mobilni okidač — usklađen sa ShopSort dugmetom */
const FilterTrigger = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--font-size-base);
  color: var(--text-100);
  background-color: var(--bg-100);
  border: 1px solid var(--bg-300);
  border-radius: 10px;
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    background-color 0.2s ease;

  ${(props) =>
    props.$isOpen &&
    css`
      border-color: var(--primary-100);
      box-shadow: 0 0 0 1px var(--primary-100);
    `}

  ${(props) =>
    props.$hasActiveFilters &&
    css`
      border-color: var(--primary-100);
      box-shadow: 0 0 0 1px var(--primary-100);
    `}

  &:hover {
    border-color: var(--text-200);
    background-color: var(--bg-200);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: var(--bg-200);
  transition: background-color 0.2s ease;
  ${FilterTrigger}:hover & {
    background-color: var(--bg-300);
  }
`;

const FilterChevron = styled.svg`
  width: 18px;
  height: 18px;
  color: var(--text-100);
  transition: transform 0.22s ease;
  transform: rotate(${(props) => (props.$isOpen ? "180deg" : "0deg")});
`;

const PanelHeaderTitle = styled.span`
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-100);
`;

const XDiv = styled.div`
  padding: 0 0 0 var(--spacing-md);
  cursor: pointer;
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--bg-200);
  & > :first-child {
    margin-left: auto;
  }
  & > :last-child {
    margin-left: auto;
  }
`;

const SvgContainer = styled.div`
  height: var(--navbar-height);
  width: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-100);
`;

const XRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const MiddleDiv = styled.div``;

const SelectedFilterNumber = styled.div`
  position: absolute;
  right: 44px;
  top: 4px;
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

  const totalSelectedFilters = 0;

  if (isDesktop) {
    return (
      <FilterData variant="desktop" toggleMenu={() => {}} />
    );
  }

  return (
    <>
      <FilterTrigger
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        $isOpen={isOpen}
        $hasActiveFilters={totalSelectedFilters > 0}
      >
        <FilterTriggerMain>
          <FilterTriggerHint>{t("FILTER.TITLE")}</FilterTriggerHint>
          <FilterTriggerValue>{t("FILTER.TRIGGER_SUBTITLE")}</FilterTriggerValue>
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
      <div>
        <IconContainer></IconContainer>
        <Container
          onClick={toggleMenu}
          $isOpen={isOpen}
          $shouldBeVisible={shouldBeVisible}
        >
          <Wrapper
            $isOpen={isOpen}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <XDiv>
              <PanelHeaderTitle>{t("FILTER.SELECTED_FILTERS")}</PanelHeaderTitle>
              <XRight>
                <SvgContainer>
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={toggleMenu}
                  >
                    <path
                      fill="var(--text-200)"
                      d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"
                    />
                  </svg>
                </SvgContainer>
              </XRight>
            </XDiv>
            <MiddleDiv>
              <FilterData variant="mobile" toggleMenu={toggleMenu} />
            </MiddleDiv>
          </Wrapper>
        </Container>
      </div>
    </>
  );
};

export default Filter;
