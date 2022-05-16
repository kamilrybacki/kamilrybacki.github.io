import React from "react"
import tw from "tailwind-styled-components"
import { useStaticQuery, graphql } from "gatsby"

import StyledSpinner from "@components/StyledSpinner"

type StackPresentationProps = {
    techs: Array<string>
}

const StackPresentationWrapper = tw.div`
    relative
    flex
    flex-wrap
    flex-auto
    justify-between
    bg-secondary-50
    p-3
    my-5
    border-2
    rounded-lg
    border-primary-100
    overflow-x-hidden
    overflow-y-scroll
    overscroll-contain
    scrollbar-thin
    mx-auto
    gap-1

    lg:mt-3
    lg:py-6
`

const StackIcon = tw.img`
    my-1
    w-8
    h-8

    md:mx-1
    lg:w-10
    lg:h-10
    lg:mx-3
`
const imagesQuery = graphql`
 query TechsImagesQuery {
    allFile(filter: {absolutePath: {regex: "/techs/"}}) {
        edges {
            node {
                name
                publicURL
            }
        }
    }
 }
`

const StackPresentation: React.FunctionComponent<StackPresentationProps> = ({techs}) => {
    const [icons, setIcons] = React.useState([])
    const techIcons = useStaticQuery(imagesQuery)

    React.useEffect(()=>{
        setIcons(
            techIcons.allFile.edges
                .filter((image) => techs.includes(image.node.name))
                .map((image) => image.node.publicURL)
                .map((iconUrl: string, index: number) => {
                    const iconImgAlt = iconUrl.split("/").at(-1).replace(".svg","")
                    return(<StackIcon key={`stack_${index}`} src={iconUrl} alt={iconImgAlt}/>)
                })
        )
    }, [])

    return(
        <StackPresentationWrapper>
            {icons ? icons : <StyledSpinner size="30%"/>}
        </StackPresentationWrapper>
    )
}

export default StackPresentation
