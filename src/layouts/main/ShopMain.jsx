import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { ProductContext } from "../../context/ProductContext";
import { PRODUCT_CHUNK } from "../../utils/global_const";
import { useTranslation } from "react-i18next";
import ProductCard from "../../components/product/ProductCard";
import Filter from "../../components/product/Filter";
import ShopSort from "../../components/product/ShopSort";
import Breadcrumbs from "../../components/section/BreadCrumbs";
import { useParams } from "react-router-dom";
import brandDescriptions from "../../brand_descriptions.json";
import {
  getBrandEntryShortDescription,
  getCategoryShortDescription,
} from "../../utils/shopCategoryCopy";

const Container = styled.article`
  color: ${(props) => props.theme.textColor};
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;

  /* Globalni index.css: article { display:flex; align-items:center } pravi suvišan
     layout/overflow na desktopu — ovde poravnanje i overflow resetujemo. */
  @media (min-width: 1025px) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: 100%;
    overflow-x: visible;
    overflow-y: visible;
    min-height: 0;
  }
`;
const Section = styled.section`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  @media (min-width: 1025px) {
    width: var(--max-width-container);
    max-width: min(100%, var(--max-width-container));
    margin-left: auto;
    margin-right: auto;
    overflow-x: visible;
    overflow-y: visible;
    min-width: 0;
  }
`;
const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) and (max-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  @media (min-width: 1025px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    column-gap: 12px;
    row-gap: 12px;
  }
`;
const FlexDiv = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  margin-top: 16px;
  padding: 0 12px;
  box-sizing: border-box;
  min-height: var(--navbar-height);
  height: auto;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-large);
  overflow-x: hidden;

  @media (min-width: 768px) {
    box-shadow: none;
    flex-direction: row;
    position: static;
    margin-bottom: 20px;
    margin-top: 28px;
    padding: 0;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    max-width: var(--max-width-container);
    min-height: 0;
    height: auto;
    overflow-x: visible;
    overflow-y: visible;
    z-index: auto;
  }
`;
const MarginDiv = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 12px;
  box-sizing: border-box;
`;
const TopWrapper = styled.div`
  width: 100%;
  min-width: 0;
  max-width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  box-sizing: border-box;
  @media (min-width: 768px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    max-width: 100%;
    margin: 0;
    gap: 20px;
  }
`;
const FlexContainer = styled.div`
  display: flex;

  justify-content: center;
  align-items: center;
  gap: 6px;
`;

const FilterContainer = styled.div`
  width: 100%;
  min-width: 0;
  max-width: 100%;
  @media (min-width: 768px) {
    flex: 1 1 auto;
    min-width: 0;
  }
`;

const SortContainer = styled.div`
  width: 100%;
  min-width: 0;
  max-width: 100%;
  @media (min-width: 768px) {
    flex: 0 0 min(280px, 100%);
    max-width: 280px;
  }
`;

const PaginationContainer = styled(FlexContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${({ isActive }) => (isActive ? "var(--primary)" : "#ccc")};
  background-color: ${({ isActive }) =>
    isActive ? "var(--primary-100)" : "var(--bg-100)"};
  color: ${({ isActive }) => (isActive ? "#fff" : "#333")};
  font-weight: ${({ isActive }) => (isActive ? "bold" : "normal")};
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ isActive }) =>
      isActive ? "var(--primary-200)" : "var(--bg-200)"};
  }
`;

const NavButton = styled.button`
  padding: 8px 16px;
  border: none;
  background-color: var(--bg-200);
  border: 1px solid var(--bg-300);
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  &:hover {
    background-color: var(--primary-200);
  }
`;

const IntroBlock = styled.div`
  width: 100%;
  max-width: 100%;
  text-align: center;
  box-sizing: border-box;
  margin: 0 auto 16px;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin: 14px 0 10px;
  width: 100%;
  max-width: 100%;
`;

/** Pun širine, centriran tekst — bez skraćivanja / „show more“. */
const ShopDescription = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  text-align: center;
  line-height: 1.6;
  color: var(--text-100);
  font-size: var(--font-size-base);
  font-family: "Gudea-Regural", var(--font-family), sans-serif;
  box-sizing: border-box;

  p {
    margin: 0;
    width: 100%;
    max-width: 100%;
    text-align: center;
  }
`;

const ShopMain = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const { filteredProducts, category } = useContext(ProductContext);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCT_CHUNK);

  // Funkcija za dobijanje proizvoda za trenutnu stranicu
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCT_CHUNK,
    currentPage * PRODUCT_CHUNK
  );

  const breadcrumbItems = [
    { name: "SnusCo", url: "/" },
    {
      name: category ? category.name + " Nicotine Pouches" : "Nicotine Pouches",
      url: "/snus-verkauf",
    },
  ];

  // Resetovanje na prvu stranicu kada se promeni filtrirana lista proizvoda
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts]);

  // Funkcije za navigaciju između stranica
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
    window.scrollTo({
      top: 80,
      behavior: "smooth",
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
    window.scrollTo({
      top: 80,
      behavior: "smooth",
    });
  };

  const renderPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PageButton
          key={i}
          onClick={() => {
            setCurrentPage(i);
            window.scrollTo({
              top: 80,
              behavior: "smooth",
            });
          }}
          isActive={i === currentPage}
        >
          {i}
        </PageButton>
      );
    }
    return pages;
  };

  const [openIndex, setOpenIndex] = useState(null);

  const handleSetOpenIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const entry = slug
    ? brandDescriptions.find((item) => item.slug === slug)
    : null;

  const titleText = entry
    ? entry.brand_name
    : category
    ? category.name
    : t("SHOP.TITLE");

  const descriptionText = entry
    ? getBrandEntryShortDescription(entry, i18n.language)
    : category
    ? getCategoryShortDescription(category, i18n.language)
    : null;

  return (
    <Container>
      <Section className="header-top-margin">
        <MarginDiv>
          <Breadcrumbs breadcrumbs={breadcrumbItems} />

          <IntroBlock>
            <Title>{titleText}</Title>

            {descriptionText ? (
              <ShopDescription>{descriptionText}</ShopDescription>
            ) : (
              <ShopDescription
                dangerouslySetInnerHTML={{ __html: t("SHOP.DESCRIPTION") }}
              />
            )}
          </IntroBlock>
        </MarginDiv>
        <FlexDiv>
          <TopWrapper>
            <FilterContainer>
              <Filter />
            </FilterContainer>
            <SortContainer>
              <ShopSort />
            </SortContainer>
          </TopWrapper>
        </FlexDiv>
        <ProductGrid>
          {currentProducts.map((product, index) => (
            <ProductCard
              key={product.id ?? product.slug}
              product={product}
              isOpen={openIndex === index}
              setIsOpen={() => handleSetOpenIndex(index)}
            />
          ))}
        </ProductGrid>
        {totalPages !== 1 && (
          <PaginationContainer>
            <NavButton onClick={handlePrevPage} disabled={currentPage === 1}>
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z"
                  fill="var(--text-100)"
                />
              </svg>
            </NavButton>
            {renderPageNumbers()}
            <NavButton
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
                  fill="var(--text-100)"
                />
              </svg>
            </NavButton>
          </PaginationContainer>
        )}
      </Section>
    </Container>
  );
};

export default ShopMain;
