/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { FaSearch, FaSort } from "react-icons/fa";
import { useDashboard } from '@/hooks/useDashboard';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
interface User {
  id?: number;
  name: string;
  email: string;
  phoneNum: string;
  address: string;
  role: string;
  permissionStatus: string
}
const MemberViewPage = () => {
  const { getMemberData } = useDashboard();
  const [users, setUsers] = useState<{
    id: number;
    name: string;
    email: string;
    phoneNum: string;
    address: string;  // Use 'string' instead of 'String'
    createdAt: string;
  }[]>([]);


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
        const data = await getMemberData();
        setUsers(data);
        console.log(data);

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

  return (
    <DashboardLayout>
      <div className="flex flex-col bg-[#1b2635]">
        <div className="bg-[#1b2635] p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white mb-8">工事職員ー覧</h1>
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

          <div className="overflow-x-auto ">
            <table className="w-full #bg-[#233044] text-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#667486]">
                  {["番号", "ユーザID", "名前", "メール", "電話番号", "住所", "就職日"].map((column) => (
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
                {currentUsers.map((user, index) => (
                  <tr key={user.id} className={`${index % 2 === 0 ? "bg-[#2a3a53]" : "bg-[#2a364d]"} hover:bg-[#444e5c]`}>
                    <td className="pl-4 py-3 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{user.id}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{user.name}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{user.email}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{user.phoneNum}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{user.address}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{user.createdAt.replace('T', '   ').replace('.000Z', '')}</td>

                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center">
              <Stack spacing={2} className='bg-[#667486] mt-1 rounded-[10px] py-1 px-5'>
                <Pagination
                  color="primary"
                  count={Math.ceil(sortedUsers.length / itemsPerPage)}
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

export default MemberViewPage;
