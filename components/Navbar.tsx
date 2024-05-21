import { UserButton } from "@clerk/nextjs";
import MobileSidebar from "./mobile-sidebar";
import { ApiCounter } from "./ApiCounter";

const Navbar = ({
  apiCount = 0,
  isPro,
  threads,
}: {
  apiCount: number | undefined;
  isPro: boolean;
  threads: any;
}) => {
  return (
    <div className="flex items-center p-3 border-b mb-5">
      <MobileSidebar count={apiCount} isPro={isPro} threads={threads} />
      <div className="px-3 w-full">
        <ApiCounter count={apiCount} isPro={isPro} />
      </div>
      <div className="flex w-full justify-end">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;
