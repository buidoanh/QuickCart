"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/currency.mjs";
export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);
export const AppContextProvider = ({ children }) => {
  const currency = 'VND';
  const router = useRouter();
  const { isLoaded, userId, getToken } = useAuth();
  const { openSignIn } = useClerk();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState('');
  const [cartItems, setCartItems] = useState({});
  const cartRef = useRef({});
  const userRef = useRef(userId);
  userRef.current = userId;
  const queue = useRef(Promise.resolve());
  const request = useCallback(async (path, options = {}) => {
    const token = await getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");
    return apiRequest(path, { ...options, token });
  }, [getToken]);
  const fetchProductData = useCallback(async () => {
    setProductsLoading(true); setProductsError('');
    try { setProducts((await apiRequest('/products')).products); }
    catch (error) { setProductsError(error.message); }
    finally { setProductsLoading(false); }
  }, []);
  const fetchUserData = useCallback(async () => {
    const id = userId;
    if (!id) { setUserError(''); setUserData(null); setCartItems({}); cartRef.current = {}; setUserLoading(false); return; }
    setUserLoading(true); setUserError('');
    try {
      const [profile, cart] = await Promise.all([request('/me'), request('/cart')]);
      if (userRef.current !== id) return;
      setUserData(profile.user); setCartItems(cart.cartItems); cartRef.current = cart.cartItems;
    } catch (error) { if (userRef.current === id) setUserError(error.message); }
    finally { if (userRef.current === id) setUserLoading(false); }
  }, [userId, request]);
  useEffect(() => { fetchProductData(); }, [fetchProductData]);
  useEffect(() => { setUserData(null); setCartItems({}); cartRef.current = {}; if (isLoaded) fetchUserData(); }, [isLoaded, fetchUserData]);
  const changeCart = (itemId, value, increment = false) => {
    if (!userId) { openSignIn(); return Promise.resolve(false); }
    const id = userId;
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (userRef.current !== id) return false;
      const quantity = increment ? (cartRef.current[itemId] || 0) + 1 : value;
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) { toast.error("Số lượng phải từ 0 đến 99"); return false; }
      try {
        const result = await request('/cart', { method: 'PUT', body: { productId: itemId, quantity } });
        if (userRef.current !== id) return false;
        cartRef.current = result.cartItems; setCartItems(result.cartItems);
        return true;
      } catch (error) { toast.error(error.message); return false; }
    });
    return queue.current;
  };
  const addToCart = id => changeCart(id, 1, true);
  const updateCartQuantity = (id, quantity) => changeCart(id, quantity);
  const getCartCount = () => Object.values(cartItems).reduce((a, b) => a + b, 0);
  const getCartAmount = () => Math.round(Object.entries(cartItems).reduce((sum, [id, quantity]) => sum + (products.find(p => p._id === id)?.offerPrice || 0) * quantity, 0));
  const clearCart = () => { setCartItems({}); cartRef.current = {}; };
  const value = { currency, formatCurrency, router, products, productsLoading, productsError, fetchProductData, userData, userLoading: !isLoaded || userLoading, userError, fetchUserData, isSeller: userData?.role === 'seller', cartItems, addToCart, updateCartQuantity, getCartCount, getCartAmount, clearCart, request, userId, openSignIn, waitForCart: () => queue.current };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
