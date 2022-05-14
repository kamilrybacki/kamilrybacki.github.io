import React from "react";

import styled from "styled-components";
import tw from "tailwind-styled-components";

import { css, keyframes } from "styled-components";
import { graphql, useStaticQuery } from "gatsby";

type CogProps = {
    src: string
}

const CogsWrapper = tw.div`
    -z-50
    overflow-hidden
`

const Cog: React.FunctionComponent<CogProps> = ({src}) => {
    const [cog_element, loadCogElement] = React.useState(<></>)

    React.useEffect(() => {
        const cogX = 0.1*window.innerWidth + Math.random() * (0.7*window.innerWidth)
        const cogY = 0.1*window.innerHeight + Math.random() * (0.7*window.innerHeight)
        const cogOpacity = 0.025 + (Math.random() * 0.05)

        const rotationPeriod = 25 + Math.floor(Math.random() * 100)

        const rotationFrames = keyframes`
            from {transform: rotate(0deg);}
            to {transform: rotate(360deg);}
        `
        const cogRotationAnimation = css`
            ${rotationFrames} ${rotationPeriod}s linear infinite
        `

        const StyledCog = styled.img`
            animation: ${cogRotationAnimation}
        `

        loadCogElement(
            <StyledCog 
                src={src} 
                style={{
                    position: "fixed",
                    left: `${cogX}px`,
                    bottom: `${cogY}px`,
                    zIndex: -99,
                    opacity: `${cogOpacity}`,
                }}
            />
        )
    }, [])

    return(
        <>
         {cog_element}
        </>
    )
}

const MovingCogs = () => {
    const [cogs, loadCogs] = React.useState()

    const cogSvgFiles = useStaticQuery(graphql`
        query AssetsPhotos {
            allFile(filter: {sourceInstanceName: {eq: "images"}, 
                    absolutePath: {regex: "/images\/cogs\/cog/"}})
                {
                    edges {
                    node {
                        id
                        publicURL
                    }
                }
            }
        }`
    )

    const numberOfCogs = 10

    React.useEffect(() => {
        const cogsPublicUrlList = cogSvgFiles.allFile.edges.map((cog: object) => cog?.node.publicURL)

        const cogIdList = Array.from(Array(numberOfCogs).keys()).map(() => Math.floor(Math.random() * cogsPublicUrlList.length))
        const spawned_cogs = cogIdList.map((cog_id, index) => <Cog src={cogsPublicUrlList[cog_id]} key={`cog_${index}`}/>)
        loadCogs(spawned_cogs)
    }, [])

    return(
        <>
            {cogs ? <CogsWrapper>{cogs}</CogsWrapper> : ""}
        </>
    )
}

export default MovingCogs;
