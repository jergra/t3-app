  import {
    GetServerSidePropsContext,
    GetStaticProps,
    InferGetServerSidePropsType,
  } from "next";
  import Head from "next/head";
  import { useState, useEffect } from "react";
  import { trpc } from "../../utils/trpc";
  import { prisma } from "../../server/db/client";
  import type { User } from "@prisma/client";
  import Link from 'next/link'

  import { useSession } from "next-auth/react";

  import LoadingSVG from "../../assets/puff.svg";
  import Image from "next/image";
  
  const AskForm = (props: { user: User, twitchName: string }) => {
    // console.log('props.twitchName:', props.twitchName)
    if (!props.user) throw new Error("user exists Next, sorry");
    const { mutate, isLoading } = trpc.proxy.questions.submit.useMutation();
    const [question, setQuestion] = useState("");
    
    const { data: sessionInfo } = useSession()

    if (isLoading)
      return (
        <div className="flex animate-fade-in-delay justify-center p-8">
          <Image src={LoadingSVG} alt="loading..." width={200} height={200} />
        </div>
      );

    // console.log('sessionInfo in [username].tsx:', sessionInfo)
    // console.log('sessionInfo.user.id in [username].tsx:', sessionInfo?.user?.id)
    let senderId:string = sessionInfo?.user?.id as string
    let senderName:string = sessionInfo?.user?.name as string
    let theUserName:any = props.twitchName

    return (
      <>
        <Head>
          <title>{`Ask ${props.user?.name} a question!`}</title>
        </Head>
        <div className="flex flex-col items-center text-center">
          <div className="p-14" />
          <div className="flex w-full max-w-lg flex-col items-center rounded border border-gray-500 bg-gray-600 p-8">
            {props.user.image && (
              <img
                src={props.user.image}
                className="fixed top-14 h-28 w-28 rounded-full border-4 border-gray-500"
                alt="Pro pic"
              />
            )}
            <div className="p-4" />
            <h1 className="text-2xl font-bold">
              Send {props.user?.name} a message!
            </h1>
            <div className="p-4" />
            <input
              placeholder="Type something..."
              className="w-full rounded px-2 py-1 text-center text-lg text-gray-800"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="p-4" />
            <Link href='/'>
              <button
                className="flex rounded bg-gray-200 py-2 px-8 font-bold text-gray-800 hover:bg-gray-100"
                onClick={() => {
                  if (!question) return;
    
                  mutate({ userId: props.user.id, question, theUserName, senderId, senderName });
    
                  setQuestion("");
                }}
              >
                  Submit
              </button>
            </Link>
          </div>
        </div>
      </>
    );
  };
  
  export const getStaticProps: GetStaticProps = async ({ params }) => {
    if (!params || !params.username || typeof params.username !== "string") {
      return {
        notFound: true,
      };
    }
    const twitchName = params.username.toLowerCase();

    // console.log('twitchName:', twitchName)
  
    const userInfo = await prisma.user.findFirst({
      where: { name: { equals: twitchName, mode: "insensitive" } },
    });
  
    if (!userInfo) {
      return {
        notFound: true,
      };
    }

    // console.log('userInfo:', userInfo)
    
    return { props: { user: userInfo, twitchName }, revalidate: 60 };
  };
  
  export async function getStaticPaths() {
    return { paths: [], fallback: "blocking" };
  }
  
  export default AskForm;