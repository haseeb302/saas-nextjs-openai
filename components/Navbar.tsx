import { UserButton } from "@clerk/nextjs";
import MobileSidebar from "./mobile-sidebar";

const Navbar = ({ apiCount }) => {
  return (
    <div className="flex items-center p-4">
      <MobileSidebar count={apiCount} />
      <div className="flex w-full justify-end">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;
