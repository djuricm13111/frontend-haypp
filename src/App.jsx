import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import Home from "./pages/Home";
import darkTheme from "./utils/theme";
import { AuthUserProvider } from "./context/AuthUserContext";
import Product from "./pages/Product";
import Shop from "./pages/Shop";
import ShopListing from "./pages/ShopListing";
import AllBrands from "./pages/AllBrands";
import SearchResults from "./pages/SearchResults";
import Checkout from "./pages/Checkout";
import Register from "./pages/Register";
import FreeSample from "./pages/FreeSample";
import UserProfile from "./pages/UserProfile";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BlogListing from "./pages/BlogListing";
import BlogArticle from "./pages/BlogArticle";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import AdminOrdersInbox from "./pages/AdminOrdersInbox";
import SiteFooter from "./layouts/footer/SiteFooter";
import { shopSearchPath, normalizeShopLang } from "./utils/shopRoutes";

const VALID_LANGS = ["en", "de", "hu"];

/** Redirect nepoznatih jezika na /en/... */
function LangGuard({ children }) {
  const { lang } = useParams();
  const { pathname, search } = useLocation();
  if (!VALID_LANGS.includes(lang)) {
    const newPath = pathname.replace(`/${lang}/`, "/en/");
    return <Navigate to={`${newPath}${search}`} replace />;
  }
  return children;
}

/** Stari URL /:lang/search/:query → /:lang/search?q=... */
function SearchLegacyRedirect() {
  const { lang, legacyQuery } = useParams();
  return (
    <Navigate
      to={shopSearchPath(normalizeShopLang(lang), legacyQuery)}
      replace
    />
  );
}

/** Stari URL /:lang/snus-verkauf/:slug → /:lang/:slug */
function BrandRedirect() {
  const { lang, slug } = useParams();
  return <Navigate to={`/${normalizeShopLang(lang)}/${slug}`} replace />;
}

const AppShell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxl);
`;

const Main = styled.main`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
`;

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <BrowserRouter>
        <AuthUserProvider>
          <AppShell>
            <Main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/register" element={<Register />} />
                <Route path="/free-sample" element={<FreeSample />} />
                <Route path="/account" element={<UserProfile />} />
                <Route path="/admin/porudzbine" element={<AdminOrdersInbox />} />
                <Route path="/admin/porudzbine/inbox" element={<Navigate to="/admin/porudzbine" replace />} />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/:lang/bestsellers" element={<LangGuard><ShopListing listing="bestsellers" /></LangGuard>} />
                <Route path="/:lang/new-in-store" element={<LangGuard><ShopListing listing="newInStore" /></LangGuard>} />
                <Route path="/:lang/mixpacks-bundles" element={<LangGuard><ShopListing listing="mixpacks" /></LangGuard>} />
                <Route path="/:lang/offers" element={<LangGuard><ShopListing listing="offers" /></LangGuard>} />
                <Route path="/:lang/all-brands" element={<LangGuard><AllBrands /></LangGuard>} />
                <Route path="/:lang/search/:legacyQuery" element={<LangGuard><SearchLegacyRedirect /></LangGuard>} />
                <Route path="/:lang/search" element={<LangGuard><SearchResults /></LangGuard>} />
                <Route path="/:lang/blog" element={<LangGuard><BlogListing /></LangGuard>} />
                <Route path="/:lang/blog/:slug" element={<LangGuard><BlogArticle /></LangGuard>} />
                <Route path="/:lang/terms" element={<LangGuard><TermsAndConditions /></LangGuard>} />
                <Route path="/:lang/privacy" element={<LangGuard><PrivacyPolicy /></LangGuard>} />
                <Route path="/:lang/accessibility" element={<LangGuard><AccessibilityStatement /></LangGuard>} />
                <Route path="/:lang/reset-password/:uid/:token" element={<LangGuard><ResetPassword /></LangGuard>} />
                <Route path="/:lang/snus-verkauf/flavours" element={<LangGuard><Shop /></LangGuard>} />
                <Route path="/:lang/snus-verkauf/flavours/:flavorSlug" element={<LangGuard><Shop /></LangGuard>} />
                <Route path="/:lang/snus-verkauf/strength" element={<LangGuard><Shop /></LangGuard>} />
                <Route path="/:lang/snus-verkauf/strength/:strengthSlug" element={<LangGuard><Shop /></LangGuard>} />
                <Route path="/:lang/snus-verkauf" element={<LangGuard><Shop /></LangGuard>} />
                <Route path="/:lang/snus-verkauf/:slug" element={<LangGuard><BrandRedirect /></LangGuard>} />
                <Route path="/:lang/:slug" element={<LangGuard><Shop /></LangGuard>} />
                <Route path="/:lang/:category/:slug" element={<LangGuard><Product /></LangGuard>} />
              </Routes>
            </Main>
            <SiteFooter />
          </AppShell>
        </AuthUserProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
