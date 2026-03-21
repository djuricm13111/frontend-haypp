import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { cartActions } from "../../../store/cart-slice";
import { ProductContext } from "../../../context/ProductContext";

const Container = styled.figure`
  min-height: 80px;
  position: relative;
  background-color: var(--bg-100);
  width: 96%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: var(--spacing-sm);
  //box-shadow: var(--shadow-medium);
  margin-bottom: 8px;
  border-bottom: 2px solid var(--bg-300);
  //border-radius: 8px;
`;
const Picture = styled.picture`
  display: flex; // Omogućavanje flex layout-a za centriranje slike
  align-items: center;
  justify-content: center;

  cursor: pointer;
  width: 120px;
  margin: 14px 0;

  position: relative;
  align-self: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const Image = styled.img`
  height: 90%;
  max-height: 100%;
  //max-width: 200px;
  width: 90%;
  max-width: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  &.secondary-image {
    display: none;
  }
`;
const Right = styled.div`
  display: grid;
  grid-template-columns: repeat(1fr);
  gap: 14px;
  width: 100%;
  padding-top: 24px;
  height: 100%;
`;

const AddContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-direction: column;
  padding: var(--spacing-xxs);
`;
const FlexAddContainer = styled.div`
  background-color: var(--background-color-hover-alt);
  //max-width: 130px;
  //border-radius: var(--border-radius-large);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
`;
const Button = styled.button`
  background-color: var(--bg-300);
  border: none;
  padding: 0;
  height: 24px;
  //width: 24px;
  //height: 24px;
  //border-radius: var(--border-radius-large);
  color: var(--text-100);
  &:hover {
    color: var(--text-200);
  }
`;
const Input = styled.input`
  width: calc(var(--font-size-small) * 3 - var(--spacing-sm)); // Širina inputa
  //width: 24px;
  height: 24px; // Visina inputa
  padding: 0;
  margin: 0;
  background-color: var(--bg-300); // Boja pozadine
  text-align: center; // Centriranje teksta
  font-size: 14px;
  //border-radius: var(--border-radius-small);
  border: none;
  font-weight: 400;
  // Uklanjanje strelica za input tipa number
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  // Za Firefox
  &[type="number"] {
    -moz-appearance: textfield;
  }
  //border-radius: 8px;
`;
const FlexDiv = styled.div`
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  //gap: 8px;
`;

