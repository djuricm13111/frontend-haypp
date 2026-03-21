import styled from "styled-components";
import { useEffect, useState } from "react";
import SearchInput from "./components/SearchInput";
import HeaderList from "./components/HeaderList";
import Search from "./components/Search";
import CartMenu from "./components/CartMenu";
import Language from "./components/Language";
const TopBlock = styled.div`
  height: 40px;
  background-color: var(--success-color);
  color: var(--bg-100);
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: underline;
`;
const TopHeaderSection = styled.div`
  height: 40px;
  background-color: var(--primary-100);
  color: var(--bg-100);
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const TopHeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  max-width: calc(var(--max-width-container) * 0.8);
`;
const IconText = styled.div`
  font-size: var(--font-size-small);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;
const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
  box-shadow: ${(props) =>
    props.$isScrolled ? "0 4px 12px rgba(0,0,0,0.12)" : "none"};
  transition: all 0.2s ease;
  background-color: var(--bg-100);

  z-index: 9;

  //position: sticky;
  position: ${(props) => (props.$isScrolled ? "sticky" : "static")};
  top: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  gap: 0;

  flex-direction: ${(props) => (props.$isScrolled ? "row" : "row-reverse")};

  padding: 0;
  margin: 0;

  width: 100%;
  max-width: var(--max-width-container);
  max-width: ${(props) =>
    props.$isScrolled
      ? "calc(var(--max-width-container) * 0.8 )"
      : "var(--max-width-container)"};

  box-sizing: border-box;

  @media (max-width: 768px) {
    height: var(--navbar-height);
  }

  @media (min-width: 768px) {
    flex-direction: ${(props) =>
      props.$isScrolled ? "row-reverse" : "column"};

    min-height: ${(props) => (props.$isScrolled ? "70px" : "100px")};
  }
`;

const DesktopNavSection = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    width: ${(props) => (props.$isScrolled ? "calc(80% - 76px)" : "80%")};
    margin-top: ${(props) => (props.$isScrolled ? "0" : "16px")};
    justify-content: center;
    align-items: center;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xxlarge);
  color: var(--primary-200);
  font-weight: 100;
  text-transform: capitalize;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
  padding-top: 14px;
