"use client";

import { Montserrat } from "next/font/google";
import { useAuth } from "@clerk/nextjs";
import Typewriter from "typewriter-effect";
import Link from "next/link";
import { Button } from "./ui/button";

const font = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

export const LandingHero = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="text-white font-bold py-36 text-center space-y-5">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
        <h1>
          <span className="text-purple-400"> AI Assistant </span> for
        </h1>

        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <Typewriter
            options={{
              strings: ["Education", "Finance", "Healthcare", "Marketing"],
              autoStart: true,
              loop: true,
            }}
          />
        </div>
      </div>
      <div className="text-sm md:text-xl font-light text-zinc-400">
        Create content using AI 10x Faster.
      </div>
      <div>
        <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
          <Button
            className="md:text-lg p-4 md:p-6 rounded-full font-semibold"
            variant="premium"
          >
            Try for free
          </Button>
        </Link>
      </div>
      <div className="text-zinc-400 text-xs md:text-sm font-normal">
        More stuff coming soon!
      </div>
    </div>
  );
};
