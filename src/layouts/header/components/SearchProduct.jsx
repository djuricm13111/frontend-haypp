import React, { useState } from "react";
import styled, { css } from "styled-components";
import { useDispatch } from "react-redux";

import { calculatePrice } from "../../../utils/discount";
import AddToCartAnim from "../../../components/animations/AddToCartAnim";
import { cartActions } from "../../../store/cart-slice";

const QUANTITY_OPTIONS = [1, 10, 30, 50];

const SearchProduct = ({
  item,
  currencyTag,
  setIsCartOpen,
  onProductClick,
}) => {
  const dispatch = useDispatch();

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);

  const primaryImage = item?.images?.find((img) => img.is_primary);
  const isOutOfStock = item.is_in_stock === "out_of_stock";

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    setOpenDropdownId((prev) => (prev ? null : item.id));
  };

  const handleSelectQuantity = (quantity, e) => {
    e.stopPropagation();
    setSelectedQuantity(quantity);
    setOpenDropdownId(null);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    dispatch(
      cartActions.addToCart({
        product: item,
        quantity: selectedQuantity,
      })
    );

    setIsCartOpen(true);
    setIsAnimating(true);
  };

  const handleViewProduct = (e) => {
    e.stopPropagation();
    onProductClick(item.category_name, item.name);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const totalPrice =
    calculatePrice(item.price, selectedQuantity) * selectedQuantity;

  return (
    <ProductResult
      onClick={() => onProductClick(item.category_name, item.name)}
    >
      <FlexDivProduct $oos={isOutOfStock}>
        <ProductLeftGroup $oos={isOutOfStock}>
          <ProductImageContainer $oos={isOutOfStock}>
            <ProductPicture>
              {primaryImage && (
                <ProductImage
                  src={primaryImage.thumbnail}
                  alt={item.name}
                  srcSet={`
                    ${primaryImage.thumbnail} 320w,
                    ${primaryImage.large} 480w,
                    ${primaryImage.large} 800w
                  `}
                  sizes="(max-width: 320px) 300px, (max-width: 480px) 440px, 800px"
                  loading="lazy"
                />
              )}
            </ProductPicture>
          </ProductImageContainer>

          <ProductTitle $oos={isOutOfStock}>{item.name}</ProductTitle>
        </ProductLeftGroup>

        {isOutOfStock ? (
          <OutOfStockStretch onClick={(e) => e.stopPropagation()}>
            <OutOfStockButtonWrapper>
              <ViewProductButton
                type="button"
                onClick={handleViewProduct}
                aria-label="View the product"
              >
                <ViewProductLabel>View the product</ViewProductLabel>
                <ArrowRightIcon
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </ArrowRightIcon>
              </ViewProductButton>
            </OutOfStockButtonWrapper>
          </OutOfStockStretch>
        ) : (
          <ProductRightGroup onClick={(e) => e.stopPropagation()}>
            <ProductPriceButton
              onClick={handleToggleDropdown}
              $isOpen={openDropdownId === item.id}
            >
              <PriceLeft>{selectedQuantity}-pack</PriceLeft>

              <PriceRight>
                {currencyTag}
                {totalPrice}
              </PriceRight>

              <ArrowIcon $isOpen={openDropdownId === item.id}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </ArrowIcon>

              {openDropdownId === item.id && (
                <ProductPriceDropdown>
                  {QUANTITY_OPTIONS.map((qty, index) => {
                    const isSelected = selectedQuantity === qty;

                    return (
                      <DropdownOption
                        key={qty}
                        $index={index}
                        onClick={(e) => handleSelectQuantity(qty, e)}
                      >
                        <OptionLabel>{qty}-pack</OptionLabel>

                        <OptionPrice>
                          {currencyTag}
                          {calculatePrice(item.price, qty) * qty}
                        </OptionPrice>

                        <CheckCircle $selected={isSelected}>
                          {isSelected && (
                            <svg
                              fill="var(--text-100)"
                              width="14px"
                              height="14px"
                              viewBox="0 0 1024 1024"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z" />
                            </svg>
                          )}
                        </CheckCircle>
                      </DropdownOption>
                    );
                  })}
                </ProductPriceDropdown>
              )}
            </ProductPriceButton>

            <ButtonWrapper>
              <Button type="button" onClick={handleAddToCart} aria-label="Add to cart">
                <AddToCartLabel>Add to cart</AddToCartLabel>
                <CartIconMobile
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                 
                </CartIconMobile>
              </Button>

              {isAnimating && (
                <AddToCartAnim
                  isAnimating={true}
                  onComplete={handleAnimationComplete}
                />
              )}
            </ButtonWrapper>
          </ProductRightGroup>
        )}
      </FlexDivProduct>
    </ProductResult>
  );
};

