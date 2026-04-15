import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
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
import AdminOrdersInbox from "./pages/AdminOrdersInbox";
import SiteFooter from "./layouts/footer/SiteFooter";
import { shopSearchPath, normalizeShopLang } from "./utils/shopRoutes";

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
                <Route
                  path="/:lang/bestsellers"
                  element={<ShopListing listing="bestsellers" />}
                />
                <Route
                  path="/:lang/new-in-store"
                  element={<ShopListing listing="newInStore" />}
                />
                <Route
                  path="/:lang/mixpacks-bundles"
                  element={<ShopListing listing="mixpacks" />}
                />
                <Route path="/:lang/all-brands" element={<AllBrands />} />
                <Route
                  path="/:lang/search/:legacyQuery"
                  element={<SearchLegacyRedirect />}
                />
                <Route path="/:lang/search" element={<SearchResults />} />
                <Route path="/:lang/blog" element={<BlogListing />} />
                <Route path="/:lang/blog/:slug" element={<BlogArticle />} />
                <Route
                  path="/:lang/reset-password/:uid/:token"
                  element={<ResetPassword />}
                />
                <Route
                  path="/:lang/snus-verkauf/flavours"
                  element={<Shop />}
                />
                <Route
                  path="/:lang/snus-verkauf/flavours/:flavorSlug"
                  element={<Shop />}
                />
                <Route
                  path="/:lang/snus-verkauf/strength"
                  element={<Shop />}
                />
                <Route
                  path="/:lang/snus-verkauf/strength/:strengthSlug"
                  element={<Shop />}
                />
                <Route path="/:lang/snus-verkauf" element={<Shop />} />
                <Route path="/:lang/snus-verkauf/:slug" element={<Shop />} />
                <Route path="/:lang/:category/:slug" element={<Product />} />
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
