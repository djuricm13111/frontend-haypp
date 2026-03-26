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
  font-size: clamp(1.45rem, 3.4vw, 2.05rem);
  font-weight: 400;
  color: var(--text-100);
  line-height: 1.25;
  margin: 0 0 var(--spacing-lg);
  letter-spacing: -0.02em;
  max-width: 100%;
  overflow-wrap: break-word;

  @media ${DESKTOP} {
    font-size: clamp(1.2rem, 1.75vw, 1.5rem);
    margin-bottom: var(--spacing-md);
  }
`;

const Subtitle = styled.p`
  font-family: var(--font-family);
  font-size: clamp(0.875rem, 1.65vw, 1rem);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.45;
  margin: 0;
  width: 100%;
  box-sizing: border-box;

  @media ${DESKTOP} {
    font-size: clamp(0.8rem, 1.1vw, 0.875rem);
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
