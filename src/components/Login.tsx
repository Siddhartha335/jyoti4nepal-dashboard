"use client";
import { useLogin } from "@refinedev/core";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { mutate: login, isLoading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    login(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Login successful!");
        },
        onError: (error: any) => {
          console.error("Login error:", error);
          toast.error(error?.message || "Invalid email or password");
        },
      }
    );
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-50">        
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 bg-white p-6 rounded shadow"
        >
          <Link href="/login">
            <div className='flex items-center justify-center p-5'>
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
            required
            disabled={isLoading}
            className="w-full p-2 border rounded focus:outline-none focus:border-[#CE9F41] disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={isLoading}
            className="w-full p-2 border rounded focus:outline-none focus:border-[#CE9F41] disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-4 h-4 accent-[#CE9F41]"
              disabled={isLoading}
            />
            <label htmlFor="remember" className="text-sm">Remember this device</label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#CE9F41] text-white py-2 rounded hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </>
  );
}