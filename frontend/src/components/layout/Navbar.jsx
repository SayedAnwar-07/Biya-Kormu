import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/slices/userSlice";
import EentraBD2 from "@/assets/EentraBD2.png";
import EentraBD from "../../../public/logo-3.png";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Home,
  Calendar,
  Users,
  Search,
  Heart,
  MessageSquare,
  FileText,
  ShoppingCart,
  ClipboardList,
  Bell,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { isSellerLike } from "@/lib/role";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userSlug = user?.slug;
  const sellerSlug = user?.user_type === "seller";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const rawRole =
    user?.user_type ?? user?.role ?? user?.type ?? user?.account_type ?? "";
  const sellerMode = isSellerLike(rawRole);

  const ordersHref = userSlug
    ? sellerSlug
      ? `/seller/${userSlug}/orders`
      : `/user/${userSlug}/orders`
    : "/login";

  const ordersLabel = sellerMode ? "Orders Received" : "My Orders";
  const OrdersIcon = sellerMode ? ClipboardList : ShoppingCart;

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Events", href: "/events", icon: Calendar },
  ];

  const isActive = (href) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  const mobileMenuVariants = {
    closed: {
      x: "100%",
      transition: { type: "spring", damping: 30, stiffness: 300 },
    },
    open: { x: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-white transition-all duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="">
                <img src={EentraBD} className="h-16 w-16" alt="" />
              </div>

              <span className="font-bold text-xl hidden sm:inline-block">
                <span className="text-[#37383c] drop-shadow-sm">Biya</span>
                <span className="text-[#ff4956] drop-shadow-sm"> Kormu</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.label} className="relative">
                    <NavigationMenuLink
                      asChild
                      className={`${navigationMenuTriggerStyle()} px-4 py-2`}
                    >
                      <Link
                        to={item.href}
                        className={`font-medium transition-colors duration-200 relative ${
                          isActive(item.href)
                            ? "text-rose-500"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {item.label}
                        <span
                          className={`absolute left-0 bottom-0 h-0.5 bg-rose-500 transition-all duration-300 ${
                            isActive(item.href) ? "w-full" : "w-0"
                          }`}
                          style={{
                            width:
                              hoveredItem === item.label
                                ? "100%"
                                : isActive(item.href)
                                  ? "100%"
                                  : "0%",
                          }}
                        />
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Right: Search + Auth */}
          <div className="flex items-center space-x-4">
            <Link to="/events">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-gray-600 hover:text-[#ff4956] hover:bg-rose-50/50 border border-gray-200/50 hover:border-rose-200 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff4956] to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.profile_image}
                        alt={user?.full_name}
                      />
                      <AvatarFallback className="bg-[#fe4956] text-white">
                        {getInitials(user?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      to={`/profile/${user.slug}/`}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to={`/settings/${user.slug}/`}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {/* Role-aware Orders item */}
                  <DropdownMenuItem asChild>
                    <Link to={ordersHref} className="cursor-pointer">
                      <OrdersIcon className="mr-2 h-4 w-4" />
                      {ordersLabel}
                    </Link>
                  </DropdownMenuItem>

                  {/* Reports */}
                  {userSlug && (
                    <DropdownMenuItem asChild>
                      <Link
                        to={`/user/${userSlug}/reports/`}
                        className="cursor-pointer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Reports
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-rose-500 focus:text-rose-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  asChild
                  variant="ghost"
                  className="text-gray-700 border"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-[#fe4956] hover:bg-red-900">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-rose-500"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 h-full w-80 max-w-full bg-white z-50 shadow-lg md:hidden"
            >
              <div className="flex flex-col h-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-[#fe4956] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <span className="font-bold text-xl text-gray-900">
                      EventHub
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-rose-500"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile Links */}
                <nav className="flex-1 space-y-1 py-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`flex items-center space-x-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-rose-500 bg-rose-50"
                          : "text-gray-700 hover:text-rose-500 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth */}
                <div className="pt-6 border-t border-gray-200">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user?.profile_image}
                            alt={user?.full_name}
                          />
                          <AvatarFallback className="bg-[#fe4956] text-white">
                            {getInitials(user?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user?.full_name}
                          </p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="outline"
                          asChild
                          className="w-full justify-start"
                        >
                          <Link
                            to={`/profile/${user.slug}/`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          asChild
                          className="w-full justify-start"
                        >
                          <Link
                            to={`/settings/${user.slug}/`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                        </Button>

                        {/* Role-aware Orders */}
                        <Button
                          variant="outline"
                          asChild
                          className="w-full justify-start"
                        >
                          <Link
                            to={ordersHref}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <OrdersIcon className="mr-2 h-4 w-4" />
                            {ordersLabel}
                          </Link>
                        </Button>

                        {/* Reports */}
                        {userSlug && (
                          <Button
                            variant="outline"
                            asChild
                            className="w-full justify-start"
                          >
                            <Link
                              to={`/user/${userSlug}/reports/`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Reports
                            </Link>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="w-full justify-start text-rose-500 hover:text-rose-500 border-red-200 hover:border-red-300"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        className="w-full bg-[#fe4956] hover:bg-red-900"
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to="/register">Sign Up</Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 border"
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to="/login">Sign In</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
