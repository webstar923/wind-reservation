import { ReactNode, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/app/layout/Sidebar";
import BellIcon from "@public/assets/icons/notification-01.svg";
import MessageIcon from "@public/assets/icons/message_icon.svg";
import { useDashboard } from "@/hooks/useDashboard";
import { useNotificationData } from '@/state/notificationNum';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const {NotificationNum}= useNotificationData();
  const { getNotificationNum, useGetUserRole } = useDashboard(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
         await getNotificationNum();
         await useGetUserRole();        
      } catch (erur) {
        console.error("Error fetching data", erur);
      }
    };    

    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full  md:flex-row bg-[#1b2635]">
      <Sidebar />
      <div className="flex-1 h-min-screen bg-[#1b2635]">
        <div className="flex w-full bg-[#1b2635] border-[#414141] py-[10px] px-[30px] justify-between">
          <div className="flex py-2 items-center gap-2">
          </div>
          <div className="flex items-center gap-3 py-2 rounded-full">
            <div className="relative cursor-pointer hover:bg-[#525252] rounded-[5px]">
              <Link href="/dashboard/message" className="flex items-center">
                <MessageIcon className="w-[40px] h-[40px] text-[#313Fa8]" />
                {NotificationNum.Message_Num !== 0 && (
                  <div className="absolute rounded-[5px] bg-[#313Fa8] bottom-[-6px] right-[0px] text-white px-1.5 py-[2px] border-[1px] border-[#f2f2f2]">
                    <p className="text-[10px]">{NotificationNum.Message_Num}</p>
                  </div>
                )}
              </Link>
            </div>
            {NotificationNum.userRole === "manager" && (
              <div className="relative cursor-pointer hover:bg-[#525252] rounded-[5px]">
                <Link href="/dashboard/notification" className="flex items-center">
                  <BellIcon className="w-[40px] h-[40px]" />
                  {NotificationNum.Notification_Num !== 0 && (
                    <div className="absolute rounded-[5px] bg-[#b92626] bottom-[-6px] right-[0px] text-white px-1.5 py-[2px] border-[1px] border-[#f2f2f2]">
                      <p className="text-[10px]">{NotificationNum.Notification_Num}</p>
                    </div>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};



export default DashboardLayout;
