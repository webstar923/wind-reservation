'use client';
import Link from 'next/link';
import ChatIcon from '@public/assets/images/icon/chat-icon.svg';
import EyeIcon from '@public/assets/icons/eye_icon.svg';
import LoginIcon from '@public/assets/icons/login.svg';
import ChatContainer from '@/app/chat/components/chat';
import Image from 'next/image';
const Chat = () => {
 
  return (
    <div className="flex flex-col w-full h-screen">
      <div data-ui-testid="navBar" className="fixed top-0 left-0 w-full z-50 flex items-center bg-gradient-to-r from-[#10124f] to-[#419cc5] px-4 md:px-20 justify-start gap-[10px] h-[60px] py-2 sm:h-auto">
     
          <Image src="/assets/images/auth/big-logo.png" alt="logo" className="drop-shadow-[2px_0px_5px_rgba(100,100,100,0.5)]" width={250} height={170}  priority />
       
      </div>
      <div className="flex flex-col flex-grow inset-0 bg-[url('/assets/images/download.webp')] bg-cover bg-no-repeat justify-center items-center mt-10">
        <div className="flex bg-[#FFFFFF]  sm:rounded-[20px] py-5 pl-5 pr-0 sm:p-5 relative gap-5 h-[100vh] sm:w-[80vw] sm:h-[80vh] overflow-y-auto custom-scrollbar">
          <ChatContainer />
        </div>
      </div>
    </div>
  
  );
  

}
export default Chat;
