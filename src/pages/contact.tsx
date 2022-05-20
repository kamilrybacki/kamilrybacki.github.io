import React from "react"
import tw from "tailwind-styled-components"

import { SocialIcon } from "react-social-icons"

import PageWrapper, { TailwindThemeContext } from "@components/PageWrapper" 
import ContactForm from "@components/ContactForm"

const ContactRoutes = tw.section`
    flex
    flex-col
    justify-center
    gap-3

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
    text-primary-900 
    font-heading 
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
const SocialMedia = tw.div`
    flex
    w-fit
    justify-end
    duration-500
    scale-75
    transform-origin-left
    cursor-pointer
    ml-auto

    hover:-translate-x-2
    hover:-translate-y-2
    hover:shadow-[0.25rem_0.25rem_0_rgb(0,0,0)]
    hover:border-[1px]
    hover:border-primary-500

    sm:py-2
    sm:px-4
    sm:scale-100
`

const SocialMediaLabel = tw.p`
    font-heading
    font-bold
    tracking-wider
    text-primary-900
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
    const [iconColor, setIconColor] = React.useState('black')
    const tailwindTheme = React.useContext(TailwindThemeContext)

    const socialMediaList =[
        ["LinkedIn","https://www.linkedin.com/in/kamil-andrzej-rybacki/"],
        ["GitHub", "https://github.com/KamilRybacki"],
        ["Facebook", "https://www.facebook.com/kamilandrzejrybacki/"],
        ["Instagram", "https://www.instagram.com/kamilandrzejrybacki/"],
        ["Twitter", "https://twitter.com/rybacki_kamil"]
    ]

    React.useEffect(()=>{
        setIconColor(tailwindTheme?.colors ? tailwindTheme.colors.accent["500"] : "black")
    },[tailwindTheme])

    return (
        <PageWrapper footer={false}>
            <ContactRoutes>
                <ContactRoute>
                    <div className="flex justify-center gap-1 w-full sm:justify-end sm:gap-2">
                        <ContactRouteTitle>You can </ContactRouteTitle>
                        <ContactRouteTitle className="font-bold text-accent-500 decoration-accent-500 uppercase">catch me here</ContactRouteTitle>
                        <ContactRouteTitle> ...</ContactRouteTitle>
                    </div>
                    <SocialMediaWrapper>
                        {socialMediaList ? socialMediaList.map((socialMedia) => {
                            const keyBase = socialMedia[1].split("/")[2]
                            return(
                                <SocialMedia onClick={()=>{ window.location.href=socialMedia[1]} } key={`${keyBase}_wrapper`}>
                                    <SocialMediaLabel key={`${keyBase}_label`}>{socialMedia[0]}</SocialMediaLabel>
                                    <SocialIcon
                                        bgColor={iconColor}
                                        url={socialMedia[1]}
                                        key={`${keyBase}_icon`}
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
                    <div className="flex justify-center gap-1 w-full sm:justify-start sm:gap-2">
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