`;

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 260);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <TopBlock>VELO from £2.49 + 17% off with code: LUCKY17 ☘️</TopBlock>
      <TopHeaderSection>
        <TopHeaderWrapper>
          <IconText>
            {" "}
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.9 4.5C15.9 3 14.418 2 13.26 2c-.806 0-.869.612-.993 1.82-.055.53-.121 1.174-.267 1.93-.386 2.002-1.72 4.56-2.996 5.325V17C9 19.25 9.75 20 13 20h3.773c2.176 0 2.703-1.433 2.899-1.964l.013-.036c.114-.306.358-.547.638-.82.31-.306.664-.653.927-1.18.311-.623.27-1.177.233-1.67-.023-.299-.044-.575.017-.83.064-.27.146-.475.225-.671.143-.356.275-.686.275-1.329 0-1.5-.748-2.498-2.315-2.498H15.5S15.9 6 15.9 4.5zM5.5 10A1.5 1.5 0 0 0 4 11.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 5.5 10z"
                fill="var(--bg-100)"
              />
            </svg>
            Free Delivery over £4.99
          </IconText>
          <IconText>
            <svg
              width="24px"
              height="24px"
              viewBox="-2.98 0 20.004 20.004"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="thunder" transform="translate(-4.967 -1.996)">
                <path
                  id="secondary"
                  fill="var(--bg-100)"
                  d="M17.76,10.63,9,21l2.14-8H7.05a1,1,0,0,1-1-1.36l3.23-8a1.05,1.05,0,0,1,1-.64h4.34a1,1,0,0,1,1,1.36L13.7,9H17a1,1,0,0,1,.76,1.63Z"
                />
                <path
                  id="primary"
                  d="M17.76,10.63,9,21l2.14-8H7.05a1,1,0,0,1-1-1.36l3.23-8a1.05,1.05,0,0,1,1-.64h4.34a1,1,0,0,1,1,1.36L13.7,9H17a1,1,0,0,1,.76,1.63Z"
                  fill="none"
                  stroke="var(--bg-100)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="0"
                />
              </g>
            </svg>
            Pay with Klarna
          </IconText>
          <div>TrustPilot asx asxasxasxa </div>
          <div>
            <Language />
          </div>
          <div>Sign In</div>
          <CartMenu isScrolled={isScrolled} />
        </TopHeaderWrapper>
      </TopHeaderSection>
      <Logo>
        <svg
          width="64"
          height="64"
          viewBox="0 0 298 298"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M148.707 0C66.7245 0 0 66.7245 0 148.707C0 230.689 66.7245 297.414 148.707 297.414C230.689 297.414 297.414 230.689 297.414 148.707C297.414 66.7245 230.689 0 148.707 0ZM294.707 148.707C294.707 188.275 278.843 224.204 253.18 250.567L244.688 242.074C268.158 217.904 282.669 184.962 282.669 148.707C282.669 112.452 267.878 78.8562 243.988 54.6394L252.48 46.1472C278.563 72.557 294.661 108.766 294.661 148.707H294.707ZM17.3576 148.707C17.3576 76.2899 76.2432 17.4043 148.66 17.4043C221.077 17.4043 279.963 76.2899 279.963 148.707C279.963 221.124 221.077 280.009 148.66 280.009C76.2432 280.009 17.3576 221.124 17.3576 148.707ZM250.52 44.2808L242.028 52.7731C217.858 29.2562 184.915 14.7447 148.614 14.7447C112.312 14.7447 79.416 29.2562 55.2458 52.7731L46.7536 44.2808C73.0701 18.6176 108.999 2.75295 148.567 2.75295C188.135 2.75295 224.11 18.6175 250.427 44.3275L250.52 44.2808ZM44.7939 46.1939L53.2862 54.6862C29.3494 78.9029 14.558 112.172 14.558 148.8C14.558 185.429 29.0693 218.044 52.5862 242.214L44.1406 250.707C18.4307 224.39 2.56627 188.415 2.56627 148.847C2.56627 109.279 18.7107 72.6504 44.7939 46.2872V46.1939ZM46.0539 252.667L54.5461 244.174C78.7629 268.064 111.985 282.856 148.614 282.856C185.242 282.856 218.511 268.064 242.728 244.128L251.22 252.62C224.857 278.703 188.602 294.848 148.66 294.848C108.719 294.848 72.5102 278.703 46.147 252.667"
            fill="var(--primary-200)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M207.722 57.7351C202.622 66.9627 200.922 78.8759 205.416 87.3302C214.54 104.491 230.158 114.314 239.894 131.851C273.15 191.781 209.011 201.72 174.784 209.915C155.428 214.537 143.812 230.506 158.492 258.688C214.436 253.98 258.39 207.07 258.39 149.903C258.39 111.144 238.177 77.1018 207.722 57.7266"
            fill="var(--primary-200)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M191.927 105.506C177.373 95.2564 162.525 82.7355 160.972 63.8935C160.307 55.8558 164.875 48.4915 171.632 43.0459C157.459 40.0907 142.84 39.9776 128.623 42.713C114.406 45.4483 100.873 50.9779 88.8086 58.9812C96.9207 91.2874 127.561 94.6763 155.629 103.143C195.722 115.235 214.322 153.656 158.871 159.818C81.4401 168.423 72.2954 187.545 127.861 256.987C133.447 258.095 139.112 258.763 144.803 258.984C114.222 212.039 131.18 198.9 188.95 180.965C245.166 163.485 224.646 128.565 191.925 105.51"
            fill="var(--primary-200)"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M123.936 118.509C100.162 114.213 67.312 112.348 58.2119 97.5595C57.3549 96.166 56.5939 94.7157 55.9342 93.2188C45.5264 110.296 40.0342 129.915 40.0626 149.915C40.0626 197.952 71.1131 238.761 114.236 253.341C95.0693 233.567 63.4812 210.21 71.1047 172.043C76.204 146.547 105.038 150.269 127.675 148.404C160.298 145.722 156.82 124.463 123.927 118.509"
            fill="var(--primary-200)"
          />
        </svg>
        SnusCo
      </Logo>

      <Container $isScrolled={isScrolled}>
        <MainHeaderWrapper $isScrolled={isScrolled}>
          {/* <SearchInput isScrolled={isScrolled} /> */}

          <Search isScrolled={isScrolled} />
          {isScrolled && <CartMenu isScrolled={isScrolled} />}

          <DesktopNavSection $isScrolled={isScrolled}>
            <HeaderList isScrolled={isScrolled} />
          </DesktopNavSection>
        </MainHeaderWrapper>
      </Container>
    </>
  );
};

export default Header;
