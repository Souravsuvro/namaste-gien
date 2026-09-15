import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/Layout";
import { Home } from "./pages/Home";
import { MenuPage } from "./pages/Menu";
import { OrderPage } from "./pages/Order";
import { AuthPage } from "./pages/Auth";
import { AccountPage } from "./pages/Account";
import { OwnerPage } from "./pages/Owner";
import { ReservePage } from "./pages/Reserve";
import { MobileApp } from "./pages/MobileApp";
import { ContactPage } from "./pages/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="order" element={<OrderPage />} />
          <Route path="reserve" element={<ReservePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="owner" element={<OwnerPage />} />
          <Route path="app" element={<MobileApp />} />
          <Route path="app/menu" element={<MobileApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
