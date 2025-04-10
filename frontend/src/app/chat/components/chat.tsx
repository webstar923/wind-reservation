import React, { useState, useEffect, useRef } from 'react';
import Typewriter from 'typewriter-effect';
import { useChatHandler } from '@/hooks/useChatHandler';
import Button from '@/app/chat/components/buttonComponent';
import Image from "next/image";
import clsx from "clsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import jaLocale from "@fullcalendar/core/locales/ja";
import interactionPlugin from "@fullcalendar/interaction";
import { DateClickArg } from "@fullcalendar/interaction";
import Modal from '@shared/components/UI/Modal';
import TextField from '@mui/material/TextField';
import { useDashboard } from '@/hooks/useDashboard';



interface Option {
  id: string;
  reservation_time: string;
  division: string;
  work_name?: string;
  name?: string;
  address?: string;
  type?: string;
  flat_name: string;
  room_num: string;
  description?: string;
  availableDates?: string[];
  [key: string]: unknown; // You can add more dynamic fields if needed
};
interface Event {
  id: string;
  customer_address: string;
  start_time: string;
}

const Chat = () => {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  const messageEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const typingDelay = 25;
  const calendarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedtDate, setSelectedDate] = useState('');
  const [changedData, setChangedData] = useState<{ id: string, address: string, title: string, date: string }[] | []>([]);

  const { messages, handleButtonClick, handleInputEnterPress,
    handleBackClick, createReservation
  } = useChatHandler();
  const { getReservationListData } = useDashboard();

  useEffect(() => {


    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, typingDelay]);


  const handleKeyDown = (reqType: string) => {
    if (inputValue !== "") {
      handleInputEnterPress(inputValue, reqType);
      setInputValue('');
    }


  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const selectDate = () => {
    createReservation(selectedtDate, 'confrim');
    setIsModalOpen(false);
  };
  function isFutureDate(inputDate: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 時間部分をリセット

    const givenDate = new Date(inputDate);
    givenDate.setHours(0, 0, 0, 0);

    return givenDate > today;
  }
  const handleDateClick = (info: DateClickArg) => {
    console.log(info.dateStr)
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
  };
  const handleOptionClick = (option: string, reqType: string, index: number) => {
    setSelectedOptions((prev) => new Set(prev).add(option + index)); // クリックしたオプションを記録
    handleButtonClick(option, reqType);
  };
  const backBtn = () => {
    setSelectedOptions((prev) => {
      const arr = Array.from(prev);
      arr.pop(); // Remove the last added option
      return new Set(arr);
    });
    handleBackClick();

  }
  const handleDatesSet = async (start: string, end: string) => {
    const data = await getReservationListData(start, end);
    changeData(data);
  };
  const changeData = (data: Event[]) => {
    if (!Array.isArray(data)) { // Check if data is an array
      console.log('Expected data to be an array, but got:', data);
    } else {
      // setOriginalData(data);

      const dataValues = data.map((reservation: Event) => {
        const formattedDate = new Date(reservation.start_time).toISOString().split('T')[0];
        const title = `予約番号${reservation.id}`;
        return {
          id: reservation.id,
          title: title,
          address: reservation.customer_address,
          date: formattedDate, // Changed `start` to `date`
        };
      });
      setChangedData(dataValues);
    }
  };
  return (
    <div className="flex flex-col w-full gap-[10px] pr-5">
      {messages.map((message, index) => (
        <div key={index} className={`flex gap-2 mt-3 ${messages.length !== 1 && messages.length !== index + 1 && "pointer-events-none"}`}>
          <Image
            src="/assets/images/avatars/avatar.png"
            alt="Avatar"
            width={100}
            height={100}
            className="flex w-[80px] h-[80px] rounded-full border-2 border-[#83d0e4] select-none"
          />
          <div className="flex flex-col flex-wrap w-full relative font-normal leading-[28px] text-[#6C73A8] text-[17px] break-all select-none">
            <Typewriter
              options={{
                strings: message.content,
                autoStart: true,
                loop: false,
                deleteSpeed: 0,
                delay: 20, // Adjusted delay for a better effect
              }}
            />

            {message.type === 'button' && (
              <div className="flex flex-col sm:flex-row w-fit gap-3 flex-wrap mt-[10px]">
                {message.options && message.options.map((option: { label: string; nextKey: string }, idx: number) => (
                  <div key={idx}
                    className={`felx justify-center items-center border border-[#c8ceed] px-[20px] py-[10px] rounded-[5px] hover:border-[#0a1551] text-[#6C73A8] hover:bg-[#dadef3] cursor-pointer ${selectedOptions.has(option["label"] + index) ? "bg-[#0f1430] text-white" : "bg-white"}`}
                    onClick={() => { handleOptionClick(option["label"], option["nextKey"], index); }}
                  >
                    <p className="font-normal leading-[28px]  text-[15px] break-all text-center">{option["label"]}</p>
                  </div>
                ))}
                {index + 1 === messages.length && messages.length !== 1 &&
                  <div
                    className={`border border-[#f88888] ml-10 px-[20px] py-[10px] rounded-[5px] hover:border-[#ff4141] text-[#ff3333] hover:bg-[#ffeaea] cursor-pointer bg-white1`}
                    onClick={() => backBtn()}
                  >
                    <p className="font-normal leading-[28px]  text-[15px] break-all text-center">戻る</p>
                  </div>
                }
              </div>
            )}
            {message.type === 'input' && (
              <div className="flex gap-3 flex-wrap mt-[10px]">
                <input
                  type="text"
                  onChange={handleInputChange}
                  className="top-[50px] text-[20px] bg-[#dfe1ee] w-[70vw] sm:w-[30vw] border-none rounded-[5px] px-[10px] py-[5px] border-[0px] focus:outline-none focus:border-none"
                  placeholder="ここに入力してください..."
                />
                <div
                  className={`border border-[#c8ceed] px-[20px] py-[10px] rounded-[5px] hover:border-[#0a1551] text-[#6C73A8] hover:bg-[#dadef3] cursor-pointer bg-white1`}
                  onClick={() => { handleKeyDown(message.options[0]) }}
                >
                  <p className="font-normal leading-[28px]  text-[15px] break-all text-center">確認</p>
                </div>
                {index + 1 === messages.length && messages.length !== 1 &&
                  <div
                    className={`border border-[#f88888] ml-1 px-[20px] py-[10px] rounded-[5px] hover:border-[#ff4c4c] text-[#ff3333] hover:bg-[#f7dbdb] cursor-pointer bg-white1`}
                    onClick={() => backBtn()}
                  >
                    <p className="font-normal leading-[28px]  text-[15px] break-all text-center">戻る</p>
                  </div>
                }
              </div>
            )}
            {message.type === 'selectDate' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full h-[550px] p-5 mb-8  flex-col">
                {/* Left Side: Calendar */}
                <div className="hidden sm:block p-5 h-[500px]">
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locale={jaLocale}
                    headerToolbar={{
                      left: "", // Default buttons
                      center: "title", // Calendar title
                      right: "today,prev,next", // Custom button
                    }}
                    datesSet={(arg) => {
                      const year = arg.start.getFullYear();
                      const month = arg.start.getMonth() + 2;
                      const firstDay = `${year}-${month.toString().padStart(2, '0')}-01`;
                      const lastDate = new Date(year, month, 0).getDate();
                      const lastDay = `${year}-${month.toString().padStart(2, '0')}-${lastDate.toString().padStart(2, '0')}`;
                      handleDatesSet(firstDay, lastDay);
                    }}
                    eventContent={(arg) => (
                      <div className="truncate-event h-7" title={arg.event.title}>
                        {arg.event.title}
                      </div>
                    )}
                    events={changedData}
                    height="600px"
                    dateClick={(info) => handleDateClick(info)}
                  />
                </div>

                {/* Right Side: Content */}
                <div className=" h-[610px] w-full flex flex-col items-center border p-2 ">
                  <TextField
                    type="date"
                    // value={selectedEvent.reservation_time || "01/01/2001"}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setIsModalOpen(true);
                    }}
                    variant="outlined"
                    className="w-[70%] sm:w-[50%] p-2 border border-gray-300 rounded "
                  />
                  <div className="w-full h-[520px] sm:h-[350px] overflow-y-auto overflow-x-auto border border-gray-300 mt-2">
                    <table className="w-full min-w-[600px] text-center text-sm sm:text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          {["番号", "住所", "日付"].map((day, index) => (
                            <th key={index} className="p-2 sm:p-1 text-blue-600 border">{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {changedData.map((data, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-100">
                            <td className="p-3 sm:p-1 border">{rowIndex + 1}</td>
                            <td className="p-3 sm:p-1 border">{data.address}</td>
                            <td className="p-3 sm:p-1 border">{data.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>



                </div>
                {index + 1 === messages.length && messages.length !== 1 &&
                  <div
                    className={`border mt-5 w-fit border-[#f88888] px-[20px] py-[10px] rounded-[5px] hover:border-[#ff4c4c] text-[#ff3333] hover:bg-[#f7dbdb] cursor-pointer bg-white1`}
                    onClick={() => backBtn()}
                  >
                    <p className="font-normal leading-[28px]  text-[15px] break-all text-center">戻る</p>
                  </div>
                }
              </div>
            )}
            {message.type === 'reservationView' && (
              <div className="flex flex-col w-full gap-3 flex-wrap mt-[10px] relative  ">
                <div
                  className={clsx(
                    "relative w-fit rounded-[10px] border border-black/10 bg-no-repeat mt-8 p-7 overflow-hidden bg-contain bg-center",
                    message.state === "OK"
                      ? "bg-[url('/assets/images/check_bg.png')] shadow-[3px_2px_34px_0px_rgba(0,210,0,0.5)]"
                      : "shadow-[1px_2px_20px_0px_rgba(0,0,0,0.4)]"
                  )}
                >
                  <div className="hidden sm:block absolute inset-0 bg-white/70"></div>
                  <div className="flex gap-5 relative">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex justify-center items-center">
                        <Image src="/assets/images/auth/logo.png" alt="logo" width={120} height={120} priority />
                        <p className="font-bold text-[100px] text-[#005596] "><span className="text-[#e6494f] text-[90px]">in</span>g</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 my-[9px]">
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options[0]}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">工事場所</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options[1]}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">日付</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options[2]}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">時間</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options[3]}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">氏名</p>
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options[4]}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">TEL</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6">
                  <Button label="はい" onClickHandler={() => handleButtonClick("はい", message.reqType[0])} />
                  <Button label="いいえ" onClickHandler={() => handleButtonClick("いいえ", message.reqType[0])} />
                </div>
              </div>
            )}
            {message.type === 'updateReservation' && (
              <div className="flex flex-col w-full gap-3 flex-wrap mt-[10px] relative  ">
                <div
                  className={clsx(
                    "relative w-fit rounded-[10px] border border-black/10 bg-no-repeat mt-8 p-7 overflow-hidden bg-contain bg-center",
                    message.state === "OK"
                      ? "bg-[url('/assets/images/check_bg.png')] shadow-[3px_2px_34px_0px_rgba(0,210,0,0.5)]"
                      : "shadow-[1px_2px_20px_0px_rgba(0,0,0,0.4)]"
                  )}
                >
                  <div className="absolute inset-0 bg-white/70"></div>
                  <p className="font-semibold text-[20px] leading-[25.5px] text-[#091428] opacity-100 relative">
                    予約番号：{message.options.id}
                  </p>
                  <div className=" hidden sm:block  gap-3 relative">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex justify-center items-center">
                        <Image src="/assets/images/auth/logo.png" alt="logo" width={120} height={120} priority />
                        <p className="font-bold text-[100px] text-[#005596] "><span className="text-[#e6494f] text-[90px]">in</span>g</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 my-[9px]">
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options.customer_address}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">工事場所</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{String(message.options.end_time).slice(0, 10)}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">日付</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{(Number(String(message.options.start_time).slice(11, 13)) + 9) < 10 ? "" + Number(String(message.options.start_time).slice(11, 13)) + 9 + ":00" : Number(String(message.options.start_time).slice(11, 13)) + 9 + ":00"}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">時間</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options.customer_name}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">氏名</p>
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options.customer_phoneNum}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">TEL</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6">
                  <Button label="はい" onClickHandler={() => handleButtonClick("はい", message.reqType[0])} />
                  <Button label="いいえ" onClickHandler={() => handleButtonClick("いいえ", message.reqType[0])} />
                </div>
              </div>
            )}
            {message.type === 'checkReservation' && (
              <div className="flex flex-col w-full gap-3 flex-wrap mt-[10px] relative  ">
                <div
                  className={clsx(
                    "relative w-fit rounded-[10px] border border-black/10 bg-no-repeat mt-8 p-7 overflow-hidden bg-contain bg-center",
                    message.state === "OK"
                      ? "bg-[url('/assets/images/check_bg.png')] shadow-[3px_2px_34px_0px_rgba(0,210,0,0.5)]"
                      : "shadow-[1px_2px_20px_0px_rgba(0,0,0,0.4)]"
                  )}
                >
                  <div className="absolute inset-0 bg-white/70"></div>
                  <div className="flex gap-5 relative">
                    <div className="flex flex-col items-center justify-center">
                      {
                        message.state === "OK" && (
                          <p className="font-semibold text-[20px] leading-[25.5px] text-[#091428] opacity-100 relative">
                            予約番号：{message.options.id}
                          </p>
                        )
                      }
                      <div className="hidden sm:flex justify-center items-center w-[270px]">
                        <Image src="/assets/images/auth/logo.png" alt="logo" width={120} height={120} priority />
                        <p className="font-bold text-[100px] text-[#005596] "><span className="text-[#e6494f] text-[90px]">in</span>g</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 my-[9px]">
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options.customer_address}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">工事場所</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{String(message.options.start_time).slice(0, 10)}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">日付</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options.customer_name}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">氏名</p>
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options.customer_phoneNum}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">TEL</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6">
                  {
                    message.state !== "OK" ? (
                      <>
                        <Button label="はい" onClickHandler={() => createReservation(selectedtDate, "reservate")} />
                        <Button label="いいえ" onClickHandler={() => handleButtonClick("welcomeAgain", "戻る")} />
                      </>
                    ) : (
                      <Button label="戻る" onClickHandler={() => handleButtonClick("welcomeAgain", "戻る")} />
                    )
                  }
                </div>
              </div>
            )}
            {message.type === 'confirmReservation' && (
              <div className="flex flex-col w-full gap-3 flex-wrap mt-[10px] relative  ">
                <div
                  className={clsx(
                    "relative w-fit rounded-[10px] border border-black/10 bg-no-repeat mt-8 p-7 overflow-hidden bg-contain bg-center",
                    message.state === "OK"
                      ? "bg-[url('/assets/images/check_bg.png')] shadow-[3px_2px_34px_0px_rgba(0,210,0,0.5)]"
                      : "shadow-[1px_2px_20px_0px_rgba(0,0,0,0.4)]"
                  )}
                >
                  <div className="absolute inset-0 bg-amber-100 sm:bg-white/70"></div>
                  <div className="flex gap-5 relative">
                    <div className="flex flex-col items-center justify-center">
                      {
                        message.state === "OK" && (
                          <p className="font-semibold text-[20px] leading-[25.5px] text-[#091428] opacity-100 relative">
                            予約番号：{message.options.id}
                          </p>
                        )
                      }

                      <div className="hidden sm:flex justify-center items-center">
                        <Image src="/assets/images/auth/logo.png" alt="logo" width={120} height={120} priority />
                        <p className="font-bold text-[100px] text-[#005596] "><span className="text-[#e6494f] text-[90px]">in</span>g</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 my-[9px]">
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options.customer_address}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">工事場所</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{String(message.options.start_time).slice(0, 10)}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">日付</p>
                      <hr />
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options.customer_name}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">氏名</p>
                      <p className="font-normal text-5 leading-[19px] text-[#091428]">{message.options.customer_phoneNum}</p>
                      <p className="font-normal text-4 leading-[14px] text-[#858688]">TEL</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6">
                  {
                    message.state !== "OK" ? (
                      <>
                        <Button label="戻る" onClickHandler={() => handleButtonClick("welcomeAgain", "戻る")} />
                      </>
                    ) : (
                      <Button label="戻る" onClickHandler={() => handleButtonClick("welcomeAgain", "戻る")} />

                    )
                  }
                </div>
              </div>
            )}
            {message.type === 'viewReservationList' && (
              <div className="p-5 max-w-full overflow-x-auto">
                <table className="w-full table-auto border border-gray-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left bg-gray-100 font-bold border-b-2 border-gray-300">予約番号</th>
                      <th className="px-4 py-3 text-left bg-gray-100 font-bold border-b-2 border-gray-300">物件名</th>
                      <th className="px-4 py-3 text-left bg-gray-100 font-bold border-b-2 border-gray-300">部屋番号</th>
                      <th className="px-4 py-3 text-left bg-gray-100 font-bold border-b-2 border-gray-300">作業内容</th>
                      <th className="px-4 py-3 text-left bg-gray-100 font-bold border-b-2 border-gray-300">予約時間</th>
                      <th className="px-4 py-3 text-left bg-gray-100 font-bold border-b-2 border-gray-300">時間帯</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      message.options.map((option: Option, idx: number) => {
                        return (
                          <tr key={idx} className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white">
                            <td className="px-4 py-3 border-b border-gray-300">{option.id}</td>
                            <td className="px-4 py-3 border-b border-gray-300">{option.flat_name}</td>
                            <td className="px-4 py-3 border-b border-gray-300">{option.room_num}</td>
                            <td className="px-4 py-3 border-b border-gray-300">{option.work_name}</td>
                            <td className="px-4 py-3 border-b border-gray-300">{option.reservation_time}</td>
                            <td className="px-4 py-3 border-b border-gray-300">{option.division}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
                <div className="flex gap-6 mt-5 justify-end items-end">
                  <Button label='戻る' onClickHandler={() => handleButtonClick("戻る", '')} />
                </div>
              </div>
            )}
            <div ref={messageEndRef} className="mt-[50px]"></div>
          </div>
        </div>
      ))}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="flex inset-0 items-center justify-center">
          <div className="bg-white p-6 rounded-[10px] shadow-lg w-full">
            <h2 className="text-xl font-bold mb-4">{isFutureDate(selectedtDate) ? selectedtDate + "日に予約をしたいですか？" : "その日の予約はできません。"}</h2>
            <p className="mb-6">{isFutureDate(selectedtDate) ? "この日を希望する場合は、会社の予約状況を確認し、空いている時間をお知らせできます。" : "将来の日付のみ選択してください。予約は必ず前日までに行う必要があり、当日の予約はできません。"}</p>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={isFutureDate(selectedtDate) ? selectDate : handleCloseModal}  // This will trigger the deletion action
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                はい
              </button>
              <button
                onClick={handleCloseModal}  // This will close the modal without performing any action
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Chat;
