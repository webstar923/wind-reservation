'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { FaSearch, FaSort } from 'react-icons/fa';
import Modal from '@shared/components/UI/Modal';
import CustomButton from '@shared/components/UI/CustomButton';
import { useDashboard } from '@/hooks/useDashboard';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const ChatManagementPage = () => {
  const { getChatData,createChat,updateChat,deleteChat} = useDashboard();

  const [flows, setFlows] = useState<{id:number; key: string;  type: string;  content: string;  options: string;}[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const itemsPerPage = 10;

  const fetchFlows = async () => {
    const res = await getChatData();
    setFlows(res.data);
  };

  useEffect(() => { fetchFlows(); }, []);

  const handleSave = async () => {
    const chatData = {
      key: form.キー,
      type: form.タイプ,
      content: form.コンテンツ,
      options: form.オプション,
      reqType: form.リクエストタイプ,
      state: form.状態,
    };
    if (modalType === 'edit' && editingId !== null) {
      await updateChat(editingId, chatData);
    } else {
      await createChat(chatData);
    }
    setIsModalOpen(false);
    fetchFlows();
  };
  const handleDelete = async (id :number) =>{
    deleteChat(id);
    setIsModalOpen(false);
    fetchFlows();
  }  

  const openModal = (flow: any | null, type: string) => {   

    if (flow !== null) {         

      setForm({
        キー: flow.key,
        タイプ: flow.type,
        コンテンツ: flow.content,
        オプション: flow.options,        
      });
      setEditingId(flow.id);
    } else {
      setForm({ キー: '', タイプ: '', コンテンツ: '', オプション: ''});
      setEditingId(null);
    }
    setModalType(type);
    setIsModalOpen(true);
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

  const filteredflows = flows.filter((flows) =>
    Object.values(flows).some(
      (flow) => flow && flow.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedflows = [...filteredflows].sort((a, b) => {
    if (sortColumn) {
      const column = sortColumn as keyof typeof a; // Ensure TypeScript knows it's a valid key
      if (a[column] < b[column]) return sortDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFlows = sortedflows.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };  

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl text-white">チャットフロー管理</h2>
          <CustomButton label="+追加" onClick={() => openModal("","add")} />
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
          <table className="w-full #bg-[#233044] text-white rounded-lg overflow-hidden p-3">
            <thead>
              <tr className="bg-[#667486]">
                {['番号','キー', 'タイプ', 'コンテンツ', 'オプション'].map((column) => (
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
                <th className="px-6 py-3 text-left text-[15px] font-medium uppercase tracking-wider">
                動作</th>
              </tr>
            </thead>
            <tbody>
              {currentFlows.map((flow, index) => (
                <tr key={flow.id} className={`${index % 2 === 0 ? "bg-[#2a3a53]" : "bg-[#2a364d]"} hover:bg-[#444e5c]`}>
                  <td className="pl-4 py-3 whitespace-nowrap">{(currentPage-1)*itemsPerPage+index+1}</td>
                  <td className="px-2 py-1">{flow.key}</td>
                  <td className="px-2 py-1">{flow.type}</td>
                  <td className="px-2 py-1">{flow.content}</td>
                  <td className="px-2 py-1">{flow.options}</td>       
                  <td className="px-4 py-3 whitespace-nowrap flex gap-3">
                    <button onClick={() => openModal(flow, 'edit')} className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded">編集</button>
                    <button onClick={() => openModal(flow, 'delete')} className="bg-red-500 hover:bg-red-700 px-4 py-2 rounded">削除</button>
                  </td>
                </tr>
              ))}
            </tbody>         
          </table> 
          <div className="flex justify-center">
            <Stack spacing={2} className='bg-[#667486] mt-1 rounded-[10px] py-1 px-5'>                    
              <Pagination 
                color="primary" 
                count={Math.ceil(sortedflows.length / itemsPerPage)} 
                page={currentPage} 
                onChange={handlePageChange} 
              /> 
            </Stack>
          </div>         
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          { modalType === "delete" ? (
            <div className="flex inset-0 items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-[10px] shadow-lg w-full">
                <h2 className="text-xl font-bold mb-4">資料を削除しますか?</h2>
                <p className="mb-6">この操作は取り消せません。削除を確認してください。</p>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={()=>handleDelete(editingId ?? 0)}  // This will trigger the deletion action
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    はい
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}  // This will close the modal without performing any action
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          ):
          (
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-xl font-bold mb-4">新規チャットフロー追加</h2>              

                {['キー', 'タイプ', 'コンテンツ', 'オプション'].map((field, index) => (
                  field === "オプション" ? (
                    <textarea 
                      className='border p-2 rounded w-full my-2 h-[150px]'
                      key={`field-${index}`} 
                      placeholder={field}
                      value={form[field] ?? ""}
                      onChange={(e) => setForm({ ...(form ?? {}), [field]: e.target.value })}
                    />
                  ) : (
                    <input
                      key={`field-${index}`} 
                      placeholder={field}
                      value={form[field] ?? ""}
                      onChange={(e) => setForm({ ...(form ?? {}), [field]: e.target.value })}
                      className="border p-2 rounded w-full my-2"
                    />
                  )
                ))}

              <div className="flex justify-end mt-4">
                <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">保存</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default ChatManagementPage;
