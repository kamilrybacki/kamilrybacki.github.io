import tw from "tailwind-styled-components";

export const Header = tw.header`
  flex
  items-center
  px-8
  py-2
  text-white
`

export const LogoWrapper = tw.div`
  relative
  flex
  items-center
  justify-center
`

export const Logo = tw.a`
  flex
  items-center
  justify-center
  text-foreground
  h-14
  w-14
`

export const LogoTitle = tw.h1`
  relative
  top-1
  text-3xl
  font-display
  font-[700]
  ml-1
`

export const ContactWrapper = tw.div`
  flex
  items-center
  justify-center
  p-1
  ml-auto
  gap-3
`

export const HeaderUnderline = tw.div`
  h-[1px]
  bg-foreground
  w-[99%]
  mt-4
  mx-auto
`
