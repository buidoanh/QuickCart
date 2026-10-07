import Image from 'next/image';
import Link from 'next/link';

export default function BannerSlide({ banner, preview = false }) {
  const buttonClass = 'px-7 py-2.5 bg-orange-600 rounded-full text-white font-medium';
  return <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 bg-[#E6E9F2] py-8 md:px-14 px-5 rounded-xl min-w-full">
    <div className="md:pl-8 min-w-0">
      <p className="text-orange-600 pb-1 break-words">{banner.offer}</p>
      <h2 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold break-words">{banner.title}</h2>
      <div className="flex flex-wrap items-center gap-3 mt-6">
        {preview ? <>
          <span className={buttonClass}>{banner.buttonText1}</span>
          <span className="px-3 py-2.5 font-medium">{banner.buttonText2} →</span>
        </> : <>
          <Link href={banner.href} className={buttonClass}>{banner.buttonText1}</Link>
          <Link href={banner.href} className="px-3 py-2.5 font-medium">{banner.buttonText2} →</Link>
        </>}
      </div>
    </div>
    <div className="flex flex-1 justify-center shrink-0">
      <Image src={banner.image} alt={banner.title} width={400} height={400} unoptimized={preview && banner.image.startsWith('blob:')} className="md:w-72 w-48 h-60 object-contain" />
    </div>
  </div>;
}
