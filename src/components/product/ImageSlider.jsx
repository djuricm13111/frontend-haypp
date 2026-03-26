import { useState, useEffect, useCallback, useRef } from "react";
import styled, { css } from "styled-components";

const ContainerDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  ${({ $fill }) =>
    $fill &&
    css`
      flex: 1;
      min-height: 0;
    `}

  @media (min-width: 768px) {
    flex-direction: ${({ $card }) => ($card ? "column" : "row-reverse")};
  }
`;

const SliderDiv = styled.div`
  position: relative;
  width: ${({ $card }) => ($card ? "100%" : "auto")};
  ${({ $card, $fill }) =>
    $card &&
    $fill &&
    css`
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    `}
  @media (min-width: 768px) {
    width: ${({ $card }) => ($card ? "100%" : "80%")};
  }
`;

const SliderViewport = styled.div`
  overflow: hidden;
  width: 100%;
  touch-action: none;
  cursor: grab;
  user-select: none;
  -webkit-user-drag: none;

  ${({ $fill }) =>
    $fill &&
    css`
      flex: 1;
      min-height: 0;
    `}

  &:active {
    cursor: grabbing;
  }
`;

const SliderTrack = styled.div`
  display: flex;
  width: ${({ $count }) => `${$count * 100}%`};
  transition: ${({ $dragging }) =>
    $dragging ? "none" : "transform 0.35s ease"};
  transform: translateX(
    calc(
      ${({ $index, $count, $dragPx }) =>
        `-${($index / $count) * 100}% + ${$dragPx ?? 0}px`}
    )
  );

  ${({ $fill }) =>
    $fill &&
    css`
      height: 100%;
      min-height: 100%;
      align-items: stretch;
    `}
`;

const Slide = styled.div`
  flex: 0 0 ${({ $count }) => `${100 / $count}%`};
  min-width: 0;

  ${({ $fill }) =>
    $fill &&
    css`
      height: 100%;
      display: flex;
      flex-direction: column;
    `}
`;

const ImageContainer = styled.div`
  background-color: ${({ $card }) =>
    $card ? "var(--bg-100)" : "var(--bg-200)"};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $card, $fill }) =>
    $fill && $card
      ? css`
          flex: 1;
          min-height: 160px;
          height: auto;
          width: 100%;
          box-sizing: border-box;
          padding: clamp(16px, 3.2vmin, 40px);
        `
      : css`
          height: ${({ $card }) => ($card ? "260px" : "240px")};
          @media (min-width: 768px) {
            height: ${({ $card }) => ($card ? "380px" : "450px")};
            width: 100%;
          }
        `}
`;

const Image = styled.img`
  width: auto;
  display: block;
  margin: 0 auto;

  ${({ $fill }) =>
    $fill
      ? css`
          width: auto;
          height: auto;
          max-width: min(100%, 820px);
          max-height: 100%;
          object-fit: contain;
        `
      : css`
          height: 90%;
        `}
`;

const Arrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 2;
  color: var(--text-100);

  &:hover {
    background-color: #fff;
  }

  ${(props) =>
    props.$direction === "left" &&
    css`
      left: 8px;
    `}

  ${(props) =>
    props.$direction === "right" &&
    css`
      right: 8px;
    `}
`;

const DotsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ $bar }) => ($bar ? "6px" : "8px")};
  padding: ${({ $bar }) => ($bar ? "16px 0 8px" : "12px 0 0")};
  flex-shrink: 0;

  ${({ $card }) =>
    !$card &&
    css`
      @media (min-width: 768px) {
        display: none;
      }
    `}
`;

const Dot = styled.button`
  padding: 0;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;

  ${({ $bar, $active }) =>
    $bar
      ? css`
          width: 28px;
          height: 4px;
          border-radius: 2px;
          background-color: ${$active ? "var(--primary-100)" : "var(--bg-300)"};
          opacity: ${$active ? 1 : 0.85};
        `
      : css`
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${$active ? "var(--text-100)" : "var(--bg-300)"};
          opacity: ${$active ? 1 : 0.6};
        `}
