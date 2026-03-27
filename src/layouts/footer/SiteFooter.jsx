import { useState } from "react";
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import truckIcon from "../../assets/icons/truck.svg";

const FOOTER_BG = "#f6f6f6";
const FOOTER_NAVY = "#001a57";
const CS_STRIP_BG = "#ececec";
const CS_STRIP_BORDER = "#d4d4d4";

const Shell = styled.footer`
  width: 100%;
  flex-shrink: 0;
  background: ${FOOTER_BG};
  box-sizing: border-box;
`;

const Inner = styled.div`
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md) var(--spacing-lg);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const BrandBlock = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-lg);
  order: 1;
`;

/** Isti vizuelni jezik kao Logo u Header-u — „tvoj“ brend na sajtu */
const BrandWordmark = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: "Montserrat", sans-serif;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: ${FOOTER_NAVY};
  text-transform: uppercase;
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  line-height: 1.2;
`;

const BrandRegion = styled.p`
  margin: 10px 0 0;
  font-size: var(--font-size-small);
  font-weight: 500;
  color: var(--text-200);
  font-family: "Montserrat", var(--font-family, sans-serif);
`;

/** Plava traka — bedževi kao na Haypp referenci (beli / outline) */
const NavyLogosRow = styled.div`
  max-width: var(--max-width-container);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--spacing-md);
  padding: 20px var(--spacing-md) 8px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-lg) var(--spacing-xl);
  }
`;

const NavyGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 14px;
  @media (min-width: 768px) {
    justify-content: flex-start;
    flex: 0 1 auto;
  }
`;

const NavyGroupCenter = styled(NavyGroup)`
  @media (min-width: 768px) {
    justify-content: center;
    flex: 1 1 auto;
  }
`;

const NavyGroupEnd = styled(NavyGroup)`
  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`;

const NavyPayBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  font-family: "Montserrat", sans-serif;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
`;

const NavyPayKlarna = styled(NavyPayBadge)`
  background: rgba(255, 179, 199, 0.25);
  border-color: rgba(255, 200, 215, 0.6);
  color: #fff;
`;

const NavyPayVisa = styled(NavyPayBadge)`
  background: rgba(26, 31, 113, 0.85);
  border-color: rgba(255, 255, 255, 0.35);
`;

const NavyPayMc = styled(NavyPayBadge)`
  background: linear-gradient(
    90deg,
    rgba(235, 0, 27, 0.9) 0%,
    rgba(235, 0, 27, 0.9) 48%,
    rgba(247, 158, 27, 0.95) 52%,
    rgba(247, 158, 27, 0.95) 100%
  );
  border: none;
  padding: 4px 14px;
`;

const ShipIcon = styled.img`
  width: 22px;
  height: 22px;
  filter: brightness(0) invert(1);
  opacity: 0.95;
`;

const NavyShipText = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.92);
  font-family: "Montserrat", sans-serif;
`;

const NavyShipDivider = styled.span`
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.35);
`;

const NavyVerifyBadge = styled.span`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #fff;
  text-transform: uppercase;
  font-family: "Montserrat", sans-serif;
  line-height: 1.15;
  span:last-of-type {
    font-size: 0.55rem;
    letter-spacing: 0.14em;
    opacity: 0.95;
  }
`;

const CustomerServiceStrip = styled.div`
  width: 100%;
  background: ${CS_STRIP_BG};
  border-top: 1px solid ${CS_STRIP_BORDER};
  border-bottom: 1px solid ${CS_STRIP_BORDER};
  box-sizing: border-box;
`;

const CustomerServiceInner = styled.div`
  max-width: var(--max-width-container);
  margin: 0 auto;
  padding: 18px var(--spacing-md);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;

  @media (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    gap: 12px 28px;
  }
`;

const CSTitle = styled.span`
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-100);
  font-family: "Montserrat", sans-serif;
  flex-shrink: 0;
`;

const CSItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const CSIcon = styled.span`
  display: flex;
  color: var(--text-100);
  flex-shrink: 0;
  svg {
    width: 17px;
    height: 17px;
  }
`;

const CSLink = styled.a`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-100);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-family: "Montserrat", sans-serif;
  word-break: break-all;
  &:hover {
    color: ${FOOTER_NAVY};
  }
`;

const CSHours = styled.span`
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.45;
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
  max-width: 100%;
  @media (min-width: 768px) {
    flex: 1 1 200px;
    min-width: min(100%, 320px);
  }
`;

