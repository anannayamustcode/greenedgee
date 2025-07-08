import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="w-screen min-h-screen bg-white py-5 px-6 flex flex-col-reverse md:flex-row items-center justify-between gap-10 max-w-7xl mx-auto gap-10 px-6 md:px-20">


      {/* Left Text Section */}
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#0071ce] leading-tight mb-4">
          Empowering Sustainable Commerce
        </h1>
        <p className="text-gray-700 text-lg mb-6">
          Connecting Vendors to Customers with Speed & Sustainability.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <Link
            to="/signup"
            // className="bg-blue-100 font-bold text-white px-6 py-3 rounded-full hover:bg-blue-500 transition"
            className="border border-[#0071ce] text-[#0071ce] px-6 py-3 rounded-full hover:bg-[#0071ce] hover:text-white transition">
            Get Started
          </Link>
          <Link
            to="/about"
            className="border border-[#0071ce] text-[#0071ce] px-6 py-3 rounded-full hover:bg-[#0071ce] hover:text-white transition"
          >
            Explore
          </Link>
        </div>
      </div>

      {/* Right Image/Graphic Section */}
      <div className="flex-1">
        <img
          src="https://source.unsplash.com/600x400/?logistics,delivery"
          alt="Sustainable Logistics"
          className="w-full max-w-md mx-auto rounded-xl shadow-lg"
        />
      </div>
    </div>
  );
};

export default Hero;
