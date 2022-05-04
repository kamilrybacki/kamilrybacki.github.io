import React from 'react';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { graphql, useStaticQuery } from "gatsby";

import { Dictionary } from 'types'

type MovingCogsProps = {
    children: JSX.Element | JSX.Element[]
}

type CogProps = {
    src: URL
    src_height: number,
    src_width: number,
    x: number,
    y: number,
    spin_duration: number,
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

const CogsVignette = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    box-shadow: inset 0 0 10vw gray;
    z-index: -99;
`

const Cog = styled.div`
    animation: cogspin ${(props: CogProps) => `${props.spin_duration}s`} linear infinite;
    @keyframes cogspin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    &:before {
        content: '';
        width: ${(props: CogProps) => `${props.src_width}px`};
        height: ${(props: CogProps) => `${props.src_height}px`};
        display: block;
        position: fixed;
        left: ${(props: CogProps) => `${props.x}px`};
        top: ${(props: CogProps) => `${props.y}px`};
        background-image: ${(props: CogProps) => `url(${props.src})`};
        z-index: -99;
        opacity: 0.1;
    }
`

const spawnCogs = (cogs: Array<Dictionary<string>>, number_of_cogs: number) => {
    const chosen_cogs = Array.from(Array(number_of_cogs).keys()).map(() => Math.floor(Math.random() * cogs.length))
    return chosen_cogs.every((entry) => !entry) ? [] : chosen_cogs.map((cog_id, cog_index) => {
        const cog_data = cogs[cog_id]

        const generated_x = Math.floor(Math.random() * window.screen.width)
        const generated_y = Math.floor(Math.random() * window.screen.height)
        const generated_duration = 10 + Math.floor(Math.random() * 30)

        return(
            <Cog 
                src={cog_data.url}
                src_height={cog_data.height}
                src_width={cog_data.width}
                x={generated_x}
                y={generated_y}
                spin_duration={generated_duration}
                key={`cog_${cog_index}`}
            />
        )
    })
}

const MovingCogs: React.FunctionComponent<MovingCogsProps> = ({children}) => {
    const [cogs, loadCogs] = useState([])
    const all_images_query_result = useStaticQuery(all_images_query)

    useEffect(() => {
        const images_list = all_images_query_result.allFile.edges
        const cogs_list = images_list.reduce((current_list: Array<string>, image: Dictionary) => {
            const image_url = image.node.publicURL
            const img = new Image();
            img.src = image_url;

            if ( image_url.search(/cog(\d*).svg/i) > 0 ) {
                const cog_data = {
                    url: image_url,
                    width: img.width,
                    height: img.height
                }
                return [...current_list, cog_data]
            }
            return current_list
        }, [])
        loadCogs(cogs_list)
    }, [])

    return(
        <>
            { cogs ? spawnCogs(cogs, 100) : '' } 
            {children}
            <CogsVignette/>
        </>
    )
}

export default MovingCogs;