const CartProduct = ({ item }) => {
  const { currencyTag } = useContext(ProductContext);
  const [inputValue, setInputValue] = useState(item.quantity);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const [newValue, setNewValue] = useState("");
  const dispatch = useDispatch();

  const deleteCartItem = (id) => {
    dispatch(cartActions.removeFromCart(id));
  };

  const handleAddOne = () => {
    const newQuantity = inputValue + 1;

    dispatch(
      cartActions.updateCart({
        product: item.product,
        quantity: newQuantity,
      })
    );
  };
  const handleRemoveOne = () => {
    const newQuantity = inputValue - 1;
    if (newQuantity === 0) {
      deleteCartItem(item.product.id);
    }
    dispatch(
      cartActions.updateCart({
        product: item.product,
        quantity: newQuantity,
      })
    );
  };
  useEffect(() => {
    setInputValue(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    setInputValue(item.quantity);
  }, [item.quantity]);

  const handleChange = (event) => {
    const value = Math.max(1, Math.min(999, Number(event.target.value)));
    setInputValue(value);
    dispatch(
      cartActions.updateCart({
        product: item.product,
        quantity: value,
      })
    );
  };
  // Try to find a non-primary image; if none exist, use the primary image as fallback
  const primaryImage =
    item.product.images.find((img) => !img.is_primary) ||
    item.product.images.find((img) => img.is_primary);

  return (
    <Container>
      <Picture>
        {primaryImage && (
          <Image
            src={primaryImage.thumbnail}
            alt={`${item.product.category_name} ${item.product.name}`}
            srcSet={`${primaryImage.thumbnail} 320w, ${primaryImage.large} 480w, ${primaryImage.large} 800w`}
            sizes="(max-width: 320px) 300px, (max-width: 480px) 440px, 800px"
            loading="lazy"
            className="primary-image"
          />
        )}
      </Picture>
      <Right>
        <FlexDiv style={{ justifyContent: "space-between" }}>
          <h5 style={{ fontFamily: "Montserrat" }}>
            {item.product.category_name} {item.product.name}{" "}
            {item.product.nicotine}MG
          </h5>
        </FlexDiv>
        <FlexDiv>
          <h3>
            {currencyTag}
            {item.product.discount_price.toFixed(2)}
          </h3>
          <AddContainer>
            <h5 style={{ fontFamily: "Montserrat", letterSpacing: "1px" }}>
              {currencyTag}
              {item.product.discount_price.toFixed(2)}/unit
            </h5>
            <FlexAddContainer>
              <Button onClick={() => handleRemoveOne()}>
                <svg
                  viewBox="0 0 160 161"
                  fill="none"
                  className="svg-icon"
                  style={{ width: "18px", height: "18px" }}
                >
                  <path
                    d="M79.516 159.561c-43.324 0-78.57-35.467-78.57-79.061 0-43.594 35.246-79.061 78.57-79.061 43.323 0 78.57 35.467 78.57 79.061 0 43.594-35.247 79.061-78.57 79.061zm0-148.661c-38.14 0-69.168 31.222-69.168 69.6 0 38.378 31.028 69.6 69.168 69.6 38.14 0 69.168-31.222 69.168-69.6 0-38.378-31.028-69.6-69.168-69.6z"
                    fill="none"
                  ></path>
                  <path
                    d="M108.69 74.379H49.407c-3.359 0-6.083 2.74-6.083 6.12 0 3.382 2.724 6.122 6.084 6.122h59.282c3.36 0 6.084-2.74 6.084-6.121 0-3.38-2.724-6.121-6.084-6.121z"
                    fill="var(--text-200)"
                  ></path>
                </svg>
              </Button>

              <div>
                <Input
                  type="number"
                  max="999"
                  min="0"
                  value={inputValue}
                  onChange={handleChange}
                />
              </div>

              <Button onClick={() => handleAddOne()}>
                <svg
                  viewBox="0 0 161 161"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="svg-icon"
                  style={{ width: "18px", height: "18px" }}
                >
                  <path
                    d="M119.668 74.283H85.76V40.375a6.217 6.217 0 00-12.434 0v33.908H39.418a6.217 6.217 0 000 12.434h33.908v33.908a6.217 6.217 0 1012.434 0V86.717h33.908a6.217 6.217 0 100-12.434z"
                    fill="var(--text-200)"
                  ></path>
                  <path
                    d="M80.013 159.561C36.419 159.561.952 124.094.952 80.5c0-43.594 35.467-79.061 79.06-79.061 43.595 0 79.062 35.467 79.062 79.061 0 43.594-35.467 79.061-79.061 79.061zm0-148.661c-38.378 0-69.6 31.222-69.6 69.6 0 38.378 31.222 69.6 69.6 69.6 38.378 0 69.6-31.222 69.6-69.6 0-38.378-31.222-69.6-69.6-69.6z"
                    fill="none"
                  ></path>
                </svg>
              </Button>
              <svg
                height="20px"
                width="20px"
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                enable-background="new 0 0 50 50"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  deleteCartItem(item.product.id);
                }}
              >
                <path
                  fill="var(--error-color)"
                  d="M10.289,14.211h3.102l1.444,25.439c0.029,0.529,0.468,0.943,0.998,0.943h18.933
	c0.53,0,0.969-0.415,0.998-0.944l1.421-25.438h3.104c0.553,0,1-0.448,1-1s-0.447-1-1-1h-3.741c-0.055,0-0.103,0.023-0.156,0.031
	c-0.052-0.008-0.1-0.031-0.153-0.031h-5.246V9.594c0-0.552-0.447-1-1-1h-9.409c-0.553,0-1,0.448-1,1v2.617h-5.248
	c-0.046,0-0.087,0.021-0.132,0.027c-0.046-0.007-0.087-0.027-0.135-0.027h-3.779c-0.553,0-1,0.448-1,1S9.736,14.211,10.289,14.211z
	 M21.584,10.594h7.409v1.617h-7.409V10.594z M35.182,14.211L33.82,38.594H16.778l-1.384-24.383H35.182z"
                />
                <path
                  fill="var(--error-color)"
                  d="M20.337,36.719c0.02,0,0.038,0,0.058-0.001c0.552-0.031,0.973-0.504,0.941-1.055l-1.052-18.535
	c-0.031-0.552-0.517-0.967-1.055-0.942c-0.552,0.031-0.973,0.504-0.941,1.055l1.052,18.535
	C19.37,36.308,19.811,36.719,20.337,36.719z"
                />
                <path
                  fill="var(--error-color)"
                  d="M30.147,36.718c0.02,0.001,0.038,0.001,0.058,0.001c0.526,0,0.967-0.411,0.997-0.943l1.052-18.535
	c0.031-0.551-0.39-1.024-0.941-1.055c-0.543-0.023-1.023,0.39-1.055,0.942l-1.052,18.535C29.175,36.214,29.596,36.687,30.147,36.718
	z"
                />
                <path
                  fill="var(--error-color)"
                  d="M25.289,36.719c0.553,0,1-0.448,1-1V17.184c0-0.552-0.447-1-1-1s-1,0.448-1,1v18.535
	C24.289,36.271,24.736,36.719,25.289,36.719z"
                />
              </svg>
            </FlexAddContainer>
          </AddContainer>
        </FlexDiv>
      </Right>
    </Container>
  );
};

export default CartProduct;
