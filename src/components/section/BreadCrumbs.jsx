import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  width: auto;
  max-width: 100%;
  min-height: inherit;
`;
const Nav = styled.nav`
  margin: 0;
  overflow-x: auto;
  white-space: nowrap;
  padding: 0;
  width: auto;
  min-width: 0;
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  min-height: 0;
`;

const BreadcrumbList = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: var(--font-size-small);
  font-family: "Montserrat", var(--font-family);
  font-weight: 500;
  letter-spacing: 0.01em;
  align-items: center;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  color: ${(props) => (props.isLast ? "var(--text-100)" : "var(--text-200)")};
  font-weight: ${(props) => (props.isLast ? "inherit" : 500)};

  a {
    text-decoration: none;
    color: var(--text-color-secondary);
    font-family: inherit;
    font-weight: 500;
    opacity: 0.75;
    &:hover {
      text-decoration: underline;
      color: var(--text-color-primary);
      opacity: 1;
    }
  }
`;

/** Trenutna stranica — samo ovde Oswald */
const BreadcrumbCurrent = styled.span`
  font-family: "Oswald-Medium", var(--font-family);
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const BreadcrumbSeparator = styled.span`
  margin: 0 8px;
  color: var(--text-200);
`;

const BackArrow = styled.button`
  display: flex;
  align-items: center;
  margin-right: 8px;
  cursor: pointer;
  background-color: var(--bg-200);
  padding: 12px;
  border-radius: 50%;
  border: none;
  flex-shrink: 0;

  svg {
    fill: var(--text-color-secondary);
    &:hover {
      fill: var(--text-color-primary);
    }
  }
`;

/**
 * @param {object} props
 * @param {{ name: string, url: string }[]} props.breadcrumbs
 * @param {boolean} [props.showBackArrow] — strelica „nazad“; podrazumevano false (samo breadcrumb lista)
 */
const Breadcrumbs = ({ breadcrumbs, showBackArrow = false }) => {
  const navigate = useNavigate();

  return (
    <Container>
      {showBackArrow && (
        <BackArrow type="button" onClick={() => navigate(-1)} aria-label="Back">
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M6 12H18M6 12L11 7M6 12L11 17"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </BackArrow>
      )}
      <Nav>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <BreadcrumbItem key={breadcrumb.name} isLast={isLast}>
                {!isLast ? (
                  <>
                    <Link to={breadcrumb.url}>{breadcrumb.name}</Link>
                    <BreadcrumbSeparator>&gt;</BreadcrumbSeparator>
                  </>
                ) : (
                  <BreadcrumbCurrent>{breadcrumb.name}</BreadcrumbCurrent>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Nav>
    </Container>
  );
};

export default Breadcrumbs;
