import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store'
import ScrollToTop from './components/ScrollToTop'
import CartSyncer from './components/CartSyncer'
import { Toaster } from 'react-hot-toast'

import {
  Home,
  Product,
  Products,
  AboutPage,
  ContactPage,
  Cart,
  Login,
  Register,
  Checkout,
  PageNotFound,
  AdminDashboard,
  AdminLogin,
  OrderSummary,
  Account,
} from './pages'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Provider store={store}>
          <CartSyncer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/products/*" element={<PageNotFound />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/order-summary" element={<OrderSummary />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </Provider>
      </ScrollToTop>
      <Toaster />
    </BrowserRouter>
  )
}

export default App;
