import prismadb from "@/lib/prismadb";

export const createThread = async (data: {
  threadId: string;
  userId: string;
  threadName: string;
}) => {
  const { userId, threadId, threadName } = data;
  if (!userId && !threadId) {
    return;
  }

  await prismadb.threads.create({
    data: { userId, threadId, threadName },
  });
};

export const getThreads = async (userId: string) => {
  if (!userId) {
    return;
  }

  return await prismadb.threads.findMany({
    where: { userId },
  });
};
