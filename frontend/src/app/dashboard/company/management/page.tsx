/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { FaSearch, FaSort } from "react-icons/fa";
import CustomButton from '@shared/components/UI/CustomButton';
import { useDashboard } from '@/hooks/useDashboard';
import Modal from '@shared/components/UI/Modal';
import { notify } from '@/utils/notification';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import City from './cities.js';
import * as React from 'react';
import useAutocomplete, {
  AutocompleteGetTagProps,
} from '@mui/material/useAutocomplete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Autocomplete, { autocompleteClasses, createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';


const Root = styled('div')(({ theme }) => ({
  color: 'rgba(0,0,0,0.85)',
  fontSize: '14px',
  ...theme.applyStyles('dark', {
    color: 'rgba(255,255,255,0.65)',
  }),
}));

const Label = styled('label')`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

const InputWrapper = styled('div', {
  shouldForwardProp: (prop) => prop !== 'ref', // ← これ追加
})(({ theme }) => ({
  width: '100%',
  border: '1px solid #d9d9d9',
  backgroundColor: '#fff',
  borderRadius: '4px',
  padding: '1px',
  display: 'flex',
  flexWrap: 'wrap',
  ...theme.applyStyles('dark', {
    borderColor: '#434343',
    backgroundColor: '#141414',
  }),
  '&:hover': {
    borderColor: '#40a9ff',
    ...theme.applyStyles('dark', {
      borderColor: '#177ddc',
    }),
  },
  '&.focused': {
    borderColor: '#40a9ff',
    boxShadow: '0 0 0 2px rgb(24 144 255 / 0.2)',
    ...theme.applyStyles('dark', {
      borderColor: '#177ddc',
    }),
  },
  '& input': {
    backgroundColor: '#fff',
    color: 'rgba(0,0,0,.85)',
    height: '30px',
    boxSizing: 'border-box',
    padding: '4px 6px',
    width: '0',
    minWidth: '30px',
    flexGrow: 1,
    border: 0,
    margin: 0,
    outline: 0,
    ...theme.applyStyles('dark', {
      color: 'rgba(255,255,255,0.65)',
      backgroundColor: '#141414',
    }),
  },
}));

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string;
}


interface FilmOptionType {
  title: string;
}


function Tag(props: TagProps) {
  const { label, onDelete, ...other } = props;
  return (
    <div {...other} >
      <span>{label}</span>
      <CloseIcon onClick={onDelete} className='w-5 h-5' />
    </div>
  );
}

const StyledTag = styled(Tag)<TagProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '24px',
  margin: '2px',
  lineHeight: '22px',
  backgroundColor: '#fafafa',
  border: `1px solid #e8e8e8`,
  borderRadius: '2px',
  boxSizing: 'content-box',
  padding: '0 4px 0 10px',
  outline: 0,
  overflow: 'hidden',
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: '#303030',
  }),
  '&:focus': {
    borderColor: '#40a9ff',
    backgroundColor: '#e6f7ff',
    ...theme.applyStyles('dark', {
      backgroundColor: '#003b57',
      borderColor: '#177ddc',
    }),
  },
  '& span': {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  '& svg': {
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px',
  },
}));

const Listbox = styled('ul')(({ theme }) => ({
  width: '300px',
  margin: '2px 0 0',
  padding: 0,
  position: 'relative',
  marginTop: '10px',
  listStyle: 'none',

  backgroundColor: '#E2E2E2',
  overflow: 'auto',
  maxHeight: '250px',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.15)',
  zIndex: 1,
  ...theme.applyStyles('dark', {
    backgroundColor: '#141414',
  }),
  '& li': {
    padding: '5px 12px',
    display: 'flex',
    '& span': {
      flexGrow: 1,
    },
    '& svg': {
      color: 'transparent',
    },
  },
  "& li[aria-selected='true']": {
    backgroundColor: '#fafafa',
    fontWeight: 600,
    ...theme.applyStyles('dark', {
      backgroundColor: '#2b2b2b',
    }),
    '& svg': {
      color: '#1890ff',
    },
  },
  [`& li.${autocompleteClasses.focused}`]: {
    backgroundColor: '#e6f7ff',
    cursor: 'pointer',
    ...theme.applyStyles('dark', {
      backgroundColor: '#003b57',
    }),
    '& svg': {
      color: 'currentColor',
    },
  },
}));