`;

const GridContainer = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

const GridImageDiv = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: ${({ $hide }) => ($hide ? "none" : "flex")};
    flex-direction: column;
    gap: 12px;
  }
  width: 100px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 450px;
`;

const NavItem = styled.picture`
  min-width: calc(100% - 2px);
  width: calc(100% - 2px);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  background-color: var(--bg-200);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: ${({ $active }) =>
    $active ? "2px solid var(--text-100)" : "1px solid var(--bg-300)"};

  &:hover {
    border-color: var(--text-200);
    background-color: var(--bg-300);
  }
`;

const NavImage = styled.img`
  width: 90%;
  height: 90%;
  object-fit: contain;
`;

const FullScreenModal = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 9999999999;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalInner = styled.div`
  position: relative;
  width: 94%;
  max-width: min(1200px, 100vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
`;

const ModalSliderViewport = styled.div`
  overflow: hidden;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  touch-action: none;
  cursor: grab;
  user-select: none;
  &:active {
    cursor: grabbing;
  }
`;

const ModalSliderTrack = styled.div`
  display: flex;
  width: ${({ $count }) => `${$count * 100}%`};
  transition: ${({ $dragging }) =>
    $dragging ? "none" : "transform 0.35s ease"};
  transform: translateX(
    calc(
      ${({ $index, $count, $dragPx }) =>
        `-${($index / $count) * 100}% + ${$dragPx ?? 0}px`}
    )
  );
`;

const ModalSlide = styled.div`
  flex: 0 0 ${({ $count }) => `${100 / $count}%`};
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  box-sizing: border-box;
`;

const ModalImage = styled.img`
  max-width: 100%;
  height: auto;
  max-height: 80vh;
  cursor: default;
  object-fit: contain;
`;

const StyledSvgIcon = styled.svg`
  position: fixed;
  right: 40px;
  top: 40px;
  width: 40px;
  height: 40px;
  z-index: 5;
  cursor: pointer;

  & path {
    stroke: var(--background-color);
    stroke-width: 4;
  }
`;

const StyledSvgText = styled.span`
  position: fixed;
  top: 50px;
  left: 40px;
  z-index: 5;
  font-weight: 600;
  color: var(--background-color);
`;

function useIsMobile(maxWidth = 767) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, [maxWidth]);

  return isMobile;
}

const DRAG_COMMIT_PX = 48;

