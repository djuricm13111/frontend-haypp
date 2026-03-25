import React, { useContext, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { ProductContext } from "../../../context/ProductContext";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import APIService from "../../../services/APIService";
import { useNavigation } from "../../../utils/navigation";
import { useTranslation } from "react-i18next";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  @media (min-width: 768px) {
    width: 100%;
  }
`;
const IconDiv = styled.div`
  display: block;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 50px;
  border-radius: 4px;
  @media (min-width: 768px) {
    //display: none;
    background-color: ${(props) =>
      props.$isScrolled ? "transparent" : "var(--primary-100)"};
  }
`;
const SVGSearchTop = styled.svg`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
`;

const FakeInputDiv = styled.div`
  //position: relative;
  display: ${(props) => (props.$isScrolled ? "flex" : "none")};
  height: 30px;
  width: 100%;
  padding: 0 1px;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-300);
  padding: 10px 0px;
  font-weight: 300;
  font-family: "Gudea-Regural";
  cursor: text;
  border-radius: 4px 0 0 4px;

  @media (min-width: 768px) {
    display: ${(props) => (props.$isScrolled ? "none" : "flex")};
  }
`;
const FakeInputSpan = styled.span`
  font-family: "Gudea-Regural";
  font-family: sans-serif;
  font-size: 16px;
  font-weight: 400;
  font-style: normal;
  line-height: 26px;
  letter-spacing: normal;

  color: var(--text-200);

  padding: var(--spacing-xs);
  display: flex;
  align-items: center;

  height: 100%;
`;

//INPUT

const InputContainer = styled.div`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  //display: flex;
  align-items: center;
  justify-content: center;

  /* position: sticky;
  top: 0px; */
  position: ${(props) => (props.$isOpen ? "absolute" : "relative")};
  top: ${(props) => (props.$isScrolled ? "0" : "15px")};
  width: 100vw;
  height: var(--navbar-height);
  @media (min-width: 768px) {
    width: calc(50vw + 60px);
    max-width: calc(50vw + 60px);
    border-radius: 4px;
    height: 50px;
  }

  z-index: 1002;

  background-color: var(--bg-300);
`;

const InputWrapper = styled.div`
  //position: relative;
  height: 100%;
  width: 100%;
  padding: 0 1px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  //gap: 10px;
  //background-color: var(--primary-200);

  @media (min-width: 768px) {
    width: 100%;
  }
`;

const Input = styled.input`
  flex: 10;
  font-weight: 400;
  padding: 0;
  width: 100%;

  padding: var(--spacing-xs);
  font-size: 16px;
  font-style: normal;
  &::placeholder {
    color: var(--text-200);
    font-weight: 400;
    line-height: 26px;
    border: none;
  }

  //background-color: var(--bg-100);
  border: none;
  background-color: var(--bg-300);
  &:focus {
    outline: none;
    background-color: var(--bg-300); /* Subtle background change */
  }
  height: 100%;
  border-radius: 4px;
