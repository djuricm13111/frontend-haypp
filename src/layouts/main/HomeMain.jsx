import React from "react";
import styled from "styled-components";
import Header from "../../layouts/header/Header";

const Content = styled.div`
  height: 2000px;
  background: #f5f5f5;
`;

const HomeMain = () => {
  return (
    <>
      <Header />
      <Content />
    </>
  );
};

export default HomeMain;
