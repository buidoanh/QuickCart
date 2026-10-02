import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";

const products = [
  {
    id: 1,
    category: "Headphone",
    image: assets.girl_with_headphone_image,
    title: "Âm thanh ấn tượng",
    description: "Tận hưởng âm thanh rõ nét với tai nghe chất lượng.",
  },
  {
    id: 2,
    category: "Earphone",
    image: assets.girl_with_earphone_image,
    title: "Luôn kết nối",
    description: "Tai nghe nhỏ gọn, phong cách cho mọi hoạt động.",
  },
  {
    id: 3,
    category: "Laptop",
    image: assets.boy_with_laptop_image,
    title: "Sức mạnh trong từng trải nghiệm",
    description: "Khám phá máy tính xách tay cho làm việc và giải trí.",
  },
];

const FeaturedProduct = () => {
  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Sản phẩm nổi bật</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map(({ id, image, title, description, category }) => (
          <div key={id} className="relative group">
            <Image
              src={image}
              alt={title}
              className="group-hover:brightness-75 transition duration-300 w-full h-auto object-cover"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl">{title}</p>
              <p className="text-sm lg:text-base leading-5 max-w-60">
                {description}
              </p>
              <Link href={`/all-products?category=${category}`} className="flex items-center gap-1.5 bg-orange-600 px-4 py-2 rounded">
                Mua ngay <Image className="h-3 w-3" src={assets.redirect_icon} alt="Mở trang sản phẩm" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;
