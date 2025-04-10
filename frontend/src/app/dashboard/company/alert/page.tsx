'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { useDashboard } from '@/hooks/useDashboard';
import { Modal } from "@mui/material";
import CustomButton from '@shared/components/UI/CustomButton';
import { notify } from '@/utils/notification';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { FaSearch, FaSort } from "react-icons/fa";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

interface Message {
  id: string;
  user_id: string | null;
  state: string;
  message: string;
  division: string;
  sent_at: string;
}

const AlertManagementPage = () => {
  const { getAllAlerts, updateAlert, deleteAlert, createAlert } = useDashboard();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

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

  const filteredMessages = messages.filter((message) =>
    Object.values(message).some(
      (value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (sortColumn) {
      const column = sortColumn as keyof typeof a;
      const aValue = a[column]?.toString() || '';
      const bValue = b[column]?.toString() || '';
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMessages = sortedMessages.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllAlerts();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {  
    
    if (selectedMessage?.id !== "0") {
      // Update existing message
      if (selectedMessage) {
        try {
          if (selectedMessage.user_id === null) {
            setSelectedMessage({
              ...selectedMessage,
              user_id: "0" // Changed from number 0 to string "0" to match type
            })
          }
          await updateAlert(selectedMessage.id, selectedMessage);  
          // Update the list of messages
          const updatedMessages = messages.map((message: Message) =>
            message.id === selectedMessage.id ? selectedMessage : message
          );    
          setMessages(updatedMessages);

          notify('success', '成功!', '通知が更新されました!');
        } catch {
          notify('error', '失敗!', '通知の更新に失敗しました!');
        }
        setModalOpen(false);
      }
    } else {
      // Create new message
      try {
        // Create alert data without id and sent_at (these will be handled by the backend)
        const alertData = {
          user_id: selectedMessage?.user_id || 0,
          state: selectedMessage?.state || "",
          message: selectedMessage?.message || "",
          division: selectedMessage?.division || ""
        };
  
        // Create the alert
        const response = await createAlert(alertData);
        
        
        if (response) {
          // Add new message to state using the response from the server
          const updatedMessages = [...messages, response];
          setMessages(updatedMessages);
          notify('success', '成功!', '通知が作成されました!');
        }
        setModalOpen(false);
      } catch (error) {
        console.error("Error creating message:", error);
        notify('error', '失敗!', '通知の作成に失敗しました!');
      }
    }
  };
  
  const handleDelete = () => {
    if (selectedMessage?.id) {
      try {
        deleteAlert(selectedMessage.id);
        setMessages((prevMessages) => {
          return prevMessages.filter(message => message.id !== selectedMessage.id);
        });
        notify('success', '成功!', '通知が削除されました!');
        setModalOpen(false);
      } catch (error) {
        console.error('Error during delete operation:', error);
        notify('error', '失敗!', '通知の削除に失敗しました!');
      }
    } else {
      console.error('Selected message is not available for deletion.');
      notify('error', '失敗!', '選択された通知がありません。');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-min-screen bg-[#1b2635]">      
        <div className="bg-[#1b2635] p-8">   
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white mb-8">通知管理</h1>
            <CustomButton
              type="button"
              className="font-semibold !text-[40px]"
              label="+追加"
              onClick={() => {
                setSelectedMessage({
                  id: "0",
                  user_id: "",
                  state: "",
                  message: "",
                  division: "",
                  sent_at: "",
                });
                setModalOpen(true);
              }} 
            />
          </div>
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="検索通知..."
              className="w-full px-4 py-2 bg-[#667486] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full #bg-[#233044] text-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#667486]">
                  {["番号","メッセージ", "状態", "区分","ユザーID","日時"].map((column) => (
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
                  <tr key={message.id} className={`${index % 2 === 0 ? "bg-[#2a3a53]" : "bg-[#2a364d]"} hover:bg-[#444e5c]`}
                      onClick={() => {
                        setSelectedMessage(message);
                        setModalOpen(true);
                      }}
                  >
                    <td className="px-6 py-3 whitespace-nowrap">{(currentPage-1)*itemsPerPage+index+1}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{message.message}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{message.state}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{message.division}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{message.user_id}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{new Date(message.sent_at).toISOString().replace("T", " ").replace(".000Z", "") }</td>
                  </tr>
                ))}
              </tbody>         
            </table> 
            <div className="flex justify-center">
              <Stack spacing={2} className="bg-[#667486] mt-1 rounded-[10px] py-1 px-5">                  
                <Pagination 
                  color="primary" 
                  count={Math.ceil(messages.length / itemsPerPage)} 
                  page={currentPage} 
                  onChange={handlePageChange} 
                /> 
              </Stack>
            </div>         
          </div>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              aria-labelledby="edit-message-modal"
              aria-describedby="edit-message-description"
              className='flex justify-center items-center'
            >
              <div className="modal-content p-4 bg-white w-[40%] rounded-lg">
                {selectedMessage && (
                  <div className="flex inset-0 items-center justify-center bg-opacity-50">
                    <div className="bg-white p-6 rounded-[10px] w-full">
                      <h2 className="text-xl font-bold mb-4">通知編集</h2>
                      <div className="space-y-4">                 
                        <TextField
                          select
                          label="状態"
                          value={selectedMessage.state}
                          onChange={(e) => setSelectedMessage({
                            ...selectedMessage,
                            state: e.target.value
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          {["エラー","情報","重要"].map((option, index) => (
                            <MenuItem key={`${option}-${index}`} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>                      
                        <TextField 
                          label="メッセージ" 
                          value={selectedMessage.message}
                          onChange={(e) => setSelectedMessage({
                            ...selectedMessage,
                            message: e.target.value
                          })} 
                          variant="outlined" 
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                        <TextField
                          select
                          label="区分"
                          value={selectedMessage.division}
                          onChange={(e) => setSelectedMessage({
                            ...selectedMessage,
                            division: e.target.value
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          {["ユーザー","メンバー","全員"].map((option, index) => (
                            <MenuItem key={`${option}-${index}`} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField 
                          type="number"
                          label="ユーザーID" 
                          value={selectedMessage.user_id}
                          onChange={(e) => setSelectedMessage({
                            ...selectedMessage,
                            user_id: e.target.value
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
                        {selectedMessage.id !== "0" && (
                          <button
                            onClick={handleDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                          >
                            削除
                          </button>
                        )}
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
     
               
    </DashboardLayout>
  );
};

export default AlertManagementPage;
