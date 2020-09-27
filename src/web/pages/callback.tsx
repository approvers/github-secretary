import { GetServerSideProps, NextPage } from "next";

const callback: NextPage = () => <h1>Hello from callback!</h1>;

export const getServerSideProps: GetServerSideProps<
  { [key: string]: unknown },
  { code: string; state: string }
> = () => {
  return Promise.resolve({ props: {} });
};

export default callback;
