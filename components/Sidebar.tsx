"use client";

import { cn } from "@/lib/utils";
import {
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  MusicIcon,
  Settings,
  VideoIcon,
  GraduationCap,
  PlusIcon,
} from "lucide-react";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ApiCounter } from "./ApiCounter";
import { Badge } from "./ui/badge";

const montserrat = Montserrat({ weight: "800", subsets: ["latin"] });

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Conversation AI",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
    disabled: false,
  },
  {
    label: "Research AI",
    icon: GraduationCap,
    href: "/article",
    color: "text-emerald-500",
    disabled: false,
  },
  // {
  //   label: "Image Generation",
  //   icon: ImageIcon,
  //   href: "/image",
  //   color: "text-pink-700",
  //   disabled: true,
  // },
  // {
  //   label: "Video Generation",
  //   icon: VideoIcon,
  //   href: "/video",
  //   color: "text-orange-700",
  //   disabled: true,
  // },
  // {
  //   label: "Music Generation",
  //   icon: MusicIcon,
  //   href: "/music",
  //   color: "text-emerald-500",
  //   disabled: true,
  // },
  // {
  //   label: "Code Generation",
  //   icon: Code,
  //   href: "/code",
  //   color: "text-green-700",
  //   disabled: true,
  // },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar({
  apiCount = 0,
  isPro = false,
  threads,
}: {
  apiCount: number;
  isPro: boolean;
  threads: any;
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full text-black">
      <Link
        href="/dashboard"
        className="flex items-center justify-center h-[72px] mb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      >
        <h1
          className={cn(
            "text-3xl font-extrabold py-3 px-5 rounded-lg text-white",
            montserrat.className
          )}
        >
          ResearchAI
        </h1>
      </Link>
      <div className="p-3">
        <Link
          href={`/article`}
          className={
            "text-sm group flex p-5 w-full cursor-pointer font-medium hover:text-blue-600 bg-zinc-700/30 rounded-lg transition"
          }
        >
          <div className="flex items-center justify-center flex-1">
            <PlusIcon className="h-5 w-5 mr-2" />
            <p className="font-bold">Article</p>
          </div>
        </Link>
      </div>
      <div className="space-y-1 px-3 py-2 overflow-auto h-full">
        {threads?.map((thread: any) => (
          <Link
            href={`/article/${thread.id}`}
            key={thread.id}
            className={cn(
              "text-sm group flex p-3 w-full justify-start cursor-pointer font-medium hover:text-blue-600 hover:bg-black/10 rounded-lg transition",
              pathname === `/article/${thread.id}`
                ? "text-black bg-black/10"
                : "text-zinc-700"
            )}
          >
            <div className="flex items-center flex-1">
              <GraduationCap className="h-5 w-5 mr-2" />
              <div className="w-44 ">
                <p className="truncate">{thread.articleTitle}</p>
              </div>
            </div>
            {/* <div className="">
                {route?.disabled && (
                  <Badge className="text-[8px]" variant="premium">
                    Coming Soon!
                  </Badge>
                )}
              </div> */}
          </Link>
        ))}
      </div>
    </div>
  );
}
