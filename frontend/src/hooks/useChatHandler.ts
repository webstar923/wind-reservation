import { log } from 'console';
import { useState, useEffect, useRef } from 'react';
export const useChatHandler = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [flowMap, setFlowMap] = useState<{ [key: string]: any }>({});
  const hasMounted = useRef(false);
  const [chatHistory, setChatHistory] = useState<{ key: string; value: string }[]>([]);
  
  const addMessage = (newMessage: any) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const removeMessage = () => {
    setMessages((prevMessages) => prevMessages.slice(0, prevMessages.length - 1));
    setChatHistory((prevChatHistory) => prevChatHistory.slice(0, prevChatHistory.length - 1));
  };
  

  useEffect(() => {
    if (!hasMounted.current) {
      const fetchChatFlows = async () => {
        const res = await fetch('/api/chat', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const flows = await res.json();      
        const mapped = flows.data.reduce((acc: any, flow: any) => {
          acc[flow.key] = {
            key: flow.key,
            type: flow.type,
            content: flow.content,
            options: flow.options ? JSON.parse(flow.options) : [],
            reqType: flow.reqType,
            nextKey: flow.nextKey || null,
            state: flow.state,
          };
          return acc;
        }, {});       
        setFlowMap(mapped);
        addMessage(mapped['welcome']);
      };
      fetchChatFlows();
      hasMounted.current = true;
    }
  }, []);

  const handleButtonClick = (value: string, reqType: string) => {    
    console.log(value,reqType);
    
    if (reqType === "select_requirement" || value === "予約変更" ||  value === "予約照会") {
      setChatHistory([]);      
    }    
    if (value === "welcomeAgain") {
      addMessage(flowMap["welcomeAgain"]);
    }else{
      const current = messages[messages.length - 1];
      const flow = flowMap[current.key];
      let nextKey = null;
      if (flow.options.length > 0) {
        const foundOption = flow.options.find((opt: any) => opt.label === value);
        if (foundOption) nextKey = foundOption.nextKey;
      }
      
      if (!nextKey && flow.nextKey) {
        nextKey = flow.nextKey;
      }

      if (nextKey && flowMap[nextKey]) {
        setChatHistory((prevHistory) => [...prevHistory, { key: current.content, value }]);         
        addMessage(flowMap[nextKey]);
      } else {
        addMessage({ type: 'button', content: 'それについてはよくわかりません。申し訳ありません。' });
      }    
    }
  };

  const handleInputEnterPress = async (value: string, reqType: string) => {  
    console.log(value,reqType);
    
    const requirement = chatHistory.find(item => item.key === "私たちのサイトにお越しいただきありがとうございます。")?.value||chatHistory.find(item => item.key === "私はどのようにもっとお手伝いできますか？")?.value;
    if (reqType.trim() === "selectDate" && requirement === "予約照会") { 
      const customer_name = chatHistory.find(item => item.key === "恐れ入りますが、お名前をお聞かせいただけますでしょうか？")?.value;
      const customer_address = chatHistory.find(item => item.key === "ご住所をお聞かせいただけますでしょうか？")?.value;
      const customer_phoneNum = value;
      const reservationData = {  
        customer_address,
        customer_name,
        customer_phoneNum,
      };
      try {
        const res = await fetch('/api/reservation/getReservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reservationData)
        });
    
        if (!res.ok) {
          console.error("API Request Failed:", res.status);
          return addMessage({ type: "error", content: "予約の取得に失敗しました。" });
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) { 
          const id = data[0].id;          
          setChatHistory(prevHistory => [...prevHistory, { key: "reservationId", value: id }]);
          const reservationConfirm = {
            type: "confirmReservation",
            content: "あなたのご予約内容は、次のとおりです。",
            options: data[0]
          };
          addMessage(reservationConfirm);
        } else {
          console.warn(" No reservation found.");
          return addMessage(flowMap["getReservationError"] ?? { type: "error", content: "該当する予約が見つかりませんでした。" });
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        return addMessage({ type: "error", content: "予期せぬエラーが発生しました。" });
      }
    
    } else {
      const current = messages[messages.length - 1];    
      
      if (reqType && flowMap[reqType]) {
        setChatHistory(prevHistory => [...prevHistory, { key: current.content, value }]);
        addMessage(flowMap[reqType]);
      } else {
        console.warn(" Unknown request type:", reqType);
        addMessage({ type: 'button', content: 'それについてはよくわかりません。申し訳ありません。' });
      }  
    }
    
  };

  const createReservation = async (date: string,reqType:string) => {

    const customer_name = chatHistory.find(item => item.key === "恐れ入りますが、お名前をお聞かせいただけますでしょうか？")?.value;
    const customer_address = chatHistory.find(item => item.key === "ご住所をお聞かせいただけますでしょうか？")?.value;
    const customer_phoneNum = chatHistory.find(item => item.key === "ご連絡させていただける電話番号を教えてください。")?.value;
    const prefecture = chatHistory.find(item => item.key === "都道府県を選択してください。")?.value;
    const firstMatch = chatHistory.find(item => item.key === "私たちのサイトにお越しいただきありがとうございます。");
    const secondMatch = chatHistory.find(item => item.key === "私はどのようにもっとお手伝いできますか？");

    const requirement = firstMatch?.value || secondMatch?.value || "デフォルトの値";

    const reservationData = {  
      customer_address: customer_address,
      start_time: date,
      customer_name: customer_name,
      customer_phoneNum: customer_phoneNum,
      history:chatHistory,
      prefecture:prefecture
    };        
    console.log(requirement);
    console.log(reqType,date);
    
    if (reqType === "reservate") {
      const req =requirement;
      console.log(req);
      
      if (req === "予約変更") { 
        console.log(requirement,date);
         
        const id = chatHistory.find(item => item.key === "reservationId")?.value;
        const start_time = reservationData.start_time;
        
        const res = await fetch('/api/reservation/updateReservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({id,start_time}),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'search failed');
        }
        const data = await res.json();
        console.log(data);
        
        const reservationConfirm = {
          type:"checkReservation",
          content:"予約が確定しました。以下の内容をご確認ください。",
          options:data,
          state:"OK"
        }
          addMessage(reservationConfirm);

      }else{
               
        const res = await fetch('/api/reservation/createReservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(reservationData),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'search failed');
        }
        const data = await res.json();
        const reservationConfirm = {
          type:"checkReservation",
          content:"予約が確定しました。以下の内容をご確認ください。",
          options:data,
          state:"OK"
        }
          addMessage(reservationConfirm);
      }      
      
    }else{
      if (requirement === "予約変更") {
        const res = await fetch('/api/reservation/getReservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(reservationData)
        });
        const data = await res.json();
        if (data.length >0) {
          const id = data[0].id;          
          setChatHistory((prevHistory) => [...prevHistory, { key: "reservationId", value:id }]);
          const reservationConfirm = {
            type:"checkReservation",
            content:"以下の内容で予約を確定します。問題がなければ『はい』と入力してください。",
            options:reservationData
          }
          addMessage(reservationConfirm);
          
        }else{
          return addMessage(flowMap["getReservationError"]);        
        }
       
      }else{
        const reservationConfirm = {
          type:"checkReservation",
          content:"以下の内容で予約を確定します。問題がなければ『はい』と入力してください。",
          options:reservationData
        }
        addMessage(reservationConfirm);
      }
    }
  };
 

  const handleBackClick = () => {
    removeMessage();
  };
  return { messages, handleButtonClick, handleInputEnterPress, handleBackClick, createReservation};
};
