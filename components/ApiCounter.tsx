"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MAX_FREE_COUNTS } from "@/constants";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useProModal } from "@/hooks/use-pro-modal";

interface ApiCounterProps {
  count: number;
  isPro: boolean;
}

export const ApiCounter = ({ count, isPro = false }: ApiCounterProps) => {
  const [mounted, setMounted] = useState(false);
  const proModal = useProModal();
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {isPro ? (
        <div className="space-x-3">
          <span className="px-4 py-1 bg-primary text-white rounded-xl">
            Pro
          </span>
          <span className="font-bold text-sm">{count} Generations</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-x-5">
            <div className="text-center text-xs">
              <span className="font-bold">
                {count} / {MAX_FREE_COUNTS} Generations
              </span>
              <Progress
                className="h-3"
                value={(count / MAX_FREE_COUNTS) * 100}
              />
            </div>
            <Button
              onClick={proModal.onOpen}
              // className="w-full"
              variant="premium"
              size="sm"
              disabled
            >
              Upgrade
              <Zap className="w-4 h-4 ml-2 fill-white" />
            </Button>
          </div>
        </>
      )}
    </>
  );
};
