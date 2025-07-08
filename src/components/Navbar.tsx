import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import menuIcon from '../assets/menu_icon.png';
import dropdownIcon from '../assets/dropdown_icon.png';

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="w-full fixed top-0 left-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0071ce] shadow-md">

      {/* Left - Logo */}
      <Link to="/" className="text-[#ffc220] font-bold text-2xl">
        GREENEDGE
      </Link>

      {/* Right - Nav Links (desktop) */}
      <ul className="hidden sm:flex gap-8 text-sm font-semibold">
        {[
          { name: 'HOME', path: '/' },
          { name: 'LOGIN', path: '/login' },
          { name: 'SIGNUP', path: '/signUp' },
          { name: 'ABOUT', path: '/about' },
        ].map((link) => (
          <li key={link.name}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-colors text-[#ffc220] hover:text-[#ce7c00] ${
                  isActive ? 'text-white' : ''
                }`
              }
            >
              <p>{link.name}</p>
              <hr className="w-4 border-none h-[2px] bg-white" />
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Hamburger Icon - small screens */}
      <img
        onClick={() => setVisible(true)}
        src={menuIcon}
        className="w-6 cursor-pointer sm:hidden"
        alt="menu"
      />

      {/* Sidebar for small screens */}
      <div
        className={`fixed top-0 right-0 h-full bg-[#0071ce] text-[#ffc220] z-50 transition-all duration-300 ease-in-out ${
          visible ? 'w-64 p-4' : 'w-0 p-0'
        } overflow-hidden shadow-lg`}
      >
        <div className="flex flex-col gap-4 text-md font-medium">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-3 cursor-pointer text-white"
          >
            <img
              src={dropdownIcon}
              className="h-5 rotate-180"
              alt="back"
            />
            <p className="font-semibold text-sm">Back</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            to="/"
            className="hover:text-white"
          >
            Home
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to="/collection"
            className="hover:text-white"
          >
            Collection
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to="/about"
            className="hover:text-white"
          >
            About
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to="/contact"
            className="hover:text-white"
          >
            Contact
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
