'use client';
import { statusLabel, formatDate } from '@/lib/labels';
import React, { useEffect, useState, useCallback } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import OrderReference from "@/components/OrderReference";

const MyOrders = () => {

    const { formatCurrency, request, userId, userLoading, openSignIn } = useAppContext();

    const [error, setError] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        if (!userId) { setOrders([]); setLoading(false); return; }
        setLoading(true); setError('');
        try { setOrders((await request('/orders')).orders); }
        catch (error) { setError(error.message); }
        finally { setLoading(false); }
    }, [request, userId]);
    useEffect(() => { fetchOrders(); }, [fetchOrders]);
    if (userLoading) return <Loading />;
    if (!userId) return <div className="p-10"><button onClick={() => openSignIn()}>Đăng nhập để xem đơn hàng</button></div>;

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <h2 className="text-lg font-medium mt-6">Đơn hàng của tôi</h2>
                    {loading ? <Loading /> : (<div className="max-w-5xl border-t border-gray-300 text-sm">
                        {error && <p role="alert" className="text-red-600">{error} <button onClick={fetchOrders}>Thử lại</button></p>}
                    {!error && !orders.length && <p className="p-5">Bạn chưa có đơn hàng.</p>}
                    {orders.map((order) => (
                            <div key={order._id} className="p-5 border-b border-gray-300">
                                <OrderReference orderId={order._id} />
                                <div className="flex flex-col md:flex-row gap-5 justify-between mt-5">
                                <div className="flex-1 flex gap-5 max-w-80">
                                    <Image
                                        className="max-w-16 max-h-16 object-cover"
                                        src={assets.box_icon}
                                        alt=""
                                    />
                                    <p className="flex flex-col gap-3">
                                        <span className="font-medium text-base">
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
                                    </p>
                                </div>
                                </div>
                            </div>
                        ))}
                    </div>)}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;