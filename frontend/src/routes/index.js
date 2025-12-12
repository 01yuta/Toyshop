import HomePage from "../Pages/HomePage/HomePage";
import ProductsPage from "../Pages/ProductsPage/ProductsPage";
import NotFoundPage from "../Pages/NotFoundPage/NotFoundPage";
import LoginPage from "../Pages/LoginPage/LoginPage";
import RegisterPage from "../Pages/RegisterPage/RegisterPage";
import ShippingPage from "../Pages/Checkout/ShippingPage";
import PaymentPage from "../Pages/Checkout/PaymentPage";
import ReviewPage from "../Pages/Checkout/ReviewPage";
import ScalePage from "../Pages/ScalePage/ScalePage";
import ModelsPage from "../Pages/ModelsPage/ModelsPage";
import AboutPage from "../Pages/AboutPage/AboutPage";
import CheckoutSuccessPage from "../Pages/Checkout/CheckoutSuccess";
import ProductDetailPage from "../Pages/ProductDetailPage/ProductDetailPage";
import AdminProducts from "../Pages/AdminProducts/AdminProducts";
import AdminUsers from "../Pages/AdminUsers/AdminUsers";
import MyOrders from "../Pages/MyOrders/MyOrders";
import AdminOrders from "../Pages/AdminOrders/AdminOrders";
import AdminSales from "../Pages/AdminSales/AdminSales";
import AdminChat from "../Pages/AdminChat/AdminChat";
import MyProfile from "../Pages/MyProfile/MyProfile";
import WishlistPage from "../Pages/WishlistPage/WishlistPage";
import ForgotPasswordPage from "../Pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "../Pages/ResetPasswordPage/ResetPasswordPage";
export const appRoutes = [
  {
    path: "/",
    page: HomePage,
    isShowHeader: true,
  },
  {
    path: "/products",
    page: ProductsPage,
    isShowHeader: true,
  },
  {
    path: "/products/:id",
    page: ProductDetailPage,
    isShowHeader: true,
  },
  {
    path: "/login",
    page: LoginPage,
    isShowHeader: false,
  },
  {
    path: "/register",
    page: RegisterPage,
    isShowHeader: false,
  },
  {
    path: "/forgot-password",
    page: ForgotPasswordPage,
    isShowHeader: false,
  },
  {
    path: "/reset-password",
    page: ResetPasswordPage,
    isShowHeader: false,
  },
  {
    path: "/scales",
    page: ScalePage,
    isShowHeader: true,
  },
  {
    path: "/models",
    page: ModelsPage,
    isShowHeader: true,
  },
  {
    path: "/about",
    page: AboutPage,
    isShowHeader: true,
  },
  {
    path: "/checkout/shipping",
    page: ShippingPage,
    isShowHeader: false,
  },
  {
    path: "/checkout/payment",
    page: PaymentPage,
    isShowHeader: false,
  },
  {
    path: "/checkout/review",
    page: ReviewPage,
    isShowHeader: false,
  },
  {
    path: "/checkout/success",
    page: CheckoutSuccessPage,
    isShowHeader: false,
  },
  {
    path: "/admin/products",
    page: AdminProducts,
    layout: "admin",
  },
  {
    path: "/admin/sales",
    page: AdminSales,
    layout: "admin",
  },
  {
    path: "/admin/users",
    page: AdminUsers,
    layout: "admin",
  },
  {
    path: "/admin/orders",
    page: AdminOrders,
    layout: "admin",
  },
  {
    path: "/admin/chat",
    page: AdminChat,
    layout: "admin",
  },
  {
    path: "/orders",
    page: MyOrders,
    isShowHeader: true,
  },
  {
    path: "/profile",
    page: MyProfile,
    isShowHeader: true,
  },
  {
    path: "/wishlist",
    page: WishlistPage,
    isShowHeader: true,
  },
  {
    path: "*",
    page: NotFoundPage,
    isShowHeader: false,
  },
];
