import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  Heart,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  MapPin,
  Mail,
  Phone,
  ArrowUp,
} from "lucide-react";
import logo from "../../../public/logo-3.png";

const Footer = () => {
  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Venues", href: "/venues", icon: Users },
    { label: "Favorites", href: "/favorites", icon: Heart },
    { label: "Contact", href: "/contact", icon: MessageSquare },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#fe4956]/10 to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(254,73,86,0.1),transparent_50%)]"></div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white p-2 rounded-2xl shadow-lg">
                <img src={logo} className="h-12" alt="Eventra BD" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Biya<span className="text-[#fe4956]"> kormu</span>
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Premium Event Management
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              Transforming event experiences through innovative technology and
              seamless management solutions.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { Icon: Facebook, color: "hover:bg-blue-600" },
                { Icon: Twitter, color: "hover:bg-sky-500" },
                { Icon: Instagram, color: "hover:bg-pink-600" },
              ].map(({ Icon, color }, index) => (
                <div
                  key={index}
                  className={`bg-gray-800 ${color} transition-all duration-300 rounded-xl w-10 h-10 flex items-center justify-center cursor-pointer hover:scale-110 hover:shadow-lg`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg relative inline-block">
              Navigation
              <div className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-[#fe4956] to-transparent"></div>
            </h3>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-3 group hover:translate-x-1"
                  >
                    <div className="w-1.5 h-1.5 bg-[#fe4956] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-6 text-lg relative inline-block">
              Get in Touch
              <div className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-[#fe4956] to-transparent"></div>
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <MapPin className="w-4 h-4 text-[#fe4956]" />
                <span>123 Event Street, City</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#fe4956]" />
                <span>hello@Biya Kormu.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#fe4956]" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#fe4956] mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">
            © {currentYear}{" "}
            <span className="text-white font-medium">Eventra BD</span>. All
            rights reserved.
          </div>

          <div className="flex gap-6 text-sm">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="text-gray-500 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#fe4956] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="bg-gradient-to-br from-[#fe4956] to-[#e53e4a] hover:from-[#e53e4a] hover:to-[#fe4956] transition-all duration-300 rounded-xl w-10 h-10 flex items-center justify-center hover:scale-105 hover:shadow-lg"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-[#fe4956]/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-[#fe4956]/5 rounded-full blur-lg"></div>
    </footer>
  );
};

export default Footer;
