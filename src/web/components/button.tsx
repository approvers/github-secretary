import { FC } from "react";

export const Button: FC<{ children: string }> = ({ children }) => (
  <>
    <a>{children}</a>
    <style jsx>{`
      a {
        background: linear-gradient(145deg, #1a1d1a, #0a0d0a);
        padding: 0 1rem;
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        border-style: none;
        font-size: 3rem;
        box-shadow: -0.25rem -0.25rem 0.5rem #7a7d7a,
          0.5rem 0.5rem 0.5rem #0a0d0a;
        user-select: none;
      }
      a:active {
        box-shadow: -0.25rem -0.25rem 0.5rem #7a7d7a,
          0.5rem 0.5rem 0.5rem #0a0d0a, inset 0.5rem 0.5rem 0.5rem #0a0d0a,
          inset -0.25rem -0.25rem 0.5rem #7a7d7a;
      }
    `}</style>
  </>
);
