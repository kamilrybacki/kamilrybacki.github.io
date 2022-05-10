import React from "react"
import tw from "tailwind-styled-components"

import { SocialIcon } from "react-social-icons"
import resolveConfig from "tailwindcss/resolveConfig"
import tailwindConfig from "/tailwind.config.js"

import PageWrapper from "@components/PageWrapper" 
import ContactForm from "@components/ContactForm"

const ContactRoutes = tw.section`
    flex
    flex-col
    justify-center
    gap-5

    sm:gap-10
    sm:flex-row
`

const VerticalSeparator = tw.div`
    relative
    bg-primary-100
    my-auto
    hidden

    sm:h-4/5
    sm:w-1
`

const HorizontalSeparator = tw.div`
    relative
    bg-primary-300
    mx-auto

    w-full
    h-1

    sm:hidden
`

const ContactRouteTitle = tw.span`
    relative
    font-italic 
    text-primary-500 
    font-display 
    underline
    underline-offset-4
    decoration-primary-100

    text-xl
    sm:text-4xl 
`

const ContactRoute = tw.div`
    relative
    w-full
    p-1

    sm:w-fit
`
const SocialMediaWrapper = tw.div`
    flex
    flex-col
    w-full
    mt-4
    gap-1

    sm:gap-5
    sm:mt-16
`
const SocialMedia = tw.a`
    flex
    w-fit
    justify-end
    duration-500
    m-auto

    hover:-translate-x-2
    hover:-translate-y-2
    hover:shadow-[0.25rem_0.25rem_0_rgb(0,0,0)]
    hover:border-[1px]
    hover:border-primary-500

    scale-75
    transform-origin-left

    sm:py-2
    sm:px-4
    sm:scale-100
    sm:ml-auto
`

const SocialMediaLabel = tw.p`
    font-display
    font-bold
    tracking-wider
    text-primary-500
    my-auto
    mr-5

    text-2xl
    md:text-3xl
`

const SocialMediaIconStyle = {
    width: '5rem',
    height: '5rem'
}

const ContactPage = () => {
    const currentConfig = resolveConfig(tailwindConfig)
    const social_media =[
        ["LinkedIn","https://www.linkedin.com/in/kamil-andrzej-rybacki/"],
        ["GitHub", "https://github.com/KamilRybacki"],
        ["Facebook", "https://www.facebook.com/kamilandrzejrybacki/"],
        ["Instagram", "https://www.instagram.com/kamilandrzejrybacki/"],
        ["Twitter", "https://twitter.com/rybacki_kamil"]
    ]
    return (
        <PageWrapper footer={false}>
            <ContactRoutes>
                <ContactRoute>
                    <div className="flex justify-center gap-1 w-full sm:justify-end sm:gap-2">
                        <ContactRouteTitle>You can </ContactRouteTitle>
                        <ContactRouteTitle className="font-bold text-accent-500 decoration-accent-500 uppercase">catch me here...</ContactRouteTitle>
                    </div>
                    <SocialMediaWrapper>
                        {social_media ? social_media.map((social_media) => {
                            return(
                                <SocialMedia href={social_media[1]}>
                                    <SocialMediaLabel>{social_media[0]}</SocialMediaLabel>
                                    <SocialIcon
                                        bgColor={currentConfig.theme.colors.accent["900"]}
                                        url={social_media[1]}
                                        key={social_media[1].split("/")[2]}
                                        style={SocialMediaIconStyle}
                                    />
                                </SocialMedia>
                            )}
                        ): ''} 
                    </SocialMediaWrapper>
                </ContactRoute>
                <VerticalSeparator/>
                <HorizontalSeparator/>
                <ContactRoute>
                    <div className="flex justify-center gap-1 w-full sm:justify-end sm:gap-2">
                        <ContactRouteTitle>... or use my contact </ContactRouteTitle>
                        <ContactRouteTitle className="font-bold text-accent-500 decoration-accent-500 uppercase">form</ContactRouteTitle>
                    </div>
                    <ContactForm endpoint="https://formsubmit.co/d2f32602d5a315ecf57a8ddf8c45f3b9"/>
                </ContactRoute>
            </ContactRoutes>
        </PageWrapper>
    )
}

export default ContactPage
