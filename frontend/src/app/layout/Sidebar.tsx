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
    { path: '/dashboard/company', Icon: BuildingIcon, label: '工事会社管理', authority: ['manager'] },
    { path: '/dashboard/member', Icon: MemberIcon, label: '工事職員管理', authority: ['manager'] },
    { path: '/dashboard/user', Icon: UserIcon, label: 'ユーザー管理', authority: ['manager'] },
    { path: '/dashboard/api_history', Icon: ApiIcon, label: 'APIログ', authority: ['manager'] },
    { path: '/dashboard/member_reservation/check', Icon: CheckIcon, label: '予約確認', authority: ['member'] },
    { path: '/dashboard/member_reservation/report', Icon: ReportIcon, label: '予約完了報告', authority: ['member'] },
    { path: '/dashboard/member_reservation/message', Icon: MessageIcon, label: 'お知らせ', authority: ['member'] },
  ];

  const renderMenuItem = (path: string, Icon: any, label: string, authority: string[]) => {
    if (!authority.includes(NotificationNum.userRole)) return null;

    const isActive = pathname === path;
    const isSubActive = pathname === "/dashboard/company/work-time";

    return (
      <>
        <li
          key={`${path}-mainli`}
          className={`w-full text-white mt-0 ${isActive ? 'bg-[#1e293a] text-white' : ''} 
          ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
          style={{ marginTop: "0px" }}
          onClick={(e) => linkOnclick(e, path)}
        >
          <div className={`flex items-center cursor-pointer ${(!isSidebarOpen || isMobile) && "justify-center"}`}>
            <div className='flex items-center justify-between relative'>
              <Icon className="w-[20px] h-[20px] text-[#3d4859]" />
              {(isSidebarOpen || isMobile) && <span className={`ml-4 text-[15px] ${isActive && "m-0"}`}>{label}</span>}
              {(path === "/dashboard/company" || path === "/dashboard/member") && (isSidebarOpen || isMobile) && (
                <Dropdown
                  className={`absolute h-6 w-6 mt-5 right-[-90px] transform text-white -translate-y-1/2 cursor-pointer transition-transform duration-500 ${pathname.startsWith(path) ? 'rotate-180' : 'rotate-0'
                    }`}
                />
              )}
            </div>
          </div>
        </li>

        {/* Nested Menu Item for Work Time */}
        {path === "/dashboard/company" && pathname.startsWith("/dashboard/company") && (
          <>
            <li
              key={`${path}-company2`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/company/alert" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/company/alert")}

            >
              <div className="flex items-center">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "通知管理" : "通知"}
                </span>
              </div>
            </li>
            <li
              key={`${path}-company3`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/company/reservation-history" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/company/reservation")}
            >
              <div className="flex">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "予約管理" : "予約"}
                </span>
              </div>
            </li>
            <li
              key={`${path}-company4`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/company/chat" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/company/chat")}          >
              <div className="flex">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "チャットフロー管理" : "チャ"}
                </span>
              </div>
            </li>
          </>
        )}
        {path === "/dashboard/member" && pathname.startsWith("/dashboard/member") && (
          <>
            <li
              key={`${path}-company1`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/member/view" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/member/view")}
            >
              <div className="flex items-center">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "工事職員ー覧" : "職員"}
                </span>
              </div>
            </li>
            <li
              key={`${path}-company2`}
              className={`w-full text-white mt-0 ${pathname === "/dashboard/member/schedule" ? 'bg-[#1e293a] text-white' : ''} 
              ${isMobile ? 'flex justify-center' : ''} p-3 hover:bg-[#1e293a] text-red-500 transition-all duration-100`}
              style={{ marginTop: "0px" }}
              onClick={(e) => linkOnclick(e, "/dashboard/member/schedule")}
            >
              <div className="flex items-center">
                <span className={`text-[15px] ${isSubActive && "m-0"} ${(isSidebarOpen || isMobile) ? "ml-9" : "ml-3"}`}>
                  {(isSidebarOpen || isMobile) ? "工事職員日程閲覧" : "日程"}
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
          <div className="flex items-center">
            {(isSidebarOpen && !isMobile) || (isMobile) ? (
              <div className="flex justify-center items-center">
                <Image src="/assets/images/auth/logo.png" alt="logo" width={60} height={60} style={{ width: "auto", height: "auto" }} priority />
                <p className={`font-bold text-[60px] text-[#407AD6] }`}><span className="text-[#e6494f] text-[60px]">in</span>g</p>
              </div>
            ) : (
              <Image
                src="/assets/images/auth/logo.png"
                alt="logo"
                width={60} height={60}
                className={`h-[40px] transition-all duration-100 ${isSidebarOpen ? 'mr-[12px]' : 'mr-0'}`}
                priority />
            )}
          </div>
          <div className={`${(!isSidebarOpen && !isMobile) && 'sm:absolute sm:top-[65px] sm:left-[27px]'}`}>
            <button className="" onClick={handleCollapseClick}>
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
