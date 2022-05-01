import React from 'react'

import { SocialIcon, SocialIconProps } from 'react-social-icons'
import tw from 'tailwind-styled-components'

import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '/tailwind.config.js'

const MonochromeSocialIcon: React.FunctionComponent<SocialIconProps> = (url) => {
    return(
        <SocialIcon 
            url={url}
        />
    )
}

const SocialMediaBarWrapper = tw.footer`
    flex
    justify-between
    align-middle
`

const SocialMediaBar = () => {
    const currentConfig = resolveConfig(tailwindConfig)
    const links =[
        'https://www.linkedin.com/in/kamil-andrzej-rybacki/',
        'https://github.com/KamilRybacki',
        'https://www.facebook.com/kamilandrzejrybacki/',
        'https://www.instagram.com/kamilandrzejrybacki/',
        'https://twitter.com/rybacki_kamil'
    ]
    return(
        <SocialMediaBarWrapper>
            {
                links.map((link) => link ? <SocialIcon 
                    bgColor={currentConfig.theme.colors.primary['500']}
                    url={link}
                    style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        marginLeft: '0.75rem',
                    }}
                    /> : null
                )
            }
        </SocialMediaBarWrapper>
    )
}

export default SocialMediaBar