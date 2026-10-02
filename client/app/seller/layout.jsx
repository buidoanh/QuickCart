'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React from 'react'
import { useAppContext } from '@/context/AppContext'
import Loading from '@/components/Loading'
import Link from 'next/link'

const Layout = ({ children }) => {
  const { isSeller, userId, userLoading, userError, fetchUserData, openSignIn } = useAppContext();
  if (userLoading) return <Loading />;
  if (userError) return <div className="p-10">{userError} <button onClick={fetchUserData}>Thử lại</button></div>;
  if (!userId) return <div className="p-10"><button onClick={() => openSignIn()}>Đăng nhập để tiếp tục</button></div>;
  if (!isSeller) return <div className="p-10">Trang này dành cho người bán. <Link href="/">Về cửa hàng</Link></div>;
  return (
    <div>
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

export default Layout