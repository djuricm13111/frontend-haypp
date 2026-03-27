import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ProductContext } from "../../context/ProductContext";
import styled from "styled-components";
import ToggleSwitch from "../animations/ToggleSwitch";
import { useTranslation } from "react-i18next";
import {
  getPresentFlavorGroupIds,
  productMatchesFlavorGroups,
  getFlavorGroupLabelKey,
  getFlavorGroupId,
} from "../../utils/flavorGroups";

const Container = styled.div`
  position: fixed;
  height: 100vh;
  max-height: 100vh;
  max-height: 100%;
  overflow: hidden;
  z-index: 99999;
  right: 0px;
  bottom: 0px;
  width: ${(props) => (props.$showFilters ? "100%" : "0%")};

  @media (min-width: 768px) {
    position: absolute;
    box-shadow: var(--shadow-large);
  }

  background-color: var(--bg-100); /* Promenite boju po želji */
  transition: width 0.3s ease;
`;
const Wrapper = styled.div`
  width: 94%;
  margin: 0 auto;
`;
const IconTitle = styled.span`
  border: none;

  font-size: var(--font-size-base);
  font-weight: 100;
  text-transform: capitalize;
  color: var(--text-100);
  display: flex;
  gap: 14px;
  cursor: pointer;

  background-color: var(--bg-200);
  border: 1px solid var(--bg-300);
  padding: var(--spacing-xs) var(--spacing-md);
  border: ${({ $totalfilters }) =>
    $totalfilters > 0
      ? "1px solid var(--primary-100)"
      : "1px solid var(--bg-300)"};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const MenuTitle = styled(IconTitle)`
  border: none;
  background-color: transparent;
  text-transform: uppercase;
`;
const XDiv = styled.div`
  padding: 0 0 0 var(--spacing-md);
  cursor: pointer;
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--bg-200);

  /* Prvi element centriran */
  & > :first-child {
    margin-right: auto;
  }

  /* Drugi element na kraju */
  & > :last-child {
    margin-right: auto;
  }
`;
const Checkbox = styled.div`
  border-radius: 4px;
  border: 1px solid var(--bg-300);
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  &:hover {
    border: 1px solid var(--text-100);
  }
`;
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  margin-top: 12px;
`;
const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
`;
const Label = styled.label`
  font-size: var(--font-size-base);
  font-weight: 100;
  color: #000;
  font-family: "Gudea-Regural";
  cursor: pointer;
`;

const FlexDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
`;

const MidContainer = styled.div`
  padding: 20px 0;
  width: 94%;
  margin: 0 auto;
  overflow: visible;
`;

const CustomFilter = styled.div`
  width: 100%;
  margin: 0 auto;
  border-top: 1px solid var(--bg-300);
  border-bottom: 1px solid var(--bg-300);
`;

const CustomWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  color: var(--text-100);
  padding: 14px 0;
`;

const FilterContainer = styled.div`
  padding: 20px 0;
  width: 94%;
  margin: 0 auto;
`;

const NICOTINE_RANGES = [
  { label: "0-5 mg", range: [0, 5] },
  { label: "5-9 mg", range: [5, 9] },
  { label: "9-12 mg", range: [9, 12] },
  { label: "12-15 mg", range: [12, 15] },
  { label: "15-17 mg", range: [15, 17] },
  { label: "17-65 mg", range: [17, 65] },
];

const DesktopBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10040;
  background: rgba(0, 0, 0, 0.12);
`;

const DesktopPanel = styled.div`
  position: fixed;
  z-index: 10050;
  background: var(--bg-100);
  border: 1px solid #cfcfcf;
  border-radius: 0;
  box-shadow: var(--shadow-large);
  max-width: min(320px, calc(100vw - 16px));
  max-height: min(85vh, 520px);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
`;

const DesktopMidScroll = styled.div`
  overflow: visible;
  padding: 4px 4px 12px;
  flex: 1;
  min-height: 0;
`;

const DesktopPanelTitle = styled.div`
  font-size: var(--font-size-small, 0.75rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-200);
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--bg-300);
`;

const DesktopStockRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px solid var(--bg-300);
`;

const DesktopBottomInline = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  width: 100%;
  justify-content: ${(props) =>
    props.$hasClear ? "space-between" : "flex-end"};
`;

const DesktopProductCount = styled.span`
  font-size: var(--font-size-base);
  color: var(--text-200);
  font-weight: 500;
  white-space: nowrap;
`;

