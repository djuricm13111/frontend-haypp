import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { cartActions } from "../../../store/cart-slice";
import { ProductContext } from "../../../context/ProductContext";

const THUMB_W = "76px";

/** Sprečava "Velo Velo Ruby Berry" ako je `name` već prefiksiran kategorijom. */
function formatCartProductTitle(categoryName, name, nicotine) {
  const cat = (categoryName || "").trim();
  const n = (name || "").trim();
  const catLower = cat.toLowerCase();
  const nLower = n.toLowerCase();
  let main;
  if (!n) main = cat || "";
  else if (!cat) main = n;
  else if (nLower === catLower) main = n;
  else if (nLower.startsWith(`${catLower} `)) main = n;
  else main = `${cat} ${n}`;
  const mg = nicotine != null ? ` ${nicotine}MG` : "";
  return (main + mg).trim();
}

const Container = styled.article`
  box-sizing: border-box;
  position: relative;
  width: 100%;
  max-width: 100%;
  margin: 0 0 var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  background-color: var(--bg-100);
  border-bottom: 2px solid var(--bg-300);
  display: grid;
  grid-template-columns: ${THUMB_W} minmax(0, 1fr);
  gap: var(--spacing-sm);
  align-items: start;
`;

const Thumb = styled.div`
  width: ${THUMB_W};
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: var(--bg-200);
  align-self: start;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  max-height: 88px;
  object-fit: contain;
  display: block;
`;

const Body = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--spacing-xs);
  min-height: 100%;
`;

const Title = styled.h3`
  margin: 0;
  padding: 0;
  font-family: "Montserrat", sans-serif;
  font-size: var(--header-dropdown-link-size, 0.875rem);
  font-weight: 600;
  line-height: 1.35;
  color: var(--text-100);
  text-align: left;
  align-self: stretch;
`;

const BottomRow = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-sm);
  width: 100%;
`;

const LineTotal = styled.div`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-100);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  text-align: left;
  align-self: flex-end;
  flex-shrink: 0;
  min-width: 0;
`;

const RightStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
`;

const PerUnit = styled.div`
  margin: 0;
  font-family: "Montserrat", sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--text-200);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  text-align: right;
`;

const QtyRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
  flex-wrap: wrap;
`;

const QtyControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  background-color: var(--bg-300);
`;

const StepButton = styled.button`
  background-color: var(--bg-300);
  border: none;
  padding: 0;
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-100);
  cursor: pointer;

  &:hover {
    color: var(--text-200);
  }
