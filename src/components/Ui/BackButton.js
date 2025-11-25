"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ label = "Back", className = "" }) {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
      className={`absolute left-4 top-4 flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition ${className}`}
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}