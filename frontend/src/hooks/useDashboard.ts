import { useState } from 'react';
import { useNotificationData } from '@/state/notificationNum';

export const useDashboard = () => {
  const { setField } = useNotificationData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchError = async (res: Response) => {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Fetching failed');
  };

  const fetchData = async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { 
        method: 'GET', 
        headers: { 'Content-Type': 'application/json' }, 
        ...options 
      });

      if (!res.ok) {
        // const errorText = await res.text(); // Read error message from response
        // throw new Error(`HTTP Error ${res.status}: ${errorText || res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  // Get Flat Data
  const getFlatData = async () => fetchData('/api/flat/getAllData');

  // Get API Log Data
  const getApiLogData = async (pageNum: number, searchTerm: string) => {
    const term = searchTerm === "" ? "!allData!" : searchTerm;
    return fetchData(`/api/log/getApiLogData/${pageNum}/${term}`);
  };

  // Get Notifications
  const getNotification = async () => fetchData('/api/log/getNotification');

  // Mark as Read
  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/message?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark alert as read');
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error marking alert as read';
      console.error(errorMessage);
      throw error;
    }
  };

  // Get Dashboard Data
  const getDashboardData = async () => fetchData('/api/reservation/getDashboardData');

  // Get Reservation List Data
  const getReservationListData = async (startTime: string, endTime: string) => {
    return fetchData('/api/reservation/getReservationListData', {
      method: 'POST',
      body: JSON.stringify({ startTime, endTime }),
    });
  };

  // Update Reservation
  const updateReservation = async (body: any) => {
    return fetchData('/api/reservation/updateReservation', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  // Get Work Data
  const getWorkData = async () => fetchData('/api/work/getAllData');

  // Get User Data
  const getUserData = async () => fetchData('/api/user/getAllData');
  const getMemberData = async () => fetchData('/api/user/memberData');

  // Get Error Log Data
  const getErrorLogData = async () => fetchData('/api/log/getErrorData');

  // Get Change Log Data
  const getChangeLogData = async () => fetchData('/api/log/getChangeData');

  // Get Notification Number
  const getNotificationNum = async () => {
    const data = await fetchData('/api/log/getNotificationNum');
    setField('Notification_Num', data.NotificationNum);
    setField('Message_Num', data.MessageNum);
    return data;
  };

  const useGetUserRole = async () => {
    const data = await fetchData('/api/auth/userRole');
    setField('userRole', data.role);
    return data;
  };

  // Other Methods (Create/Update/Delete)
  const createFlat = async (body: any) => fetchData('/api/flat/createFlat', { method: 'POST', body: JSON.stringify(body) });
  const createWork = async (body: any) => fetchData('/api/work/createWork', { method: 'POST', body: JSON.stringify(body) });
  const createUser = async (body: any) => fetchData('/api/user/createUser', { method: 'POST', body: JSON.stringify(body) });

  const changeFlat = async (body: any) => fetchData('/api/flat/changeFlat', { method: 'POST', body: JSON.stringify(body) });
  const changeWork = async (body: any) => fetchData('/api/work/changeWork', { method: 'POST', body: JSON.stringify(body) });
  const changeUser = async (body: any) => fetchData('/api/user/changeUser', { method: 'POST', body: JSON.stringify(body) });

  const deleteFlat = async (id: number) => fetchData('/api/flat/deleteFlat', { method: 'POST', body: JSON.stringify({ id }) });
  const deleteWork = async (id: number) => fetchData('/api/work/deleteWork', { method: 'POST', body: JSON.stringify({ id }) });
  const deleteUser = async (id: number) => fetchData('/api/user/deleteUser', { method: 'POST', body: JSON.stringify({ id }) });
  const deleteReservation = async (id: number) => fetchData('/api/reservation/deleteReservation', { method: 'POST', body: JSON.stringify({ id }) });
  const createReservation = async (body: any) => fetchData('/api/reservation/createReservation', { method: 'POST', body: JSON.stringify(body) });


  const getMessages = async () => {
    try {
      const response = await fetch('/api/message', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching alerts';
      console.error(errorMessage);
      throw error;
    }
  };

  // Alert Management
  const createAlert = async (body: any) => fetchData('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const updateAlert = async (id: string, body: any) => fetchData(`/api/alerts?id=${id}`, {
    method: 'PUT', 
    body: JSON.stringify(body),
  });

  const deleteAlert = async (id: string) => fetchData(`/api/alerts?id=${id}`, {
    method: 'DELETE',
  });

  // Get Alerts
  const getAlerts = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching alerts';
      console.error(errorMessage);
      throw error;
    }
  };

  // Get All Alerts (with read status)
  const getAllAlerts = async () => {
    try {
      const response = await fetch('/api/alerts/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch all alerts');
      }
      
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching all alerts';
      console.error(errorMessage);
      throw error;
    }
  };
    // Get All Alerts (with read status)
    const getChatData = async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch all alerts');
        }        
        return await response.json();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error fetching all alerts';
        console.error(errorMessage);
        throw error;
      }
    };
    const createChat = async (body: any) => fetchData('/api/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const updateChat = async (id: number, body: any) => fetchData(`/api/chat?id=${id}`, {
      method: 'PUT', 
      body: JSON.stringify(body),
    });
    const deleteChat = async (id: number) => fetchData(`/api/chat?id=${id}`, {
      method: 'DELETE',
    });
  

    const getAllReservationData = async () => {
      try {
        const response = await fetch('/api/reservation/getAllReservationData', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch all alerts');
        }        
        return await response.json();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error fetching all alerts';
        console.error(errorMessage);
        throw error;
      }
    };
    const getFutureReservationData = async () => {
        try {
          const response = await fetch('/api/reservation/getFutureReservationData', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch all alerts');
          }        
          return await response.json();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error fetching all alerts';
          console.error(errorMessage);
          throw error;
        }
      };

      const getChatHistory = async (id: number) => {
        try {
          console.log(id);
          
          const response = await fetch('/api/reservation/getChatHistoryByid', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }), 
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch chat history');
          }
          
          return await response.json();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error fetching chat history';
          console.error(errorMessage);
          throw error;
        }
      };
      
  return {   
    getUserData,
    changeUser,
    deleteUser,
    createUser,
    getErrorLogData,
    getChangeLogData,
    getApiLogData,
    getNotificationNum,
    getNotification,
    markAsRead,
    getReservationListData,
    updateReservation,
    deleteReservation,
    createReservation,
    getDashboardData,
    loading,
    error,
    createAlert,
    updateAlert,
    deleteAlert,
    getAlerts,
    getAllAlerts,
    useGetUserRole,
    getMessages,
    getMemberData,


    getChatData,
    createChat,
    updateChat,
    deleteChat,

    getAllReservationData,
    getFutureReservationData,
    getChatHistory

  };
};
