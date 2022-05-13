import React from "react"
import tw from "tailwind-styled-components/dist/tailwind"

import { Link } from "gatsby"
import PageWrapper from "@components/PageWrapper"

const FourOhFourWrapper = tw.article`
  relative
  flex
  flex-col
  justify-center
  align-middle
  text-center
  top-52

  md:top-32
`

const NotFoundPage = () => {
  return (
    <PageWrapper header={false} footer={false}>
      <FourOhFourWrapper>
        <h1 className="-mb-10 font-heading font-bold text-accent-900 text-[10rem] lg:-mb-20 lg:text-[20rem]">404</h1>
        <h2 className="font-subheading font-bold text-4xl text-primary-500 lg:text-7xl">Page not found!</h2>
        <Link to='/' className="mt-8 text-2xl underline underline-offset-4 text-primary-500">Return to homepage</Link>
      </FourOhFourWrapper>
    </PageWrapper>
  )
}

export default NotFoundPage
