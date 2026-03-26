import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { ThemeProvider } from "styled-components";
import darkTheme from "./utils/theme";
import { AuthUserProvider } from "./context/AuthUserContext";
import Product from "./pages/Product";

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <BrowserRouter>
        <AuthUserProvider>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/:lang/:slug" element={<Product />} />
          </Routes>
        </AuthUserProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