interface CityOptionType {
  inputValue?: string;
  name: string;
}
interface Compay {
  id: number,
  company_name: string,
  representative_name: string,
  email: string,
  address: string,
  available_prefecture: string,
  available_cities: string,
  available_time: number
}


const selectCities: readonly CityOptionType[] = [
  { "name": "北海道" },
  { "name": "青森県" },
  { "name": "岩手県" },
  { "name": "宮城県" },
  { "name": "秋田県" },
  { "name": "山形県" },
  { "name": "福島県" },
  { "name": "茨城県" },
  { "name": "栃木県" },
  { "name": "群馬県" },
  { "name": "埼玉県" },
  { "name": "千葉県" },
  { "name": "東京都" },
  { "name": "神奈川県" },
  { "name": "新潟県" },
  { "name": "富山県" },
  { "name": "石川県" },
  { "name": "福井県" },
  { "name": "山梨県" },
  { "name": "長野県" },
  { "name": "岐阜県" },
  { "name": "静岡県" },
  { "name": "愛知県" },
  { "name": "三重県" },
  { "name": "滋賀県" },
  { "name": "京都府" },
  { "name": "大阪府" },
  { "name": "兵庫県" },
  { "name": "奈良県" },
  { "name": "和歌山県" },
  { "name": "鳥取県" },
  { "name": "島根県" },
  { "name": "岡山県" },
  { "name": "広島県" },
  { "name": "山口県" },
  { "name": "徳島県" },
  { "name": "香川県" },
  { "name": "愛媛県" },
  { "name": "高知県" },
  { "name": "福岡県" },
  { "name": "佐賀県" },
  { "name": "長崎県" },
  { "name": "熊本県" },
  { "name": "大分県" },
  { "name": "宮崎県" },
  { "name": "鹿児島県" },
  { "name": "沖縄県" }
];

