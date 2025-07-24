
import { GraduationCap } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPaypal, FaBitcoin } from "react-icons/fa";
import { DashboardInstallButton } from "@/components/dashboard-install-button";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold">Channel Market</span>
            </div>
            <p className="text-gray-400">
              India's premier social media channel marketplace. Buy and sell premium channels instantly.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition duration-200">
                <FaFacebookF />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition duration-200">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition duration-200">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition duration-200">
                <FaYoutube />
              </a>
            </div>
            <div className="flex justify-start">
              <DashboardInstallButton />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Refund Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Instagram Channels</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">YouTube Channels</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Facebook Pages</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">TikTok Accounts</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Channel Market. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">We accept:</span>
              <FaPaypal className="text-2xl text-blue-400" />
              <FaBitcoin className="text-2xl text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
