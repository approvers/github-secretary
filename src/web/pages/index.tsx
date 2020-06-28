import { NextPage } from 'next';
import Head from 'next/head';

const home: NextPage = () => {
  const pageTitle = 'GitHub Secretary | Discord 通知登録窓口';
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <main>
        <h1>{pageTitle}</h1>
        <p>こちらのページからワンクリックで Discord 通知を登録できます。</p>
        <a>通知を登録</a>
      </main>
      <style jsx>{`
        main {
          background-color: #1a1d1a;
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
        }
        main > h1 {
          color: #fdfdfd;
        }
        main > p {
          color: #f7f7f7;
        }
        main > a {
          background: linear-gradient(145deg, #7a7d7a, #1a1d1a);
          padding: 0 1rem;
          margin-bottom: 1rem;
          color: #fdfdfd;
          border-radius: 0.5rem;
          border-style: none;
          font-size: 3rem;
          box-shadow: -0.5rem -0.5rem 1.5rem #7a7d7a, 0.5rem 0.5rem 1.5rem #0a0d0a;
          user-select: none;
        }
        main > a:active {
          background: linear-gradient(-35deg, #7a7d7a, #1a1d1a);
        }
      `}</style>
    </>
  );
};

export default home;
