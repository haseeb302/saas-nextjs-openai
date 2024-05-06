"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("e81ad594-0489-4dda-8be2-df995299bd16");
  }, []);

  return null;
};
