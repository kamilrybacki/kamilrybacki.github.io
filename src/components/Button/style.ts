import tw from "tailwind-styled-components";

export const ButtonWrapper = tw.button`
  bg-background
  text-foreground
  font-bold
  py-2
  px-4
  rounded-sm
  border-[0.1rem]
  border-foreground
  transition
  ease-in-out
  duration-200

  hover:translate-x-[0.1rem]
  hover:-translate-y-[0.1rem]
  hover:shadow-foreground
  hover:shadow-[-0.1rem_0.1rem_0rem_0rem]

  active:translate-x-0
  active:-translate-y-0
  active:shadow-none
`;
