/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { FaSearch, FaSort } from "react-icons/fa";
import { useDashboard } from '@/hooks/useDashboard';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

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
const ReservationHistory = () => {
  const { getAllReservationData } = useDashboard();
  const [reservationDatas, setReservationDatas] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {

    const fetchData = async () => {
      try {
        const data = await getAllReservationData();
        setReservationDatas(data);
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

  const filterReservationData = reservationDatas.filter((logs) =>
    Object.values(logs).some(
      (value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedreservationDatas = [...filterReservationData].sort((a, b) => {
    if (sortColumn) {
      const column = sortColumn as keyof typeof a; // Ensure TypeScript knows it's a valid key
      if (a[column] < b[column]) return sortDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservationDatas = sortedreservationDatas.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="bg-[#1b2635] p-8">
          <div className="flex flex-col items-start mb-4">
            <h2 className="text-3xl text-white">予約管理</h2>
            <div className='flex mt-5 text-gray-400 '>
              <Link href={"/dashboard/company/reservation"}><p className='text-[18px]  mx-2'>予約管理</p> </Link>/<Link href={"/dashboard/company/reservation/history"}><p className='text-[18px] text-[#407AD6] mx-2'>過去の予約履歴</p> </Link>
            </div>
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
                  {["番号", "顧客名", "顧客住所", "電話番号", '予約状況', '時間', 'メンバー'].map((column) => (
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
                  <tr key={resesrvation.id} className={`${index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"} hover:bg-gray-700`}>
                    <td className="px-6 py-3 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.customer_name}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.customer_address}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.customer_phoneNum}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.status}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.start_time.replace('T', ' ').replace(':00.000Z', '')}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resesrvation.worker_id}</td>
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReservationHistory;