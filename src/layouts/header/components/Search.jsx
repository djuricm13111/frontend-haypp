import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ProductContext } from "../../../context/ProductContext";
import { useNavigation } from "../../../utils/navigation";
import APIService from "../../../services/APIService";
import SearchProduct from "./SearchProduct";

const fadeInTop = keyframes`
  from {
    clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
  }
  to {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
`;

const fadeOutBottom = keyframes`
  from {
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
  to {
    clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
  }
`;

const Search = ({ isScrolled }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goToSearch, goToProduct, goToCategory } = useNavigation();
  const { setSearchedProducts, currencyTag, setIsCartOpen } =
    useContext(ProductContext);

  const [searchValue, setSearchValue] = useState("");
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [maxProductsToShow, setMaxProductsToShow] = useState(12);

  const containerRef = useRef(null);

  const isDeliveryHidden = sessionStorage.getItem("headerDeliveryHidden");

  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchTerm) => {
        try {
          const searchData = await APIService.SearchProducts(searchTerm);
          setSearchProducts(searchData?.products || []);
          setSearchCategories(searchData?.categories || []);
        } catch (error) {
          console.error("Greška pri pretrazi:", error);
          setSearchProducts([]);
          setSearchCategories([]);
        }
      }, 300),
    []
  );

  useEffect(() => {
    if (searchValue.trim()) {
      debouncedSearch(searchValue);
      setIsOpen(true);
    } else {
      setSearchProducts([]);
      setSearchCategories([]);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchValue, debouncedSearch]);

  useEffect(() => {
    const updateProductDisplay = () => {
      if (window.innerWidth >= 768) {
        setMaxProductsToShow(9);
      } else {
        setMaxProductsToShow(20);
      }
    };

    updateProductDisplay();
    window.addEventListener("resize", updateProductDisplay);

    return () => window.removeEventListener("resize", updateProductDisplay);
  }, []);

  const handleShowAll = () => {
    setSearchedProducts(searchProducts);
    navigate(goToSearch(searchValue));
    handleCloseSearch();
  };

  const handleProductCardClick = (categoryName, productName) => {
    navigate(goToProduct(categoryName, productName));
    setIsOpen(false);
  };

  const handleCategoryCardClick = (name) => {
    navigate(goToCategory(name));
    setIsOpen(false);
  };

  const handleCloseSearch = (e) => {
    if (e) e.stopPropagation();

    setIsOpen(false);
    setSearchValue("");
    setSearchProducts([]);
    setSearchCategories([]);
  };

  const hasResults = searchProducts.length > 0 || searchCategories.length > 0;

  return (
    <>
      <Container
        onClick={() => setIsOpen(true)}
        $isScrolled={isScrolled && isOpen}
        $pageScrolled={isScrolled}
        $isOpen={isOpen}
        $expandMobile={isOpen && !isScrolled}
      >
        <SearchWrapper $isOpen={isOpen} $pageScrolled={isScrolled}>
          <Input
            $isScrolled={!isScrolled || isOpen}
            $revealInput={isScrolled || isOpen}
            $pageScrolled={isScrolled}
            $isOpen={isOpen}
            type="text"
            placeholder={t("HEADER.SEARCH_FOR") || "Search for"}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          {!isOpen ? (
            <SearchButton
              type="button"
              aria-label="Search"
              $pageScrolled={isScrolled}
              $isScrolledR={isScrolled}
            >
              <SearchIcon $pageScrolled={isScrolled} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <line
                  x1="17"
                  y1="17"
                  x2="21"
                  y2="21"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </SearchIcon>
            </SearchButton>
          ) : (
            <CancelButton
              type="button"
              aria-label="Close search"
              onClick={handleCloseSearch}
            >
              <SearchIcon $closeIcon viewBox="0 0 24 24">
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </SearchIcon>
            </CancelButton>
          )}
        </SearchWrapper>

        {isOpen && hasResults && (
          <ResultContainer
            $isDeliveryHidden={isDeliveryHidden}
            ref={containerRef}
            $isOpen={isOpen}
          >
            <ResultWrapper>
              {!!searchCategories.length && (
                <InnerWrapperCategory>
                  <ResultTitle>
                    {t("HEADER.BRANDS")} ({searchCategories.length})
                  </ResultTitle>

                  {searchCategories.slice(0, maxProductsToShow).map((item) => (
                    <ProductResult
                      key={item.id}
                      onClick={() => handleCategoryCardClick(item.name)}
                    >
                      <div style={{ fontFamily: "Montserrat" }}>
                        {item.name}
                      </div>
                      <div>Category</div>
                    </ProductResult>
                  ))}
                </InnerWrapperCategory>
              )}

              <ProductsSection>
                <ResultTitle>
                  {t("HEADER.PRODUCTS")} ({searchProducts.length})
                </ResultTitle>

                <ProductsList>
                  {searchProducts.slice(0, maxProductsToShow).map((product) => (
                    <SearchProduct
                      key={product.id}
                      item={product}
                      currencyTag={currencyTag}
                      setIsCartOpen={setIsCartOpen}
                      onProductClick={handleProductCardClick}
                    />
                  ))}
                </ProductsList>
              </ProductsSection>
            </ResultWrapper>

            <BottomButtonWrapper>
              <ViewAllButton onClick={handleShowAll}>
                {t("HEADER.VIEW_ALL_RESULTS")} ({searchProducts.length})
              </ViewAllButton>
            </BottomButtonWrapper>
          </ResultContainer>
        )}
      </Container>

      <MaskContainer $isOpen={isOpen} onClick={handleCloseSearch} />
    </>
  );
};

