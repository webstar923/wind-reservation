/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React from 'react';
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
import Autocomplete, { autocompleteClasses, createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});
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
  prefecture: string,
  company: string,
  pdf_url?: string
}


interface CityOptionType {
  inputValue?: string;
  name: string;
}
interface ChatHistory {
  key: string,
  value: string
}

const ReservationManagementPage = () => {
  const { getReservationListData, updateReservation, deleteReservation, createReservation, getAvailableCompanies, getChatHistory, uploadPdf } = useDashboard();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);

  const calendarRef = useRef(null);
  const [originalData, setOriginalData] = useState<Event[]>([]);
  const [changedData, setChangedData] = useState<{ id: string, title: string, date: string }[] | []>([]);
  const [city, setCity] = React.useState<CityOptionType | null>(null);
  const [prefecture, setPrefecture] = useState("");
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [realUploadedFilePath, setRealUploadedFilePath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


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


  const selectCities: readonly CityOptionType[] = [
    { "name": "北海道" },
    { "name": "青森県" },
    { "name": "岩手県" },
    { "name": "宮城県" },
    { "name": "秋田県" },
    { "name": "山形県" },
    { "name": "福島県" },
    { "name": "茨城県" },
    { "name": "栃木県" },
    { "name": "群馬県" },
    { "name": "埼玉県" },
    { "name": "千葉県" },
    { "name": "東京都" },
    { "name": "神奈川県" },
    { "name": "新潟県" },
    { "name": "富山県" },
    { "name": "石川県" },
    { "name": "福井県" },
    { "name": "山梨県" },
    { "name": "長野県" },
    { "name": "岐阜県" },
    { "name": "静岡県" },
    { "name": "愛知県" },
    { "name": "三重県" },
    { "name": "滋賀県" },
    { "name": "京都府" },
    { "name": "大阪府" },
    { "name": "兵庫県" },
    { "name": "奈良県" },
    { "name": "和歌山県" },
    { "name": "鳥取県" },
    { "name": "島根県" },
    { "name": "岡山県" },
    { "name": "広島県" },
    { "name": "山口県" },
    { "name": "徳島県" },
    { "name": "香川県" },
    { "name": "愛媛県" },
    { "name": "高知県" },
    { "name": "福岡県" },
    { "name": "佐賀県" },
    { "name": "長崎県" },
    { "name": "熊本県" },
    { "name": "大分県" },
    { "name": "宮崎県" },
    { "name": "鹿児島県" },
    { "name": "沖縄県" }
  ];
  const handleMore = async (id: number) => {

    const data = await getChatHistory(id);

    const chatHistoryArray = data[0]["history"].split("\n").map((line: string) => {
      const [key, value = ""] = line.split(": ");
      return { key: key.replace("<br/>", ""), value };
    });
    setChatHistories(chatHistoryArray);
    setMoreModalOpen(true);
  };
  const handleEventClick = async (clickInfo: EventClickArg) => {
    if (originalData && Array.isArray(originalData)) {
      const selectedEvent = originalData.find(
        (event: Event) => String(event.id) === clickInfo.event._def.publicId
      );
      if (selectedEvent) {
        setRealUploadedFilePath(selectedEvent?.pdf_url || "");
        const fileName = selectedEvent?.pdf_url?.split('/').pop() || '';
        setUploadedFilePath(fileName);
        setSelectedEvent(selectedEvent);
        const data = await getAvailableCompanies(selectedEvent.prefecture, selectedEvent.id);
        setCompanies(data);
      } else {
        console.error('originalData is not available');
      }
    }
    setModalOpen(true);
  };
  const handleSave = async () => {
    if (!selectedEvent) return;
  
    try {
      let pdfUrl = selectedEvent.pdf_url;
  
      // 🔽 Upload PDF if file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("reservationId", String(selectedEvent.id));
  
        const response = await uploadPdf(formData);
        pdfUrl = response.pdfUrl;
      }
  
      const updatedEventWithPdf = {
        ...selectedEvent,
        pdf_url: pdfUrl,
      };
      setRealUploadedFilePath(pdfUrl || null);
  
      if (String(selectedEvent.id) !== "0") {
        // ✅ Update existing reservation
        await updateReservation(updatedEventWithPdf);
        console.log("00000",updatedEventWithPdf);
        
  
        const updatedEvents = originalData.map((event: Event) =>
          event.id === selectedEvent.id ? updatedEventWithPdf : event
        );
  
        setOriginalData(updatedEvents);
        setChangedData(
          updatedEvents.map((reservation: Event) => ({
            id: String(reservation.id),
            title: `予約番号${reservation.id}`,
            date: new Date(reservation.start_time).toISOString().split("T")[0],
          }))
        );
  
        notify("success", "成功!", "予約が成果的に更新されました!");
      } else {        
        const newReservation = await createReservation(updatedEventWithPdf);  
        if (newReservation) {
          const updatedOriginalData = [...originalData, newReservation];
          setOriginalData(updatedOriginalData);  
          setChangedData([
            ...(changedData ?? []),
            {
              id: newReservation.id,
              title: `予約番号${newReservation.id}-${newReservation.work_name}`,
              date: new Date(newReservation.start_time).toISOString().split("T")[0],
            },
          ]);
        }
      }  
      setModalOpen(false);
      setSelectedFile(null); // reset file
    } catch (error) {
      console.error("Error saving reservation:", error);
      notify("error", "失敗!", "予約の保存に失敗しました。");
    }
  };
  

  const handleDatesSet = async ({ start, end }: { start: Date; end: Date }) => {
    const startDate = start.toISOString();
    const endDate = end.toISOString();
    const data = await getReservationListData(startDate, endDate);
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
            {/* <div className='flex mt-5 text-gray-400 '>
              <Link href={"/dashboard/company/reservation"}><p className='text-[18px] text-[#407AD6] mx-2'>予約管理</p> </Link>/<Link href={"/dashboard/company/reservation/history"}><p className='text-[18px]  mx-2'>過去の予約履歴</p> </Link>
            </div> */}
          </div>
          <div className="bg-white p-5 shadow-lg rounded-lg">
            <div className="flex justify-end">
              <Link
                href={"/chat"}
                className="bg-green-500 text-white px-4 py-3 rounded mb-5"
              >
                新しい予約を追加
              </Link>
            </div>
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
              <div className="modal-content p-4 bg-[#FFFFFF] w-[80%] md:w-[40%] rounded-lg ">
                {selectedEvent && (
                  <div className="flex inset-0 items-center justify-center  bg-opacity-50 max-h-[90vh] overflow-y-auto">
                    <div className="bg-[#FFFFFF] p-6 rounded-[10px] w-full">
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
                          className="w-full p-2 border border-gray-300 rounded mb-[10px]"
                        />
                        <Autocomplete
                          value={selectedEvent?.prefecture}
                          onChange={(event, newValue) => {
                            if (typeof newValue === 'object' && newValue !== null && 'name' in newValue) {
                              setSelectedEvent({
                                ...selectedEvent,
                                prefecture: newValue.name
                              });
                            } else {
                              setSelectedEvent({
                                ...selectedEvent,
                                prefecture: ''
                              });
                            }
                          }}
                          selectOnFocus
                          clearOnBlur
                          handleHomeEndKeys
                          id="free-solo-with-text-demo"
                          options={selectCities}
                          getOptionLabel={(option) => {
                            // Value selected with enter, right from the input
                            if (typeof option === 'string') {
                              return option;
                            }
                            // Add "xxx" option created dynamically
                            if (option.inputValue) {
                              return option.inputValue;
                            }
                            // Regular option
                            return option.name;
                          }}
                          renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            return (
                              <li key={key} {...optionProps}>
                                {option.name}
                              </li>
                            );
                          }}
                          sx={{ width: 300 }}
                          freeSolo

                          renderInput={(params) => (
                            <TextField {...params} label="都道府県" />
                          )}
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
                          select
                          label="担当会社"
                          value={selectedEvent?.company ?? ''} // Fallback to empty string
                          onChange={(e) =>
                            setSelectedEvent({
                              ...selectedEvent,
                              company: e.target.value
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          {companies.length === 0 ? (
                            <MenuItem value="" disabled>
                              その県の担当会社はありません。
                            </MenuItem>
                          ) : (
                            companies.map((option, index) => (
                              <MenuItem key={`${option}-${index}`} value={option}>
                                {option}
                              </MenuItem>
                            ))
                          )}
                        </TextField>
                        <TextField
                          type="date"

                          value={new Date(selectedEvent.start_time).toISOString().split("T")[0] || "01/01/2001"}
                          onChange={(e) => setSelectedEvent({
                            ...selectedEvent,
                            start_time: e.target.value
                          })}
                          variant="outlined"
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                        <div className='flex gap-5'>
                          <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            // onClick={handleUpload}
                            startIcon={<CloudUploadIcon />}
                          >
                            PDFアップロード
                            <VisuallyHiddenInput
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                console.log(file);

                                setUploadedFilePath(file?.name || null);
                                if (file) setSelectedFile(file);
                              }}
                              multiple
                              className="mt-2"
                            />
                          </Button>
                          {uploadedFilePath && (
                            <div className="mt-2 text-sm text-blue-700 underline">
                              <a href={"/"+realUploadedFilePath || ""} target="_blank" rel="noopener noreferrer">
                                {uploadedFilePath}
                              </a>
                            </div>
                          )}

                        </div>
                      </div>
                      <div className="flex justify-end mt-4 space-x-2">

                        {selectedEvent.id !== 0 ? (
                          <button
                            onClick={() => { handleMore(selectedEvent.id) }}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                          >
                            もっと見る
                          </button>
                        ) : null}
                        <button
                          onClick={handleSave}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          保存
                        </button>
                        {selectedEvent.id !== 0 ? (
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
            <Modal
              open={moreModalOpen}
              onClose={() => setMoreModalOpen(false)}
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
