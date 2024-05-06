import { UserButton } from "@clerk/nextjs";
import MobileSidebar from "./mobile-sidebar";

const Navbar = ({
  apiCount = 0,
  isPro,
}: {
  apiCount: number;
  isPro: boolean;
}) => {
  return (
    <div className="flex items-center p-4">
      <MobileSidebar count={apiCount} isPro={isPro} />
      <div className="flex w-full justify-end">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;