const DesktopClearBtn = styled.button`
  padding: 10px 16px;
  border-radius: 0;
  font-family: inherit;
  font-size: var(--font-size-base);
  cursor: pointer;
  border: 1px solid #cfcfcf;
  background: var(--bg-300);
  color: var(--text-100);
  transition: border-color 0.18s ease, background 0.18s ease;

  &:hover {
    border-color: #b0b0b0;
    background: #e4e4e4;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
`;

const DesktopChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  width: 100%;
  margin-top: 2px;
`;

const DesktopChip = styled.button`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 6px 6px 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--bg-300);
  background: var(--bg-200);
  color: var(--text-100);
  font-size: var(--font-size-small, 0.875rem);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: var(--text-200);
    background: var(--bg-300);
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
`;

const DesktopChipMeta = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-width: 0;
`;

const DesktopChipKind = styled.span`
  font-weight: 700;
  color: var(--text-200);
  text-transform: uppercase;
  font-size: 0.65rem;
  letter-spacing: 0.04em;
  line-height: 1;
`;

const DesktopChipValue = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: min(220px, 42vw);
  font-weight: 500;
  line-height: 1.2;
`;

const DesktopChipRemove = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  flex-shrink: 0;
  color: var(--text-200);
  transition: background 0.2s ease, color 0.2s ease;
  font-size: 1.1rem;
  line-height: 1;

  ${DesktopChip}:hover & {
    background: var(--bg-100);
    color: var(--text-100);
  }
`;

const BottomDiv = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: calc(var(--navbar-mini) * 2);
  background-color: var(--bg-100);
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--bg-300);
  z-index: 99999;
`;
const BottomWrapper = styled.div`
  width: 90%;
  height: 60%;
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 14px;
`;
const TransparentButton = styled.button`
  background-color: transparent;
  color: var(--text-100);
  border-color: var(--bg-300);
  &:hover {
    background-color: transparent;
    border-color: var(--text-100);
  }
