import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import { useNavigation } from "../../utils/navigation";
import descriptions from "../../descriptions.json";

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
const DropDown = styled.div`
  /* Samo za telefone, primenjuje se display na osnovu $isOpen */
  ${({ $isOpen }) =>
    $isOpen
      ? css`
          display: none; /* Sakrij ako je otvoreno */
        `
      : css`
          display: flex; /* Prikaži ako nije otvoreno */
          align-items: center;
          justify-content: center;
          background-color: var(--bg-100);
        `}
`;
const GridContainer = styled.div`
  width: 100%;
  min-width: 100%;
  overflow-x: hidden;
  position: relative;
  background-color: transparent;
`;
const Box = styled.div`
  width: 100%;
  ${({ $isOpen }) =>
    $isOpen
      ? css`
          animation: ${fadeOutBottom} 0.2s ease-in-out both;
        `
      : css`
          animation: ${fadeInTop} 0.3s ease-in-out both;
        `}
`;

const FlexDiv = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
`;

const InfoCard = styled.div`
  border: 1px solid #c8c8c8;
  border-radius: 0;
  box-shadow: var(--shadow-medium);
  background: var(--bg-100);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
`;

const DescriptionCard = styled(InfoCard)`
  scroll-margin-top: calc(var(--navbar-mini) + var(--navbar-height) + 16px);
  @media (min-width: 768px) {
    scroll-margin-top: calc(var(--navbar-mini) + var(--navbar-height-desktop) + 16px);
  }
`;

const SpecificationCard = styled(InfoCard)``;

const DescriptionHeaderButton = styled.button`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-md);
  margin: 0;
  border: none;
  background: var(--bg-100);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition: background-color 0.15s ease;
  &:hover {
    background-color: var(--bg-200);
  }
  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: -2px;
  }
`;

const DescriptionHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
`;

const DescriptionMainTitle = styled.h2`
  margin: 0;
  font-size: clamp(1rem, 2.4vw, 1.2rem);
  font-weight: 600;
  color: var(--text-100);
  line-height: 1.3;
  font-family: "Oswald-Medium", var(--font-family, sans-serif);
`;

const DescriptionSubTitle = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  font-weight: 400;
  color: var(--text-200);
  line-height: 1.45;
  font-family: "Montserrat", var(--font-family, sans-serif);
`;

const DescriptionChevronWrap = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-200);
  svg {
    width: 28px;
    height: 28px;
  }
`;

const DescriptionBody = styled.div`
  border-top: none;
  background: var(--bg-100);
  padding: var(--spacing-lg) var(--spacing-md);
`;

const DescriptionTextBlock = styled.div`
  width: 100%;
  max-width: 100%;
`;

const SpecTableWrap = styled.div`
  padding: var(--spacing-lg) var(--spacing-md);
  background: var(--bg-100);
`;

const SpecArticleLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--spacing-md);
  margin: 0 var(--spacing-sm) var(--spacing-md);
  padding: 0 2px;
  font-family: "Montserrat", var(--font-family, sans-serif);
`;

const SpecArticleLabel = styled.span`
  font-size: var(--font-size-small);
  font-weight: 600;
  color: var(--text-200);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const SpecArticleValue = styled.span`
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--text-100);
  letter-spacing: 0.02em;
`;

/** Jedna boja, blago uvučeno od ivica kartice */
const SpecTableInner = styled.div`
  margin: 0 var(--spacing-sm);
  border: 1px solid #c8c8c8;
  border-radius: 0;
  background: #f4f4f4;
  overflow: hidden;
`;

const SpecTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Montserrat", var(--font-family, sans-serif);
  font-size: var(--font-size-base);
  background: transparent;
  border: none;
`;

const SpecTableRow = styled.tr`
  background: transparent;
  border-bottom: 1px solid #e0e0e0;
  &:last-child {
    border-bottom: none;
  }
`;

const SpecLabelCell = styled.td`
  padding: 16px var(--spacing-md) 16px var(--spacing-lg);
  vertical-align: middle;
  text-align: left;
  font-size: var(--font-size-small);
  font-weight: 400;
  color: var(--text-200);
  border: none;
  width: 48%;
`;

const SpecValueCell = styled.td`
  padding: 16px var(--spacing-lg) 16px var(--spacing-md);
  vertical-align: middle;
  text-align: right;
  color: var(--text-100);
  font-weight: 400;
  line-height: 1.5;
  border: none;
`;

const CustomLink = styled(Link)`
  font-size: var(--font-size-large);
`;

const SpecValueLink = styled(CustomLink)`
  font-size: inherit;
  font-weight: 700;
  color: var(--text-100);
  text-decoration: underline;
  text-underline-offset: 2px;
  &:hover {
    color: var(--accent-200);
  }
