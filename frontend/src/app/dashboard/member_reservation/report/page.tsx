/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { FaSearch, FaSort } from "react-icons/fa";
import { useDashboard } from '@/hooks/useDashboard';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Modal from '@shared/components/UI/Modal';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { notify } from '@/utils/notification';



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
const ReportPage = () => {
  const { getFutureReservationData, updateReservation } = useDashboard();
  const [reservationDatas, setReservationDatas] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalContent, setModalContent] = useState<Reservation | null>(null);
  const [reportId, setReportId] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState("予約済み");

  const itemsPerPage = 10;
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const fetchData = async () => {
    try {
      const data = await getFutureReservationData();
      setReservationDatas(data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };


  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSave = async () => {
    try {
      await updateReservation({ id: reportId, status: selectedReservation });

      notify('success', '成功!', '予約が成果的に行われました!');
    } catch {
      notify('error', '失敗!', '予約追加に失敗しました!');
    }
    fetchData();
    setIsModalOpen(false);

  };

  const filterReservationData = reservationDatas.filter((reservation) =>
    Object.values(reservation).some((value) => {
      if (value == null) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );


  const sortedreservationDatas = [...filterReservationData].sort((a, b) => {
    if (sortColumn) {
      const column = sortColumn as keyof typeof a;
      if (a[column] < b[column]) return sortDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservationDatas = sortedreservationDatas.slice(indexOfFirstItem, indexOfLastItem);

  const openModal = async (reservation: Reservation) => {
    setModalContent(reservation);
    setReportId(reservation.id);
    setSelectedReservation(reservation.status);
    setIsModalOpen(true);
  };
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="bg-[#1b2635] p-8">
          <div className="flex flex-col items-start mb-4">
            <h2 className="text-3xl text-white">予約完了報告</h2>
          </div>
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="検索予約..."
              className="w-full px-4 py-2 bg-[#667486] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>

          <div className="w-full overflow-x-auto ">
            <table className="w-full bg-[#1b2635] text-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700">
                  {["番号", "顧客名", "顧客住所", "電話番号", '予約状況', '時間'].map((column) => (
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
                {currentReservationDatas.map((resesrvation, index) => (
                  <tr key={resesrvation.id} className={`${index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"} hover:bg-gray-700`} onClick={() => openModal(resesrvation)}>
                    <td className="px-6 py-3 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.customer_name}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.customer_address}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.customer_phoneNum}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.status}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.start_time.replace('T', ' ').replace('00:00:00.000Z', '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center">
              <Stack spacing={2} className='bg-gray-700 mt-1 rounded-[10px] py-1 px-5'>
                <Pagination
                  color="primary"
                  count={Math.ceil(sortedreservationDatas.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                />
              </Stack>
            </div>
            {modalContent && (
              <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="flex inset-0 items-center justify-center">
                  <div className="bg-white p-6 rounded-[10px] shadow-lg w-full">
                    <h2 className="text-xl font-bold mb-4">予約報告</h2>
                    <p className="mb-6">予約番号{reportId}の予約進行定形をご記入ください。</p>
                    <TextField
                      select
                      label="予約状況"
                      value={selectedReservation}
                      onChange={(e) => setSelectedReservation(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      {currencies.map((option, index) => (
                        <MenuItem key={`${option.value}-${index}`} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <div className="flex justify-end mt-4 space-x-2">

                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        はい
                      </button>
                      <button
                        onClick={handleCloseModal}
                        className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                      >
                        いいえ
                      </button>
                    </div>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportPage;