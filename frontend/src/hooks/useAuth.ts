'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { useAuthStore } from '@/state/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/utils/notification'


interface PasswordResetVariables {
  email: string;
  password: string;
}
interface PasswordResetResponse {
  success: boolean;
  message: string;}

type LoginVariables = { email: string; password: string };
type LoginResponse = { token:string;accessToken: string; refreshToken: string;role:string };

type RoleVariables = { role: string; };
type RoleResponse = { role:string;};

const login = async (credentials: LoginVariables): Promise<LoginResponse> => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message );
  }
  return await res.json();
};
const userRole = async (): Promise<RoleResponse> => {
  const res = await fetch('/api/auth/userRole', {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },   
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message );
  }
  return await res.json();
};

// Register API function
type RegisterVariables = { email: string; password: string };
type RegisterResponse = { message: string };

const register = async (data: RegisterVariables): Promise<RegisterResponse> => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.log("this is auth data",errorData)
    throw new Error(errorData.message || 'Registration failed');
  }
  return res.json();
};

// Logout API function
type LogoutResponse = { message: string };

const logout = async (): Promise<LogoutResponse> => {
    const res = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Logout failed');
  }

  return res.json();
};

const resetPassword = async (variables: PasswordResetVariables): Promise<PasswordResetResponse> => {
  // Perform the mutation logic (e.g., API call)
  console.log(variables);
  
  const response = await fetch('/api/auth/password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variables),
  });
  
  if (!response.ok) {
    throw new Error('Password reset failed');
  }

  const data = await response.json();
  return data; // Return the expected response
};

// Refresh token API function
type RefreshTokenResponse = { accessToken: string, refreshToken: string };
const refreshTokenAPI = async (): Promise<RefreshTokenResponse> => {
  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to refresh token');
  }

  return response.json();
}


// Hook for login
export const useLogin = () => {  

  return useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: login,
    onSuccess: (data) => {     
      notify('success', 'ログインしました', 'ログインに成功しました!')
    },
    onError: (error) => {
      notify('error', '間違った詳細', error.message)
    }
  });
};

// Hook for registration
export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterVariables>({
    mutationFn: register,
    onSuccess: (data) => {
      notify('success','成功',data.message);
    },
    onError: (error) => {
      notify('error', 'エラー!', error.message);
    }
  });
};


export const passwordReset = () => { 
  
  return useMutation<PasswordResetResponse, Error, PasswordResetVariables>({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      console.log(data)
      notify('success', '成功', 'パスワードを正常にリセットしました。')
    },
    onError: (error) => {
      notify('error', '間違った詳細', 'メールアドレスを正確に入力してください。')
    }
  });
};

export const useLogout = () => {  
  const router = useRouter();
  const queryClient = useQueryClient();  
  return useMutation<LogoutResponse, Error>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.push('/chat');      
      notify('success', '成功', 'ログアウトに成功しました!');
    },
    onError: () => {
      router.push('/chat');
      notify('error', 'エラー', 'ログアウトに失敗しました!');
    },
  });
};

// // Hook for refreshing the token
export const useTokenRefresh = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mutation = useMutation<RefreshTokenResponse, Error>({
    mutationFn: refreshTokenAPI,
    onSuccess: () => {
      // setError(null);
    },
    onError: () => {
      notify('error', 'Error', 'Session expired, please log in again.');
      // setError('Session expired, please log in again.');
    }
  });
  

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = 60 * 15 * 1000 * 0.8;;

    const interval = setInterval(() => {
      mutation.mutate();  // Attempt to refresh the token
    }, refreshInterval);  // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [mutation]);

  return mutation;
};


// Hook for getUserRole
export const useGetUserRole = () => {
  return useMutation<RoleResponse, Error, RoleVariables>({
    mutationFn: userRole,
    onSuccess: (data) => {
      // Update the role in auth store without affecting the token
      useAuthStore.setState({ userRole: data.role });
    },
    onError: (error) => {
      notify('error', 'エラー', 'ユーザーロールの取得に失敗しました。');
    }
  });
};
