import React from 'react';

import styled from 'styled-components';
import tw from 'tailwind-styled-components';

import { css, keyframes } from 'styled-components';
import { useEffect, useState } from 'react';
import { graphql, useStaticQuery } from "gatsby";

import { Dictionary } from 'types'

type CogProps = {
    src: string
}

const all_images_query = graphql`
    query AssetsPhotos {
            allFile(filter: { sourceInstanceName: { eq: "images" }}) {
                edges {
                    node {
                    id
                    publicURL
                    }
                }
        }
    }`

const CogsWrapper = tw.div`
    -z-50
    overflow-hidden
`

const Cog: React.FunctionComponent<CogProps> = ({src}) => {
    const [cog_element, loadCogElement] = useState(<></>)

    useEffect(() => {
        const img = new Image();
        img.src = src;

        const generated_x = Math.floor(Math.random() * 100)
        const generated_y = Math.floor(Math.random() * 100)
        const generated_duration = 10 + Math.floor(Math.random() * 100)
        const generated_opacity = 0.025 + (Math.random() * 0.1)

        const cogspin_frames = keyframes`
            from {transform: rotate(0deg);}
            to {transform: rotate(360deg);}
        `
        const cogspin = css`
            ${cogspin_frames} ${generated_duration}s linear infinite
        `

        const StyledCog = styled.img`
            animation: ${cogspin}
        `

        loadCogElement(
            <StyledCog src={src} style={{
                position: 'fixed',
                left: `${generated_x}%`,
                top: `${generated_y}%`,
                width: `${img.width}px`,
                height: `${img.height}px`,
                zIndex: -99,
                opacity: `${generated_opacity}`
            }}/>
        )
    }, [])

    return(
        <>
         {cog_element}
        </>
    )
}

const MovingCogs = () => {
    const [cogs, loadCogs] = useState([])

    const all_images_query_result = useStaticQuery(all_images_query)
    const number_of_cogs = 250

    useEffect(() => {
        if (!cogs.length) {
            const images_list = all_images_query_result.allFile.edges
            const cogs_list = images_list.reduce((current_list: Array<string>, image: Dictionary) => {
                const image_url = image.node.publicURL
                if ( image_url.search(/cog(\d*).svg/i) > 0 ) {
                    return [...current_list, image_url]
                }
                return current_list
            }, [])
            const chosen_cogs = Array.from(Array(number_of_cogs).keys()).map(() => Math.floor(Math.random() * cogs_list.length))
            const spawned_cogs = chosen_cogs.map((cog_id, cog_index) => <Cog src={cogs_list[cog_id]} key={`cog_${cog_index}`}/>)
            loadCogs(spawned_cogs)
        }
    }, [])

    return(
        <CogsWrapper>
            {cogs} 
        </CogsWrapper>
    )
}

export default MovingCogs;