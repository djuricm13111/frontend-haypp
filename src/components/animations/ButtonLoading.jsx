import Lottie from "react-lottie";
import animationData from "../../assets/animations/button-loading.json";
import styled, { css } from "styled-components";

const Container = styled.div`
  position: absolute; /* Apsolutno pozicioniranje da prekrije button */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--primary-200);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;
const Wrapper = styled.div`
  width: 60px;
  height: 30px;
  pointer-events: none;
`;

const ButtonLoading = ({ onComplete }) => {
  const defaultOptions = {
    loop: false, // Promenjeno na false kako bi se animacija izvršila samo jednom
    autoplay: true, // Počinje automatski
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <Container>
      <Wrapper>
        <Lottie
          options={defaultOptions}
          eventListeners={[
            {
              eventName: "complete", // Događaj koji označava kraj animacije
              callback: onComplete, // Funkcija koja se poziva na kraju animacije
            },
          ]}
        />
      </Wrapper>
    </Container>
  );
};

export default ButtonLoading;
