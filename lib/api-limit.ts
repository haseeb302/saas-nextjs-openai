import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { MAX_FREE_COUNTS } from "@/constants";

export const increaseApiLimit = async () => {
  const { userId } = auth();

  if (!userId) {
    return;
  }

  const userApiLimit = await prismadb.user.findUnique({
    where: { userId },
  });

  if (userApiLimit) {
    await prismadb.user.update({
      where: { userId: userId },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    await prismadb.user.create({
      data: { userId: userId, count: 1 },
    });
  }
};

export const checkApiLimit = async () => {
  const { userId } = auth();
  if (!userId) {
    return false;
  }
  const userLimit = await prismadb.user.findUnique({
    where: { userId: userId },
  });

  if (!userLimit || userLimit.count < MAX_FREE_COUNTS) {
    return true;
  } else {
    return false;
  }
};

export const getApiLimitCount = async () => {
  const { userId } = auth();
  if (!userId) {
    return 0;
  }
  const userLimit = await prismadb.user.findUnique({
    where: { userId },
  });

  if (!userLimit) {
    return 0;
  }

  return userLimit?.count;
};
