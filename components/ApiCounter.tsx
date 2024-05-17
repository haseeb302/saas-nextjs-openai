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
  if (isPro) {
    return null;
  }
  return (
    <div className="px-3 mb-2">
      <Card className="bg-black/80 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-white mb-4 space-y-2">
            <p>
              {count} / {MAX_FREE_COUNTS} Generations
            </p>
            <Progress className="h-3" value={(count / MAX_FREE_COUNTS) * 100} />
          </div>
          <Button
            onClick={proModal.onOpen}
            className="w-full"
            variant="premium"
          >
            Upgrade
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
