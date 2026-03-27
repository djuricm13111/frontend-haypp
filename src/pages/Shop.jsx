import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ShopMain from "../layouts/main/ShopMain";
import PRODUCT_CHUNK, { DEFAULT_LANGUAGE } from "../utils/global_const";
import { useParams } from "react-router-dom";
import { ProductContext } from "../context/ProductContext";
import Header from "../layouts/header/Header";

import brandDescriptions from "../brand_descriptions.json";

const SEOConfig = {
  en: {
    title: "Buy Nicotine Pouches Online | SnusCo Europe",
    description:
      "Discover the best selection of nicotine pouches at SnusCo – shipped from Austria across Europe. Choose from top brands, flavors, and strengths. Fast shipping & secure checkout.",
    keywords:
      "nicotine pouches, snus online, buy snus Europe, snus Austria, nicotine pouches Europe, snusCo shop, best nicotine pouches",
    url: "https://www.snusco.at/en/snus-verkauf",
    images: ["https://www.snusco.at/assets/snuspouch-category-image.jpg"],
  },
  de: {
    title: "Snus & Nikotinbeutel online kaufen | SnusCo Europa",
    description:
      "SnusCo bietet Ihnen eine große Auswahl an Nikotinbeuteln – direkt aus Österreich in ganz Europa geliefert. Wählen Sie aus Top-Marken, Geschmacksrichtungen und Stärken. Schneller Versand & sichere Zahlung.",
    keywords:
      "Nikotinbeutel kaufen, Snus online kaufen, Snus Österreich, SnusCo Shop, Nikotin Pouches Europa, bester Snus, Snus Versand Europa",
    url: "https://www.snusco.at/de/snus-verkauf",
    images: ["https://www.snusco.at/assets/snuspouch-category-image.jpg"],
  },
};

const Shop = () => {
  const { i18n } = useTranslation();
  const { slug } = useParams();
  const [seo, setSeo] = useState(SEOConfig[DEFAULT_LANGUAGE]);
  const { loadProducts, loadProductsByCategorySlug, setCategory, category } =
    useContext(ProductContext);

  useEffect(() => {
    // Odredi jezik
    const lang = i18n.language === "de" ? "de" : "en";
    const defaultSEO = SEOConfig[lang] || SEOConfig[DEFAULT_LANGUAGE];

    // Pokušaj da nadješ brend po slug-u
    const entry = brandDescriptions.find((item) => item.slug === slug);

    if (entry) {
      const descKey = lang === "de" ? "short_desc_de" : "short_desc_en";
      const seoDescription = entry[descKey] || defaultSEO.description;
      const seoTitle = `${entry.brand_name} | SnusCo Österreich`;
      const categoryUrl = `https://www.snusco.at/${lang}/snus-verkauf/${slug}`;

      setSeo({
        title: seoTitle,
        description: seoDescription,
        keywords: `${entry.brand_name}, ${defaultSEO.keywords}`,
        url: categoryUrl,
        images: defaultSEO.images,
      });

      loadProductsByCategorySlug(slug);
    } else {
      loadProducts();
      setCategory(null);
    }
  }, [slug, i18n.language]);

  return (
    <div>
      <Helmet>
        <html lang={i18n.language} />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seo.url} />

        {/* Open Graph slike - Primarna slika na prvom mestu */}
        {seo.images?.map((image, index) => (
          <meta key={index} property="og:image" content={image} />
        ))}

        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="SnusCo" />
        <link rel="canonical" href={seo.url} />
      </Helmet>
      <Header />
      <ShopMain />
    </div>
  );
};

export default Shop;
