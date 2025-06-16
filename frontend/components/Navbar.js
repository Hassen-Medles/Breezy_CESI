import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex items-center space-x-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 8h16M4 16h24M4 24h16" stroke="#00C2A8" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-xl font-bold">
        <span className="text-blue-600">CON</span>
        <span className="text-green-500">NEXION</span>
        </span>
    </div>
  );
}