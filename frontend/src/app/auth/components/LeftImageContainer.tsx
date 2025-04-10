import React from 'react';
import Image from 'next/image';

const LeftImageContainer = () => {
  return (
    <div className="absolute inset-2 md:bg-[url('/assets/images/auth/auth_bg2.png')] bg-cover bg-no-repeat rounded-[10px]">
      <div className="absolute inset-0 rounded-[10px] bg-black opacity-15 w-full h-full"></div>
      <div className="absolute w-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center z-10">
        <p className="font-semibold text-[110px] mb-[50px] leading-[20px] tracking-[-0.05em] text-[#d7f140] drop-shadow-[20px_20px_40px_rgba(230,230,0,19)]">予約システム</p>
        <div className="flex justify-center items-center">
          <Image src="/assets/images/auth/logo.png" alt="logo" width={130} height={130} className="drop-shadow-[4px_4px_10px_rgba(30,230,230,0.9)]"  priority />
          <p className="font-bold text-[120px] text-[#005596] drop-shadow-[4px_4px_10px_rgba(30,230,230,0.9)]"><span className="text-[#e6494f] text-[100px]">in</span>g</p>
        </div>       
      </div>
    </div>
  )
}

export default LeftImageContainer;