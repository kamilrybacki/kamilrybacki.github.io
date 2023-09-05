import tw from "tailwind-styled-components";

export const Header = tw.header`
  flex
  items-center
  px-8
  py-2
  text-white
`

export const LogoWrapper = tw.div`
  flex
  items-center
  justify-center
`

export const Logo = tw.a`
  flex
  items-center
  justify-center
  h-12
  w-12
`

export const LogoTitle = tw.h1`
  text-3xl
  font-bold
  ml-1
`

export const ContactWrapper = tw.div`
  flex
  items-center
  justify-center
  p-1
  ml-auto
`

export const HeaderUnderline = tw.div`
  h-[1px]
  bg-foreground
  w-[99%]
  mt-4
  mx-auto
`
