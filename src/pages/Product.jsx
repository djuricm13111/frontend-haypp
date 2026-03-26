import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ProductMain from "../layouts/main/ProductMain";
import { ProductContext } from "../context/ProductContext";
import Header from "../layouts/header/Header";
import {
  DEFAULT_CURRENCY,
  getPriceByQuantity,
  transportMethods,
} from "../utils/global_const";
import descriptions from "../descriptions.json";
import { useParams } from "react-router-dom";

const Container = styled.div`
  background-color: var(--background-color);
  color: var(--text-color);
`;
const RecommendedContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const RecommendedWrapper = styled.div`
  margin-bottom: 20px;
  width: 94%;
  @media (min-width: 1025px) {
    width: var(--max-width-container);
  }
`;

const Product = () => {
  const { t, i18n } = useTranslation();
  const { product, recommendedProducts } = useContext(ProductContext);
  const { slug } = useParams();

  const [currencyCode, setCurrencyCode] = useState(
    localStorage.getItem("currency") || DEFAULT_CURRENCY
  );

  // Generiši canonical URL na b2b.snusco.at
  const productUrl = product
    ? `https://www.snusco.at/${i18n.language}/${slug}`
    : "https://www.snusco.at";

  // Odredi jezik za i18n
  const lang = i18n.language.startsWith("sr")
    ? "sr"
    : i18n.language.startsWith("de")
    ? "de"
    : "en";
  const shortKey = `short_${lang}`;
  // Pronađi opis za trenutni proizvod
  const descItem = descriptions.find((d) => d.slug === slug) || {};
  const metaDescription = descItem[shortKey] || "";

  // Napravi keywords polje na osnovu atributa
  const keywords = [
    product?.category?.name,
    product?.name,
    product?.flavor,
    `${product?.nicotine}mg`,
    product?.format,
    "nicotine pouches",
  ]
    .filter(Boolean)
    .join(", ");

  // OG/Twitter slika
  const ogImage =
    product?.images.find((img) => img.is_primary) || product?.images[0] || null;

  //console.log("tu sam", product);
  return (
    <Container>
      <Helmet>
        <html lang={i18n.language} />
        {/* Title */}
        <title>
          {product?.name
            ? `${product.name} | Nicotine Pouches SnusCo`
            : "Nicotine Pouches SnusCo"}
        </title>

        {/* Meta Description & Keywords */}
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:title" content={product?.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={ogImage} />

        {/* Canonical & Hreflang */}
        <link rel="canonical" href={productUrl} />
        <link rel="alternate" hreflang={i18n.language} href={productUrl} />
        <link rel="alternate" hreflang="x-default" href={productUrl} />

        {/* JSON-LD za Product */}
        {product && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              description: metaDescription,
              sku: product.sku,
              brand: { "@type": "Brand", name: product.category?.name },
              image: ogImage,
              offers: {
                "@type": "Offer",
                priceCurrency: currencyCode,
                price: product.price,
                itemCondition: "https://schema.org/NewCondition",
                availability: "https://schema.org/InStock",
                url: productUrl,
                shippingDetails: {
                  "@type": "OfferShippingDetails",
                  shippingRate: {
                    "@type": "MonetaryAmount",
                    value: transportMethods[0].price,
                    currency: currencyCode,
                  },
                  shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "AT",
                  },
                  shippingMethod: transportMethods[0].name,
                },
              },
            })}
          </script>
        )}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product?.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Header />
      <ProductMain />

      <section
        style={{
          textAlign: "center",
          margin: "40px auto",
        }}
      >
        <h2 style={{ textTransform: "uppercase" }}>
          {t("PRODUCT.RECOMMENDED_PRODUCTS")}
        </h2>
      </section>

    </Container>
  );
};

export default Product;