`;

const QuantityInput = styled.input`
  width: 2.5rem;
  height: 28px;
  padding: 0;
  margin: 0;
  background-color: var(--bg-300);
  text-align: center;
  font-size: 15px;
  border: none;
  font-weight: 500;
  color: var(--text-100);

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--error-color);
  flex-shrink: 0;

  &:hover {
    opacity: 0.85;
  }

  &:focus-visible {
    outline: 2px solid var(--error-color);
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const CartProduct = ({ item }) => {
  const { currencyTag } = useContext(ProductContext);
  const [inputValue, setInputValue] = useState(item.quantity);
  const dispatch = useDispatch();

  const unitPrice = item.product.discount_price;
  const lineTotal = unitPrice * item.quantity;

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
      return;
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

  const primaryImage =
    item.product.images?.find((img) => img.is_primary) ||
    item.product.images?.[0];

  return (
    <Container>
      <Thumb>
        {primaryImage ? (
          <Image
            src={primaryImage.thumbnail}
            alt={formatCartProductTitle(
              item.product.category_name,
              item.product.name,
              item.product.nicotine
            )}
            srcSet={`${primaryImage.thumbnail} 320w, ${primaryImage.large} 480w, ${primaryImage.large} 800w`}
            sizes="76px"
            loading="lazy"
          />
        ) : null}
      </Thumb>
      <Body>
        <Title>
          {formatCartProductTitle(
            item.product.category_name,
            item.product.name,
            item.product.nicotine
          )}
        </Title>
        <BottomRow>
          <LineTotal>
            {currencyTag}
            {lineTotal.toFixed(2)}
          </LineTotal>
          <RightStack>
            <PerUnit>
              {currencyTag}
              {unitPrice.toFixed(2)}/unit
            </PerUnit>
            <QtyRow>
              <QtyControls>
                <StepButton
                type="button"
                onClick={() => handleRemoveOne()}
                aria-label="Decrease quantity"
              >
                <svg
                  viewBox="0 0 160 161"
                  fill="none"
                  width="18"
                  height="18"
                  aria-hidden
                >
                  <path
                    d="M79.516 159.561c-43.324 0-78.57-35.467-78.57-79.061 0-43.594 35.246-79.061 78.57-79.061 43.323 0 78.57 35.467 78.57 79.061 0 43.594-35.247 79.061-78.57 79.061zm0-148.661c-38.14 0-69.168 31.222-69.168 69.6 0 38.378 31.028 69.6 69.168 69.6 38.14 0 69.168-31.222 69.168-69.6 0-38.378-31.028-69.6-69.168-69.6z"
                    fill="none"
                  />
                  <path
                    d="M108.69 74.379H49.407c-3.359 0-6.083 2.74-6.083 6.12 0 3.382 2.724 6.122 6.084 6.122h59.282c3.36 0 6.084-2.74 6.084-6.121 0-3.38-2.724-6.121-6.084-6.121z"
                    fill="var(--text-200)"
                  />
                </svg>
              </StepButton>
                <QuantityInput
                type="number"
                max={999}
                min={1}
                value={inputValue}
                onChange={handleChange}
                aria-label="Quantity"
              />
                <StepButton
                type="button"
                onClick={() => handleAddOne()}
                aria-label="Increase quantity"
              >
                <svg
                  viewBox="0 0 161 161"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  aria-hidden
                >
                  <path
                    d="M119.668 74.283H85.76V40.375a6.217 6.217 0 00-12.434 0v33.908H39.418a6.217 6.217 0 000 12.434h33.908v33.908a6.217 6.217 0 1012.434 0V86.717h33.908a6.217 6.217 0 100-12.434z"
                    fill="var(--text-200)"
                  />
                  <path
                    d="M80.013 159.561C36.419 159.561.952 124.094.952 80.5c0-43.594 35.467-79.061 79.06-79.061 43.595 0 79.062 35.467 79.062 79.061 0 43.594-35.467 79.061-79.061 79.061zm0-148.661c-38.378 0-69.6 31.222-69.6 69.6 0 38.378 31.222 69.6 69.6 69.6 38.378 0 69.6-31.222 69.6-69.6 0-38.378-31.222-69.6-69.6-69.6z"
                    fill="none"
                  />
                </svg>
              </StepButton>
              </QtyControls>
              <DeleteButton
                type="button"
                onClick={() => deleteCartItem(item.product.id)}
                aria-label="Remove from cart"
              >
              <svg
                width="22"
                height="22"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M10.289,14.211h3.102l1.444,25.439c0.029,0.529,0.468,0.943,0.998,0.943h18.933
	c0.53,0,0.969-0.415,0.998-0.944l1.421-25.438h3.104c0.553,0,1-0.448,1-1s-0.447-1-1-1h-3.741c-0.055,0-0.103,0.023-0.156,0.031
	c-0.052-0.008-0.1-0.031-0.153-0.031h-5.246V9.594c0-0.552-0.447-1-1-1h-9.409c-0.553,0-1,0.448-1,1v2.617h-5.248
	c-0.046,0-0.087,0.021-0.132,0.027c-0.046-0.007-0.087-0.027-0.135-0.027h-3.779c-0.553,0-1,0.448-1,1S9.736,14.211,10.289,14.211z
	 M21.584,10.594h7.409v1.617h-7.409V10.594z M35.182,14.211L33.82,38.594H16.778l-1.384-24.383H35.182z"
                />
                <path
                  fill="currentColor"
                  d="M20.337,36.719c0.02,0,0.038,0,0.058-0.001c0.552-0.031,0.973-0.504,0.941-1.055l-1.052-18.535
	c-0.031-0.552-0.517-0.967-1.055-0.942c-0.552,0.031-0.973,0.504-0.941,1.055l1.052,18.535
	C19.37,36.308,19.811,36.719,20.337,36.719z"
                />
                <path
                  fill="currentColor"
                  d="M30.147,36.718c0.02,0.001,0.038,0.001,0.058,0.001c0.526,0,0.967-0.411,0.997-0.943l1.052-18.535
	c0.031-0.551-0.39-1.024-0.941-1.055c-0.543-0.023-1.023,0.39-1.055,0.942l-1.052,18.535C29.175,36.214,29.596,36.687,30.147,36.718
	z"
                />
                <path
                  fill="currentColor"
                  d="M25.289,36.719c0.553,0,1-0.448,1-1V17.184c0-0.552-0.447-1-1-1s-1,0.448-1,1v18.535
	C24.289,36.271,24.736,36.719,25.289,36.719z"
                />
              </svg>
              </DeleteButton>
            </QtyRow>
          </RightStack>
        </BottomRow>
      </Body>
    </Container>
  );
};

export default CartProduct;