export default SearchProduct;

const ProductResult = styled.div`
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-100);
  cursor: pointer;
  width: 94%;
  min-height: 24px;
  justify-content: space-between;
  margin: 0 auto;

  @media (max-width: 767px) {
    width: 100%;
    max-width: 100%;
    padding-left: 4px;
    padding-right: 4px;
    box-sizing: border-box;
  }
`;

const FlexDivProduct = styled.div`
  @media (max-width: 767px) {
    ${(p) =>
      p.$oos
        ? css`
            display: grid;
            grid-template-columns: 52px minmax(0, 1fr) 48px;
            grid-template-rows: auto;
            column-gap: 10px;
            align-items: center;
            width: 100%;
            max-width: 100%;
          `
        : css`
            display: grid;
            grid-template-columns: 52px minmax(0, 1fr) 48px;
            grid-template-rows: auto auto;
            column-gap: 10px;
            row-gap: 6px;
            align-items: center;
            width: 100%;
            max-width: 100%;
          `}
  }

  @media (min-width: 768px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;
    width: 100%;
    background-color: var(--bg-100);
    padding-bottom: 8px;
    border-bottom: 2px solid var(--bg-300);
    height: 100%;
  }
`;

const ProductLeftGroup = styled.div`
  @media (max-width: 767px) {
    display: contents;
  }

  @media (min-width: 768px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    width: 60%;
    max-width: 60%;
    height: 100%;

    ${(p) =>
      p.$oos &&
      css`
        align-items: flex-start;
      `}
  }
`;

const ProductRightGroup = styled.div`
  @media (max-width: 767px) {
    display: contents;
  }

  @media (min-width: 768px) {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    height: 100%;
  }
`;

const OutOfStockStretch = styled.div`
  @media (max-width: 767px) {
    grid-column: 3;
    grid-row: 1;
    width: 48px;
    justify-self: end;
    align-self: start;
    flex-shrink: 0;
  }

  @media (min-width: 768px) {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    min-width: 0;
  }
`;

const ProductImageContainer = styled.div`
  margin-bottom: 12px;
  height: 60px;
  width: 60px;
  flex-shrink: 0;

  @media (max-width: 767px) {
    margin-bottom: 0;
    grid-column: 1;
    ${(p) =>
      p.$oos
        ? css`
            grid-row: 1;
            justify-self: center;
            align-self: start;
          `
        : css`
            grid-row: 1 / 3;
            justify-self: center;
            align-self: start;
          `}
  }

  @media (min-width: 768px) {
    height: 100%;
    margin-bottom: 0;
  }
`;

const ProductPicture = styled.picture`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-200);
  border-radius: 8px;
`;

const ProductImage = styled.img`
  height: 40px;
  background-color: var(--bg-100);
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

  @media (min-width: 768px) {
    height: 60px;
    //height: 100%;
  }
`;

const ProductTitle = styled.h5`
  font-size: 15px;
  font-weight: 400;
  max-width: 100%;
  text-align: left;
  font-family: "Montserrat";
  margin: 0;

  @media (max-width: 767px) {
    grid-column: 2;
    grid-row: 1;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    ${(p) =>
      p.$oos
        ? css`
            align-self: start;
          `
        : css`
            align-self: end;
          `}
  }

  @media (min-width: 768px) {
    padding-bottom: 4px;
  }
`;

const OutOfStockButtonWrapper = styled.div`
  width: 100%;

  @media (max-width: 767px) {
    width: 48px;
  }
`;

