/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { useDashboard } from '@/hooks/useDashboard';
import { notify } from '@/utils/notification';

import TextField from '@mui/material/TextField';
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

const WorktimeSettingPage = () => {
  const { getUserData, changeUser, createUser, deleteUser } = useDashboard();
  const [users, setUsers] = useState<{
    id: number;
    name: string;
    email: string;
    phoneNum: string;
    permissionStatus: string;
    address: string;  
    role: string;
  }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Add modal state
  const [modalContent, setModalContent] = useState<{ type: string, users?: User | null } | null>(null);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('user');
  const [permission, setPermission] = useState('');

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
        const data = await getUserData();
        setUsers(data);
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

  const openModal = (users: User | null, type: string) => {
    setModalContent({ type, users });

    if (users !== null) {

      setUserName(users.name);
      setUserEmail(users.email);
      // setPassword(users.password);
      setPhoneNum(users.phoneNum);
      setAddress(users.address);
      setRole(users.role);
      setPermission(users.permissionStatus);

    } else {
      setUserName('');
      setUserEmail('');
      setPhoneNum('');
      setPassword('');
      setAddress('');
      setRole('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
    setModalContent(null); // Reset modal content
  };

  const handleSave = async () => {
    const updatedUserData = {
      id: modalContent?.users?.id ? Number(modalContent.users.id) : 0, // Fallback to 0 if id is undefined
      name: userName,
      email: userEmail,
      phoneNum: phoneNum,
      address: address,
      permissionStatus: permission,
      role: role
    };
    console.log(updatedUserData);

    try {
      await changeUser(updatedUserData);
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === updatedUserData.id
            ? {
              ...updatedUserData,
              phoneNum: updatedUserData.phoneNum, // Ensure phoneNum is a number
              role: Array.isArray(updatedUserData.role) ? updatedUserData.role : updatedUserData.role,
            }
            : user
        )
      );
      notify('success', '成功!', 'データが成果的に変更されました!');
    } catch (error) {
      notify('error', 'エラー!', '資料保管中にエラーが発生しました!');
      console.log(error);
    }
    handleCloseModal();
  };
  const handleCreate = async () => {
    const saveUserData = {
      name: userName,
      password: password,
      email: userEmail,
      phoneNum: phoneNum,
      address: address,
      role: role
    }

    try {
      const createdUser = await createUser(saveUserData);
      if (createdUser) {
        setUsers(prevUsers => [
          ...prevUsers,
          createdUser
        ]);
        notify('success', '成功!', 'データが成果的に保管されました!');
      } else {
        notify('error', 'エラー!', '作成されたデータは無効です!');
      }
    } catch (error) {
      console.log(error);
      notify('error', 'エラー!', '資料保管中にエラーが発生しました!');
    }
    handleCloseModal();
  };


  const handleDelte = async () => {
    const id = modalContent?.users?.id;

    try {
      const deletedUser = await deleteUser(Number(id));
      setUsers(prevUsers => {
        return prevUsers.filter(users => users.id !== deletedUser.User.id);
      });
      notify('success', '成功!', 'データが成果的に削除されました!');
    } catch (error) {
      console.log(error);
      notify('error', 'エラー!', '資料削除中にエラーが発生しました!');
    }
    handleCloseModal();
  }


  return (
    <DashboardLayout>
      <div className="flex flex-col bg-[#1b2635]">
        <div className="bg-[#1b2635] p-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white mb-8">標準所要時間</h1>
          </div>
          <div className="overflow-x-auto ">
            <div className='flex flex-col p-4 bg-[#233044] rounded-lg'>
              <h3 className='text-white'>標準作業時間制定</h3>
              <div className='flex  text-white p-5'>
                <TextField
                  label="物件名"
                  InputProps={{
                    className: "text-gray-200", 
                  }}
                  InputLabelProps={{
                    className: "text-gray-200",
                  }}
                  variant="outlined"
                  className="w-30 border-1 border-white text-white rounded"
                />
              </div>


            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorktimeSettingPage;
