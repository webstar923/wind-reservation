/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { useDashboard } from '@/hooks/useDashboard';
import TextField from '@mui/material/TextField';
import { notify } from '@/utils/notification'


interface User {
  id?: number;
  name: string;
  email: string;
  // password:string;
  phoneNum: string;
  address: string;
  role: string;
  permissionStatus: string
}
const ReservationSettingPage = () => {
  const { getSettingData,setReservationNumPerDay } = useDashboard();
  const [users, setUsers] = useState<{
    id: number;
    name: string;
    email: string;
    phoneNum: string;
    address: string;  // Use 'string' instead of 'String'
    createdAt: string;
  }[]>([]);

  const [reservation_number, setReservation_number] = useState(1);
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
        const data = await getSettingData();
        setReservation_number(data[0].T_number);       
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

  const filteredusers = users.filter((users) =>
    Object.values(users).some(
      (value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedUsers = [...filteredusers].sort((a, b) => {
    if (sortColumn) {
      const column = sortColumn as keyof typeof a; // Ensure TypeScript knows it's a valid key
      if (a[column] < b[column]) return sortDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const reservation_number_setting = async() =>{    
     await setReservationNumPerDay(reservation_number);
     notify('success', '成功', '1日の予約件数が正常に変更されました。');
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col bg-[#1b2635]">
        <div className="bg-[#1b2635] p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white mb-8">予約設定管理</h1>
          </div>
          <div className="overflow-x-auto ">
            <div className='bg-gray-100 p-4 rounded-[10px] flex gap-5'>
             <TextField 
                label="1日予約件数設定" 
                type="number"
                value={reservation_number}
                onChange={(e) => setReservation_number(Number(e.target.value))} 
                inputProps={{ min: 5 }}
                variant="outlined" 
                className="border border-[#c8ceed] rounded w-[250px]"
              />
              <div 
                className={`border border-[#c8ceed] px-[20px] rounded-[5px] hover:border-[#56d461] text-[#6C73A8] hover:text-[#48a8c0] hover:bg-[#b7e9be] cursor-pointer flex justify-center items-center`}
                onClick={() =>reservation_number_setting()}
              >
                <p className="font-bold leading-[28px] text-[15px] break-all">確認</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ReservationSettingPage;