const CompanyManagementPage = () => {
  const { getAllCompanies, createCompany, updateCompany, deleteCompany } = useDashboard();
  const [companies, setCompanies] = useState<Compay[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Add modal state
  const [modalContent, setModalContent] = useState<{ type: string, companies?: Compay | null } | null>(null);
  const [selectedCities, setSelectedCities] = useState<FilmOptionType[]>([]);
  const [focuseds, setFocuseds] = useState(false);

  const [companyId, setCompanyId] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [email, setEmail] = useState('');
  const [availableTime, setAvailableTime] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = React.useState<CityOptionType | null>(null);


  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const citiesList = city?.name && (City as Record<string, { title: string }[]>)[city.name]
    ? (City as Record<string, { title: string }[]>)[city.name]
    : [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);


  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
  } = useAutocomplete({
    id: 'customized-hook-demo',
    multiple: true,
    options: citiesList,
    value: selectedCities,
    onChange: (event, newValue) => setSelectedCities(newValue),
    getOptionLabel: (option) => option.title,
  });





  const validateData = (data: any) => {
    if (!data.company_name) {
      return { error: true, message: "会社名を入力してください。" }
    } else if (!data.representative_name) {
      return { error: true, message: "代表者名を入力してください。" }
    } else if (!data.email) {
      return { error: true, message: "メールアドレスを入力してください。" }
    } else if (!data.address) {
      return { error: true, message: "住所を入力してください。" }
    } else if (!data.available_time) {
      return { error: true, message: "対応可能な時間を入力してください。" }
    } else if (!data.available_prefecture) {
      return { error: true, message: "県名を選択してください。" }
    } else if (!data.available_cities) {
      return { error: true, message: "市区町村を選択してください。" }
    }
    return { error: false };
  }
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [focuseds]);
  const handleFocus = () => {
    setFocuseds(!focuseds);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAllCompanies();
        setCompanies(result);
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

  const filteredCompanies = companies.filter((companies) =>
    Object.values(companies).some(
      (company) => company.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedcompanies = [...filteredCompanies].sort((a, b) => {
    if (sortColumn) {
      const column = sortColumn as keyof typeof a; // Ensure TypeScript knows it's a valid key
      if (a[column] < b[column]) return sortDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = sortedcompanies.slice(indexOfFirstItem, indexOfLastItem);

  const openModal = (companies: Compay | null, type: string) => {
    setModalContent({ type, companies });

    if (companies !== null) {
      setCompanyId(companies.id);
      setCompanyName(companies.company_name);
      setRepresentativeName(companies.representative_name);
      setAvailableTime(String(companies.available_time));
      setAddress(companies.address);
      setEmail(companies.email);
      setCity({ name: companies.available_prefecture });
      const cityArray = companies.available_cities
        .split(",")         // カンマで分割
        .filter(item => item !== "") // 最後の空文字（","のせいでできる）を除去
        .map(item => ({ title: item })); // {title:"..."} に変換
      setSelectedCities(cityArray);

    } else {
      setCompanyName("");
      setRepresentativeName("");
      setAvailableTime("");
      setAddress("");
      setEmail("");
      setCity(null);
      setSelectedCities([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
    setModalContent(null); // Reset modal content
  };

  const handleCreate = async () => {
    const CDT = value.map(item => item.title).join(',');
    const saveCompanyData = {
      company_name: companyName,
      representative_name: representativeName,
      email: email,
      available_time: Number(availableTime),
      address: address,
      available_prefecture: city?.name,
      available_cities: CDT,
    }
    const result = await validateData(saveCompanyData);
    if (result["error"]) {
      const message = result["message"] ?? "予期しないエラーが発生しました";
      notify('error', '入力エラー!', message);
    } else {
      try {
        const createdCompany = await createCompany(saveCompanyData);
        if (createdCompany) {
          setCity(null);
          setSelectedCities([]);
          console.log(createdCompany, "123123132");

          setCompanies(prevcompanies => [
            ...prevcompanies,
            createdCompany.data
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
    }

  };
  const handleUpdate = async () => {
    const CDT = value.map(item => item.title).join(',');
    const saveCompanyData = {
      company_name: companyName,
      representative_name: representativeName,
      email: email,
      available_time: Number(availableTime),
      address: address,
      available_prefecture: city?.name,
      available_cities: CDT,
    }
    const result = await validateData(saveCompanyData);
    if (result["error"]) {
      const message = result["message"] ?? "予期しないエラーが発生しました";
      notify('error', '入力エラー!', message);
    } else {
      try {
        const updatedCompany = await updateCompany(companyId, saveCompanyData);
        console.log(updatedCompany, "ddddd");

        setCompanies(prevCompanies =>
          prevCompanies.map(company =>
            company.id === updatedCompany.data.id
              ? updatedCompany.data
              : company
          )
        );
        notify('success', '成功!', 'データが成果的に変更されました!');
      } catch (error) {
        console.log(error);
        notify('error', 'エラー!', '資料保管中にエラーが発生しました!');
      }
      handleCloseModal();
    }
  }
  const handleDelte = async () => {
    try {
      const deletedUser = await deleteCompany(companyId);
      setCompanies(prevcompanies => {
        return prevcompanies.filter(company => company.id !== companyId);
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
            <h1 className="text-3xl font-bold text-white mb-8">工事会社管理</h1>
            <CustomButton
              type="button"
              className="font-semibold !text-[40px]"
              label="+追加"
              onClick={() => openModal(null, 'create')} // Open modal for creating a new entry
            />
          </div>
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="検索工事会社..."
              className="w-full px-4 py-2 bg-[#667486] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>

          <div className="overflow-x-auto ">
            <table className="w-full bg-[#233044] text-white rounded-lg overflow-hidden p-3">
              <thead>
                <tr className="bg-[#667486]">
                  {["番号", "会社名", "代表者名", "メールアドレス", "住所", "対応可能・県", "対応可能・市町村", "対応可能時間"].map((column) => (
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
                {currentCompanies.length > 0 && currentCompanies.map((company, index) => (
                  <tr key={company.id} className={`${index % 2 === 0 ? "bg-[#2a3a53] p-3" : "bg-[#2a364d] p-3"} hover:bg-[#444e5c] `}>
                    <td className="pl-4 py-3 whitespace-nowrap">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{company.company_name}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{company.representative_name}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{company.email}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{company.address}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{company.available_time}</td>
                    <td className="pl-4 py-3 whitespace-nowrap">{company.available_prefecture}</td>
                    <td className="pl-4 py-3 ">{company.available_cities}</td>
                    <td className=" py-3 pr-1 ">
                      <div className="flex justify-center items-center gap-2 text-[12px] w-full h-full whitespace-nowrap">
                        <button onClick={() => openModal(company, 'edit')} className="bg-blue-500 hover:bg-blue-700 px-2 py-1 rounded">編集</button>
                        <button onClick={() => openModal(company, 'delete')} className="bg-red-500 hover:bg-red-700 px-2 py-1 rounded">削除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center">
              <Stack spacing={2} className='bg-[#667486] mt-1 rounded-[10px] py-1 px-5'>
                <Pagination
                  color="primary"
                  count={Math.ceil(sortedcompanies.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                />
              </Stack>
            </div>
          </div>
        </div>
        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          {modalContent?.type === 'edit' && (
            <div className="flex inset-0 items-center justify-center bg-black bg-opacity-50">
              <div className=" flex flex-col   bg-[#FFFFFF] p-6 rounded-[10px] shadow-lg w-full">
                <h2 className="text-xl font-bold mb-4">会社情報編集</h2>
                <div className="flex flex-col h-[70vh] overflow-auto space-y-4" ref={scrollContainerRef} >
                  <input
                    type="text"
                    placeholder="会社名"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />
                  <input
                    type="text"
                    placeholder="代表者名"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />
                  <input
                    type="text"
                    placeholder="メール"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />

                  <input
                    type="text"
                    placeholder="住所"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />
                  <input
                    type="number"
                    placeholder="対応可能時間"
                    value={availableTime}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      if (/^\d{0,14}$/.test(numericValue)) {
                        setAvailableTime(numericValue);

                      }
                    }}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />
                  <div className='flex w-full justify-start items-center gap-5'>
                    <Autocomplete
                      value={city}
                      onChange={(event, newValue) => {
                        if (typeof newValue === 'string') {
                          setCity({
                            name: newValue,
                          });
                        } else if (newValue && newValue.inputValue) {
                          // Create a new value from the user input
                          setCity({
                            name: newValue.inputValue,
                          });
                        } else {
                          setCity(newValue);
                        }
                      }}
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      id="free-solo-with-text-demo"
                      options={selectCities}
                      getOptionLabel={(option) => {
                        // Value selected with enter, right from the input
                        if (typeof option === 'string') {
                          return option;
                        }
                        // Add "xxx" option created dynamically
                        if (option.inputValue) {
                          return option.inputValue;
                        }
                        // Regular option
                        return option.name;
                      }}
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                          <li key={key} {...optionProps}>
                            {option.name}
                          </li>
                        );
                      }}
                      sx={{ width: 300 }}
                      freeSolo
                      renderInput={(params) => (
                        <TextField {...params} label="都道府県選択" />
                      )}
                    />
                  </div>
                  <Root>
                    <div {...getRootProps()} onClick={handleFocus}>
                      <Label {...getInputLabelProps()}>市区町村選択:</Label>
                      <InputWrapper className={focused ? 'focused' : ''}>
                        {value.map((option: FilmOptionType, index: number) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return <StyledTag key={key} {...tagProps} label={option.title} />;
                        })}
                        <input {...getInputProps()} />
                      </InputWrapper>
                    </div>

                    {groupedOptions.length > 0 && (
                      <Listbox {...getListboxProps()}>
                        {city?.name && (City as Record<string, { title: string }[]>)[city.name]?.map((option, index) => {
                          const { key, ...optionProps } = getOptionProps({ option, index });
                          return (
                            <li key={key} {...optionProps}>
                              <span>{option.title}</span>
                              <CheckIcon fontSize="small" />
                            </li>
                          );
                        })}
                      </Listbox>
                    )}
                  </Root>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    変更
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="bg-[#afabab] text-black px-4 py-2 rounded hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
          {modalContent?.type === 'create' && (
            <div className="flex inset-0 items-center justify-center bg-black bg-opacity-50">
              <div className=" flex flex-col   bg-[#FFFFFF] p-6 rounded-[10px] shadow-lg w-full">
                <h2 className="text-xl font-bold mb-4">新規会社登録</h2>
                <div className="flex flex-col h-[70vh] overflow-auto space-y-4" ref={scrollContainerRef} >
                  <input
                    type="text"
                    placeholder="会社名"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />
                  <input
                    type="text"
                    placeholder="代表者名"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />
                  <input
                    type="text"
                    placeholder="メール"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />

                  <input
                    type="text"
                    placeholder="住所"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />
                  <input
                    type="number"
                    placeholder="対応可能時間"
                    value={availableTime}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      if (/^\d{0,14}$/.test(numericValue)) {
                        setAvailableTime(numericValue);

                      }
                    }}
                    className="w-full p-2 border border-[#afabab] rounded"
                  />
                  <div className='flex w-full justify-start items-center gap-5'>
                    <Autocomplete
                      value={city}
                      onChange={(event, newValue) => {
                        if (typeof newValue === 'string') {
                          setCity({
                            name: newValue,
                          });
                        } else if (newValue && newValue.inputValue) {
                          // Create a new value from the user input
                          setCity({
                            name: newValue.inputValue,
                          });
                        } else {
                          setCity(newValue);
                        }
                      }}
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      id="free-solo-with-text-demo"
                      options={selectCities}
                      getOptionLabel={(option) => {
                        // Value selected with enter, right from the input
                        if (typeof option === 'string') {
                          return option;
                        }
                        // Add "xxx" option created dynamically
                        if (option.inputValue) {
                          return option.inputValue;
                        }
                        // Regular option
                        return option.name;
                      }}
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                          <li key={key} {...optionProps}>
                            {option.name}
                          </li>
                        );
                      }}
                      sx={{ width: 300 }}
                      freeSolo
                      renderInput={(params) => (
                        <TextField {...params} label="都道府県選択" />
                      )}
                    />
                  </div>

                  <Root>
                    <div {...getRootProps()} onClick={handleFocus}>
                      <Label {...getInputLabelProps()}>市区町村選択:</Label>
                      <InputWrapper className={focused ? 'focused' : ''}>
                        {value.map((option: FilmOptionType, index: number) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return <StyledTag key={key} {...tagProps} label={option.title} />;
                        })}
                        <input {...getInputProps()} />
                      </InputWrapper>
                    </div>

                    {groupedOptions.length > 0 && (
                      <Listbox {...getListboxProps()}>
                        {city?.name && (City as Record<string, { title: string }[]>)[city.name]?.map((option, index) => {
                          const { key, ...optionProps } = getOptionProps({ option, index });
                          return (
                            <li key={key} {...optionProps}>
                              <span>{option.title}</span>
                              <CheckIcon fontSize="small" />
                            </li>
                          );
                        })}
                      </Listbox>
                    )}
                  </Root>




                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={handleCreate}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="bg-[#afabab] text-black px-4 py-2 rounded hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
          {modalContent?.type === 'delete' && (
            <div className="flex inset-0 items-center justify-center bg-black bg-opacity-50">
              <div className="bg-[#FFFFFF] p-6 rounded-[10px] shadow-lg w-full">
                <h2 className="text-xl font-bold mb-4">資料を削除しますか?</h2>
                <p className="mb-6">この操作は取り消せません。削除を確認してください。</p>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={handleDelte}  // This will trigger the deletion action
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    はい
                  </button>
                  <button
                    onClick={handleCloseModal}  // This will close the modal without performing any action
                    className="bg-[#afabab] text-black px-4 py-2 rounded hover:bg-gray-400"
                  >
                    いいえ
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default CompanyManagementPage;
