'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { useDashboard } from '@/hooks/useDashboard';
import AgendarIcon from '@public/assets/images/icon/agendar_icon.svg';
import BuildingIcon from '@public/assets/images/icon/building_icon.svg';
import PercentIcon from '@public/assets/icons/percentage-svgrepo.svg';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import MemberIcon from '@public/assets/icons/member.svg';

const DashboardPage = () => {
  const [chartData, setChartData] = useState<{ month: string; count: number }[]>([]);
  const [todayReservationDatas, setTodayReservationDatas] = useState<{ id:number,flat_name:string,room_num:number,user_name:string,work_name:string,division:string}[]>([]);

  const [futureReservationNum, setFutureReservationNum] = useState(0);
  const [totalUserNum, setTotalUserNum] = useState(0);
  const [totalRservationNum, setTotalRservationNum] = useState(0);
  const [cancelReservationNum, setCancelReservationNum] = useState(0);


  const {getDashboardData} = useDashboard();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setCancelReservationNum(data.cancelReservationNum)
        setFutureReservationNum(data.futureReservationItems);
        setTotalUserNum(data.totalUserItems);
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
          <div className="flex flex-col justify-start items-center">
            <h1 className="flex justify-start text-3xl font-bold text-white mb-8">工事会社管理</h1>
            <div className="flex flex-wrap w-full gap-10 justify-center p-10">
              <div className="flex w-[260px] gap-5 bg-[#3f5faa] justify-center px-4 py-5 rounded-[10px] ">
                <BuildingIcon className="w-[60px] h-[60px] text-[#afb6c4]" />
                <div className="flex flex-col mt-[-10px]">
                  <p className="font-semibold text-[#f9fbfc] text-[50px]">{totalRservationNum}</p>
                  <p className="font-bold text-[#8e95a3] text-[20px] mt-[-10px]">過去の予約件数</p>
                </div>
              </div>
              <div className="flex w-[300px] gap-5 bg-[#3f5faa] justify-center px-4 py-5 rounded-[10px] ">
                <AgendarIcon className="w-[60px] h-[60px] text-[#afb6c4]" />
                <div className="flex flex-col mt-[-10px]">
                  <p className="font-semibold text-[#f9fbfc] text-[50px]">{futureReservationNum}</p>
                  <p className="font-bold text-[#8e95a3] text-[20px] mt-[-10px]">予約件数</p>
                </div>
              </div>
              <div className="flex w-[300px] gap-5 bg-[#3f5faa] justify-center px-4 py-5 rounded-[10px] ">
                <MemberIcon className="w-[60px] h-[60px] text-[#afb6c4]" />
                <div className="flex flex-col mt-[-10px]">
                  <p className="font-semibold text-[#f9fbfc] text-[50px]">{totalUserNum}</p>
                  <p className="font-bold text-[#8e95a3] text-[20px] mt-[-10px]">従業員数</p>
                </div>
              </div>
              <div className="flex w-[300px] gap-5 bg-[#3f5faa] justify-center px-4 py-5 rounded-[10px] ">
                <PercentIcon className="w-[60px] h-[60px] text-[#afb6c4]" />
                <div className="flex flex-col mt-[-10px]">
                  <p className="font-semibold text-[#f9fbfc] text-[50px]">{(cancelReservationNum/totalRservationNum * 100).toFixed(1) }%</p>
                  <p className="font-bold text-[#8e95a3] text-[20px] mt-[-10px]">キャンセル率</p>
                </div>
              </div>
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
        </div>
  
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
