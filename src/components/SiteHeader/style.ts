import tw from "tailwind-styled-components";

export const Header = tw.header`
  flex
  items-center
  px-12
  pb-2
  text-white
`

export const LogoWrapper = tw.a`
  relative
  flex
  items-center
  justify-center
  neon-glow
`

export const Logo = tw.div`
  flex
  justify-center
  h-14
  w-14
  text-accent
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