export default Search;

const Container = styled.div`
  flex: 2;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: visible;
  z-index: ${(props) => (props.$isOpen ? "1002" : "0")};

  position: ${(props) => (props.$isScrolled ? "absolute" : "relative")};

  @media (max-width: 767px) {
    flex: 0 0 auto;
    width: auto;
    min-width: 0;
    max-width: 100%;
    justify-content: center;

    ${(props) =>
      props.$isOpen &&
      css`
        align-items: stretch;
      `}

    ${(props) =>
      props.$pageScrolled &&
      !props.$isOpen &&
      css`
        flex: 1 1 auto;
        min-width: 0;
        max-width: none;
        width: 100%;
      `}

    /* pun širina + visina reda: nadoknada padding MainHeaderWrapper (12px) */
    ${(props) =>
      props.$expandMobile &&
      css`
        position: absolute;
        left: -12px;
        right: -12px;
        top: 0;
        bottom: 0;
        flex: none;
        width: auto;
        max-width: none;
        min-width: 0;
        margin: 0;
        padding: 0;
        justify-content: stretch;
      `}

    ${(props) =>
      props.$isScrolled &&
      css`
        left: -12px;
        right: -12px;
        top: 0;
        bottom: 0;
        width: auto;
        max-width: none;
        flex: none;
        min-width: 0;
        padding: 0;
        justify-content: stretch;
      `}
  }

  @media (min-width: 768px) {
    width: 100%;
  }
`;

const SearchWrapper = styled.div`
  width: 100%;
  height: 42px;
  display: flex;
  align-items: stretch;
  /* background-color: ${(props) =>
    props.$isOpen ? "var(--bg-100)" : "var(--bg-200)"}; */

  border-radius: 4px;
  border-bottom: ${(props) =>
    props.$isOpen ? "2px solid var(--bg-300)" : "none"};
  overflow: hidden;

  ${(props) =>
    props.$isOpen &&
    css`
      position: relative;
      z-index: 3;
    `}

  @media (max-width: 767px) {
    height: 40px;
    width: ${(props) => (props.$isOpen ? "100%" : "auto")};
    min-width: 0;
    max-width: 100%;

    ${(props) =>
      props.$isOpen &&
      css`
        align-self: stretch;
        width: calc(100% - 20px);
        max-width: calc(100% - 20px);
        height: calc(100% - 4px);
        min-height: 44px;
        margin: 2px 10px;
        box-sizing: border-box;
        border-radius: 6px;
      `}

    ${(props) =>
      props.$pageScrolled &&
      !props.$isOpen &&
      css`
        width: 100%;
        background-color: var(--bg-200);
        border-radius: 4px;
        overflow: hidden;
      `}
  }
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background-color: ${(props) =>
    props.$isOpen ? "var(--bg-100)" : "var(--bg-200)"};
  padding: 0 14px;
  font-size: var(--header-dropdown-title-size);
  font-weight: 400;
  color: #222;
  height: 100%;

  &::placeholder {
    color: #9a9a9a;
    font-weight: 400;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 767px) {
    display: ${(props) => (props.$revealInput ? "block" : "none")};
    min-width: 0;
    flex: 1;

    ${(props) =>
      props.$isOpen &&
      css`
        padding: 0 12px;
      `}

    ${(props) =>
      props.$pageScrolled &&
      props.$revealInput &&
      !props.$isOpen &&
      css`
        padding: 0 8px;
        background-color: transparent;
      `}
  }

  @media (min-width: 768px) {
    display: ${(props) => (props.$isScrolled ? "block" : "none")};
  }
`;

