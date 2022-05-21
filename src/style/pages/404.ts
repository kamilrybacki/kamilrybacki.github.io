import tw from 'tailwind-styled-components/dist/tailwind';

import {Link} from 'gatsby';

const FourOhFourWrapper = tw.article`
  relative
  flex
  flex-col
  justify-center
  align-middle
  text-center
  top-52

  md:top-32
`;

const FourOhFour = tw.h1`
  -mb-10
  font-heading
  font-bold
  text-accent-900
  text-[10rem]

  lg:-mb-20
  lg:text-[20rem]
`;

const FourOhFourErrorMessage = tw.h2`
  font-heading
  font-bold
  text-4xl
  text-primary-900
  
  lg:text-7xl
`;

const HomeLink = tw(Link)`
  mt-8
  text-2xl
  underline
  underline-offset-4
  text-primary-900
`;

export {FourOhFourWrapper, FourOhFour,
  FourOhFourErrorMessage, HomeLink};
