import styled, { css } from "styled-components";
import { useState, useEffect, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ProductContext,
  sortProductList,
  productSortKey,
} from "../../context/ProductContext";

function sameProductOrder(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return false;
  return a.every((p, i) => productSortKey(p) === productSortKey(b[i]));
}

const Root = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  position: relative;
  box-sizing: border-box;
`;

const SortTrigger = styled.button`
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
  background-color: var(--bg-300);
  border: 1px solid #cfcfcf;
  border-radius: 0;
  transition: border-color 0.18s ease, box-shadow 0.18s ease,
    background-color 0.18s ease;

  ${(props) =>
    props.$isOpen &&
    css`
      border-color: var(--primary-100);
      box-shadow: 0 0 0 1px var(--primary-100);
      background-color: var(--bg-200);
    `}

  &:hover {
    border-color: ${(props) =>
      props.$isOpen ? "var(--primary-100)" : "#b0b0b0"};
    background-color: ${(props) =>
      props.$isOpen ? "var(--bg-200)" : "#e4e4e4"};
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    min-height: 52px;
    padding: 14px 16px;
    gap: 12px;
    border-radius: 14px;
    background-color: var(--bg-100);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 8px 22px rgba(0, 0, 0, 0.09);
    transition: border-color 0.2s ease, box-shadow 0.2s ease,
      background-color 0.18s ease, transform 0.2s ease;

    ${(props) =>
      props.$isOpen &&
      css`
        border-color: var(--primary-100);
        background-color: var(--bg-100);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.06), 0 14px 32px rgba(0, 0, 0, 0.14),
          0 0 0 1px var(--primary-100);
      `}

    &:hover {
      border-color: ${(props) =>
        props.$isOpen ? "var(--primary-100)" : "rgba(0, 0, 0, 0.12)"};
      background-color: var(--bg-100);
      box-shadow: ${(props) =>
        props.$isOpen
          ? "0 4px 6px rgba(0, 0, 0, 0.06), 0 14px 32px rgba(0, 0, 0, 0.14), 0 0 0 1px var(--primary-100)"
          : "0 4px 8px rgba(0, 0, 0, 0.06), 0 12px 28px rgba(0, 0, 0, 0.11)"};
    }

    &:active {
      transform: scale(0.995);
    }
  }
`;

const SortTriggerMain = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  flex: 1;
  text-align: left;
`;

const SortTriggerHint = styled.span`
  font-size: var(--font-size-small, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-200);
  line-height: 1.2;
`;

const SortTriggerValue = styled.span`
  font-weight: 500;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  color: var(--text-100);
`;

const ChevronWrap = styled.span`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  background-color: rgba(0, 0, 0, 0.06);
  transition: background-color 0.18s ease;
  ${SortTrigger}:hover & {
    background-color: rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 767px) {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.05);
    ${SortTrigger}:hover & {
      background-color: rgba(0, 0, 0, 0.09);
    }
  }
`;

const SortChevron = styled.svg`
  width: 18px;
  height: 18px;
  color: var(--text-100);
  transition: transform 0.22s ease;
  transform: rotate(${(props) => (props.$isOpen ? "180deg" : "0deg")});
`;

const OptionsContainer = styled.div`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  flex-direction: column;
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  /* Ispod korpe (modal 1050); iznad sadržaja prodavnice */
  z-index: calc(var(--zindex-fixed) + 2);
  max-height: min(70vh, 420px);
  padding: 0;
  background-color: var(--bg-100);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  box-sizing: border-box;

  @media (min-width: 768px) {
    position: absolute;
    left: auto;
    top: calc(100% + 8px);
    bottom: auto;
    right: 0;
    width: min(280px, calc(100vw - 24px));
    max-width: min(280px, calc(100vw - 24px));
    max-height: none;
    border-radius: 0;
    box-shadow: var(--shadow-large);
    border: 1px solid #cfcfcf;
  }
`;

const SheetHandle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 4px;
  background: var(--bg-300);
  margin: 10px auto 4px;
  flex-shrink: 0;
  @media (min-width: 768px) {
    display: none;
  }
