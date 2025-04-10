/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { useDashboard } from '@/hooks/useDashboard';
import ReservationIcon from '@public/assets/images/icon/reservation_icon.svg';
import AgendarIcon from '@public/assets/images/icon/agendar_icon.svg';
import BuildingIcon from '@public/assets/images/icon/building_icon.svg';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const DashboardPage = () => {
  const [chartData, setChartData] = useState<{ month: string; count: number }[]>([]);
  const [todayReservationDatas, setTodayReservationDatas] = useState<{ id:number,flat_name:string,room_num:number,user_name:string,work_name:string,division:string}[]>([]);

  const [totalFlatNum, setTotalFlatNum] = useState(0);
  const [totalWorkNum, setTotalWorkNum] = useState(0);
  const [totalRservationNum, setTotalRservationNum] = useState(0);

  const {getDashboardData} = useDashboard();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setTotalFlatNum(data.totalFlatItems);
        setTotalWorkNum(data.totalWorkItems);
        setTotalRservationNum(data.totalReservationItems);
        setChartData(data.monthlyReservations);
        setTodayReservationDatas(data.todayReservations);
        
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  },[]);  

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="bg-[#1b2635] p-8">
          <div className="flex flex-wrap w-full gap-10 justify-center p-10">
            <div className="flex w-[260px] gap-5 bg-[#242a38] justify-center px-4 py-5 rounded-[10px] ">
              <BuildingIcon className="w-[60px] h-[60px] text-[#afb6c4]" />
              <div className="flex flex-col mt-[-10px]">
                <p className="font-semibold text-[#f9fbfc] text-[50px]">{totalFlatNum}</p>
                <p className="font-bold text-[#8e95a3] text-[20px] mt-[-10px]">物件数</p>
              </div>
            </div>
            <div className="flex w-[300px] gap-5 bg-[#242a38] justify-center px-4 py-5 rounded-[10px] ">
              <AgendarIcon className="w-[60px] h-[60px] text-[#afb6c4]" />
              <div className="flex flex-col mt-[-10px]">
                <p className="font-semibold text-[#f9fbfc] text-[50px]">{totalWorkNum}</p>
                <p className="font-bold text-[#8e95a3] text-[20px] mt-[-10px]">物件数</p>
              </div>
            </div>
            <div className="flex w-[300px] gap-5 bg-[#242a38] justify-center px-4 py-5 rounded-[10px] ">
              <ReservationIcon className="w-[60px] h-[60px] text-[#afb6c4]" />
              <div className="flex flex-col mt-[-10px]">
                <p className="font-semibold text-[#f9fbfc] text-[50px]">{totalRservationNum}</p>
                <p className="font-bold text-[#8e95a3] text-[20px] mt-[-10px]">予約件数</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="予約件数" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-col bg-[#242a38] px-[30px] py-[30px] rounded-[10px] mt-[20px]">
            <p className="font-bold text-[25px] text-[#f9fbfc]">本日のご予約</p>
            <table className="w-full  rounded-lg overflow-hidden mt-5  border-separate border-spacing-y-1">
              <thead>
                <tr>
                  {["番号", "ユーザー","物件", "部屋番号", "案件", "区分"].map((column) => (
                    <th
                      key={column}
                      className="text-[#747b89] px-6 py-3 text-left text-[18px] font-medium uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center ">
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
              {todayReservationDatas && (todayReservationDatas.map((reservation, index) => (
                <tr key={index} className="bg-[#2f3847] hover:bg-gray-700 text-[#a3aab5]">
                  <td className="px-6 py-1 whitespace-nowrap rounded-l-[5px]">{reservation.id}</td>
                  <td className="px-6 py-1 whitespace-nowrap">{reservation.flat_name}</td>
                  <td className="px-6 py-1 whitespace-normal">{reservation.room_num}</td>
                  <td className="px-6 py-1 whitespace-nowrap">{reservation.work_name}</td>
                  <td className="px-6 py-1 whitespace-normal rounded-r-[5px]">{reservation.division}</td>
                </tr>
              )))}
              </tbody>
            </table> 
          </div>

        </div>
  
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
