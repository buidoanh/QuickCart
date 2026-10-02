"use client"
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { assets} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {

  const { isSeller, router, userId, openSignIn, getCartCount } = useAppContext();

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt=""
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Trang chủ
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Cửa hàng
        </Link>
        <Link href="/about" className="hover:text-gray-900 transition">
          Về chúng tôi
        </Link>
        <Link href="/contact" className="hover:text-gray-900 transition">
          Liên hệ
        </Link>

        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Quản lý bán hàng</button>}

      </div>

      <div className="flex gap-3 text-sm"><Link href="/cart">Giỏ hàng ({getCartCount()})</Link>{userId && <Link href="/my-orders">Đơn hàng của tôi</Link>}</div>
      <ul className="hidden md:flex items-center gap-4 ">
        <Image className="w-4 h-4" src={assets.search_icon} alt="" />
        {userId ? <UserButton /> : <button onClick={() => openSignIn()} className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.user_icon} alt="" />
          Đăng nhập
        </button>}
      </ul>

      <div className="flex items-center md:hidden gap-3">
        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Quản lý bán hàng</button>}
        {userId ? <UserButton /> : <button onClick={() => openSignIn()} className="flex items-center gap-2 hover:text-gray-900 transition">
          <Image src={assets.user_icon} alt="" />
          Đăng nhập
        </button>}
      </div>
    </nav>
  );
};

export default Navbar;