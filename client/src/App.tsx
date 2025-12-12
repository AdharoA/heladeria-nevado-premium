import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import { useSettings } from "@/_core/hooks/useSettings";

// Lazy load pages
const Home = lazy(() => import("@/pages/Home"));
const Products = lazy(() => import("@/pages/Products"));
const Cart = lazy(() => import("@/pages/Cart"));
const Contact = lazy(() => import("@/pages/Contact"));
const Profile = lazy(() => import("@/pages/Profile"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Location = lazy(() => import("@/pages/Location"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const DevLogin = lazy(() => import("@/pages/DevLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/AdminProducts"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const Addresses = lazy(() => import("@/pages/Addresses"));
const OrderConfirmation = lazy(() => import("@/pages/OrderConfirmation"));
const OrderDetails = lazy(() => import("@/pages/OrderDetails"));
const AdminOrders = lazy(() => import("@/pages/AdminOrders"));
const AdminCategories = lazy(() => import("@/pages/AdminCategories"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
const AdminContacts = lazy(() => import("@/pages/AdminContacts"));
const AdminPosts = lazy(() => import("@/pages/AdminPosts"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdaraWidget = lazy(() => import("@/components/AdaraWidget"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton"));

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Navigation />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/cart" component={Cart} />
          <Route path="/contact" component={Contact} />
          <Route path="/profile" component={Profile} />
          <Route path="/addresses" component={Addresses} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/order-confirmation/:orderNumber" component={OrderConfirmation} />
          <Route path="/order/:id" component={OrderDetails} />
          <Route path="/product/:id" component={ProductDetails} />
          <Route path="/location" component={Location} />
          <Route path="/dev-login" component={DevLogin} />
          <Route path="/login" component={DevLogin} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/categories" component={AdminCategories} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/settings" component={AdminSettings} />
          <Route path="/admin/contacts" component={AdminContacts} />
          <Route path="/admin/posts" component={AdminPosts} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <AdaraWidget />
      <WhatsAppButton />
    </Suspense>
  );
}

function App() {
  useSettings();
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
