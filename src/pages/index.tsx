import type { GetServerSidePropsContext, NextPage } from "next";
import Link from 'next/link'
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { getT3AppAuthSession } from "../server/common/get-server-session";

import {
  FaArrowCircleRight,
  FaCaretSquareRight,
  FaCopy,
  FaSignOutAlt,
  FaTwitch,
} from "react-icons/fa";
import dynamic from "next/dynamic";

import { trpc } from "../utils/trpc";

import { FaEye, FaEyeSlash, FaArchive } from "react-icons/fa";
import {
  PusherProvider,
  useCurrentMemberCount,
  useSubscribeToEvent,
} from "../utils/pusher";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import LoadingSVG from "../assets/puff.svg";
import Image from "next/image";
import { PropsWithChildren, useEffect } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Card } from "../components/card";
import { AutoAnimate } from "../components/auto-animate";

const UsersView = () => {
  const { data: sessionInfo } = useSession()
  const { data, isLoading, refetch } = trpc.proxy.users.getAll.useQuery()

  if (isLoading)
    return (
      <div className="flex animate-fade-in-delay justify-center p-8">
        <Image src={LoadingSVG} alt="loading..." width={200} height={200} />
      </div>
    );

  // console.log('data in UsersView in index.tsx:', data)
  const usernames = data
    
  // console.log('usernames in UsersView in index.tsx:', usernames)
  
  const filteredUsernames = usernames?.filter(username => username.name !== sessionInfo?.user?.name)

  // console.log('filteredUsernames in UsersView in index.tsx:', filteredUsernames)
  
  return (
    <>
      {
        filteredUsernames?.map((username) => (
          <div key={username.id} className="flex">
            <Link href={`/ask/${username.name}`}>
              <button className={`bg-violet-800 flex px-3 py-1 my-1 rounded-xl text-sm`}>
                <div>{username.name}</div>
                {/* <div>{username.id}</div> */}
              </button>
            </Link>
          </div>
        ))
      }
    </>
  )
}

const ConversationView = () => {
    
  const { data: sessionInfo } = useSession()
  
  const { data, isLoading, refetch } = trpc.proxy.conversation.getAll.useQuery()

  if (isLoading)
    return (
      <div className="flex animate-fade-in-delay justify-center p-8">
        <Image src={LoadingSVG} alt="loading..." width={200} height={200} />
      </div>
    );

  // console.log('data in ConversationView in index.tsx:', data)

  // console.log('sessionInfo.user.id in ConversationView in index.tsx:', sessionInfo?.user?.id)

  const conversation:any = data
  // console.log('conversation in ConversationView in index.tsx:', conversation)
  // console.log('conversation.length in ConversationView in index.tsx:', conversation?.length)

  const userConversation = []

  for (let i = 0; i < conversation?.length; i++) {
    // console.log("conversation.theUserName:", conversation[i].theUserName)
    if (conversation[i]?.userId === sessionInfo?.user?.id) {
      userConversation.push([conversation[i]?.body, conversation[i]?.createdAt, conversation[i]?.senderName, conversation[i]?.theUserName])
    }
    if (conversation[i]?.senderId === sessionInfo?.user?.id) {
      userConversation.push([conversation[i]?.body, conversation[i]?.createdAt, sessionInfo?.user?.name, conversation[i]?.theUserName])
    }
  }

  // console.log('userConversation in ConversationView in index.tsx:', userConversation)
  

  const reversedUserConversation:any = [];
  userConversation.forEach(element => {
      reversedUserConversation.unshift(element)
  });

  // console.log('reversedUserConversation in ConversationView in index.tsx:', reversedUserConversation)


  return (
    <div className='flex flex-col-reverse h-screen overflow-y-scroll'>
      {
        reversedUserConversation?.map((line:any, index:any) => (
          <div key={index}>
          {
            line[2] !== sessionInfo?.user?.name ? (
                <div className='ml-40'>
                  <div className={`bg-violet-800 pl-5 pr-5 py-3 m-2 flex flex-col rounded-3xl`}>
                    <div className="w-60 mb-2">{line[0]}</div>
                    <div className='text-xs'>{line[2]}</div>
                    <div className='text-xs'>{dayjs(String(line[1])).fromNow()}</div>
                  </div>
                </div>
              ) : (
                <div className='mr-40'>
                  <div className={`bg-teal-700 pl-5 pr-5 py-3 m-2 flex flex-col items-start rounded-3xl`}>
                    <div className="w-60 mb-2 leading-5">{line[0]}</div>
                    <div className='text-xs'>to {line[3]}</div>
                    <div className='text-xs'>{dayjs(String(line[1])).fromNow()}</div>
                  </div>  
                </div>
              ) 
          }
          </div>
        ))
      }
    </div>
  )
}

const QuestionsView = () => {
  const { data, isLoading, refetch } = trpc.proxy.questions.getAll.useQuery();
  // console.log('data in QuestionsView:', data)
  
  // Refetch when new questions come through
  useSubscribeToEvent("new-question", () => refetch());

  const connectionCount = useCurrentMemberCount() - 1;

  // Question pinning mutation
  const {
    mutate: pinQuestion,
    variables: currentlyPinned, // The "variables" passed are the currently pinned Q
    reset: resetPinnedQuestionMutation, // The reset allows for "unpinning" on client
  } = trpc.proxy.questions.pin.useMutation();
  const pinnedId = currentlyPinned?.questionId;

  const { mutate: unpinQuestion } = trpc.proxy.questions.unpin.useMutation({
    onMutate: () => {
      resetPinnedQuestionMutation(); // Reset variables from mutation to "unpin"
    },
  });

  const tctx = trpc.useContext();
  const { mutate: removeQuestion } = trpc.proxy.questions.archive.useMutation({
    onMutate: ({ questionId }) => {
      // Optimistic update
      tctx.queryClient.setQueryData(
        ["questions.getAll", null],
        data?.filter((q) => q.id !== questionId)
      );
    },
  });

  if (isLoading)
    return (
      <div className="flex animate-fade-in-delay justify-center p-8">
        <Image src={LoadingSVG} alt="loading..." width={200} height={200} />
      </div>
    );

  // console.log('data in QuestionsView:', data)

  const selectedQuestion = data?.find((q) => q.id === pinnedId);
  const otherQuestions = data?.filter((q) => q.id !== pinnedId) || [];

  return (
    <div className="grid min-h-0 flex-1 grid-cols-3">
      <div className="col-span-2 flex py-4 pl-6 pr-3">
        <Card className="flex flex-1 flex-col divide-y divide-gray-800">
          <AutoAnimate className="flex flex-1 items-center justify-center p-4 text-lg font-medium">
            <span key={selectedQuestion?.id}>{selectedQuestion?.body}</span>
          </AutoAnimate>
          <div className="grid grid-cols-2 divide-x divide-gray-800">
            <button
              className="flex items-center justify-center gap-2 rounded-bl p-4 hover:bg-gray-700"
              onClick={() => unpinQuestion()}
            >
              <FaEyeSlash /> Hide
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-br p-4 hover:bg-gray-700"
              onClick={() => {
                if (selectedQuestion)
                  removeQuestion({ questionId: selectedQuestion.id });
                const next = otherQuestions[0]?.id;
                if (next) pinQuestion({ questionId: next });
              }}
            >
              <FaCaretSquareRight />
              Next Question
            </button>
          </div>
        </Card>
      </div>
      <AutoAnimate className="col-span-1 flex flex-col gap-4 overflow-y-auto py-4 pl-3 pr-6">
        {otherQuestions.map((q) => (
          <Card
            key={q.id}
            className="flex animate-fade-in-down flex-col divide-y divide-gray-800"
          >
            <div className="flex justify-between p-4">
              {dayjs(q.createdAt).fromNow()}
              <div className="flex gap-4">
                {pinnedId === q.id && (
                  <button onClick={() => unpinQuestion()}>
                    <FaEyeSlash size={24} />
                  </button>
                )}
                {pinnedId !== q.id && (
                  <button onClick={() => pinQuestion({ questionId: q.id })}>
                    <FaEye size={24} />
                  </button>
                )}
                <button onClick={() => removeQuestion({ questionId: q.id })}>
                  <FaArchive size={24} />
                </button>
              </div>
            </div>
            <div className="p-4">{q.body}</div>
          </Card>
        ))}
      </AutoAnimate>
    </div>
  );
};

