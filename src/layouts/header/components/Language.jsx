import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { languages } from "../../../utils/global_const";

const Mask = styled.div`
  margin-top: var(--spacing-xxs);
  background-color: transparent;
  position: fixed;
  right: 0;
  top: 0;
  z-index: var(--zindex-default);
  min-width: 100%;
  height: 100vh;

  box-sizing: border-box;
`;
const ItemContainer = styled.div`
  position: relative;
  cursor: pointer;
  display: flex;

  align-items: flex-start;
  width: 100%;

  overflow: hidden;

  text-transform: uppercase;
  font-size: var(--font-size-base);
  font-weight: bold;
  font-weight: 500;
  justify-content: space-between;
  flex-direction: column;
  padding: 12px 0;

  @media (min-width: 768px) {
    align-items: flex-end;
    width: auto;
  }
`;
const Span = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-base);
`;
const Picture = styled.picture`
  width: 30px;
  //height: auto;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Image = styled.img`
  width: 100%;
  height: auto; // Da bi se zadržale proporcije slike
  object-fit: cover;
`;
const SVGArrow = styled.svg``;

const RadioContainer = styled.div`
  position: absolute;
  top: calc(40px + var(--spacing-md));
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-items: center;

  width: auto;
  min-width: 200px;
  background-color: var(--bg-100);

  @media (min-width: 768px) {
    position: absolute;
    width: auto;

    top: calc(100% - var(--navbar-mini));
    background-color: var(--bg-200);
  }
  background-color: red;
  z-index: 100000;
`;
const StyledLabel = styled.label`
  width: 94%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  cursor: pointer;
  margin: 8px 0;
  font-size: var(--font-size-base);
  gap: 12px;

  &:hover {
    color: var(--primary-200); // Boja teksta kada je labela hoverovana
  }
`;

const FlagTitleRadio = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  max-width: 100%;
`;
const Language = () => {
  const { i18n } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState(
    languages.find(
      (lang) => lang.code.toLowerCase() === i18n.language.toLowerCase()
    ) || languages[0]
  );

  useEffect(() => {
    // Ažurirajte currentLang svaki put kada se promeni i18n.language
    const foundLang = languages.find(
      (lang) => lang.code.toLowerCase() === i18n.language.toLowerCase()
    );
    setCurrentLang(foundLang || languages[0]); // Postavite na pronađeni jezik ili na podrazumevani jezik ako pronađeni jezik ne postoji
  }, [i18n.language]);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang.code);
    setCurrentLang(lang);
    setShowMenu(false);

    const currentUrl = window.location.pathname;
    const urlSegments = currentUrl.split("/").filter((segment) => segment);

    // Izbacujemo prethodni lang kod ako postoji
    const newUrlSegments = urlSegments.filter(
      (segment) =>
        !languages.some(
          (language) => language.code.toLowerCase() === segment.toLowerCase()
        )
    );

    // Dodajemo novi lang kod
    newUrlSegments.unshift(lang.code.toLowerCase());

    // Kreiramo novi URL
    const newUrl = `/${newUrlSegments.join("/")}`;

    // Menjamo URL bez učitavanja stranice
    window.history.pushState({}, "", newUrl);
  };

  return (
    <>
      {currentLang && (
        <>
          {showMenu && <Mask onClick={toggleMenu} />}
          <ItemContainer onClick={toggleMenu}>
            <Span>
              <Picture>
                <Image
                  src={currentLang.flag}
                  alt={`${currentLang.code}`}
                  loading="lazy"
                />
              </Picture>
              {currentLang.code}
            </Span>
            <SVGArrow
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={showMenu ? { transform: "rotate(180deg)" } : {}}
            >
              <path
                d="M-0.000325203 0.333496L4.66634 5.66683L9.33301 0.333496L-0.000325203 0.333496Z"
                fill="var(--text-color)"
              />
            </SVGArrow>

            {showMenu && (
              <RadioContainer>
                {languages.map((lang) => (
                  <StyledLabel
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                  >
                    <FlagTitleRadio>
                      <Picture>
                        <Image
                          width={30}
                          height={30}
                          src={lang.flag}
                          alt={`${lang.code} flag`}
                        />
                      </Picture>
                      {lang.label} tu sam
                    </FlagTitleRadio>
                  </StyledLabel>
                ))}
              </RadioContainer>
            )}
          </ItemContainer>
        </>
      )}
    </>
  );
};

export default Language;