`;
const SVGContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (min-width: 768px) {
    background-color: var(--primary-100);
  }
  height: 100%;
  border-radius: 4px;
  width: 60px;
  height: 50px;
`;
const SVGSearch = styled.svg`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;
const CancelText = styled.span`
  @media (min-width: 768px) {
    display: none;
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

const SearchInput = ({ isScrolled }) => {
  const { t } = useTranslation();
  const { setSearchedProducts, currencyTag } = useContext(ProductContext);
  const navigate = useNavigate();
  const { goToSearch, goToProduct, goToCategory } = useNavigation();
  const [searchValue, setSearchValue] = useState("");
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchCategories, setSearchCategories] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [show, setShow] = useState(false);

  // Debounce funkcija za pretragu kako bi se izbeglo preterano slanje zahteva
  const debouncedSearch = useRef(
    debounce(async (searchTerm) => {
      // Ovde dodajte logiku za slanje zahteva za pretragu
      console.log("Pretraga za:", searchTerm);
      try {
        const searchData = await APIService.SearchProducts(searchTerm);
        //console.log("searchData", searchData);
        setSearchProducts(searchData.products);
        setSearchCategories(searchData.categories);
        setSearchHistory((prevHistory) => {
          // Check if the searchTerm is a substring of any existing searchTerm in the history
          const isSubstring = prevHistory.some(
            (existingTerm) =>
              existingTerm.includes(searchTerm) &&
              existingTerm.length > searchTerm.length
          );

          // Only add the searchTerm if it is not a substring of any longer searchTerm
          if (!isSubstring) {
            const newHistory = [searchTerm, ...prevHistory];

            // Filter out shorter terms if they are substrings of longer terms
            const filteredHistory = newHistory.filter((item, index) =>
              newHistory.every(
                (otherItem, otherIndex) =>
                  index === otherIndex ||
                  !item.includes(otherItem) ||
                  item.length >= otherItem.length
              )
            );

            return filteredHistory.slice(0, 3);
          }

          return prevHistory;
        });
      } catch (error) {
        console.error("Greška pri pretrazi:", error);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (searchValue && searchValue != "") {
      debouncedSearch(searchValue);
      setIsOpen(true);
    } else {
      setSearchProducts([]);
      setSearchCategories([]);
    }
  }, [searchValue, debouncedSearch]);

  const handleShowAll = (searchValue) => {
    setSearchedProducts(searchProducts);
    navigate(goToSearch(searchValue));
    setSearchProducts([]);
  };

  const [maxProductsToShow, setMaxProductsToShow] = useState(12);
  useEffect(() => {
    const updateProductDisplay = () => {
      if (window.innerWidth >= 1024) {
        setMaxProductsToShow(10); // Desktop
      } else if (window.innerWidth >= 768) {
        setMaxProductsToShow(15); // Tablet
      } else {
        setMaxProductsToShow(20); // Mobilni
      }
    };

    updateProductDisplay();

    window.addEventListener("resize", updateProductDisplay);

    return () => window.removeEventListener("resize", updateProductDisplay);
  }, []);

  const handleProductCardClick = (category_name, name) => {
    navigate(goToProduct(category_name, name));
    setIsOpen(false);
  };
  const handleCategoryCardClick = (name) => {
    navigate(goToCategory(name));
    setIsOpen(false);
    setShow(false);
  };

  const isDesktop = window.innerWidth >= 768;
  const searchStrokeColor = isDesktop
    ? isScrolled
      ? "var(--text-100)"
      : "var(--bg-200)"
    : "var(--text-200)";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <Container $isOpen={isOpen} onClick={() => setIsOpen(true)}>
        <FakeInputDiv $isScrolled={isScrolled}>
          <FakeInputSpan>Search products, brands</FakeInputSpan>
        </FakeInputDiv>
        <IconDiv $isScrolled={isScrolled}>
          <SVGSearchTop
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => setShow(!show)}
          >
            <g clipPath="url(#clip0_335_5465)">
              <path
                d="M2.5 8.33333C2.5 9.09938 2.65088 9.85792 2.94404 10.5657C3.23719 11.2734 3.66687 11.9164 4.20854 12.4581C4.75022 12.9998 5.39328 13.4295 6.10101 13.7226C6.80875 14.0158 7.56729 14.1667 8.33333 14.1667C9.09938 14.1667 9.85792 14.0158 10.5657 13.7226C11.2734 13.4295 11.9164 12.9998 12.4581 12.4581C12.9998 11.9164 13.4295 11.2734 13.7226 10.5657C14.0158 9.85792 14.1667 9.09938 14.1667 8.33333C14.1667 7.56729 14.0158 6.80875 13.7226 6.10101C13.4295 5.39328 12.9998 4.75022 12.4581 4.20854C11.9164 3.66687 11.2734 3.23719 10.5657 2.94404C9.85792 2.65088 9.09938 2.5 8.33333 2.5C7.56729 2.5 6.80875 2.65088 6.10101 2.94404C5.39328 3.23719 4.75022 3.66687 4.20854 4.20854C3.66687 4.75022 3.23719 5.39328 2.94404 6.10101C2.65088 6.80875 2.5 7.56729 2.5 8.33333Z"
                stroke={searchStrokeColor}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 17.5L12.5 12.5"
                stroke={searchStrokeColor}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_335_5465">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </SVGSearchTop>
        </IconDiv>
      </Container>

      <InputContainer $show={show} $isOpen={isOpen} $isScrolled={isScrolled}>
        <InputWrapper>
          <Input
            type="search"
            placeholder={t("PLACEHOLDERS.SEARCH_PRODUCTS")}
            aria-label={t("PLACEHOLDERS.SEARCH_PRODUCTS")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSelect={() => {
              setIsOpen(true);
            }}
          />
          <SVGContainer>
            <SVGSearch
              width="20"
              height="20"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => {
                setShow(!show);
                setIsOpen(false);

                setSearchProducts([]);
                setSearchCategories([]);
              }}
            >
              <path
                fill={isDesktop ? "var(--bg-100)" : "var(--text-200)"}
                d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z"
              />
            </SVGSearch>
          </SVGContainer>
        </InputWrapper>
      </InputContainer>
      <MaskContainer $isOpen={isOpen} onClick={() => setIsOpen(false)} />
    </>
  );
};

export default SearchInput;
