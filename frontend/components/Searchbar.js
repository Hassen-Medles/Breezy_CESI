import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  return (
    <div className="px-4 py-2 flex justify-center">
      <div className="relative w-full max-w-md">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-lg pointer-events-none" />
        <input
          type="text"
          placeholder="Recherche"
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}