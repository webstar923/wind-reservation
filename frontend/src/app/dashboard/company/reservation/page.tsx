/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, useRef } from 'react';
import { notify } from '@/utils/notification';
import { EventClickArg } from '@fullcalendar/core';
import { useDashboard } from '@/hooks/useDashboard';
import { Modal } from "@mui/material";


import Link from 'next/link';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import jaLocale from "@fullcalendar/core/locales/ja";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import DashboardLayout from '@/app/layout/DashboardLayout';

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
const ReservationManagementPage = () => {
  const { getReservationListData, updateReservation, deleteReservation, createReservation } = useDashboard();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const calendarRef = useRef(null);
  const [originalData, setOriginalData] = useState<Event[]>([]);
  const [changedData, setChangedData] = useState<{ id: string, title: string, date: string }[] | []>([]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (originalData && Array.isArray(originalData)) {
      const selectedEvent = originalData.find(
        (event: Event) => String(event.id) === clickInfo.event._def.publicId
      );
      if (selectedEvent) {
        setSelectedEvent(selectedEvent);
      }
    } else {
      console.error('originalData is not available');
    }
    setModalOpen(true);
  };
  const handleSave = async () => {

    if (String(selectedEvent?.id) !== "0") {
      // Update existing reservation
      if (selectedEvent && originalData) {
        try {
          await updateReservation(selectedEvent);
          // Update the list of reservations
          const updatedEvents = originalData.map((event: Event) =>
            event.id === selectedEvent.id ? selectedEvent : event
          );

          setOriginalData(updatedEvents);
          setChangedData(
            updatedEvents.map((reservation: Event) => ({
              id: String(reservation.id),
              title: `予約番号${reservation.id}`,
              date: new Date(reservation.start_time).toISOString().split("T")[0],
            }))
          );
          notify('success', '成功!', '予約が成果的に行われました!');
        } catch {
          notify('error', '失敗!', '予約追加に失敗しました!');
        }

        setModalOpen(false);
      } else {
        console.error("originalData is null or undefined.");
      }
    } else {
      // Create new reservation
      try {
        const newReservation = await createReservation(selectedEvent);

        if (newReservation) {
          // Add new reservation to state
          const updatedOriginalData = [...originalData, newReservation];
          setOriginalData(updatedOriginalData);

          setChangedData([
            ...(changedData ?? []), // If changedData is undefined, fallback to an empty array
            {
              id: newReservation.id,
              title: `予約番号${newReservation.id}-${newReservation.work_name}`,
              date: new Date(newReservation.start_time).toISOString().split("T")[0],
            },
          ]);


        }
        setModalOpen(false);
      } catch (error) {
        console.error("Error creating reservation:", error);
      }
    }
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
      setOriginalData(data);

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

  const handleDelete = () => {
    if (selectedEvent?.id) {
      try {

        deleteReservation(Number(selectedEvent?.id));
        setChangedData((prevChangedData) => {
          return (prevChangedData ?? []).filter(data => data.id !== String(selectedEvent.id));
        });

        notify('success', '成功!', '予約が成果的に削除されました!');

        setModalOpen(false);
      } catch (error) {
        console.error('Error during delete operation:', error);
        notify('error', '失敗!', '予約の削除に失敗しました!');
      }
    } else {
      console.error('Selected event is not available for deletion.');
      notify('error', '失敗!', '選択されたイベントがありません。');
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
            <h2 className="text-3xl text-white">予約管理</h2>
            <div className='flex mt-5 text-gray-400 '>
              <Link href={"/dashboard/company/reservation"}><p className='text-[18px] text-[#407AD6] mx-2'>予約管理</p> </Link>/<Link href={"/dashboard/company/reservation/history"}><p className='text-[18px]  mx-2'>過去の予約履歴</p> </Link>
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
              <div className="modal-content p-4 bg-white w-[40%] rounded-lg">
                {selectedEvent && (
                  <div className="flex inset-0 items-center justify-center  bg-opacity-50">
                    <div className="bg-white p-6 rounded-[10px] w-full">
                      <h2 className="text-xl font-bold mb-4">予約編集</h2>
                      <div className="space-y-4">
                        <TextField
                          label="顧客名"
                          value={selectedEvent.customer_name}
                          onChange={(e) => setSelectedEvent({
                            ...selectedEvent,
                            customer_name: e.target.value
                          })}
                          variant="outlined"
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                        <TextField
                          label="顧客住所"
                          value={selectedEvent.customer_address}
                          onChange={(e) => setSelectedEvent({
                            ...selectedEvent,
                            customer_address: e.target.value
                          })}
                          variant="outlined"
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                        <TextField
                          label="電話番号"
                          value={selectedEvent.customer_phoneNum}
                          onChange={(e) => setSelectedEvent({
                            ...selectedEvent,
                            customer_phoneNum: e.target.value
                          })}
                          variant="outlined"
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                        <TextField
                          select
                          label="予約状況"
                          value={selectedEvent.status}  // Use `value` instead of `defaultValue`
                          onChange={(e) => setSelectedEvent({
                            ...selectedEvent,
                            status: e.target.value
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          {currencies.map((option, index) => (
                            <MenuItem key={`${option.value}-${index}`} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          type="date"

                          value={selectedEvent.start_time || "01/01/2001"}
                          onChange={(e) => setSelectedEvent({
                            ...selectedEvent,
                            start_time: e.target.value
                          })}
                          variant="outlined"
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex justify-end mt-4 space-x-2">
                        <button
                          onClick={handleSave}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          保存
                        </button>
                        {selectedEvent.id ? (
                          <button
                            onClick={handleDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            削除
                          </button>
                        ) : ""}

                        <button
                          onClick={() => setModalOpen(false)}
                          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </Modal>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReservationManagementPage;
