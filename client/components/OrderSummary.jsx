import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState, useRef } from "react";

const OrderSummary = () => {

  const { formatCurrency, router, getCartCount, getCartAmount, request, userId, cartItems, clearCart, waitForCart, openSignIn } = useAppContext()
  const [promoCode, setPromoCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [addressError, setAddressError] = useState('');
  const orderKey = useRef(null);
  const placingRef = useRef(false);
  const promoVersion = useRef(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [userAddresses, setUserAddresses] = useState([]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    if (!userId) return openSignIn();
    if (!selectedAddress) return toast.error("Vui lòng chọn địa chỉ nhận hàng");
    if (placingRef.current) return;
    placingRef.current = true; setPlacing(true);
    try {
      await waitForCart();
      if (!orderKey.current) orderKey.current = crypto.randomUUID();
      await request('/orders', { method: 'POST', body: { addressId: selectedAddress._id, requestId: orderKey.current, promoCode: appliedCode } });
      orderKey.current = null; clearCart(); router.push('/order-placed');
    } catch (error) { toast.error(error.message); }
    finally { placingRef.current = false; setPlacing(false); }
  };
  const applyPromo = async () => {
    const version = ++promoVersion.current;
    const code = promoCode.trim();
    try {
      await waitForCart();
      const result = await request('/orders/quote', { method: 'POST', body: { promoCode: code } });
      if (version !== promoVersion.current) return;
      setQuote(result); setAppliedCode(code); toast.success(code ? "Đã áp dụng mã giảm giá" : "Đã bỏ mã giảm giá");
    }
    catch (error) { if (version === promoVersion.current) toast.error(error.message); }
  };
  useEffect(() => {
    let active = true;
    setUserAddresses([]); setSelectedAddress(null); setAddressError('');
    setPromoCode(''); setAppliedCode(''); setQuote(null);
    promoVersion.current++; orderKey.current = null;
    if (userId) request('/addresses').then(data => { if (active) { setUserAddresses(data.addresses); setAddressError(''); } }).catch(error => { if (active) setAddressError(error.message); });
    return () => { active = false; };
  }, [userId, request]);
  useEffect(() => {
    let active = true;
    setQuote(null);
    promoVersion.current++;
    if (userId && Object.keys(cartItems).length) request('/orders/quote', { method: 'POST', body: { promoCode: appliedCode } }).then(data => { if (active) setQuote(data); }).catch(error => { if (active) toast.error(error.message); });
    return () => { active = false; };
  }, [cartItems, userId, request, appliedCode]);
  const subtotal = quote?.subtotal ?? getCartAmount();
  const tax = quote?.tax ?? Math.round(subtotal * 0.02);
  const total = quote?.amount ?? subtotal + tax;

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Thông tin thanh toán
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          {addressError && <p role="alert" className="text-red-600">{addressError}</p>}
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Chọn địa chỉ
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Chọn địa chỉ"}
              </span>
              <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullName}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Thêm địa chỉ mới
                </li>
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Mã giảm giá
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={promoCode} onChange={e => setPromoCode(e.target.value)}
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button onClick={applyPromo} disabled={!userId || placing} className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700">
              Áp dụng
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Sản phẩm {getCartCount()}</p>
            <p className="text-gray-800">{formatCurrency(subtotal)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Phí giao hàng</p>
            <p className="font-medium text-gray-800">Miễn phí</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Thuế (2%)</p>
            <p className="font-medium text-gray-800">{formatCurrency(tax)}</p>
          </div>
          {quote?.discount > 0 && <div className="flex justify-between"><p>Giảm giá</p><p>-{formatCurrency(quote.discount)}</p></div>}
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Tổng cộng</p>
            <p>{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <button disabled={placing || getCartCount() === 0} onClick={createOrder} className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700">
        {placing ? "Đang đặt hàng..." : "Đặt hàng (thanh toán khi nhận)"}
      </button>
    </div>
  );
};

export default OrderSummary;