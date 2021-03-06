import { Button } from "../components/button";
import type { FC } from "react";
import Head from "next/head";
import type { NextPage } from "next";

interface MainProps {
  pageSubTitle: string;
}

const MainContent: FC<MainProps> = ({ pageSubTitle }: MainProps) => (
  <>
    <h1>{pageSubTitle}</h1>
    <p>こちらのページからワンクリックで Discord 通知を登録できます。</p>
    <Button>通知を登録</Button>
    <footer>
      GitHub Secretary--Copyright (c) 2020 MikuroXina, all rights reserved.
    </footer>
  </>
);

const Main: FC<MainProps> = (props: MainProps) => (
  <>
    <main>
      <MainContent {...props} />
    </main>
    <style jsx>{`
      main {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
      }
      h1 {
        font-size: 1.8em;
        color: #fdfdfd;
      }
      p {
        color: #f7f7f7;
        padding: 2rem;
      }
      footer {
        position: fixed;
        bottom: 1em;
        text-align: center;
      }
    `}</style>
  </>
);

const home: NextPage = () => {
  const pageTitle = "GitHub Secretary",
    pageSubTitle = "Discord 通知登録窓口";
  return (
    <>
      <Head>
        <title>{`${pageTitle} - ${pageSubTitle}`}</title>
      </Head>
      <Main pageSubTitle={pageSubTitle} />
      <style jsx global>{`
        body {
          background-color: #1a1d1a;
          color: #fdfdfd;
        }
      `}</style>
    </>
  );
};

export default home;
