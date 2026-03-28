import styled from "styled-components";
import React, {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";

const StaticFlexDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  position: relative;
`;

const SliderWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
`;

const ArrowButton = styled.button`
  border: none;
  background-color: transparent;
  cursor: pointer;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  font-size: 26px;
  color: var(--text-100);

  &:hover {
    background-color: transparent;
    color: var(--text-100);
  }
`;

const SliderViewport = styled.div`
  overflow: hidden;
  flex: 1;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    width: 40px;
    height: 100%;
    pointer-events: none;
    z-index: 2;
  }

  &::before {
    left: 0;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.85),
      rgba(255, 255, 255, 0)
    );
    opacity: ${(props) => (props.$showLeftFade ? 1 : 0)};
    transition: opacity 0.2s ease;
  }

  &::after {
    right: 0;
    background: linear-gradient(
      to left,
      rgba(255, 255, 255, 0.85),
      rgba(255, 255, 255, 0)
    );
    opacity: ${(props) => (props.$showRightFade ? 1 : 0)};
    transition: opacity 0.2s ease;
  }
`;

const SliderTrack = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  transform: translateX(${(props) => `-${props.$offset}px`});
  transition: transform 0.3s ease;
`;

const FlexItem = styled.div`
  flex-shrink: 0;
  border-right: 1px solid var(--text-200);
  padding-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin:14px 0;

  &:last-child {
    border-right: none;
  }
`;

const Text = styled.span`
  position: relative;
  display: inline-block;
  cursor: pointer;
  color: var(--text-100);
  font-size: var(--header-link-size);

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -3px;
    width: 100%;
    height: 2px;
    background: var(--primary-200);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

const DropdownLayer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  z-index: 1000;
`;

const SubHeader = styled.div`
  background-color: var(--bg-100);
  color: var(--text-100);
  border-radius: 0 0 8px 8px;
  box-shadow: var(--shadow-large);
  padding: 10px;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 70vh;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const SubHeaderGrid = styled.div`
  display: grid;
  grid-template-rows: repeat(13, auto);
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  column-gap: clamp(16px, 3vw, 32px);
  row-gap: 10px;
  align-items: start;
  width: 100%;
  min-width: 0;
`;

const SubHeaderItem = styled.div`
  padding: 4px 8px;
  cursor: pointer;
  min-width: 0;
  font-weight: 100;
  font-size: var(--header-dropdown-link-size);
`;

const SubHeaderHeading = styled.h3`
  margin: 0 0 4px 0;
  font-size: var(--header-dropdown-heading-size);
  font-weight: 600;
  font-family: "Montserrat", sans-serif;
  line-height: 1.25;
  color: var(--text-100);
`;

const SubHeaderTitleText = styled.h5`
  font-size: var(--header-dropdown-title-size);
  font-family: "Montserrat", sans-serif;
  margin: 2px 0 10px 0;
  font-weight: 400;
  line-height: 1.35;
`;
const MenuTitleLink = styled.a`
  font-family: "Oswald-Medium";
  font-weight: 700;
  font-size: var(--header-dropdown-title-size);
  text-decoration: none;
  color: var(--text-100);

  &:hover {
    color: var(--primary-200);
  }
`;

const MenuLink = styled.a`
  font-weight: 400;
  font-size: var(--header-dropdown-link-size);
  text-decoration: none;
  color: var(--text-100);
  font-family: "Montserrat";

  &:hover {
    color: var(--primary-200);
  }
`;

const Spacer = styled.div`
  height: 8px;
`;

export const navItems = [
  "Nicotine Pouches",
  "Nicotine Free Pouches",
  "Caffeine Pouches",
  "99p Pouches",
  "New",
  "Bestsellers",
  "Offers & Deals",
  "All Brands",
];

/** Dinamički linkovi ka `/{lang}/snus-verkauf/...` za brend, ukus i jačinu. */
export function buildDropdownData(shopBase) {
  return {
    first: [
      {
        title: "Popular Brands",
        href: shopBase,
        items: [
          { label: "ZYN", href: `${shopBase}/zyn` },
          { label: "Nordic Spirit", href: `${shopBase}/nordic-spirit` },
          { label: "VELO", href: `${shopBase}/velo` },
          { label: "FUMi", href: `${shopBase}/fumi` },
          { label: "XQS", href: `${shopBase}/xqs` },
          { label: "KILLA", href: `${shopBase}/killa` },
          { label: "PABLO", href: `${shopBase}/pablo` },
        ],
      },
      {
        title: "Shop by Flavour",
        href: `${shopBase}/flavours/mint`,
        items: [
          { label: "Mint Pouches", href: `${shopBase}/flavours/mint` },
          { label: "Fruit Pouches", href: `${shopBase}/flavours/fruit` },
          { label: "Coffee Pouches", href: `${shopBase}/flavours/coffee` },
        ],
      },
      {
        title: "Shop by Strength",
        href: `${shopBase}/strength/low`,
        items: [
          { label: "Low", href: `${shopBase}/strength/low` },
          { label: "Normal", href: `${shopBase}/strength/normal` },
          { label: "Strong", href: `${shopBase}/strength/strong` },
          { label: "Extra Strong", href: `${shopBase}/strength/extra-strong` },
          { label: "Ultra Strong", href: `${shopBase}/strength/ultra-strong` },
        ],
      },
      {
        title: "Snus Pouches",
        href: "/snus",
      },
      {
        title: "Subscriptions",
        href: "/subscriptions",
      },
      {
        title: "Free Sample",
        href: "/free-sample",
      },
      {
        title: "Can of the Month",
        href: "/can-of-the-month",
      },
    ],
    second: [
      { title: "Free Sample", href: "/free-sample" },
      { title: "Mixpacks & Bundles", href: "/mixpacks-bundles" },
    ],
  };
}

const HOVER_CLOSE_DELAY = 250;

const HeaderList = ({ isScrolled }) => {
  const { i18n } = useTranslation();
  const lang =
    i18n.language?.split("-")[0]?.toLowerCase() === "de" ? "de" : "en";
  const shopBase = `/${lang}/snus-verkauf`;
  const dropdownData = useMemo(() => buildDropdownData(shopBase), [shopBase]);

  const [sliderOffset, setSliderOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  const wrapperRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const updateSliderLimits = () => {
    if (!viewportRef.current || !trackRef.current) return;

    const viewportWidth = viewportRef.current.offsetWidth;
    const trackWidth = trackRef.current.scrollWidth;
    const nextMaxOffset = Math.max(trackWidth - viewportWidth, 0);

    setMaxOffset(nextMaxOffset);
    setSliderOffset((prev) => Math.min(prev, nextMaxOffset));
  };

  useLayoutEffect(() => {
    if (!isScrolled) return;

    updateSliderLimits();

    const resizeObserver = new ResizeObserver(() => {
      updateSliderLimits();
    });

    if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);
    if (viewportRef.current) resizeObserver.observe(viewportRef.current);
    if (trackRef.current) resizeObserver.observe(trackRef.current);

    window.addEventListener("resize", updateSliderLimits);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSliderLimits);
    };
  }, [isScrolled]);

  useEffect(() => {
    if (!isScrolled) {
      setSliderOffset(0);
      setMaxOffset(0);
    }
  }, [isScrolled]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openDropdown = (dropdownKey) => {
    clearCloseTimeout();
    setActiveDropdown(dropdownKey);
  };

  const closeDropdownWithDelay = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, HOVER_CLOSE_DELAY);
  };

  const canSlideLeft = sliderOffset > 1;
  const canSlideRight = sliderOffset < maxOffset - 1;

  const handleSlideRight = () => {
    if (!viewportRef.current) return;
    const step = viewportRef.current.offsetWidth * 0.9;
    setSliderOffset((prev) => Math.min(prev + step, maxOffset));
  };

  const handleSlideLeft = () => {
    if (!viewportRef.current) return;
    const step = viewportRef.current.offsetWidth * 0.9;
    setSliderOffset((prev) => Math.max(prev - step, 0));
  };

  const renderNavItem = (item, index) => {
    const hasFirstDropdown = index === 0;
    const hasSecondDropdown = index === 6;

    return (
      <FlexItem
        key={`${item}-${index}`}
        onMouseEnter={(e) => {
          if (hasFirstDropdown) openDropdown("first", e.currentTarget);
          if (hasSecondDropdown) openDropdown("second", e.currentTarget);
        }}
        onMouseLeave={() => {
          if (hasFirstDropdown || hasSecondDropdown) {
            closeDropdownWithDelay();
          }
        }}
      >
        <Text>{item}</Text>

        {(hasFirstDropdown || hasSecondDropdown) && (
          <svg
            fill="var(--text-100)"
            width="20px"
            height="20px"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M759.2 419.8L697.4 358 512 543.4 326.6 358l-61.8 61.8L512 667z" />
          </svg>
        )}
      </FlexItem>
    );
  };

  const renderDropdown = () => {
    if (!activeDropdown) return null;
    const data = dropdownData[activeDropdown] || [];

    return (
      <DropdownLayer
        onMouseEnter={clearCloseTimeout}
        onMouseLeave={closeDropdownWithDelay}
      >
        {activeDropdown === "first" && (
          <SubHeader>
            <SubHeaderItem>
              <SubHeaderHeading>Nicotine Pouches</SubHeaderHeading>
              <SubHeaderTitleText>
                Here you will find all our Nicotine Pouches
              </SubHeaderTitleText>

              <SubHeaderGrid>
                {data.map((section, i) => (
                  <React.Fragment key={i}>
                    {i !== 0 && <Spacer />}

                    {/* TITLE kao link */}
                    <MenuTitleLink href={section.href}>
                      {section.title}
                    </MenuTitleLink>

                    {/* ako ima items */}
                    {section.items?.map((item, j) => (
                      <MenuLink key={j} href={item.href}>
                        {item.label}
                      </MenuLink>
                    ))}
                  </React.Fragment>
                ))}
              </SubHeaderGrid>
            </SubHeaderItem>
          </SubHeader>
        )}

        {activeDropdown === "second" && (
          <SubHeader>
            <SubHeaderItem>
              <SubHeaderHeading>Offers & Deals</SubHeaderHeading>
              <SubHeaderTitleText>
                Here you will find all our Offers & Deals
              </SubHeaderTitleText>
              <SubHeaderGrid>
                {dropdownData.second.map((row) => (
                  <MenuTitleLink key={row.href} href={row.href}>
                    {row.title}
                  </MenuTitleLink>
                ))}
              </SubHeaderGrid>
            </SubHeaderItem>
          </SubHeader>
        )}
      </DropdownLayer>
    );
  };

  if (!isScrolled) {
    return (
      <StaticFlexDiv ref={wrapperRef}>
        {navItems.map(renderNavItem)}
        {renderDropdown()}
      </StaticFlexDiv>
    );
  }

  return (
    <SliderWrapper ref={wrapperRef}>
      {canSlideLeft && <ArrowButton onClick={handleSlideLeft}>←</ArrowButton>}

      <SliderViewport
        ref={viewportRef}
        $showLeftFade={canSlideLeft}
        $showRightFade={canSlideRight}
      >
        <SliderTrack ref={trackRef} $offset={sliderOffset}>
          {navItems.map(renderNavItem)}
        </SliderTrack>
      </SliderViewport>

      {canSlideRight && <ArrowButton onClick={handleSlideRight}>→</ArrowButton>}

      {renderDropdown()}
    </SliderWrapper>
  );
};

export default HeaderList;
