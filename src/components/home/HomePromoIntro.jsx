import React, { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { shopBasePath } from "../../utils/shopRoutes";

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
  const { i18n } = useTranslation();
  const shopMain = useMemo(() => {
    const lang =
      i18n.language?.split("-")[0]?.toLowerCase() === "de" ? "de" : "en";
    return shopBasePath(lang);
  }, [i18n.language]);

  return (
    <Intro>
      <Trans
        i18nKey="HOME.PROMO_INTRO"
        components={{
          nicotine: <InlineLink to={shopMain} />,
          free: <InlineLink to={shopMain} />,
        }}
      />
    </Intro>
  );
};

export default HomePromoIntro;
