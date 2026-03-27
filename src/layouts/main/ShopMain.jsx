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

const Container = styled.article`
  color: ${(props) => props.theme.textColor};
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
`;
const Section = styled.section`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  @media (min-width: 1025px) {
    width: var(--max-width-container);
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
    gap: 12px;
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
  }
  @media (min-width: 1025px) {
    width: var(--max-width-container);
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

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin: 14px 0;
`;

// Stil za opis sa glass efekatom i delimičnim sakrivanjem
const Description = styled.p`
  max-height: ${(props) =>
    props.showAll ? "none" : "70px"}; // Skriva deo teksta
  overflow: hidden;
  position: relative;
  transition: max-height 0.3s ease-in-out;
  max-height: ${(props) =>
    props.$showMore ? "100vh" : "calc(4 * var(--font-size-base))"};

  &::after {
    content: "";
    position: absolute;

    left: 0;
    right: 0;
    top: 0;
    box-shadow: 0px 15px 24px 30px rgba(251, 251, 251, 0.75);
    -webkit-box-shadow: 0px 15px 24px 30px rgba(251, 251, 251, 0.75);
    -moz-box-shadow: 0px 15px 24px 30px rgba(251, 251, 251, 0.75);
    display: ${(props) => (props.$showMore ? "none" : "block")};
    height: 60%;
  }
  @media (min-width: 768px) {
    max-width: 50%;
  }
`;
const Button = styled.div`
  border: none;
  background-color: transparent;
  color: var(--text-100);
  border-color: var(--text-100);
  &:hover {
    background-color: transparent;
    color: var(--text-100);
    border-color: var(--text-100);
  }
  margin: 8px 0 20px 0;
  display: flex;
  align-items: center;
`;

const ShopMain = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const { filteredProducts, category } = useContext(ProductContext);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCT_CHUNK);
  const [showMore, setShowMore] = useState(false);
  const handleShowMore = () => {
    setShowMore((prevState) => !prevState);
  };

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

  const descKey = i18n.language === "de" ? "short_desc_de" : "short_desc_en";

  // Sastavi title i description
  const titleText = entry
    ? slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : category
    ? category.name
    : t("SHOP.TITLE");

  const descriptionText = entry
    ? entry[descKey]
    : category
    ? category.seo_data?.description
    : null;

  return (
    <Container>
      <Section className="header-top-margin">
        <MarginDiv>
          <Breadcrumbs breadcrumbs={breadcrumbItems} />

          <Title>{titleText}</Title>

          {descriptionText ? (
            <Description $showMore={showMore}>{descriptionText}</Description>
          ) : (
            <Description
              $showMore={showMore}
              dangerouslySetInnerHTML={{ __html: t("SHOP.DESCRIPTION") }}
            />
          )}
          <Button onClick={handleShowMore}>
            {showMore ? (
              <>
                {t("SHOP.SEE_LESS")}
                <svg
                  fill="var(--text-100)"
                  width="24px"
                  height="24px"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M759.2 419.8L697.4 358 512 543.4 326.6 358l-61.8 61.8L512 667z" />
                </svg>
              </>
            ) : (
              <>
                {t("SHOP.SEE_MORE")}
                <svg
                  fill="var(--text-100)"
                  width="24px"
                  height="24px"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ transform: "rotate(180deg)" }} // Ispravljeno
                >
                  <path d="M759.2 419.8L697.4 358 512 543.4 326.6 358l-61.8 61.8L512 667z" />
                </svg>
              </>
            )}
          </Button>
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