const SearchButton = styled.button`
  width: ${(props) => (props.$isScrolledR ? "auto" : "96px")};
  min-width: ${(props) => (props.$isScrolledR ? "auto" : "96px")};
  height: 100%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: none;
  background-color: ${(props) =>
    props.$pageScrolled ? "var(--primary-100)" : "transparent"};

  &:hover {
    background-color: ${(props) =>
      props.$pageScrolled ? "var(--primary-200)" : "transparent"};
  }

  @media (min-width: 768px) {
    background-color: ${(props) =>
      props.$pageScrolled ? "transparent" : "var(--primary-100)"};

    &:hover {
      background-color: ${(props) =>
        props.$pageScrolled ? "transparent" : "var(--primary-200)"};
    }
  }

  @media (max-width: 767px) {
    width: 44px;
    min-width: 44px;
    max-width: 44px;
    flex-shrink: 0;
    padding: 0;
    /* bg-200 na SearchWrapper obuhvata i dugme sa ikonom */
    background-color: transparent;

    &:hover {
      background-color: transparent;
    }
  }
`;

const CancelButton = styled(SearchButton)`
  background-color: var(--bg-100);

  &:hover {
    background-color: var(--bg-200);
  }
`;

const SearchIcon = styled.svg`
  width: 24px;
  height: 24px;
  display: block;
  flex-shrink: 0;
  overflow: visible;
  fill: none;
  stroke: currentColor;
  shape-rendering: geometricPrecision;
  backface-visibility: hidden;
  transform: translateZ(0);
  color: ${(props) =>
    props.$closeIcon
      ? "var(--text-100)"
      : props.$pageScrolled
        ? "var(--bg-100)"
        : "var(--text-100)"};

  circle {
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }

  line {
    stroke: currentColor;
  }

  @media (max-width: 767px) {
    color: var(--primary-100);
  }

  @media (min-width: 768px) {
    color: ${(props) =>
      props.$closeIcon
        ? "var(--text-100)"
        : props.$pageScrolled
          ? "var(--text-200)"
          : "var(--bg-100)"};
  }
`;

const MaskContainer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1001;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background-color: #0000003a;
  display: ${(props) => (props.$isOpen ? "block" : "none")};
`;

const ResultContainer = styled.div`
  position: absolute;
  background-color: var(--bg-100);
  width: 100%;
  left: 0;
  right: 0;
  top: ${(props) =>
    props.$isDeliveryHidden ? "100%" : "calc(100% - var(--navbar-mini))"};
  border-radius: 0 0 8px 8px;
  z-index: 1;
  height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 90vh;
  box-sizing: border-box;

  @media (max-width: 767px) {
    top: 100%;
    left: 10px;
    right: 10px;
    width: auto;
    margin-top: 4px;
    height: auto;
    max-height: 75vh;
    z-index: 2;
    box-shadow: var(--shadow-large);
    border-radius: 8px;
    box-sizing: border-box;
  }

  @media (min-width: 768px) {
    top: 100%;
    box-shadow: var(--shadow-large);
    height: auto;
    max-height: 70vh;
  }

  ${({ $isOpen }) =>
    $isOpen
      ? css`
          animation: ${fadeInTop} 0.3s ease-in-out both;
        `
      : css`
          animation: ${fadeOutBottom} 0.2s ease-in-out both;
        `}
`;

const ResultWrapper = styled.div`
  width: 100%;
  margin-bottom: 60px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    padding: 0 6px 8px;
  }

  @media (min-width: 768px) {
    display: flex;
    flex-direction: row-reverse;
  }
`;

const InnerWrapperCategory = styled.div`
  flex: 1;
`;

const ProductsSection = styled.div`
  flex: 1;
`;

const ProductsList = styled.div`
  width: 100%;
`;

const ResultItem = styled.div`
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--header-dropdown-link-size);
  color: var(--text-100);
  cursor: pointer;
  width: 94%;
  box-sizing: border-box;

  @media (max-width: 767px) {
    width: 100%;
    padding-left: 4px;
    padding-right: 4px;
  }
`;

const ProductResult = styled(ResultItem)`
  cursor: pointer;
  min-height: 24px;
  justify-content: space-between;
  margin: 0 auto;
`;

const ResultTitle = styled.h4`
  font-size: var(--header-dropdown-title-size);
  font-style: normal;
  line-height: 1.3;
  padding: 6px 12px;
  font-weight: 500;
`;

const BottomButtonWrapper = styled.div`
  width: 100%;
  left: 0;
  flex-shrink: 0;
  background-color: var(--bg-100);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(6px);
  position: sticky;
  bottom: 0;
  padding: 4px 0;
`;

const ViewAllButton = styled.button`
  margin: 0 auto;
`;
