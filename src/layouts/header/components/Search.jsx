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
        $isOpen={isOpen}
      >
        <SearchWrapper $isOpen={isOpen}>
          <Input
            $isScrolled={!isScrolled || isOpen}
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
              $isScrolled={!isScrolled || isOpen}
              $isScrolledR={isScrolled}
            >
              <SearchIcon
                $isScrolled={!isScrolled || isOpen}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </SearchIcon>
            </SearchButton>
          ) : (
            <CancelButton
              type="button"
              aria-label="Close search"
              onClick={handleCloseSearch}
            >
              <SearchIcon viewBox="0 0 24 24">
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  stroke="var(--text-100)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  stroke="var(--text-100)"
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
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${(props) => (props.$isOpen ? "1002" : "0")};

  @media (min-width: 768px) {
    position: ${(props) => (props.$isScrolled ? "absolute" : "relative")};
    width: ${(props) =>
      props.$isScrolled ? "calc(var(--max-width-container) * 0.8)" : "80%"};
  }
`;

const SearchWrapper = styled.div`
  width: 100%;
  height: 46px;
  display: flex;
  align-items: stretch;
  /* background-color: ${(props) =>
    props.$isOpen ? "var(--bg-100)" : "var(--bg-200)"}; */

  border-radius: 4px;
  border-bottom: ${(props) =>
    props.$isOpen ? "2px solid var(--bg-300)" : "none"};
  overflow: hidden;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background-color: ${(props) =>
    props.$isOpen ? "var(--bg-100)" : "var(--bg-200)"};
  padding: 0 16px;
  font-size: 14px;
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

  @media (min-width: 768px) {
    background-color: ${(props) =>
      props.$isScrolled ? "var(--primary-100)" : "transparent"};

    &:hover {
      background-color: ${(props) =>
        props.$isScrolled ? "var(--primary-200)" : "transparent"};
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
  stroke: white;
  stroke-width: 2;
  fill: none;

  @media (min-width: 768px) {
    stroke: ${(props) =>
      props.$isScrolled ? "var(--bg-100)" : "var(--text-100)"};
  }
`;

const MaskContainer = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1001;
  min-width: 100%;
  height: 100vh;
  background-color: #0000003a;
  display: none;

  @media (min-width: 768px) {
    display: ${(props) => (props.$isOpen ? "block" : "none")};
  }
`;

const ResultContainer = styled.div`
  position: absolute;
  background-color: var(--bg-100);
  width: 100%;
  top: ${(props) =>
    props.$isDeliveryHidden ? "100%" : "calc(100% - var(--navbar-mini))"};
  left: 0;
  border-radius: 0 0 8px 8px;
  z-index: 1;
  height: 90vh;
  overflow-y: auto;
  max-height: 90vh;

  @media (min-width: 768px) {
    width: 100%;
    left: 0;
    top: 100%;
    box-shadow: var(--shadow-large);
    height: auto;
    //padding: 20px 0 40px 0;
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
  font-size: var(--font-size-base);
  color: var(--text-100);
  cursor: pointer;
  width: 94%;
`;

const ProductResult = styled(ResultItem)`
  cursor: pointer;
  min-height: 24px;
  justify-content: space-between;
  margin: 0 auto;
`;

const ResultTitle = styled.h4`
  font-size: var(--font-size-base);
  font-style: normal;
  line-height: normal;
  padding: 8px 14px;
  font-weight: 300;
`;

const BottomButtonWrapper = styled.div`
  width: 100%;
  bottom: 10px;
  left: 0;
  background-color: var(--bg-100);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(6px);

  @media (min-width: 768px) {
    display: block;
    position: sticky;
    bottom: 0;
    padding: 4px 0;
  }
`;

const ViewAllButton = styled.button`
  margin: 0 auto;
`;
