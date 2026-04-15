import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const DESKTOP = "(min-width: 1025px)";

const Section = styled.section`
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-container);
  margin-left: auto;
  margin-right: auto;
  background: var(--bg-100);
  padding: var(--spacing-xxl) var(--spacing-md);
  text-align: center;
  overflow-x: clip;
`;

const Inner = styled.div`
  max-width: var(--max-width-container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-family: var(--font-family);
  font-size: clamp(1.65rem, 4vw, 2.35rem);
  font-weight: 400;
  color: var(--text-100);
  line-height: 1.25;
  margin: 0 0 var(--spacing-lg);
  letter-spacing: -0.02em;
  max-width: 100%;
  overflow-wrap: break-word;

  @media (max-width: 767px) {
    font-size: clamp(1.95rem, 6vw, 2.85rem);
  }

  @media ${DESKTOP} {
    font-size: clamp(1.5rem, 2.2vw, 1.9rem);
    margin-bottom: var(--spacing-md);
  }
`;

const Subtitle = styled.p`
  font-family: var(--font-family);
  font-size: clamp(1rem, 2vw, 1.1875rem);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.45;
  margin: 0;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 767px) {
    font-size: clamp(1.125rem, 3.2vw, 1.375rem);
  }

  @media ${DESKTOP} {
    font-size: clamp(0.95rem, 1.35vw, 1.0625rem);
  }
`;

const HomeIntroText = () => {
  const { t } = useTranslation();

  return (
    <Section aria-labelledby="home-intro-title">
      <Inner>
        <Title id="home-intro-title">{t("HOME.HERO_TITLE")}</Title>
        <Subtitle>{t("HOME.HERO_SUBTITLE")}</Subtitle>
      </Inner>
    </Section>
  );
};

export default HomeIntroText;
