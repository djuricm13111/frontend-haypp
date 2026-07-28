import { Link } from "react-router-dom";
import styled from "styled-components";

const MOBILE_MAX = "(max-width: 767px)";

export const Crumbs = styled.nav`
  margin-bottom: var(--spacing-md);

  @media ${MOBILE_MAX} {
    margin-left: calc(-1 * var(--spacing-xs));
    margin-right: calc(-1 * var(--spacing-xs));
    margin-bottom: var(--spacing-sm);
  }
`;

export const CrumbsList = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.55rem;
  list-style: none;
  margin: 0;
  padding: 0.65rem 1rem 0.7rem;
  background: linear-gradient(
    180deg,
    rgba(0, 48, 87, 0.05) 0%,
    rgba(0, 48, 87, 0.07) 100%
  );
  border: 1px solid rgba(0, 48, 87, 0.1);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  font-family: "Montserrat", sans-serif;
  font-size: 0.8125rem;
  line-height: 1.35;
  box-sizing: border-box;

  @media ${MOBILE_MAX} {
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.3rem 0.45rem;
    padding: 0.5rem 0.65rem;
    border-radius: 8px;
    font-size: 0.75rem;
    line-height: 1.3;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    background: rgba(0, 48, 87, 0.045);
    border-color: rgba(0, 48, 87, 0.08);
    box-shadow: none;
  }
`;

export const CrumbsItem = styled.li`
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;

  @media ${MOBILE_MAX} {
    flex-shrink: 0;
    max-width: none;
  }
`;

export const CrumbSep = styled.span`
  display: inline-flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.28);
  font-weight: 600;
  font-size: 0.75rem;
  user-select: none;
  flex-shrink: 0;

  @media ${MOBILE_MAX} {
    font-size: 0.7rem;
    color: rgba(0, 0, 0, 0.22);
  }
`;

export const CrumbLink = styled(Link)`
  color: var(--primary-100);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s ease, text-decoration 0.15s ease;

  &:hover {
    color: var(--primary-200);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

export const CrumbCurrent = styled.span`
  color: var(--text-100);
  font-weight: 700;
  letter-spacing: 0.01em;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media ${MOBILE_MAX} {
    display: inline;
    -webkit-line-clamp: unset;
    overflow: visible;
    text-overflow: unset;
    white-space: nowrap;
  }
`;
