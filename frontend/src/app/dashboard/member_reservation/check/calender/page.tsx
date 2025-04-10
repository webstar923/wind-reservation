/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { useDashboard } from '@/hooks/useDashboard';
import { EventClickArg } from '@fullcalendar/core';
import { Modal } from "@mui/material";


import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import jaLocale from "@fullcalendar/core/locales/ja";
import Link from 'next/link';


interface Event {
  customer_address: string,
  customer_name: string,
  customer_phoneNum: string,
  end_time: string,
  id: number,
  installation_type_id: number,
  start_time: string,
  status: string,
  worker_id: number,
}

interface Reservation {
  customer_address: string,
  customer_name: string,
  customer_phoneNum: string,
  end_time: string,
  id: number,
  installation_type_id: number,
  start_time: string,
  status: string,
  worker_id: number,
}
const currencies = [
  {
    value: '予約済み',
    label: '予約済み',
  },
  {
    value: '作業中',
    label: '作業中',
  },
  {
    value: '完了',
    label: '完了',
  },
  {
    value: 'キャンセル',
    label: 'キャンセル',
  },
];
interface ChatHistory {
  key: string,
  value: string
}

const ReservationManagementPage = () => {
  const { getReservationListData, updateReservation, deleteReservation, createReservation, getChatHistory } = useDashboard();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const calendarRef = useRef(null);
  const [changedData, setChangedData] = useState<{ id: string, title: string, date: string }[] | []>([]);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);

  const handleEventClick = async (clickInfo: EventClickArg) => {

    const data = await getChatHistory(Number(clickInfo.event._def.publicId));

    const chatHistoryArray = data[0]["history"].split("\n").map((line: string) => {
      const [key, value = ""] = line.split(": ");
      return { key: key.replace("<br/>", ""), value };
    });
    console.log(chatHistoryArray);

    setChatHistories(chatHistoryArray);

    setModalOpen(true);
  };
  const handleDatesSet = async ({ start, end }: { start: Date; end: Date }) => {
    const startDate = start.toISOString();
    const endDate = end.toISOString();
    const data = await getReservationListData(startDate, endDate);
    console.log(data);

    changeData(data);
  };
  const changeData = (data: Event[]) => {
    if (!Array.isArray(data)) { // Check if data is an array
      console.log('Expected data to be an array, but got:', data);
    } else {

      const dataValues = data.map((reservation: Event) => {
        const formattedDate = new Date(reservation.start_time).toISOString().split('T')[0];
        const title = `予約番号${reservation.id}`;
        return {
          id: String(reservation.id),  // number → string に変換
          title: title,
          date: formattedDate,
        };
      });

      setChangedData(dataValues);
    }
  };
  useEffect(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    const fetchData = async () => {
      try {
        const data = await getReservationListData(currentMonthStart, currentMonthEnd);
        changeData(data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);


  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="bg-[#1b2635] p-8">
          <div className="flex flex-col items-start mb-4">
            <h2 className="text-3xl text-white">予約確認</h2>
            <div className='flex text-gray-400 mt-2'>
              <Link href="/dashboard/member_reservation/check/calender" className='text-[#407AD6] mr-2'>カレンダー形式で表示</Link> / <Link href="/dashboard/member_reservation/check" className='hover:text-[#407AD6] ml-2'>リスト形式で表示</Link>
            </div>
          </div>
          <div className="bg-white p-5 shadow-lg rounded-lg">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
              locale={jaLocale}
              events={changedData}
              datesSet={handleDatesSet}
              headerToolbar={{
                left: "prev,next today", // Default buttons
                center: "title", // Calendar title
                right: "dayGridMonth,timeGridWeek,timeGridDay", // Custom button
              }}
              eventContent={(arg) => (
                <div className="truncate-event" title={arg.event.title}>
                  {arg.event.title}
                </div>
              )}
              eventClick={(event) => handleEventClick(event)}
              height="600px"
            />


            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              aria-labelledby="edit-reservation-modal"
              aria-describedby="edit-reservation-description"
              className='flex justify-center items-center'
            >
              <div className="flex w-[50%] justify-center items-center z-20 top-2">
                <div className=" max-h-[400px] bg-[#aac9c9] text-white rounded-lg p-2 pr-0 overflow-auto custom-scrollbar">
                  <table className="w-full ">
                    <thead>
                      <tr className="bg-lime-700">
                        {["質問", "答え"].map((header, index) => (
                          <th key={index} className="px-6 py-3 text-left text-[15px] font-medium uppercase tracking-wider cursor-pointer">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(chatHistories ?? []).map((history, index) => (
                        index !== 0 && (
                          <tr key={index} className="hover:bg-gray-100 bg-[#d1d8da]">
                            <td className="px-6 py-3 whitespace-wrap text-[#201f71]">{history?.key}</td>
                            <td className="px-6 py-3 whitespace-wrap text-[#201f71]">{history?.value}</td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReservationManagementPage;