`;

const FilterSection = ({
  showFilters,
  setShowFilters,
  toggleMenu,
  variant = "mobile",
  anchorRef,
}) => {
  const { t } = useTranslation();
  const { products, setFilteredProducts, filteredProducts, category } =
    useContext(ProductContext);

  // Stanje za selektovane kategorije i formate
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedFormats, setSelectedFormats] = useState(new Set());
  const [selectedNicotineRanges, setSelectedNicotineRanges] = useState(
    new Set()
  );
  const [selectedFlavors, setSelectedFlavors] = useState(new Set());
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);

  // Grupisanje proizvoda po kategoriji i formatu
  const groupedCategories = Array.from(
    new Set(
      products.map((product) => product.category_name).filter(Boolean)
    )
  );
  const groupedFormats = Array.from(
    new Set(products.map((product) => product.format).filter(Boolean))
  );
  /** Koje grupe ukusa postoje u listi (mint, voćno, citrus, …). */
  const groupedFlavorGroupIds = getPresentFlavorGroupIds(products);

  const applyFilters = useCallback(
    (categories, formats, nicotineRange, flavors, hideOutOfStockOverride) => {
      const stockFilter =
        hideOutOfStockOverride !== undefined
          ? hideOutOfStockOverride
          : filterOutOfStock;
      const nicotineRangesArray = Array.from(nicotineRange);
      const flavorSet = flavors instanceof Set ? flavors : new Set(flavors);

      const filtered = products.filter((product) => {
        const nic = Number(product.nicotine);
        const isInCategory =
          categories.size === 0 || categories.has(product.category_name);
        const isInFormat = formats.size === 0 || formats.has(product.format);
        const isInFlavor =
          flavorSet.size === 0 ||
          productMatchesFlavorGroups(product, flavorSet);
        const isInNicotineRange =
          nicotineRange.size === 0 ||
          nicotineRangesArray.some((label) => {
            const item = NICOTINE_RANGES.find((nr) => nr.label === label);
            const [min, max] = item ? item.range : [0, 100];
            return nic >= min && nic <= max;
          });
        const isInStock =
          !stockFilter || product.is_in_stock === "in_stock";

        return (
          isInCategory &&
          isInFormat &&
          isInNicotineRange &&
          isInFlavor &&
          isInStock
        );
      });

      setFilteredProducts(filtered);
    },
    [products, filterOutOfStock, setFilteredProducts]
  );

  // Funkcija za promenu selektovanih kategorija
  const handleCategoryChange = (category) => {
    const updatedCategories = new Set(selectedCategories);
    if (updatedCategories.has(category)) {
      updatedCategories.delete(category);
    } else {
      updatedCategories.add(category);
    }

    setSelectedCategories(updatedCategories);
    applyFilters(
      updatedCategories,
      selectedFormats,
      selectedNicotineRanges,
      selectedFlavors
    );
  };

  // Funkcija za promenu selektovanih formata
  const handleFormatChange = (format) => {
    const updatedFormats = new Set(selectedFormats);
    if (updatedFormats.has(format)) {
      updatedFormats.delete(format);
    } else {
      updatedFormats.add(format);
    }

    setSelectedFormats(updatedFormats);
    applyFilters(
      selectedCategories,
      updatedFormats,
      selectedNicotineRanges,
      selectedFlavors
    );
  };

  const handleFlavorChange = (flavor) => {
    const updated = new Set(selectedFlavors);
    if (updated.has(flavor)) {
      updated.delete(flavor);
    } else {
      updated.add(flavor);
    }
    setSelectedFlavors(updated);
    applyFilters(
      selectedCategories,
      selectedFormats,
      selectedNicotineRanges,
      updated
    );
  };

  const handleNicotineRangeChange = (range) => {
    const updatedRanges = new Set(selectedNicotineRanges);

    // Dodajemo samo labelu opsega, a ne ceo objekat
    if (updatedRanges.has(range.label)) {
      updatedRanges.delete(range.label); // Ako je selektovan, uklonimo ga
    } else {
      updatedRanges.add(range.label); // Ako nije selektovan, dodajemo samo labelu
    }

    setSelectedNicotineRanges(updatedRanges);
    applyFilters(
      selectedCategories,
      selectedFormats,
      updatedRanges,
      selectedFlavors
    );
  };

  const handleFilterOutOfStock = (newState) => {
    setFilterOutOfStock(newState);
  };

  // Samo stock toggle / nova lista proizvoda — selekcije menjaju handleri
  useEffect(() => {
    applyFilters(
      selectedCategories,
      selectedFormats,
      selectedNicotineRanges,
      selectedFlavors
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- namerno: ne duplirati apply pri svakoj promeni Set-ova
  }, [filterOutOfStock, applyFilters]);

  const clearFilters = () => {
    setFilterOutOfStock(false);
    setSelectedCategories(new Set());
    setSelectedFormats(new Set());
    setSelectedNicotineRanges(new Set());
    setSelectedFlavors(new Set());
    applyFilters(new Set(), new Set(), new Set(), new Set(), false);
  };

  // Funkcija za brojanje proizvoda u određenoj kategoriji
  const countProductsInCategory = (category) => {
    return products.filter((product) => product.category_name === category)
      .length;
  };

  // Funkcija za brojanje proizvoda u određenom formatu
  const countProductsInFormat = (format) => {
    return products.filter((product) => product.format === format).length;
  };

  const countProductsInNicotineRange = (label) => {
    const range = NICOTINE_RANGES.find((range) => range.label === label);
    if (!range) return 0;
    return products.filter((product) => {
      const nic = Number(product.nicotine);
      const [min, max] = range.range;
      return nic >= min && nic <= max;
    }).length;
  };

  const countProductsInFlavorGroup = (groupId) =>
    products.filter((p) => getFlavorGroupId(p.flavor) === groupId).length;

  const panelRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState(null);

  useLayoutEffect(() => {
    if (variant !== "desktop" || !showFilters || !anchorRef?.current) {
      setDropdownPos(null);
      return;
    }
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const w = 300;
      let left = r.left;
      const top = r.bottom + 6;
      if (left + w > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - w - 8);
      }
      if (left < 8) left = 8;
      setDropdownPos({ top, left, width: w });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [variant, showFilters, anchorRef]);

  useEffect(() => {
    if (variant !== "desktop" || !showFilters) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowFilters(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, showFilters, setShowFilters]);

  useEffect(() => {
    if (variant !== "desktop" || !showFilters) return;
    const handler = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (anchorRef?.current?.contains(e.target)) return;
      setShowFilters(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [variant, showFilters, anchorRef, setShowFilters]);

  const filterOptions = (
    <>
      {showFilters === "brand" && (
        <div>
          {groupedCategories.map((category) => (
            <CheckboxContainer
              key={category}
              onClick={() => handleCategoryChange(category)}
            >
              <CheckboxWrapper>
                <Checkbox>
                  {selectedCategories.has(category) && (
                    <svg
                      fill="var(--bg-100)"
                      width="20px"
                      height="20px"
                      viewBox="0 0 1024 1024"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ backgroundColor: "var(--success-color)" }}
                    >
                      <path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z" />
                    </svg>
                  )}
                </Checkbox>
                <Label htmlFor={category}>{category}</Label>
              </CheckboxWrapper>
              <div>{countProductsInCategory(category)}</div>
            </CheckboxContainer>
          ))}
        </div>
      )}

      {showFilters === "format" && (
        <div>
          {groupedFormats.map((format) => (
            <CheckboxContainer
              key={format}
              onClick={() => handleFormatChange(format)}
            >
              <CheckboxWrapper>
                <Checkbox>
                  {selectedFormats.has(format) && (
                    <svg
                      fill="var(--bg-100)"
                      width="20px"
                      height="20px"
                      viewBox="0 0 1024 1024"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ backgroundColor: "var(--success-color)" }}
                    >
                      <path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z" />
                    </svg>
                  )}
                </Checkbox>
                <Label htmlFor={format}>{format}</Label>
              </CheckboxWrapper>
              <div>{countProductsInFormat(format)}</div>
            </CheckboxContainer>
          ))}
        </div>
      )}

      {showFilters === "flavor" && (
        <div>
          {groupedFlavorGroupIds.map((groupId) => (
            <CheckboxContainer
              key={groupId}
              onClick={() => handleFlavorChange(groupId)}
            >
              <CheckboxWrapper>
                <Checkbox>
                  {selectedFlavors.has(groupId) && (
                    <svg
                      fill="var(--bg-100)"
                      width="20px"
                      height="20px"
                      viewBox="0 0 1024 1024"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ backgroundColor: "var(--success-color)" }}
                    >
                      <path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z" />
                    </svg>
                  )}
                </Checkbox>
                <Label htmlFor={groupId}>
                  {t(getFlavorGroupLabelKey(groupId))}
                </Label>
              </CheckboxWrapper>
              <div>{countProductsInFlavorGroup(groupId)}</div>
            </CheckboxContainer>
          ))}
        </div>
      )}

      {showFilters === "nicotine" && (
        <div>
          {NICOTINE_RANGES.map((range) => (
            <CheckboxContainer
              key={range.label}
              onClick={() => handleNicotineRangeChange(range)}
            >
              <CheckboxWrapper>
                <Checkbox>
                  {selectedNicotineRanges.has(range.label) && (
                    <svg
                      fill="var(--bg-100)"
                      width="20px"
                      height="20px"
                      viewBox="0 0 1024 1024"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ backgroundColor: "var(--success-color)" }}
                    >
                      <path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z" />
                    </svg>
                  )}
                </Checkbox>
                <Label htmlFor={range.label}>{range.label}</Label>{" "}
              </CheckboxWrapper>
              <div>{countProductsInNicotineRange(range.label)}</div>
            </CheckboxContainer>
          ))}
        </div>
      )}
    </>
  );

  const showClearOnDesktop =
    selectedCategories.size > 0 ||
    selectedFormats.size > 0 ||
    selectedNicotineRanges.size > 0 ||
    selectedFlavors.size > 0;

  const removeNicotineLabel = (label) => {
    const range = NICOTINE_RANGES.find((r) => r.label === label);
    if (range) handleNicotineRangeChange(range);
  };

  if (variant === "desktop") {
    const brandChips = !category
      ? Array.from(selectedCategories)
      : [];
    const formatChips = Array.from(selectedFormats);
    const flavorChips = Array.from(selectedFlavors);
    const nicotineChips = Array.from(selectedNicotineRanges);

    return (
      <>
        {showFilters && dropdownPos && (
          <>
            <DesktopBackdrop onClick={() => setShowFilters(false)} />
            <DesktopPanel
              ref={panelRef}
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
              }}
            >
              <DesktopPanelTitle>
                {showFilters === "nicotine"
                  ? t("FILTER.STRENGTH")
                  : showFilters === "flavor"
                  ? t("FILTER.FLAVOUR")
                  : showFilters === "brand"
                  ? t("FILTER.BRAND")
                  : showFilters === "format"
                  ? t("FILTER.FORMAT")
                  : t(`FILTER.${String(showFilters).toUpperCase()}`)}
              </DesktopPanelTitle>
              <DesktopMidScroll>{filterOptions}</DesktopMidScroll>
            </DesktopPanel>
          </>
        )}
        {showClearOnDesktop && (
          <DesktopChipsRow>
            {brandChips.map((name) => (
              <DesktopChip
                key={`brand-${name}`}
                type="button"
                onClick={() => handleCategoryChange(name)}
                aria-label={`${t("FILTER.REMOVE")}: ${t("FILTER.BRAND")} ${name}`}
              >
                <DesktopChipMeta>
                  <DesktopChipKind>{t("FILTER.BRAND")}</DesktopChipKind>
                  <DesktopChipValue>{name}</DesktopChipValue>
                </DesktopChipMeta>
                <DesktopChipRemove aria-hidden>×</DesktopChipRemove>
              </DesktopChip>
            ))}
            {formatChips.map((name) => (
              <DesktopChip
                key={`format-${name}`}
                type="button"
                onClick={() => handleFormatChange(name)}
                aria-label={`${t("FILTER.REMOVE")}: ${t("FILTER.FORMAT")} ${name}`}
              >
                <DesktopChipMeta>
                  <DesktopChipKind>{t("FILTER.FORMAT")}</DesktopChipKind>
                  <DesktopChipValue>{name}</DesktopChipValue>
                </DesktopChipMeta>
                <DesktopChipRemove aria-hidden>×</DesktopChipRemove>
              </DesktopChip>
            ))}
            {flavorChips.map((groupId) => (
              <DesktopChip
                key={`flavor-${groupId}`}
                type="button"
                onClick={() => handleFlavorChange(groupId)}
                aria-label={`${t("FILTER.REMOVE")}: ${t("FILTER.FLAVOUR")} ${t(getFlavorGroupLabelKey(groupId))}`}
              >
                <DesktopChipMeta>
                  <DesktopChipKind>{t("FILTER.FLAVOUR")}</DesktopChipKind>
                  <DesktopChipValue>
                    {t(getFlavorGroupLabelKey(groupId))}
                  </DesktopChipValue>
                </DesktopChipMeta>
                <DesktopChipRemove aria-hidden>×</DesktopChipRemove>
              </DesktopChip>
            ))}
            {nicotineChips.map((label) => (
              <DesktopChip
                key={`nic-${label}`}
                type="button"
                onClick={() => removeNicotineLabel(label)}
                aria-label={`${t("FILTER.REMOVE")}: ${t("FILTER.STRENGTH")} ${label}`}
              >
                <DesktopChipMeta>
                  <DesktopChipKind>{t("FILTER.STRENGTH")}</DesktopChipKind>
                  <DesktopChipValue>{label}</DesktopChipValue>
                </DesktopChipMeta>
                <DesktopChipRemove aria-hidden>×</DesktopChipRemove>
              </DesktopChip>
            ))}
          </DesktopChipsRow>
        )}
        <DesktopStockRow>
          <FilterContainer style={{ width: "100%", padding: 0, margin: 0 }}>
            <CustomWrapper style={{ padding: "4px 0" }}>
              {t("FILTER.HIDE_OUT_OF_STOCK")}
              <ToggleSwitch
                checked={filterOutOfStock}
                onChange={handleFilterOutOfStock}
              />
            </CustomWrapper>
          </FilterContainer>
          <DesktopBottomInline $hasClear={showClearOnDesktop}>
            {showClearOnDesktop && (
              <DesktopClearBtn type="button" onClick={clearFilters}>
                {t("FILTER.CLEAR_FILTER")}
              </DesktopClearBtn>
            )}
            <DesktopProductCount>
              {t("FILTER.PRODUCTS_COUNT", {
                count: filteredProducts.length,
              })}
            </DesktopProductCount>
          </DesktopBottomInline>
        </DesktopStockRow>
      </>
    );
  }

  return (
    <>
      <Container $showFilters={showFilters}>
        <Wrapper>
          <XDiv>
            <FlexDiv onClick={() => setShowFilters(false)}>
              <svg
                width="30px"
                height="30px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ cursor: "pointer" }}
              >
                <path
                  d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z"
                  fill="var(--text-100)"
                />
              </svg>
              Back
            </FlexDiv>
            <MenuTitle>{showFilters}</MenuTitle>
          </XDiv>
          <MidContainer>{filterOptions}</MidContainer>
        </Wrapper>
      </Container>
      <CustomFilter>
        <FilterContainer>
          <CustomWrapper>
            {t("FILTER.HIDE_OUT_OF_STOCK")}
            <ToggleSwitch
              checked={filterOutOfStock}
              onChange={handleFilterOutOfStock}
            />
          </CustomWrapper>
        </FilterContainer>
      </CustomFilter>

      <BottomDiv>
        <BottomWrapper>
          <TransparentButton type="button" onClick={clearFilters}>
            {t("FILTER.CLEAR_FILTER")}
          </TransparentButton>
          <button type="button" onClick={toggleMenu}>
            {t("FILTER.VIEW_ALL_PRODUCTS", {
              filteredProducts: filteredProducts.length,
            })}
          </button>
        </BottomWrapper>
      </BottomDiv>
    </>
  );
};

export default FilterSection;
