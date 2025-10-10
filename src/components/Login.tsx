"use client";
import { useLogin } from "@refinedev/core";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { mutateAsync: login, isLoading } = useLogin(); // using mutateAsync instead of mutate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password });
      if (result.success) {
        toast.success("Login successful");
      } else {
        toast.error(result.error?.message || "Login failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-50">        
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 bg-white p-6 rounded shadow"
        >
          <Link href="/login">
            {' '}
            <div className='flex items-center justify-center p-5 '>
              <Image
                width={200}
                height={60}
                className=""
                src="/logo1.svg"
                alt="jyoti"
              />
            </div>
          </Link>
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded focus:outline-none focus:border-[#CE9F41]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded focus:outline-none focus:border-[#CE9F41]"
          />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="w-4 h-4 accent-[#CE9F41]" />
            <label htmlFor="remember">Remember this device</label>
          </div>
          <button
            type="submit"
            className="w-full bg-[#CE9F41] text-white py-2 rounded hover:bg-[#CE9F41]"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </>
  );
}