const ViewProductLabel = styled.span`
  @media (max-width: 767px) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

const ArrowRightIcon = styled.svg`
  width: 22px;
  height: 22px;
  display: none;
  color: var(--bg-100);
  flex-shrink: 0;

  @media (max-width: 767px) {
    display: block;
  }
`;

const ViewProductButton = styled.button`
  width: 100%;
  font-size: 11px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: var(--primary-100);
  color: var(--bg-100);
  border: 1px solid var(--primary-100);
  padding: var(--spacing-xs) var(--spacing-lg);
  cursor: pointer;
  font-family: "Oswald-Medium", sans-serif;

  &:hover {
    background-color: var(--primary-200);
    border-color: var(--primary-200);
  }

  @media (max-width: 767px) {
    width: 48px;
    height: 48px;
    min-width: 48px;
    padding: 0;
    border-radius: 4px;
  }

  @media (min-width: 768px) {
    width: 100%;
    min-width: 0;

    ${ArrowRightIcon} {
      display: none;
    }

    ${ViewProductLabel} {
      position: static;
      width: auto;
      height: auto;
      margin: 0;
      overflow: visible;
      clip: unset;
      white-space: normal;
    }
  }
`;

const ProductPriceButton = styled.button`
  position: relative;
  width: 100%;
  height: 42px;
  border: none;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 0 10px 0 12px;
  cursor: pointer;
  background-color: ${({ $isOpen }) =>
    $isOpen ? "var(--primary-100)" : "var(--bg-100)"};
  color: ${({ $isOpen }) => ($isOpen ? "var(--bg-100)" : "var(--text-100)")};

  &:hover {
    background-color: ${({ $isOpen }) =>
      $isOpen ? "var(--primary-100)" : "var(--bg-100)"};
    color: ${({ $isOpen }) => ($isOpen ? "var(--bg-100)" : "var(--text-100)")};
  }

  @media (max-width: 767px) {
    grid-column: 2;
    grid-row: 2;
    align-self: start;
    min-width: 0;
    z-index: ${({ $isOpen }) => ($isOpen ? 4 : 0)};
  }

`;

const PriceLeft = styled.span`
  font-family: "Montserrat";
  text-align: left;
  font-size: 13px;
  font-weight: 100;
`;

const PriceRight = styled.span`
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
`;

const ArrowIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease;
`;

const ProductPriceDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  width: 100%;
  background-color: transparent;
  border: 1px solid #d8d8d8;
  border-top: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  z-index: 2;
`;

const DropdownOption = styled.button`
  width: 100%;
  border: none;
  display: grid;
  grid-template-columns: 1fr auto 24px;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  background-color: ${({ $index }) =>
    $index % 2 === 0 ? "var(--bg-100)" : "var(--bg-200)"};

  &:hover {
    background-color: var(--bg-300);
  }
`;

const OptionLabel = styled.span`
  font-family: "Montserrat";
  text-align: left;
  font-size: 12px;
  font-weight: 100;
  color: var(--text-100);
`;

const OptionPrice = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-100);
  white-space: nowrap;
`;

const CheckCircle = styled.span`
  width: 14px;
  height: 14px;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#a8a8a8" : "#cfcfcf")};
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  position: relative;

  @media (max-width: 767px) {
    grid-column: 3;
    grid-row: 1 / 3;
    width: 48px;
    justify-self: end;
    align-self: center;
  }

  @media (min-width: 768px) {
    display: block;
    bottom: 0;
  }
`;

const AddToCartLabel = styled.span`
  @media (max-width: 767px) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

const CartIconMobile = styled.svg`
  width: 22px;
  height: 22px;
  display: none;
  color: var(--bg-100);

  @media (max-width: 767px) {
    display: block;
  }
`;

const Button = styled.button`
  width: 100%;
  font-size: 11px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 767px) {
    width: 48px;
    height: 48px;
    min-width: 48px;
    padding: 0;
    border-radius: 4px;
    flex-shrink: 0;
  }

  @media (min-width: 768px) {
    ${AddToCartLabel} {
      position: static;
      width: auto;
      height: auto;
      margin: 0;
      overflow: visible;
      clip: unset;
    }

    ${CartIconMobile} {
      display: none;
    }
  }
`;
