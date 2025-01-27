import React from "react";
import Link from "next/link";

const AppSidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-full p-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/" className="hover:text-gray-400">
            Home
          </Link>
        </li>
        <li>
          <Link href="/about" className="hover:text-gray-400">
            About
          </Link>
        </li>
        <li>
          <Link href="/services" className="hover:text-gray-400">
            Services
          </Link>
        </li>
        <li>
          <Link href="/contact" className="hover:text-gray-400">
            Contact
          </Link>
        </li>
        <li>
          <Link href="/not-found" className="hover:text-gray-400">
            Not Found
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default AppSidebar;
