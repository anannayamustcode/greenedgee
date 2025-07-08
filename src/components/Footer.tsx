import React from 'react';

const Footer = () => {
  return (
    <div>
        <div className="m-5 grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* Column 1 */}
        <div>
            
            <p className="w-full md:w-1/3 text-gray-600">
            <h1>GREENEDGE</h1>
            dummy text... check its properties. So much fun making websites.
            </p>
        </div>

        {/* Column 2 */}
        <div>
            <p className="text-xl font-medium mb-5">COMPANY</p>
            <ul className="flex flex-col gap-1 text-gray-400">
            <li>Home</li>
            <li>About Us</li>
            <li>Walmart</li>
            <li>Privacy Policy</li>
            </ul>
        </div>

        {/* Column 3 */}
        <div>
            {/* Additional content if needed */}
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-400'>
                <li>+91 9897026523</li>
                <li>contact@greenedge.com</li>
            </ul>
        </div>
        
        </div>
              <div>
            <hr className="border-gray-200 my-6"/>
            <p className='text-center text-sm text-gray-500'>Copyright 2025@ greenedge.com- All Rights Reserved</p>
        </div>
    </div>
  );
}

export default Footer;
