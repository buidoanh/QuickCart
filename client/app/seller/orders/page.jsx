'use client';
import { statusLabel, formatDate } from '@/lib/labels';
import React, { useEffect, useState, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";

const Orders = () => {

    const { formatCurrency, request, userId, userLoading, openSignIn } = useAppContext();

    const [error, setError] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerOrders = useCallback(async () => {
        if (!userId) { setOrders([]); setLoading(false); return; }
        setLoading(true); setError('');
        try { setOrders((await request('/seller/orders')).orders); }
        catch (error) { setError(error.message); }
        finally { setLoading(false); }
    }, [request, userId]);
    useEffect(() => { fetchSellerOrders(); }, [fetchSellerOrders]);
    if (userLoading) return <Loading />;
    if (!userId) return <div className="p-10"><button onClick={() => openSignIn()}>Đăng nhập để xem đơn hàng</button></div>;

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            {loading ? <Loading /> : <div className="md:p-10 p-4 space-y-5">
                <h2 className="text-lg font-medium">Đơn hàng</h2>
                <div className="max-w-4xl rounded-md">
                    {error && <p role="alert" className="text-red-600">{error} <button onClick={fetchSellerOrders}>Thử lại</button></p>}
                    {!error && !orders.length && <p className="p-5">Bạn chưa có đơn hàng.</p>}
                    {orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-t border-gray-300">
                            <div className="flex-1 flex gap-5 max-w-80">
                                <Image
                                    className="max-w-16 max-h-16 object-cover"
                                    src={assets.box_icon}
                                    alt=""
                                />
                                <p className="flex flex-col gap-3">
                                    <span className="font-medium">
                                        {order.items.map((item) => item.product.name + ` x ${item.quantity}`).join(", ")}
                                    </span>
                                    <span>Số sản phẩm: {order.items.length}</span>
                                </p>
                            </div>
                            <div>
                                <p>
                                    <span className="font-medium">{order.address.fullName}</span>
                                    <br />
                                    <span >{order.address.area}</span>
                                    <br />
                                    <span>{`${order.address.city}, ${order.address.state}`}</span>
                                    <br />
                                    <span>{order.address.phoneNumber}</span>
                                </p>
                            </div>
                            <p className="font-medium my-auto">{formatCurrency(order.amount)}</p>
                            <div>
                                <p className="flex flex-col">
                                    <span>Thanh toán: Khi nhận hàng (COD)</span>
                                    <span>Ngày đặt: {formatDate(order.date)}</span>
                                    <span>Thanh toán: {statusLabel(order.paymentStatus)}</span>
                                    <span>Trạng thái: {statusLabel(order.status)}</span>
                                    <select aria-label="Trạng thái đơn hàng" value={order.status} onChange={async e => { try { await request(`/seller/orders/${order._id}`, { method: 'PATCH', body: { status: e.target.value } }); await fetchSellerOrders(); } catch (error) { setError(error.message); } }}>
                                      <option value={statusLabel(order.status)}>{statusLabel(order.status)}</option>
                                      {({ 'Order Placed': ['Processing','Cancelled'], Processing: ['Shipped','Cancelled'], Shipped: ['Delivered'] }[order.status] || []).map(status => <option key={status} value={status}>{statusLabel(status)}</option>)}
                                    </select>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>}
            <Footer />
        </div>
    );
};

export default Orders;