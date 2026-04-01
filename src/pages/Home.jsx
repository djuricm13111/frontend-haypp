import { useContext } from "react";
import styled from "styled-components";
import HomeMain from "../layouts/main/HomeMain";

const Container = styled.div`
  min-height: 400vh;
`;
const Home = () => {
  return (
      <HomeMain />
  );
};

export default Home;
