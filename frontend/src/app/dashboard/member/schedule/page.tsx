/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { useDashboard } from '@/hooks/useDashboard';

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
            <h1 className="text-3xl font-bold text-white mb-8">工事職員日程ー覧</h1>
          </div>
          <div className="overflow-x-auto ">
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MemberViewPage;
