// src/server/router/index.ts
// src/server/router/index.ts
import { newQuestionRouter } from "./subroutes/question";
import { usersRouter } from './subroutes/user';
import { conversationRouter } from './subroutes/conversation';

import { t } from "./trpc";

export const appRouter = t.router({
  questions: newQuestionRouter,
  users: usersRouter,
  conversation: conversationRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
