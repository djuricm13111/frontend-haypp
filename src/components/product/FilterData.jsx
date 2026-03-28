import { useContext, useMemo, useRef, useState } from "react";
import FilterSection from "./FilterSection";
import styled from "styled-components";
import { ProductContext } from "../../context/ProductContext";
import { useTranslation } from "react-i18next";
import { getPresentFlavorGroupIds } from "../../utils/flavorGroups";

const FilterContainer = styled.div`
  padding: 20px 0;
  width: 94%;
  margin: 0 auto;
  @media (max-width: 767px) {
    width: 100%;
    padding: 8px 14px 12px;
    margin: 0;
    box-sizing: border-box;
  }
`;

const Button = styled.button`
  background-color: transparent;
  color: var(--text-100);
  border: none;
  border-radius: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--font-size-base);
  &:hover {
    background-color: transparent;
    svg {
      transform: translateX(10px);
      transition: transform 0.2s ease;
    }
  }
  svg {
    transition: transform 0.2s ease;
  }
`;

const MobileRoot = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const DesktopRoot = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
`;

const DesktopTriggerRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
`;

const DropdownSlot = styled.div`
  position: relative;
`;

const shopControlBg = "var(--bg-300)";
const shopControlBorder = "#cfcfcf";
const shopControlBorderHover = "#b0b0b0";
const shopControlBgHover = "#e4e4e4";

const DesktopTrigger = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--font-size-base);
  color: var(--text-100);
  background-color: ${shopControlBg};
  border: 1px solid
    ${(props) => (props.$active ? "var(--primary-100)" : shopControlBorder)};
  border-radius: 0;
  transition: border-color 0.18s ease, box-shadow 0.18s ease,
    background-color 0.18s ease;
  white-space: nowrap;

  ${(props) =>
    props.$active &&
    `
    box-shadow: 0 0 0 1px var(--primary-100);
    background-color: var(--bg-200);
  `}

  &:hover {
    border-color: ${(props) =>
      props.$active ? "var(--primary-100)" : shopControlBorderHover};
    background-color: ${(props) =>
      props.$active ? "var(--bg-200)" : shopControlBgHover};
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
`;

const Chevron = styled.svg`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--text-200);
  transition: transform 0.2s ease;
  transform: rotate(${(props) => (props.$open ? "180deg" : "0deg")});
`;

const FilterData = ({
  toggleMenu,
  variant = "mobile",
  onActiveFilterCountChange,
}) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const { category, products } = useContext(ProductContext);

  const hasFlavorOptions = useMemo(
    () => getPresentFlavorGroupIds(products).length > 0,
    [products]
  );

  const brandRef = useRef(null);
  const formatRef = useRef(null);
  const flavorRef = useRef(null);
  const nicotineRef = useRef(null);

  const activeAnchorRef =
    showFilters === "brand"
      ? brandRef
      : showFilters === "format"
      ? formatRef
      : showFilters === "flavor"
      ? flavorRef
      : showFilters === "nicotine"
      ? nicotineRef
      : null;

  if (variant === "desktop") {
    return (
      <DesktopRoot>
        <DesktopTriggerRow>
          {!category && (
            <DropdownSlot ref={brandRef}>
              <DesktopTrigger
                type="button"
                $active={showFilters === "brand"}
                onClick={() =>
                  setShowFilters((s) => (s === "brand" ? false : "brand"))
                }
              >
                {t("FILTER.BRAND")}
                <Chevron $open={showFilters === "brand"} viewBox="0 0 24 24">
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </Chevron>
              </DesktopTrigger>
            </DropdownSlot>
          )}
          <DropdownSlot ref={formatRef}>
            <DesktopTrigger
              type="button"
              $active={showFilters === "format"}
              onClick={() =>
                setShowFilters((s) => (s === "format" ? false : "format"))
              }
            >
              {t("FILTER.FORMAT")}
              <Chevron $open={showFilters === "format"} viewBox="0 0 24 24">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </Chevron>
            </DesktopTrigger>
          </DropdownSlot>
          {hasFlavorOptions && (
            <DropdownSlot ref={flavorRef}>
              <DesktopTrigger
                type="button"
                $active={showFilters === "flavor"}
                onClick={() =>
                  setShowFilters((s) => (s === "flavor" ? false : "flavor"))
                }
              >
                {t("FILTER.FLAVOUR")}
                <Chevron $open={showFilters === "flavor"} viewBox="0 0 24 24">
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </Chevron>
              </DesktopTrigger>
            </DropdownSlot>
          )}
          <DropdownSlot ref={nicotineRef}>
            <DesktopTrigger
              type="button"
              $active={showFilters === "nicotine"}
              onClick={() =>
                setShowFilters((s) => (s === "nicotine" ? false : "nicotine"))
              }
            >
              {t("FILTER.STRENGTH")}
              <Chevron $open={showFilters === "nicotine"} viewBox="0 0 24 24">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </Chevron>
            </DesktopTrigger>
          </DropdownSlot>
        </DesktopTriggerRow>

        <FilterSection
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          toggleMenu={toggleMenu}
          variant="desktop"
          anchorRef={activeAnchorRef}
        />
      </DesktopRoot>
    );
  }

  return (
    <MobileRoot>
      <FilterContainer>
        {!category && (
          <Button type="button" onClick={() => setShowFilters("brand")}>
            {t("FILTER.BRAND")}
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 1024 1024"
              className="icon"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
                fill="var(--text-100)"
              />
            </svg>
          </Button>
        )}
        <Button type="button" onClick={() => setShowFilters("format")}>
          {t("FILTER.FORMAT")}
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 1024 1024"
            className="icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
              fill="var(--text-100)"
            />
          </svg>
        </Button>
        {hasFlavorOptions && (
          <Button type="button" onClick={() => setShowFilters("flavor")}>
            {t("FILTER.FLAVOUR")}
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 1024 1024"
              className="icon"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
                fill="var(--text-100)"
              />
            </svg>
          </Button>
        )}
        <Button type="button" onClick={() => setShowFilters("nicotine")}>
          {t("FILTER.STRENGTH")}
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 1024 1024"
            className="icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z"
              fill="var(--text-100)"
            />
          </svg>
        </Button>
      </FilterContainer>

      <FilterSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        toggleMenu={toggleMenu}
        variant="mobile"
        onActiveFilterCountChange={onActiveFilterCountChange}
      />
    </MobileRoot>
  );
};

export default FilterData;
