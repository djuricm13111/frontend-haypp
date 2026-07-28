import styled from "styled-components";

const TOC_BORDER = "#e0e0e0";

/**
 * Zajednička proza za Terms i Privacy (TOC, H2, paragrafi, liste, tabele).
 * Isti vizuelni jezik kao TermsAndConditions; tabele preko .lg-table-wrap.
 */
export const LegalDocumentProse = styled.article`
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  font-family: "Montserrat", sans-serif;
  color: var(--text-200);

  & > h2#toc {
    margin: 0 0 var(--spacing-md);
    padding: var(--spacing-lg) 0 0;
    border-top: 1px solid ${TOC_BORDER};
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    color: var(--text-100);
    scroll-margin-top: 80px;
    line-height: 1.3;
  }

  & > h2#toc + ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px var(--spacing-xl);
    margin: 0;
    padding: 0 0 var(--spacing-lg);
    list-style: none;
    border-bottom: 1px solid ${TOC_BORDER};
    margin-bottom: var(--spacing-xl);
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    min-width: 0;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  & > h2#toc + ul > li {
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  & > h2#toc + ul > li > a {
    display: inline-flex;
    align-items: flex-start;
    gap: 8px;
    font-family: "Montserrat", sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--primary-100);
    text-decoration: none;
    line-height: 1.45;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }

  & > h2#toc + ul > li > a::before {
    content: "›";
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0;
    font-weight: 800;
    font-size: 1rem;
    line-height: 1.2;
    color: var(--primary-100);
  }

  & > h2#toc + ul > li > a:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  & > h2#toc + ul > li > a:focus-visible {
    outline: 2px solid var(--primary-100);
    outline-offset: 2px;
    border-radius: 4px;
  }

  & > h2:not(#toc) {
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
    margin: var(--spacing-xl) 0 var(--spacing-sm);
    color: var(--text-100);
    scroll-margin-top: 80px;
    line-height: 1.3;
  }

  & > h2#toc + ul + h2 {
    margin-top: 0;
  }

  & > p {
    font-size: 0.9375rem;
    line-height: 1.6;
    margin: 0 0 var(--spacing-sm);
    color: var(--text-200);
    font-family: "Montserrat", sans-serif;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }

  & > p a,
  & td a,
  & li a {
    color: var(--primary-100);
    font-weight: 600;
    text-decoration: none;
  }

  & > p a:hover,
  & td a:hover,
  & li a:hover {
    text-decoration: underline;
  }

  & > p strong,
  & td strong,
  & li strong {
    font-weight: 800;
    color: var(--text-100);
  }

  & ul {
    margin: 0 0 var(--spacing-md);
    padding-left: 1.25rem;
    font-size: 0.9375rem;
    line-height: 1.55;
  }

  & > h2#toc + ul {
    padding-left: 0;
  }

  & li {
    margin-bottom: 0.35rem;
  }

  & h3 {
    font-family: "Montserrat", sans-serif;
    font-weight: 700;
    font-size: 1.0625rem;
    margin: var(--spacing-md) 0 var(--spacing-xs);
    color: var(--text-100);
    scroll-margin-top: 80px;
    line-height: 1.38;
  }

  & abbr {
    text-decoration: none;
    border-bottom: 1px dotted var(--text-200);
    cursor: help;
  }

  & code {
    font-size: 0.875em;
    font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas,
      monospace;
    background: rgba(0, 26, 87, 0.07);
    padding: 0.12em 0.4em;
    border-radius: 4px;
    color: var(--text-100);
    word-break: break-word;
  }

  & .lg-table-wrap {
    overflow-x: auto;
    margin: var(--spacing-md) 0 var(--spacing-lg);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
  }

  & .lg-table-wrap table {
    width: 100%;
    min-width: min(100%, 520px);
    border-collapse: collapse;
    font-size: 0.9375rem;
    font-family: "Montserrat", sans-serif;
    table-layout: auto;
  }

  & .lg-table-wrap th {
    text-align: left;
    padding: 10px 12px;
    background: rgba(0, 26, 87, 0.06);
    font-weight: 800;
    color: var(--text-100);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    word-wrap: break-word;
    overflow-wrap: anywhere;
    vertical-align: top;
  }

  & .lg-table-wrap td {
    padding: 10px 12px;
    vertical-align: top;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    color: var(--text-200);
    line-height: 1.45;
    font-size: 0.9375rem;
    font-family: "Montserrat", sans-serif;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }

  & .lg-table-wrap tr:last-child td {
    border-bottom: none;
  }
`;
