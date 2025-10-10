"use client"

import LoginPage from '@components/Login'
import { useIsAuthenticated } from '@refinedev/core';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const page = () => {

  const {data} = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (data?.authenticated) {
      router.replace("/dashboard");
    }
  }, [data, router]);

  return (
    <LoginPage />
  )
}

export default page