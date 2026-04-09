"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

const Header = () => {
  const [isClient, setIsClient] = React.useState(false);

  const { resolvedTheme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className=" bg-background sticky top-0 z-10 border-b border-2">
      <div className="mx-auto px-6 py-4 max-w-5xl flex flex-row items-center justify-between ">
        <Link
          href="/"
          className="flex items-center gap-4 text-xl font-bold text-primary"
        >
          <Image src="/images/logo1.png" alt="Logo" width={45} height={45} />
          Menü Hazırlama
        </Link>

        {isClient && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleTheme}
              aria-label="Temayi degistir"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
