import internal from 'stream';
import { create } from 'zustand';

interface ChatStore {
  chatData: {
    requirement: string;
    installNum: string;
    ResidentialType: string;
    BuildingType:string;
    installationType:string;
    reinstall:string;
    recycleRequirement:string;
    isConsent:string;
    installationStatus:string;
    installationMethod:string;
    isOutdoorDecorativeCoverRequired:string;
    isHolePiping:string;
    outdoorCosmeticCoberColor:string;
    isIndoorDecorativeCoverRequired:string;
    customerName:string;
    customerAddress:string;
    customerPhoneNum:string;
    selectTime:string;
    selectDate:string;
    updateId:number;


    
    roomNum: number;
    workName:string;
    scheduledTask: string;    
    changeReservationId: number;
    changeReservationDate: string;
    changeReservationDivision: string;

  };
  setField: (key: keyof ChatStore['chatData'], value: string | boolean | number) => void;
  resetForm: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chatData: { // Fixed typo from 'cahtData' to 'chatData'
    requirement: '',
    installNum:'',
    ResidentialType:'',
    BuildingType:'',
    installationType:'',
    reinstall:'',
    recycleRequirement:'',
    isConsent:'',
    installationStatus:'',
    installationMethod:'',
    isOutdoorDecorativeCoverRequired:'',
    isHolePiping:'',
    outdoorCosmeticCoberColor:'',
    isIndoorDecorativeCoverRequired:'',
    customerName:'',
    customerAddress:'',
    customerPhoneNum:'',
    selectTime:'',
    selectDate:'',
    updateId:0,


    roomNum:0,
    workName:'',
    scheduledTask:'',
    changeReservationId:0,
    changeReservationDate:'',
    changeReservationDivision:''

  },
  setField: (key, value) =>
    set((state) => ({
      chatData: {
        ...state.chatData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set(() => ({
      chatData: {
        requirement: '',
        installNum:'',
        ResidentialType:'',
        BuildingType:'',
        installationType:'',
        reinstall:'',
        recycleRequirement:'',
        isConsent:'',
        installationStatus:'',
        installationMethod:'',
        isOutdoorDecorativeCoverRequired:'',
        isHolePiping:'',
        outdoorCosmeticCoberColor:'',
        isIndoorDecorativeCoverRequired:'',
        customerName:'',
        customerAddress:'',
        customerPhoneNum:'',
        selectTime:'',
        selectDate:'',
        updateId:0,



        roomNum:0,
        workName:'',
        scheduledTask:'',
        changeReservationId:0,
        changeReservationDate:'',
        changeReservationDivision:''
      },
    })),
}));
