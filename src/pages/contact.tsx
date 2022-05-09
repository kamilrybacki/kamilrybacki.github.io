import React from "react"
import tw from "tailwind-styled-components"

import { SocialIcon } from "react-social-icons"
import resolveConfig from "tailwindcss/resolveConfig"
import tailwindConfig from "/tailwind.config.js"

import PageWrapper from "@components/PageWrapper" 
import ContactForm from "@components/ContactForm"

const ContactRoutes = tw.section`
    flex
    justify-center
    gap-10
`

const VerticalSeparator = tw.div`
    relative
    bg-primary-100
    my-auto
    h-4/5
    w-1
`

const ContactRouteTitle = tw.span`
    relative
    text-4xl 
    font-italic 
    text-primary-500 
    font-display 
    underline
    underline-offset-4
    decoration-primary-100
`

const ContactRoute = tw.div`
    relative
    w-2/5
    p-1
`
const SocialMediaWrapper = tw.div`
    flex
    flex-col
    gap-5
    mt-20
    w-full
`
const SocialMedia = tw.div`
    flex
    w-full
    justify-end
`

const SocialMediaLabel = tw.p`
    font-display
    font-bold
    tracking-wider
    text-primary-500
    text-3xl
    my-auto
    mr-5
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
                <div className="flex justify-end gap-2">
                    <ContactRouteTitle>You can also</ContactRouteTitle>
                    <ContactRouteTitle className="font-bold text-accent-700 decoration-accent-500 uppercase">catch me here!</ContactRouteTitle>
                </div>
                <SocialMediaWrapper>
                    {social_media ? social_media.map((social_media) => {
                        return(
                            <SocialMedia>
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
            <ContactRoute>
                <div className="flex justify-start gap-2">
                    <ContactRouteTitle>My contact </ContactRouteTitle>
                    <ContactRouteTitle className="font-bold text-accent-700 decoration-accent-500 uppercase">form</ContactRouteTitle>
                </div>
                <ContactForm endpoint="https://formsubmit.co/d2f32602d5a315ecf57a8ddf8c45f3b9"/>
            </ContactRoute>
        </ContactRoutes>
    </PageWrapper>
  )
}

export default ContactPage