`;
const SectionContainer = styled.div`
  width: 100%;
  background-color: var(--bg-200);
  //padding: 14px;
  border-radius: 6px;
  padding: var(--spacing-md);

  @media (min-width: 768px) {
    display: flex;
    position: relative; /* Ovo je potrebno za relativno pozicioniranje unutar roditelja */
    justify-content: flex-end;
    flex-direction: column;
  }
`;
const Title = styled.h3`
  margin: var(--spacing-lg) 0 var(--spacing-sm);
  font-size: var(--font-size-large);
  font-weight: 600;
  color: var(--text-100);
  line-height: 1.35;
  &:first-child {
    margin-top: 0;
  }
`;

const Paragraph = styled.p`
  margin-bottom: 16px;
`;

const ProductDetails = ({ product }) => {
  const { t, i18n } = useTranslation();
  const { goToCategory, goToShop } = useNavigation();
  const [isOpenBox, setIsOpenBox] = useState([false, true]);
  const [isOpenContainer, setIsOpenContainer] = useState([false, true]);
  const [isBoxAnimating, setIsBoxAnimating] = useState([false, false]);

  /** Kad hash vodi na dugi opis, otvori prvi accordion (false = sadržaj vidljiv u ovom layoutu). */
  useEffect(() => {
    const openLongDescriptionFromHash = () => {
      if (window.location.hash !== "#product-long-description") return;
      setIsOpenBox((prev) => {
        const n = [...prev];
        n[0] = false;
        return n;
      });
      setIsOpenContainer((prev) => {
        const n = [...prev];
        n[0] = false;
        return n;
      });
    };
    openLongDescriptionFromHash();
    window.addEventListener("hashchange", openLongDescriptionFromHash);
    return () =>
      window.removeEventListener("hashchange", openLongDescriptionFromHash);
  }, []);

  const toggleBox = (index) => {
    if (isBoxAnimating[index]) {
      return;
    }

    const updatedIsOpenBox = [...isOpenBox];
    updatedIsOpenBox[index] = !updatedIsOpenBox[index];
    setIsOpenBox(updatedIsOpenBox);

    const updatedIsBoxAnimating = [...isBoxAnimating];
    updatedIsBoxAnimating[index] = true;
    setIsBoxAnimating(updatedIsBoxAnimating);

    setTimeout(
      () => {
        const updatedIsOpenContainer = [...isOpenContainer];
        updatedIsOpenContainer[index] = !updatedIsOpenContainer[index];
        setIsOpenContainer(updatedIsOpenContainer);

        updatedIsBoxAnimating[index] = false;
        setIsBoxAnimating(updatedIsBoxAnimating);
      },
      !isOpenContainer[index] ? 200 : 10
    );
  };

  const { slug } = useParams();
  const [descData, setDescData] = useState(null);

  useEffect(() => {
    const item = descriptions.find((d) => d.slug === slug);
    setDescData(item ?? null);
  }, [slug, descriptions]);

  if (!descData) {
    return <SectionContainer>{t("loading")}</SectionContainer>;
  }

  // 1. Odabir jezika
  const lang = i18n.language.startsWith("sr")
    ? "sr"
    : i18n.language.startsWith("de")
    ? "de"
    : "en";
  const longKey = `long_${lang}`;
  const paras = descData[longKey] || [];

  // 2. Heuristika za naslov
  const isTitle = (str) =>
    str.length < 60 && (str.match(/\./g) || []).length < 2;

  // 3. Funkcija za čišćenje stringa
  const clean = (str = "") =>
    str
      .replace(/[\r\n]+/g, " ") // zamenjuje newline-ove jednim razmakom
      .replace(/""/g, "") // uklanja duple navodnike
      .trim();

  // 4. Grupisanje u sekcije
  const sections = [];
  let current = null;

  paras.forEach((raw) => {
    const text = clean(raw);
    if (!text) return; // preskači prazne stringove

    if (isTitle(text)) {
      current = { title: text, contents: [] };
      sections.push(current);
    } else if (current) {
      current.contents.push(text);
    }
  });
  return (
    <div>
      <GridContainer>
        <DescriptionCard id="product-long-description">
          <DescriptionHeaderButton
            type="button"
            onClick={() => toggleBox(0)}
            aria-expanded={!isOpenContainer[0]}
            aria-controls="product-description-panel"
          >
            <DescriptionHeaderText>
              <DescriptionMainTitle>
                {t("PRODUCT.MORE_INFORMATION_TITLE", {
                  name: product?.name ?? "",
                })}
              </DescriptionMainTitle>
              <DescriptionSubTitle>
                {t("PRODUCT.MORE_INFORMATION_SUBTITLE")}
              </DescriptionSubTitle>
            </DescriptionHeaderText>
            <DescriptionChevronWrap aria-hidden>
              {isOpenBox[0] ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12H18M12 6V18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L18 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </DescriptionChevronWrap>
          </DescriptionHeaderButton>
          <DropDown $isOpen={isOpenContainer[0]}>
            <Box $isOpen={isOpenBox[0]}>
              <FlexDiv>
                <DescriptionBody id="product-description-panel">
                  <DescriptionTextBlock>
                    {sections.map(({ title, contents }, idx) => (
                      <Fragment key={idx}>
                        <Title>{title}</Title>
                        {contents.map((html, i) => (
                          <Paragraph
                            key={i}
                            dangerouslySetInnerHTML={{ __html: html }}
                          />
                        ))}
                      </Fragment>
                    ))}
                  </DescriptionTextBlock>
                </DescriptionBody>
              </FlexDiv>
            </Box>
          </DropDown>
        </DescriptionCard>
        <SpecificationCard>
          <DescriptionHeaderButton
            type="button"
            onClick={() => toggleBox(1)}
            aria-expanded={!isOpenContainer[1]}
            aria-controls="product-specification-panel"
          >
            <DescriptionHeaderText>
              <DescriptionMainTitle>
                {t("PRODUCT.PRODUCT_INFORMATION_TITLE")}
              </DescriptionMainTitle>
              <DescriptionSubTitle>
                {t("PRODUCT.MORE_INFORMATION_SUBTITLE")}
              </DescriptionSubTitle>
            </DescriptionHeaderText>
            <DescriptionChevronWrap aria-hidden>
              {isOpenBox[1] ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12H18M12 6V18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12L18 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </DescriptionChevronWrap>
          </DescriptionHeaderButton>
          <DropDown $isOpen={isOpenContainer[1]}>
            <Box $isOpen={isOpenBox[1]}>
              <SpecTableWrap id="product-specification-panel">
                <SpecArticleLine>
                  <SpecArticleLabel>
                    {t("PRODUCT.ARTICLE_NUMBER")}
                  </SpecArticleLabel>
                  <SpecArticleValue>
                    {product.sku ?? product.id ?? "—"}
                  </SpecArticleValue>
                </SpecArticleLine>
                <SpecTableInner>
                  <SpecTable>
                  <tbody>
                    <SpecTableRow>
                      <SpecLabelCell>{t("PRODUCT.BRAND")}</SpecLabelCell>
                      <SpecValueCell>
                        <SpecValueLink to={goToCategory(product.category_name)}>
                          {product.category_name}
                        </SpecValueLink>
                      </SpecValueCell>
                    </SpecTableRow>
                    <SpecTableRow>
                      <SpecLabelCell>{t("PRODUCT.FLAVOR")}</SpecLabelCell>
                      <SpecValueCell>{product.flavor}</SpecValueCell>
                    </SpecTableRow>
                    <SpecTableRow>
                      <SpecLabelCell>{t("PRODUCT.FORMAT")}</SpecLabelCell>
                      <SpecValueCell>{product.format}</SpecValueCell>
                    </SpecTableRow>
                    <SpecTableRow>
                      <SpecLabelCell>
                        {t("PRODUCT.POUCHES_PER_CAN")}
                      </SpecLabelCell>
                      <SpecValueCell>{product.pouches_per_can}</SpecValueCell>
                    </SpecTableRow>
                    <SpecTableRow>
                      <SpecLabelCell>{t("PRODUCT.NET_WEIGHT")}</SpecLabelCell>
                      <SpecValueCell>{product.net_weight}g</SpecValueCell>
                    </SpecTableRow>
                    <SpecTableRow>
                      <SpecLabelCell>{t("PRODUCT.NICOTINE")}</SpecLabelCell>
                      <SpecValueCell>{product.nicotine}MG</SpecValueCell>
                    </SpecTableRow>
                    <SpecTableRow>
                      <SpecLabelCell>
                        {t("PRODUCT.MANUFACTURER")}
                      </SpecLabelCell>
                      <SpecValueCell>{product.manufacturer}</SpecValueCell>
                    </SpecTableRow>
                    <SpecTableRow>
                      <SpecLabelCell>{t("PRODUCT.STOCK")}</SpecLabelCell>
                      <SpecValueCell>{product.state_display}</SpecValueCell>
                    </SpecTableRow>
                    <SpecTableRow>
                      <SpecLabelCell>{t("PRODUCT.TYPE")}</SpecLabelCell>
                      <SpecValueCell>
                        <SpecValueLink to={goToShop()}>
                          Nicotine pouches
                        </SpecValueLink>
                      </SpecValueCell>
                    </SpecTableRow>
                  </tbody>
                  </SpecTable>
                </SpecTableInner>
              </SpecTableWrap>
            </Box>
          </DropDown>
        </SpecificationCard>
      </GridContainer>
    </div>
  );
};

export default ProductDetails;
