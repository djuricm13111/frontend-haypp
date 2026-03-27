import React from "react";
import styled from "styled-components";
import { Trans, useTranslation } from "react-i18next";

const Wrap = styled.section`
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-xxl) var(--spacing-md) var(--spacing-xxl);
  border-top: 1px solid var(--bg-300);
  background: linear-gradient(
    180deg,
    var(--bg-100) 0%,
    var(--bg-200) 55%,
    var(--bg-100) 100%
  );
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxl);

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: var(--spacing-xxl) var(--spacing-xl);
    align-items: start;
  }
`;

const AboutBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const WhyBlock = styled.div`
  padding: var(--spacing-lg) var(--spacing-md);
  border-radius: var(--border-radius-base);
  background: var(--bg-100);
  box-shadow: var(--shadow-small);
  border: 1px solid rgba(0, 32, 105, 0.06);

  @media (min-width: 1024px) {
    border-left: 4px solid var(--primary-100);
  }
`;

const H2 = styled.h2`
  margin: 0;
  font-family: "Montserrat", var(--font-family);
  font-size: clamp(1.25rem, 2.4vw, 1.5rem);
  font-weight: 700;
  color: var(--text-100);
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const Prose = styled.div`
  font-family: var(--font-family);
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--text-100);

  p {
    margin: 0 0 var(--spacing-sm);

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    font-weight: 700;
    color: var(--text-100);
  }
`;

const WhyIntro = styled.p`
  margin: 0 0 var(--spacing-lg);
  font-family: var(--font-family);
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--text-200);

  strong {
    font-weight: 700;
    color: var(--text-100);
  }
`;

const CheckList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const CheckRow = styled.li`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--spacing-sm);
  align-items: start;
`;

const CheckBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  background: var(--secondary-color);
  flex-shrink: 0;
  margin-top: 0.1rem;

  svg {
    width: 0.75rem;
    height: 0.75rem;
    display: block;
  }
`;

const PointTitle = styled.span`
  display: block;
  font-family: "Montserrat", var(--font-family);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-100);
  margin-bottom: 0.2rem;
`;

const PointText = styled.span`
  display: block;
  font-family: var(--font-family);
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-200);
`;

const Footnote = styled.p`
  margin: var(--spacing-lg) 0 0;
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--bg-300);
  font-family: var(--font-family);
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--text-200);
`;

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6l3 3 5-5"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Donji blok početne: o SnusCo + zašto kupovati (liste, brend, dostava).
 */
const HomeAboutTrust = () => {
  const { t } = useTranslation();
  const rawPoints = t("HOME.TRUST.WHY_POINTS", { returnObjects: true });
  const points = Array.isArray(rawPoints) ? rawPoints : [];

  return (
    <Wrap aria-labelledby="home-about-snusco-heading">
      <Inner>
        <AboutBlock>
          <H2 id="home-about-snusco-heading">{t("HOME.TRUST.ABOUT_H2")}</H2>
          <Prose>
            <p>
              <Trans
                i18nKey="HOME.TRUST.ABOUT_P1"
                components={{ strong: <strong /> }}
              />
            </p>
            <p>
              <Trans
                i18nKey="HOME.TRUST.ABOUT_P2"
                components={{ strong: <strong /> }}
              />
            </p>
            <p>{t("HOME.TRUST.ABOUT_P3")}</p>
          </Prose>
        </AboutBlock>

        <WhyBlock aria-labelledby="home-why-snusco-heading">
          <H2 id="home-why-snusco-heading">{t("HOME.TRUST.WHY_H2")}</H2>
          <WhyIntro>
            <Trans
              i18nKey="HOME.TRUST.WHY_INTRO"
              components={{ strong: <strong /> }}
            />
          </WhyIntro>
          <CheckList>
            {points.map((item, i) => (
              <CheckRow key={item.title || i}>
                <CheckBadge>
                  <CheckIcon />
                </CheckBadge>
                <div>
                  <PointTitle>{item.title}</PointTitle>
                  <PointText>{item.text}</PointText>
                </div>
              </CheckRow>
            ))}
          </CheckList>
          <Footnote>{t("HOME.TRUST.FOOTNOTE")}</Footnote>
        </WhyBlock>
      </Inner>
    </Wrap>
  );
};

export default HomeAboutTrust;
