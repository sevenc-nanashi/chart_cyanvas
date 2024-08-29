import { NavigationFilled } from "@fluentui/react-icons";
import { Link } from "@remix-run/react";
import { useState } from "react";
import LogoCF from "~/assets/logo-cf.svg?react";
import { useSession } from "~/lib/contexts";
import SideMenu from "./SideMenu.tsx";

const Header = () => {
  const session = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <header className="bg-theme dark:bg-gray-800 flex items-center pl-4 pr-8 h-20 shadow-sm shadow-[#83ccd288]">
        <Link to="/" className="flex items-center">
          <LogoCF
            className="text-white dark:text-theme"
            width="56px"
            height="56px"
            viewBox="0 0 512 512"
          />
          <span className="text-2xl md:text-4xl text-white dark:text-theme font-extrabold">
            Chart
            <br className="block md:hidden" />
            <span className="hidden md:inline"> </span>
            Cyanvas
            {import.meta.env.DEV && (
              <span className="ml-2 opacity-50">(dev)</span>
            )}
          </span>
        </Link>
        <div className="flex-grow" />

        {session?.loggedIn ? (
          <div
            className="flex items-end text-white bg-white p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer"
            onClick={() => setShowMenu(true)}
          >
            <button
              className="block rounded-full w-8 h-8 md:mr-2"
              style={{
                backgroundColor: session.user.bgColor,
              }}
            />
            <div className="font-bold text-xl text-white md:block hidden">
              {session.user.name}
              <span className="text-sm">#{session.user.handle}</span>
            </div>
          </div>
        ) : (
          <div
            className="flex items-end text-white bg-white p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer"
            onClick={() => setShowMenu(true)}
          >
            <button className="block w-8 h-8">
              <NavigationFilled className="w-full h-full" />
            </button>
          </div>
        )}
      </header>
      {showMenu && <SideMenu close={() => setShowMenu(false)} />}
    </>
  );
};

export default Header;