const AccordionRoot = styled.div`
  margin-bottom: var(--spacing-xl);
  order: 3;
  @media (min-width: 1024px) {
    display: none;
  }
`;

const DesktopNavGrid = styled.div`
  display: none;
  order: 2;
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--spacing-xl) var(--spacing-lg);
    align-items: start;
    margin-bottom: var(--spacing-xl);
    padding: 0 4px;
  }
`;

const DesktopCol = styled.div`
  min-width: 0;
  padding: 0 var(--spacing-sm);
  border-right: 1px solid #e2e2e2;
  text-align: left;
  &:last-child {
    border-right: none;
  }
`;

const DesktopColTitle = styled.h3`
  margin: 0 0 var(--spacing-md);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-100);
  font-family: "Montserrat", sans-serif;
`;

const AccordionBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 4px;
  margin: 0;
  border: none;
  border-bottom: 1px solid #e2e2e2;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
  color: var(--text-100);
  font-family: "Montserrat", sans-serif;
  font-size: 0.9375rem;
  font-weight: 600;
  -webkit-tap-highlight-color: transparent;
  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
  }
`;

const AccordionTitle = styled.span``;

const Chevron = styled.span`
  display: flex;
  color: var(--text-200);
  transition: transform 0.2s ease;
  ${({ $open }) =>
    $open &&
    css`
      transform: rotate(90deg);
    `}
  svg {
    width: 20px;
    height: 20px;
  }
`;

const AccordionPanel = styled.div`
  overflow: hidden;
  padding: ${({ $open }) => ($open ? "12px 4px 16px" : "0 4px")};
  max-height: ${({ $open }) => ($open ? "240px" : "0")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: max-height 0.25s ease, opacity 0.2s ease, padding 0.2s ease;
`;

const PanelLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PanelLink = styled(Link)`
  font-size: var(--font-size-small);
  color: var(--text-200);
  text-decoration: none;
  font-family: "Montserrat", sans-serif;
  &:hover {
    color: var(--text-100);
    text-decoration: underline;
  }
`;

const PanelHint = styled.p`
  margin: 0;
  font-size: var(--font-size-small);
  color: var(--text-200);
  line-height: 1.45;
  font-family: "Montserrat", sans-serif;
`;

const NavyStrip = styled.div`
  background: ${FOOTER_NAVY};
  color: var(--bg-100);
  box-sizing: border-box;
`;

const NavySub = styled.p`
  margin: 0;
  padding: 16px var(--spacing-md) 22px;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.5;
  font-family: "Montserrat", sans-serif;
  letter-spacing: 0.02em;
  text-align: center;
  color: rgba(255, 255, 255, 0.88);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

const CopyrightLine = styled.p`
  margin: var(--spacing-lg) 0 0;
  padding: 0 var(--spacing-md) var(--spacing-md);
  text-align: center;
  font-size: 0.6875rem;
  color: var(--text-200);
  font-family: "Montserrat", sans-serif;
  order: 4;
`;

function ShieldVerifyNavy() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <path
        fill="#ffffff"
        d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.59L18 9.5l-7 7z"
      />
    </svg>
  );
}

const SECTIONS = [
  { id: "cs", menuKey: "ACC_MENU_CS", descKey: "ACC_CS_DESC", linkKeys: ["LINK_HELP", "LINK_CONTACT"] },
  { id: "legal", menuKey: "ACC_MENU_LEGAL", descKey: "ACC_LEGAL_DESC", linkKeys: ["LINK_PRIVACY", "LINK_TERMS", "LINK_RETURNS"] },
  { id: "company", menuKey: "ACC_MENU_COMPANY", descKey: "ACC_COMPANY_DESC", linkKeys: ["LINK_ABOUT", "LINK_BLOG"] },
];

/** Izbegava `0 01` u JSX atributu (parsiranje) */
const PHONE_ICON_PATH =
  "M2 3a1 1 0 0 1 1-1h2.153a1 1 0 0 1 .986.836l.74 4.435a1 1 0 0 1-.54 1.06l-1.548.773a11.037 11.037 0 0 0 6.105 6.105l.774-1.548a1 1 0 0 1 1.059-.54l4.435.74a1 1 0 0 1 .836.986V17a1 1 0 0 1-1 1h-2C7.82 18 2 12.18 2 5V3z";