function QuestionsViewWrapper() {
  const { data: sesh } = useSession();

  if (!sesh || !sesh.user?.id) return null;

  return (
    <PusherProvider slug={`user-${sesh.user?.id}`}>
        {/* <QuestionsView /> */}
    </PusherProvider>
  );
}

const LazyQuestionsView = dynamic(() => Promise.resolve(QuestionsViewWrapper), {
  ssr: false,
});

const copyUrlToClipboard = (path: string) => () => {
  if (!process.browser) return;
  navigator.clipboard.writeText(`${window.location.origin}${path}`);
};

const NavButtons: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: sesh } = useSession();

  return (
    <div className="flex gap-2">
      {/* <button
        onClick={copyUrlToClipboard(`/embed/${userId}`)}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Copy embed url <FaCopy size={24} />
      </button>
      <button
        onClick={copyUrlToClipboard(`/ask/${sesh?.user?.name?.toLowerCase()}`)}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Copy Q&A url <FaCopy size={24} />
      </button> */}
      <button
        onClick={() => signOut()}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Logout <FaSignOutAlt size={24} />
      </button>
    </div>
  );
};

const HomeContents = () => {
  const { data } = useSession();
  var imageAddress = []

  // console.log('data in HomeContents in index.tsx:', data)
  // console.log('data.user.name in HomeContents in index.tsx:', data?.user?.name)
  // console.log('data.user.image in HomeContents in index.tsx:', data?.user?.image)

  if (!data)
    return (
      <div className="flex grow flex-col items-center justify-center">
        <div className="text-2xl font-bold">Please log in below</div>
        <div className="p-4" />
        <button
          onClick={() => signIn("twitch")}
          className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-2xl text-black"
        >
          <span>Sign in with Twitch</span>
          <FaTwitch />
        </button>
      </div>
    );

  return (
    <div className="w-screen flex min-h-0 flex-col">
      <div className="flex items-center justify-between bg-gray-800 py-4 px-8 shadow">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {data.user?.image && (
            <img
              src={data.user?.image}
              alt="pro pic"
              className="w-16 rounded-full"
            />
          )}
          {data.user?.name}
        </h1>
        <NavButtons userId={data.user?.id!} />
      </div>
      <div className="flex">
      <div className="flex py-4 pl-6 pr-3">
        <Card className="flex flex-1 flex-col divide-y divide-gray-800">
          <div className="flex flex-col py-4 px-8 shadow">
            <div>
              Send a message to:
            </div>
          </div>
          <div className="flex flex-col py-4 px-8">
            <UsersView />
          </div>
        </Card>
        <Card className="flex flex-col divide-y divide-gray-800">
          <div className="flex flex-col py-4 px-8 min-w-max">
            <ConversationView />
          </div>
        </Card>
        </div>
        <LazyQuestionsView />
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>{"Stream Q&A Tool"}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex w-screen flex-col items-end">
        <div className="flex justify-center items-center w-screen h-5/6 p-10">
          <HomeContents />
        </div>
        <div className="flex w-screen justify-between bg-black/40 py-4 px-8">
          <span>
            Modified from{" "}
            <a href="https://github.com/t3-oss/zapdos" className="text-blue-300">
              Theo
            </a>
          </span>
          <div className="flex gap-4">
            <a
              href="https://github.com/jergra/t3-app"
              className="text-blue-300"
            >
              Github
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {
      session: await getT3AppAuthSession(ctx),
    },
  };
};


export default Home;