const ImageSlider = ({ images, layout = "default", fillHeight = false }) => {
  const isCard = layout === "card";
  const fill = isCard && fillHeight;
  const isMobile = useIsMobile(767);
  const [indexImg, setIndexImg] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const viewportRef = useRef(null);
  const [dragPx, setDragPx] = useState(0);
  const [trackDragging, setTrackDragging] = useState(false);
  const mainDragActive = useRef(false);
  const mainDragStartX = useRef(0);
  const mainDragMoved = useRef(false);
  const mainDragPxRef = useRef(0);

  const modalViewportRef = useRef(null);
  const [modalDragPx, setModalDragPx] = useState(0);
  const [modalTrackDragging, setModalTrackDragging] = useState(false);
  const modalDragActive = useRef(false);
  const modalDragStartX = useRef(0);
  const modalDragPxRef = useRef(0);

  const count = images?.length ?? 0;

  const goTo = useCallback(
    (next) => {
      if (count <= 0) return;
      const i = ((next % count) + count) % count;
      setIndexImg(i);
    },
    [count]
  );

  const goPrev = useCallback(() => goTo(indexImg - 1), [goTo, indexImg]);
  const goNext = useCallback(() => goTo(indexImg + 1), [goTo, indexImg]);

  const onMainPointerDown = (e) => {
    if (count <= 1) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    mainDragActive.current = true;
    mainDragMoved.current = false;
    mainDragStartX.current = e.clientX;
    mainDragPxRef.current = 0;
    setDragPx(0);
    setTrackDragging(true);
    viewportRef.current?.setPointerCapture(e.pointerId);
  };

  const onMainPointerMove = (e) => {
    if (!mainDragActive.current || count <= 1) return;
    let dx = e.clientX - mainDragStartX.current;
    if (Math.abs(dx) > 10) mainDragMoved.current = true;
    if (indexImg === 0 && dx > 0) dx *= 0.35;
    else if (indexImg === count - 1 && dx < 0) dx *= 0.35;
    mainDragPxRef.current = dx;
    setDragPx(dx);
  };

  const endMainPointer = (e) => {
    if (!mainDragActive.current || count <= 1) return;
    mainDragActive.current = false;
    try {
      viewportRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    setTrackDragging(false);
    const dx = mainDragPxRef.current;
    mainDragPxRef.current = 0;
    setDragPx(0);
    if (dx > DRAG_COMMIT_PX) {
      setIndexImg((i) => ((i - 1 + count) % count + count) % count);
    } else if (dx < -DRAG_COMMIT_PX) {
      setIndexImg((i) => ((i + 1) % count + count) % count);
    }
  };

  const onMainPointerUp = (e) => {
    if (mainDragActive.current) endMainPointer(e);
  };

  const onMainPointerCancel = (e) => {
    if (mainDragActive.current) endMainPointer(e);
  };

  const handleImageClick = (index) => {
    setIndexImg(index);
  };

  const handleMainImageClick = (index) => {
    if (mainDragMoved.current) return;
    if (!isMobile) return;
    setModalIndex(index);
    setIndexImg(index);
    setIsModalOpen(true);
  };

  const onModalPointerDown = (e) => {
    if (count <= 1) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    modalDragActive.current = true;
    modalDragStartX.current = e.clientX;
    modalDragPxRef.current = 0;
    setModalDragPx(0);
    setModalTrackDragging(true);
    modalViewportRef.current?.setPointerCapture(e.pointerId);
  };

  const onModalPointerMove = (e) => {
    if (!modalDragActive.current || count <= 1) return;
    let dx = e.clientX - modalDragStartX.current;
    if (modalIndex === 0 && dx > 0) dx *= 0.35;
    else if (modalIndex === count - 1 && dx < 0) dx *= 0.35;
    modalDragPxRef.current = dx;
    setModalDragPx(dx);
  };

  const endModalPointer = (e) => {
    if (!modalDragActive.current || count <= 1) return;
    modalDragActive.current = false;
    try {
      modalViewportRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setModalTrackDragging(false);
    const dx = modalDragPxRef.current;
    modalDragPxRef.current = 0;
    setModalDragPx(0);
    if (dx > DRAG_COMMIT_PX) setModalIndex((i) => (i - 1 + count) % count);
    else if (dx < -DRAG_COMMIT_PX) setModalIndex((i) => (i + 1) % count);
  };

  const onModalPointerUp = (e) => {
    if (modalDragActive.current) endModalPointer(e);
  };

  const onModalPointerCancel = (e) => {
    if (modalDragActive.current) endModalPointer(e);
  };

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const modalGoPrev = useCallback(() => {
    if (count <= 0) return;
    setModalIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const modalGoNext = useCallback(() => {
    if (count <= 0) return;
    setModalIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (count > 1 && e.key === "ArrowLeft") modalGoPrev();
      if (count > 1 && e.key === "ArrowRight") modalGoNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal, modalGoPrev, modalGoNext, count]);

  if (!images || count === 0) {
    return null;
  }

  const showDots = isCard || isMobile;
  const dotBar = isCard;

  return (
    <div>
      <ContainerDiv $card={isCard} $fill={fill}>
        {count > 1 ? (
          <SliderDiv $card={isCard} $fill={fill}>
            <SliderViewport
              ref={viewportRef}
              $fill={fill}
              onPointerDown={onMainPointerDown}
              onPointerMove={onMainPointerMove}
              onPointerUp={onMainPointerUp}
              onPointerCancel={onMainPointerCancel}
            >
              <SliderTrack
                $index={indexImg}
                $count={count}
                $dragPx={dragPx}
                $dragging={trackDragging}
                $fill={fill}
              >
                {images.map((image, index) => (
                  <Slide key={index} $count={count} $fill={fill}>
                    <ImageContainer
                      $card={isCard}
                      $fill={fill}
                      onClick={() => {
                        handleMainImageClick(index);
                      }}
                    >
                      <Image
                        draggable={false}
                        $fill={fill}
                        src={image.thumbnail}
                        alt="Product"
                        srcSet={`${image.thumbnail} 320w, ${image.large} 480w, ${image.large} 800w`}
                        sizes="(max-width: 320px) 300px, (max-width: 480px) 440px, 800px"
                        loading="lazy"
                      />
                    </ImageContainer>
                  </Slide>
                ))}
              </SliderTrack>
            </SliderViewport>
            {!isCard && (
              <>
                <Arrow
                  type="button"
                  aria-label="Prethodna slika"
                  $direction="left"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                >
                  ‹
                </Arrow>
                <Arrow
                  type="button"
                  aria-label="Sledeća slika"
                  $direction="right"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                >
                  ›
                </Arrow>
              </>
            )}
            {showDots && (
              <DotsRow $card={isCard} $bar={dotBar}>
                {images.map((_, i) => (
                  <Dot
                    key={i}
                    type="button"
                    aria-label={`Slika ${i + 1}`}
                    $active={i === indexImg}
                    $bar={dotBar}
                    onClick={() => goTo(i)}
                  />
                ))}
              </DotsRow>
            )}
          </SliderDiv>
        ) : (
          <ImageContainer
            $card={isCard}
            $fill={fill}
            onClick={() => {
              handleMainImageClick(0);
            }}
          >
            <Image
              draggable={false}
              $fill={fill}
              src={images[0].thumbnail}
              alt="Product"
              srcSet={`${images[0].thumbnail} 320w, ${images[0].large} 480w, ${images[0].large} 800w`}
              sizes="(max-width: 320px) 300px, (max-width: 480px) 440px, 800px"
              loading="lazy"
            />
          </ImageContainer>
        )}

        {count > 1 && !isCard && (
          <GridContainer>
            <GridImageDiv $hide={false}>
              {images.map((image, index) => (
                <NavItem
                  key={index}
                  $active={index === indexImg}
                  onClick={() => handleImageClick(index)}
                >
                  <NavImage
                    src={image.thumbnail}
                    alt=""
                    srcSet={`${image.thumbnail} 320w, ${image.large} 480w, ${image.large} 800w`}
                    sizes="100px"
                    loading="lazy"
                  />
                </NavItem>
              ))}
            </GridImageDiv>
          </GridContainer>
        )}
      </ContainerDiv>

      {isModalOpen && (
        <FullScreenModal
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <StyledSvgText>
            {modalIndex + 1}/{count}
          </StyledSvgText>
          <StyledSvgIcon
            focusable="false"
            role="presentation"
            viewBox="0 0 64 64"
            onClick={closeModal}
          >
            <path d="M19 17.61l27.12 27.13m0-27.12L19 44.74" />
          </StyledSvgIcon>
          <ModalInner onClick={(e) => e.stopPropagation()}>
            {count > 1 ? (
              <>
                <ModalSliderViewport
                  ref={modalViewportRef}
                  onPointerDown={onModalPointerDown}
                  onPointerMove={onModalPointerMove}
                  onPointerUp={onModalPointerUp}
                  onPointerCancel={onModalPointerCancel}
                >
                  <ModalSliderTrack
                    $index={modalIndex}
                    $count={count}
                    $dragPx={modalDragPx}
                    $dragging={modalTrackDragging}
                  >
                    {images.map((image, index) => (
                      <ModalSlide key={index} $count={count}>
                        <ModalImage
                          draggable={false}
                          src={image.original}
                          alt={`Povećana slika ${index + 1}`}
                        />
                      </ModalSlide>
                    ))}
                  </ModalSliderTrack>
                </ModalSliderViewport>
                <Arrow
                  type="button"
                  aria-label="Prethodna"
                  $direction="left"
                  onClick={modalGoPrev}
                >
                  ‹
                </Arrow>
                <Arrow
                  type="button"
                  aria-label="Sledeća"
                  $direction="right"
                  onClick={modalGoNext}
                >
                  ›
                </Arrow>
              </>
            ) : (
              <ModalImage
                src={images[0].original}
                alt="Povećana slika"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </ModalInner>
        </FullScreenModal>
      )}
    </div>
  );
};

export default ImageSlider;
