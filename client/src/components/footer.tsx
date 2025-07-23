import { GraduationCap } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaPaypal, FaBitcoin } from "react-icons/fa";
import { PWAInstallButton } from "@/components/pwa-install-button";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white text-xl" />
              </div>
              <span className="ml-3 text-2xl font-bold">ChannelMarket</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The leading marketplace for buying and selling premium social media channels. 
              Transform your digital presence with established, verified channels.
            </p>
            <div className="flex flex-col space-y-4">
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
                <PWAInstallButton />
              </div>
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
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Refund Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400">© 2024 ChannelMarket. All rights reserved.</p>
              <p className="text-sm text-gray-500 mt-1">Powered by ChannelMarket</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-400">Accepted Payments:</div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <FaPaypal className="text-white text-sm" />
                </div>
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">UPI</span>
                </div>
                <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                  <FaBitcoin className="text-white text-sm" />
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PAY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