function FooterSectionContent({ section, t }) {
  return (
    <PanelLinks>
      <PanelHint>{t(`FOOTER.${section.descKey}`)}</PanelHint>
      {section.linkKeys.map((lk) => (
        <PanelLink key={lk} to="/">
          {t(`FOOTER.${lk}`)}
        </PanelLink>
      ))}
    </PanelLinks>
  );
}

function SiteFooter() {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <Shell>
      <Inner>
        <BrandBlock>
          <BrandWordmark aria-label={t("FOOTER.BRAND_ARIA", { defaultValue: "SnusCo" })}>
            SNUSCO
          </BrandWordmark>
          <BrandRegion>{t("FOOTER.BRAND_REGION")}</BrandRegion>
        </BrandBlock>

        <DesktopNavGrid>
          {SECTIONS.map((section) => (
            <DesktopCol key={`desk-${section.id}`}>
              <DesktopColTitle>{t(`FOOTER.${section.menuKey}`)}</DesktopColTitle>
              <FooterSectionContent section={section} t={t} />
            </DesktopCol>
          ))}
        </DesktopNavGrid>

        <AccordionRoot>
          {SECTIONS.map((section) => {
            const open = openId === section.id;
            return (
              <div key={section.id}>
                <AccordionBtn
                  type="button"
                  onClick={() => toggle(section.id)}
                  aria-expanded={open}
                  aria-controls={`footer-acc-${section.id}`}
                  id={`footer-acc-btn-${section.id}`}
                >
                  <AccordionTitle>{t(`FOOTER.${section.menuKey}`)}</AccordionTitle>
                  <Chevron $open={open} aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Chevron>
                </AccordionBtn>
                <AccordionPanel
                  id={`footer-acc-${section.id}`}
                  role="region"
                  aria-labelledby={`footer-acc-btn-${section.id}`}
                  $open={open}
                >
                  <FooterSectionContent section={section} t={t} />
                </AccordionPanel>
              </div>
            );
          })}
        </AccordionRoot>

        <CopyrightLine>{t("FOOTER.COPYRIGHT")}</CopyrightLine>
      </Inner>

      <CustomerServiceStrip>
        <CustomerServiceInner>
          <CSTitle>{t("FOOTER.CONTACT_BLOCK_TITLE")}</CSTitle>
          <CSItem>
            <CSIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
            </CSIcon>
            <CSLink href={`mailto:${t("FOOTER.EMAIL")}`}>{t("FOOTER.EMAIL")}</CSLink>
          </CSItem>
          <CSItem>
            <CSIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d={PHONE_ICON_PATH} />
              </svg>
            </CSIcon>
            <CSLink href={`tel:${t("FOOTER.PHONE_RAW")}`}>{t("FOOTER.PHONE")}</CSLink>
          </CSItem>
          <CSHours>{t("FOOTER.HOURS")}</CSHours>
        </CustomerServiceInner>
      </CustomerServiceStrip>

      <NavyStrip>
        <NavyLogosRow aria-label={t("FOOTER.PAYMENT_ARIA", { defaultValue: "Payment and delivery" })}>
          <NavyGroup>
            <NavyPayKlarna>{t("FOOTER.PAYMENT_KLARNA")}</NavyPayKlarna>
            <NavyPayVisa>{t("FOOTER.PAYMENT_VISA")}</NavyPayVisa>
            <NavyPayMc>{t("FOOTER.PAYMENT_MC")}</NavyPayMc>
          </NavyGroup>
          <NavyGroupCenter>
            <ShipIcon src={truckIcon} alt="" aria-hidden />
            <NavyShipText>{t("FOOTER.SHIPPING_AUSTRIA")}</NavyShipText>
            <NavyShipDivider aria-hidden />
            <NavyShipText>{t("FOOTER.SHIPPING_CENTER_EXTRA")}</NavyShipText>
          </NavyGroupCenter>
          <NavyGroupEnd>
            <NavyVerifyBadge>
              <ShieldVerifyNavy />
              <span>18+</span>
              <span>{t("FOOTER.VERIFY_SUB")}</span>
            </NavyVerifyBadge>
          </NavyGroupEnd>
        </NavyLogosRow>
        <NavySub>{t("FOOTER.NAVY_COMPANY_LINE")}</NavySub>
      </NavyStrip>
    </Shell>
  );
}

export default SiteFooter;
