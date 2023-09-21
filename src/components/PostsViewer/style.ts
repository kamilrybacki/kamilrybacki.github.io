import tw from "tailwind-styled-components";

export const PostsTypeButton = tw.button`
  font-handwriting
  font-bold
  p-1
  hover:translate-y-2
  transition-all
  duration-500
`;

export const PostsMenu = tw.nav`
  flex
  flex-row
  justify-between
  items-center
  mb-4
`;

export const PostsSearch = tw.input`
  font-body
  py-1
  px-2
  w-1/3
`;

export const PostsWrapper = tw.div`
  flex
  flex-row
  flex-wrap
  justify-between
  items-start
  mt-8
`;

export const PostCard = tw.article`
  bg-background
  py-4
  px-6
  mb-4
  w-[500px]
`;

export const PostCardThumbnail = tw.img`
  w-[350px]
  max-h-[200px]
  rounded-lg
  mb-4
  mx-auto
`;
