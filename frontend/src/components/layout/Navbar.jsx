import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Brain, Phone, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "AI & Safety", href: "/ai-safety" },
  { name: "Fees", href: "/fees" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <>
      {/* Crisis Banner */}
      <div className="crisis-banner" data-testid="crisis-banner">
        <Link to="/crisis" className="hover:underline flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          <span>In crisis? This is NOT an emergency service. Get help now</span>
        </Link>
      </div>

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <nav className="container-custom h-16 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
            data-testid="logo-link"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                Mutha's
              </span>
              <span className="text-sm text-muted-foreground block -mt-1">
                Psychology Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-testid={`nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2" data-testid="user-menu-btn">
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{user?.full_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/portal" className="w-full cursor-pointer">
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" data-testid="nav-login-btn">
                  Sign In
                </Button>
              </Link>
            )}
            <Link to="/book">
              <Button 
                className="btn-primary"
                data-testid="nav-book-btn"
              >
                Book Appointment
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="mobile-menu-btn">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-6 mt-8">
                {isAuthenticated && (
                  <div className="pb-4 border-b border-border">
                    <p className="text-sm text-muted-foreground">Signed in as</p>
                    <p className="font-medium truncate">{user?.full_name}</p>
                    <SheetClose asChild>
                      <Link to="/portal" className="inline-block mt-2">
                        <Button variant="outline" size="sm">My Bookings</Button>
                      </Link>
                    </SheetClose>
                  </div>
                )}
                
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      to={link.href}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        location.pathname === link.href
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                      data-testid={`mobile-nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.name}
                    </Link>
                  </SheetClose>
                ))}
                
                <div className="mt-4 space-y-3">
                  {!isAuthenticated && (
                    <SheetClose asChild>
                      <Link to="/auth">
                        <Button variant="outline" className="w-full">Sign In</Button>
                      </Link>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    <Link to="/book">
                      <Button className="btn-primary w-full" data-testid="mobile-book-btn">
                        Book Appointment
                      </Button>
                    </Link>
                  </SheetClose>
                  {isAuthenticated && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-destructive"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
