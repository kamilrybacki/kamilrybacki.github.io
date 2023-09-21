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
  p-6
  mb-4
  border-[1px]
  border-accent
  border-dashed
  w-1/4
`;

export const PostCardThumbnail = tw.img`
  max-h-32
  rounded-lg
  mb-4
`;
