'use client';
import { useEffect, useState } from 'react';
import { useLogout, useGetUserRole } from '@/hooks/useAuth';
import Image from "next/image";
import { useAlbumStore } from '@/state/albumStore';
import { useAuthStore } from '@/state/authStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CollapseIcon from '@public/assets/icons/collapse.svg';
import { useRouter } from 'next/navigation';

import LogoutIcon from '@public/assets/icons/logout.svg';
import UserIcon from '@public/assets/images/icon/user_icon.svg';
import BuildingIcon from '@public/assets/images/icon/building_icon.svg';
import ApiIcon from '@public/assets/images/icon/api_icon.svg';
import ReportIcon from '@public/assets/icons/report_icon.svg';

import { useNotificationData } from '@/state/notificationNum';
import MessageIcon from '@public/assets/icons/message_icon.svg';
import Dropdown from '@public/assets/icons/dropdown_icon.svg';
import MemberIcon from '@public/assets/icons/member.svg';
import CheckIcon from '@/../../public/assets/icons/confirm.svg';


const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { mutate: logout } = useLogout();
  const { isSidebarOpen, toggleSidebar, } = useAlbumStore();
  const [isListsCollapsed, setIsListsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { NotificationNum } = useNotificationData();


  const clearAuth = useAuthStore((state) => state.clearAuth);
  const handleCollapseClick = () => {
    isMobile ? setIsListsCollapsed(!isListsCollapsed) : toggleSidebar();
  };
  const linkOnclick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    console.log(path);


    if (window.screen.width < 500 && !(path === "/dashboard/company" || path === "/dashboard/member")) {
      toggleSidebar();
    }

    router.push(path);
  }
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    clearAuth();
  };

  const menuItems = [
    { path: '/dashboard/reservation', Icon: BuildingIcon, label: '予約管理', authority: ['manager'] },
    { path: '/dashboard/company', Icon: MemberIcon, label: '工事会社管理', authority: ['manager'] },
    { path: '/dashboard/user', Icon: UserIcon, label: 'ユーザー管理', authority: ['manager'] },
    { path: '/dashboard/api_history', Icon: ApiIcon, label: 'APIログ', authority: ['manager'] },
    { path: '/dashboard/member_reservation/check', Icon: CheckIcon, label: '予約確認', authority: ['member'] },
    { path: '/dashboard/member_reservation/report', Icon: ReportIcon, label: '予約完了報告', authority: ['member'] },
    { path: '/dashboard/member_reservation/message', Icon: MessageIcon, label: 'お知らせ', authority: ['member'] },
  ];

  const renderMenuItem = (path: string, Icon: any, label: string, authority: string[]) => {
    if (!authority.includes(NotificationNum.userRole)) return null;

    const isActive = pathname === path;
    const isSubActive = pathname === "/dashboard/reservation/work-time";

    return (
      <>
        <li
          key={`${path}-mainli`}
          className={`w-full text-white mt-0 ${isActive ? 'bg-[#1e293a] text-white' : ''} 
          ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
          style={{ marginTop: "0px" }}
          onClick={(e) => linkOnclick(e, path)}    
        >
          <div className={`flex w-full justify-between cursor-pointer ${(!isSidebarOpen || isMobile) && "justify-center"}`}>
            <div className='flex items-center justify-between relative'>
              <Icon className="w-[20px] h-[20px] text-[#3d4859]" />
              {(isSidebarOpen || isMobile) && <span className={`ml-4 text-[15px] ${isActive && "m-0"}`}>{label}</span>}
              
            </div>
            {(path === "/dashboard/reservation" || path === "/dashboard/company") && (isSidebarOpen || isMobile) && (
                <Dropdown
                  className={`h-6 w-6 mt-5 transform text-white -translate-y-1/2 cursor-pointer transition-transform duration-500 ${pathname.startsWith(path) ? 'rotate-180' : 'rotate-0'
                    }`}
                />
              )}
          </div>
        </li>

        {/* Nested Menu Item for Work Time */}
        {path === "/dashboard/reservation" && pathname.startsWith("/dashboard/reservation") && (
          <>
            <li
              key={`${path}-company2`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/reservation/alert" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/reservation/alert")}

            >
              <div className="flex items-center">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "通知管理" : "通知"}
                </span>
              </div>
            </li>
            <li
              key={`${path}-company3`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/reservation/reservation" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/reservation/reservation")}
            >
              <div className="flex">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "予約管理" : "予約"}
                </span>
              </div>
            </li>
            {/* <li
              key={`${path}-company4`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/reservation/setting" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/reservation/setting")}
            >
              <div className="flex">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "予約設定" : "設定"}
                </span>
              </div>
            </li> */}
            {/* <li
              key={`${path}-company5`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/reservation/chat" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/reservation/chat")}          >
              <div className="flex">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "チャットフロー管理" : "チャ"}
                </span>
              </div>
            </li> */}
            
          </>
        )}
        {path === "/dashboard/company" && pathname.startsWith("/dashboard/company") && (
          <>
           <li
              key={`${path}-company3`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/company/management" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/company/management")}
            >
              <div className="flex items-center">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "工事会社ー覧" : "会社"}
                </span>
              </div>
            </li>       
          </>
        )}
      </>
    );
  };


  return (
    <div
      className={`sticky top-0 z-30 bg-[#233044] transition-all sm:min-h-screen duration-100 
        ${isSidebarOpen ? 'w-full md:w-64' : 'w-full md:w-20'} 
        ${!isMobile ? 'fixed ' : ''}`}
    >
      <div className="">
        <div className={`flex justify-between items-center px-3 ${isMobile ? ' mb-10' : 'mt-3 sm:mb-14'} ${(isMobile && isListsCollapsed) && 'hidden'} }`}>
          <div className="flex items-center cursor-pointer" onClick={(e) => linkOnclick(e, "/dashboard/company")} >
            {(isSidebarOpen && !isMobile) || (isMobile) ? (
              <div className="flex justify-center items-center hover:scale-110 mr-2">
                <Image src="/assets/images/auth/big-logo.png" alt="logo" width={360} height={360} style={{ width: "auto", height: "auto" }} priority />
              </div>
            ) : (
              <Image
                src="/assets/images/auth/logo.png"
                alt="logo"
                width={60} height={60}
                className={`h-[40px] hover:scale-110 transition-all duration-100 ${isSidebarOpen ? 'mr-[12px]' : 'mr-0'}`}
                priority />
            )}
          </div>
          <div className={`${(!isSidebarOpen && !isMobile) && 'sm:absolute sm:top-[65px] sm:left-[27px]'}`}>
            <button  onClick={handleCollapseClick}>
              <CollapseIcon className="w-7 h-7 mb-3" />
            </button>
          </div>
        </div>
        <ul
          className={`space-y-2 w-full ${(isSidebarOpen) ? ' block pt-2' : 'sm:absolute sm:top-[130px] hidden'
            } md:block md:space-y-4 transition-all duration-100`}
        >
          {menuItems.map((item) =>
            <div key={item.path} style={{ marginTop: "0px" }}>
              {renderMenuItem(item.path, item.Icon, item.label, item.authority)}
            </div>

          )}
          <li className={`flex rounded-lg p-3 hover:bg-[#1e293a] text-white transition-all duration-100 ${!(isSidebarOpen || isMobile) && "justify-center"}`} onClick={handleLogout}>
            <Link href="" className="flex items-center">
              <LogoutIcon className="w-[25px] text-[#3d4859] h-[20px]" />
              {(isSidebarOpen || isMobile) && <span className="ml-2 text-[15px]">ログアウト</span>}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
