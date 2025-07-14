import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
<footer className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-blue-900 font-bold text-lg">G</span>
              </div>
              <h1 className="text-2xl font-bold text-white">GREENEDGE</h1>
            </div>
            <p className="text-blue-100 leading-relaxed mb-6 max-w-md">
              Empowering businesses with cutting-edge analytics and forecasting solutions. 
              We transform data into actionable insights that drive growth and success.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-700 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <Facebook className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-blue-700 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <Twitter className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-blue-700 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <Linkedin className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-blue-700 hover:bg-blue-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <Instagram className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">COMPANY</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors cursor-pointer">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors cursor-pointer">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors cursor-pointer">
                  Walmart Analytics
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors cursor-pointer">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors cursor-pointer">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">GET IN TOUCH</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-yellow-400" />
                <span className="text-blue-100">+91 9897026523</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-400" />
                <span className="text-blue-100">contact@greenedge.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-yellow-400 mt-1" />
                <span className="text-blue-100">
                  Pune, Maharashtra<br />
                  India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">
              © 2025 GreenEdge.com - All Rights Reserved
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-blue-200 hover:text-yellow-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;