`;

const OpenSortTitle = styled.div`
  font-size: var(--font-size-small, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-200);
  padding: 12px 16px 10px;
  border-bottom: 1px solid var(--bg-300);
  @media (min-width: 768px) {
    padding: 12px 14px 8px;
  }
`;

const OptionsList = styled.div`
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 6px 0 12px;
  @media (min-width: 768px) {
    padding: 6px 0 8px;
  }
`;

const Option = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--font-size-base);
  color: var(--text-100);
  text-align: left;
  transition: background-color 0.15s ease;

  ${(props) =>
    props.$selected &&
    css`
      background-color: var(--primary-300);
      font-weight: 600;
    `}

  &:hover {
    background-color: #e8e8e8;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: -2px;
  }

  @media (min-width: 768px) {
    padding: 10px 14px;
  }
`;

const OptionLabel = styled.span`
  flex: 1;
  min-width: 0;
`;

const CheckMark = styled.span`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-100);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
`;

const MaskContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.35);
  position: fixed;
  display: ${(props) => (props.$isOpen ? "block" : "none")};
  inset: 0;
  z-index: calc(var(--zindex-fixed) + 1);
  @media (min-width: 768px) {
    display: none;
  }
`;

const ShopSort = () => {
  const { t } = useTranslation();
  const items = ["name", "date", "price_asc", "price_desc"];
  const [selectedSort, setSelectedSort] = useState("");
  const { filteredProducts, setFilteredProducts } = useContext(ProductContext);
  const [isOpen, setIsOpen] = useState(false);
  /** Sprečava petlju: setFilteredProducts → ponovo effect → ponovo sort. */
  const skipNextSortApplyRef = useRef(false);

  useEffect(() => {
    if (skipNextSortApplyRef.current) {
      skipNextSortApplyRef.current = false;
      return;
    }
    if (!selectedSort || !filteredProducts?.length) return;

    let sorted;
    if (selectedSort === "price_desc") {
      sorted = sortProductList(filteredProducts, "price", false);
    } else if (selectedSort === "price_asc") {
      sorted = sortProductList(filteredProducts, "price", true);
    } else if (selectedSort === "name") {
      sorted = sortProductList(filteredProducts, "name", true);
    } else if (selectedSort === "date") {
      sorted = sortProductList(filteredProducts, "date", true);
    } else {
      sorted = sortProductList(filteredProducts, selectedSort, true);
    }

    if (sameProductOrder(sorted, filteredProducts)) return;
    skipNextSortApplyRef.current = true;
    setFilteredProducts(sorted);
  }, [selectedSort, filteredProducts, setFilteredProducts]);

  const toggleSort = () => {
    setIsOpen(!isOpen);
  };

  const valueLabel = selectedSort
    ? t(`SHOP_SORT.${selectedSort.toUpperCase()}`)
    : t("SHOP_SORT.CHOOSE_SORT");

  return (
    <Root>
      <SortTrigger
        type="button"
        onClick={toggleSort}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        $isOpen={isOpen}
      >
        <SortTriggerMain>
          <SortTriggerHint>{t("SHOP_SORT.SORT")}</SortTriggerHint>
          <SortTriggerValue>{valueLabel}</SortTriggerValue>
        </SortTriggerMain>
        <ChevronWrap>
          <SortChevron
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
          </SortChevron>
        </ChevronWrap>
      </SortTrigger>

      <OptionsContainer $isOpen={isOpen} role="listbox">
        <SheetHandle aria-hidden />
        <OpenSortTitle>{t("SHOP_SORT.SORT_BY")}</OpenSortTitle>
        <OptionsList>
          {items.map((item) => (
            <Option
              key={item}
              type="button"
              role="option"
              aria-selected={item === selectedSort}
              $selected={item === selectedSort}
              onClick={() => {
                setSelectedSort(item);
                setIsOpen(false);
              }}
            >
              <OptionLabel>{t(`SHOP_SORT.${item.toUpperCase()}`)}</OptionLabel>
              <CheckMark $visible={item === selectedSort} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </CheckMark>
            </Option>
          ))}
        </OptionsList>
      </OptionsContainer>
      <MaskContainer $isOpen={isOpen} onClick={toggleSort} aria-hidden />
    </Root>
  );
};

export default ShopSort;
