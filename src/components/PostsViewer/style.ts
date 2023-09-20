import tw from "tailwind-styled-components";

export const PostsMenu = tw.nav`
  flex
  flex-row
  justify-between
  items-center
  mb-4
`;

export const PostsWrapper = tw.div`
  flex
  flex-row
  flex-wrap
  justify-between
  items-start
`;

export const PostCard = tw.div`
  bg-background
  rounded-lg
  p-6
  mb-4
  border-2
  border-foreground
  w-1/3
`;
