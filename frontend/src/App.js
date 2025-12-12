import React, { Fragment } from "react";
import { Routes, Route } from "react-router-dom";
import { appRoutes } from "./routes";
import DefaultComponents from "./Components/DefaultComponents/DefaultComponents";
import AdminLayout from "./Components/AdminLayout/AdminLayout";
import { CartProvider } from "./Context/CartContext.jsx";
import { WishlistProvider } from "./Context/WishlistContext";

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <Routes>
        {appRoutes.map((route, index) => {
          const Page = route.page;
          const Layout =
            route.layout === "admin"
              ? AdminLayout
              : route.isShowHeader
              ? DefaultComponents
              : Fragment;

          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}
      </Routes>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
