import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { viVN } from '@clerk/localizations/vi-VN';
import { ClerkProvider } from '@clerk/nextjs';

const outfit = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "QuickCart — Mua sắm công nghệ",
  description: "Mua sắm công nghệ dễ dàng với QuickCart.",
};

export default function RootLayout({ children }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return <html lang="vi"><body className="p-10"><h1>Thiết lập QuickCart</h1><p>Thiết lập khóa Clerk trong client/.env rồi khởi động lại giao diện.</p></body></html>;
  }
  return (
      <html lang="vi">
        <body className={`${outfit.className} antialiased text-gray-700`} >
          <ClerkProvider localization={viVN}>
          <Toaster />
          <AppContextProvider>
            {children}
          </AppContextProvider>
          </ClerkProvider>
        </body>
      </html>
  );
}
