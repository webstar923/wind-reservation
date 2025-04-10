'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { FaSearch, FaSort } from "react-icons/fa";
import BellIcon from '@public/assets/icons/notification-01.svg';
import MessageIcon from '@public/assets/icons/message_icon.svg';
import ErrorIcon from '@public/assets/icons/error_icon (log).svg';
import { useDashboard } from '@/hooks/useDashboard';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useNotificationData } from '@/state/notificationNum';

const Message = () => {
  const { getMessages, markAsRead } = useDashboard();
  const [messages, setMessages] = useState<{ id: number; state: string; message: string; division: string; sent_at: string; isRead: boolean }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const { NotificationNum, setField } = useNotificationData();
  const itemsPerPage = 10;


  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMessages();
        setMessages(data.unreadAlerts);
        console.log(data.unreadAlerts)
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleCheck = async (id: number) => {
    try {
      await markAsRead(id);
      setField('Message_Num', NotificationNum.Message_Num - 1);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === id ? { ...message, isRead: true } : message
        )
      );
    } catch (error) {
      console.error("Failed to update read status", error);
    }
  };

  const filterMessages = messages.filter((message) =>
    Object.values(message).some(
      (value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedMessages = [...filterMessages].sort((a, b) => {
    if (sortColumn) {
      const column = sortColumn as keyof typeof a;
      if (a[column] < b[column]) return sortDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMessages = sortedMessages.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <DashboardLayout>
      <div className="flex flex-col bg-[#1b2635]">

        <div className="bg-[#1b2635] p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white mb-8">メッセージ</h1>
          </div>

          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="検索ユーザー..."
              className="w-full px-4 py-2 bg-[#667486] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>


          <div className="overflow-x-auto">
            <table className="w-full sbg-[#1b2635] text-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700">
                  {["番号", "状態", "時間", "メッセージ", "区分", "チェック"].map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-[15px] font-medium uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center">
                        {column.charAt(0).toUpperCase() + column.slice(1)}
                        {sortColumn === column && (
                          <FaSort className={`ml-1 ${sortDirection === "asc" ? "text-gray-400" : "text-gray-200"}`} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentMessages.map((message, index) => (
                  <tr key={message.id} className={`${index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"} hover:bg-gray-700`}>
                    <td className="px-6 py-3 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{message.state === "情報" ? <MessageIcon /> : message.state === "エラー" ? <ErrorIcon /> : <BellIcon />}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      {new Date(message.sent_at).toISOString().replace("T", " ").replace(".000Z", "")}
                    </td>
                    <td className="px-6 py-3 w-[50%]">{message.message}</td>
                    <td className="px-6 py-3 ">{message.division}</td>
                    <td className="flex justify-start px-6 py-3 text-center ">
                      <input
                        type="checkbox"
                        checked={!!message.isRead}  // Ensure boolean value
                        onChange={() => handleCheck(message.id)}
                        className="w-5 h-5 cursor-pointer"
                        disabled={!!message.isRead}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center">
              <Stack spacing={2} className='bg-gray-700 mt-1 rounded-[10px] py-1 px-5'>
                <Pagination
                  color="primary"
                  count={Math.ceil(sortedMessages.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                />
              </Stack>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Message;


