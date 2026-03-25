import React from "react";
import { Trans } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";

/** Prilagodi putanje kad imaš stvarne kategorije u ruti. */
export const PROMO_LINK_TOBACCO_FREE =
  "/category/tobacco-free-nicotine-pouches";
export const PROMO_LINK_NICOTINE_FREE = "/category/nicotine-free-pouches";

const Intro = styled.p`
  margin: 0 0 var(--spacing-lg);
  padding: 0 var(--spacing-xs);
  text-align: left;
  font-size: clamp(0.9rem, 2.1vw, 1.0625rem);
  line-height: 1.55;
  color: var(--text-200);
  font-family: var(--font-family);
  font-weight: 400;
`;

const InlineLink = styled(Link)`
  color: #0a0a0a;
  text-decoration: underline;
  font-weight: 700;
  text-underline-offset: 2px;

  &:hover {
    color: #000000;
    opacity: 0.88;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const HomePromoIntro = () => {
  return (
    <Intro>
      <Trans
        i18nKey="HOME.PROMO_INTRO"
        components={{
          nicotine: (
            <InlineLink to={PROMO_LINK_TOBACCO_FREE} />
          ),
          free: <InlineLink to={PROMO_LINK_NICOTINE_FREE} />,
        }}
      />
    </Intro>
  );
};

export default HomePromoIntro;
