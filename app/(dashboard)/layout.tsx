import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getApiLimitCount } from "@/lib/api-limit";
import { getUserThreads } from "@/lib/open-ai-thread";
import { checkSubscription } from "@/lib/subscription";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();
  const threads = await getUserThreads();

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r">
        <Sidebar apiCount={apiLimitCount} isPro={isPro} threads={threads} />
      </div>
      <main className="md:pl-60">
        <Navbar apiCount={apiLimitCount} isPro={isPro} threads={threads} />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
