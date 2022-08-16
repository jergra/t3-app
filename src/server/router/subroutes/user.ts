import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { t } from "../trpc";
import { protectedProcedure } from "../utils/protected-procedure";
import { pusherServerClient } from "../../common/pusher";

export const usersRouter = t.router({
  submit: t.procedure
    .input(
      z.object({
        userId: z.string(),
        question: z.string().min(0).max(400),
        senderId: z.string(),
        senderName: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.prisma.question.create({
        data: {
          userId: input.userId,
          body: input.question,
          senderId: input.senderId,
          senderName: input.senderName
        },
      });

      await pusherServerClient.trigger(
        `user-${input.userId}`,
        "new-question",
        {}
      );

      return question;
    }),

  getAll: t.procedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      
    })
    // console.log('users', users)
    return users;
  }),

  pin: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.prisma.question.findFirst({
        where: { id: input.questionId },
      });
      if (!question || question.userId !== ctx.session.user.id) {
        throw new TRPCError({
          message: "NOT YOUR QUESTION",
          code: "UNAUTHORIZED",
        });
      }

      await pusherServerClient.trigger(
        `user-${question.userId}`,
        "question-pinned",
        {
          question: question.body,
        }
      );
      return question;
    }),

  archive: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.question.updateMany({
        where: { id: input.questionId, userId: ctx.session.user.id },
        data: {
          status: "ANSWERED",
        },
      });
    }),

  unpin: protectedProcedure.mutation(async ({ ctx }) => {
    await pusherServerClient.trigger(
      `user-${ctx.session.user?.id}`,
      "question-unpinned",
      {}
    );
  }),
});