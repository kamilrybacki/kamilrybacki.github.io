import React from 'react';

import styled from 'styled-components';
import tw from 'tailwind-styled-components';

import { css, keyframes } from 'styled-components';
import { useEffect, useState } from 'react';
import { graphql, useStaticQuery } from "gatsby";

import { Dictionary } from 'types'

type CogProps = {
    src: string
    area: Array<Array<number>>
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

const Cog: React.FunctionComponent<CogProps> = ({src, area}) => {
    const [cog_element, loadCogElement] = useState(<></>)

    useEffect(() => {
        const img = new Image();
        img.src = src;

        const min_x = area[0] + 0.25*img.width
        const max_x = area[2] - 0.75*img.width

        const min_y = area[1] + 0.25*img.height
        const max_y = area[3] - 0.75*img.height

        const generated_x = min_x + Math.random() * (max_x - min_x)
        const generated_y = min_y + Math.random() * (max_y - min_y)

        const generated_duration = 25 + Math.floor(Math.random() * 100)
        const generated_opacity = 0.075 + (Math.random() * 0.1)
        const generated_scale = 1.0 + (Math.random() * 1.25)

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
            <StyledCog 
                src={src} 
                style={{
                    position: 'fixed',
                    left: `${generated_x}px`,
                    bottom: `${generated_y}px`,
                    width: `${img.width * generated_scale}px`,
                    height: `${img.height * generated_scale}px`,
                    zIndex: -99,
                    opacity: `${generated_opacity}`,
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
    const [cogs, loadCogs] = useState([])

    const all_images_query_result = useStaticQuery(all_images_query)
    const cogs_per_area = 1 

    useEffect(() => {
        const images_list = all_images_query_result.allFile.edges
        const cogs_list = images_list.reduce((current_list: Array<string>, image: Dictionary) => {
            const image_url = image.node.publicURL
            if ( image_url.search(/cog(\d*).svg/i) > 0 ) {
                return [...current_list, image_url]
            }
            return current_list
        }, [])

        const rendered_index_splash = document.getElementById('splash-wrapper')
        const filled_area = rendered_index_splash?.getBoundingClientRect()
        const available_areas = [
            [0, 0, filled_area?.x, 0.25*window.innerHeight],
            [0, 0.25*window.innerHeight, filled_area?.x, 0.5*window.innerHeight],
            [0, 0.5*window.innerHeight, filled_area?.x, 0.75*window.innerHeight],
            [0, 0.75*window.innerHeight, filled_area?.x, window.innerHeight],

            [filled_area?.x, filled_area?.y + filled_area?.height, (filled_area?.x + 0.25*filled_area?.width), window.innerHeight],
            [(filled_area?.x + 0.25*filled_area?.width), filled_area?.y + filled_area?.height, (filled_area?.x + 0.5*filled_area?.width), window.innerHeight],
            [(filled_area?.x + 0.5*filled_area?.width), filled_area?.y + filled_area?.height, (filled_area?.x + 0.75*filled_area?.width), window.innerHeight],
            [(filled_area?.x + 0.75*filled_area?.width), filled_area?.y + filled_area?.height, filled_area?.x + filled_area?.width, window.innerHeight],

            [filled_area?.x , 0, (filled_area?.x + 0.25*filled_area?.width), filled_area?.y],
            [(filled_area?.x + 0.25*filled_area?.width), 0, (filled_area?.x + 0.5*filled_area?.width), filled_area?.y],
            [(filled_area?.x + 0.5*filled_area?.width), 0, (filled_area?.x + 0.75*filled_area?.width), filled_area?.y],
            [(filled_area?.x + 0.75*filled_area?.width), 0, filled_area?.x + filled_area?.width, filled_area?.y],

            [filled_area?.x + filled_area?.width, 0, window.innerWidth, 0.25*window.innerHeight],
            [filled_area?.x + filled_area?.width, 0.25*window.innerHeight, window.innerWidth , 0.5*window.innerHeight],
            [filled_area?.x + filled_area?.width, 0.5*window.innerHeight, window.innerWidth , 0.75*window.innerHeight],
            [filled_area?.x + filled_area?.width, 0.75*window.innerHeight, window.innerWidth , window.innerHeight],
        ]

        let spawned_cogs: Array<JSX.Element> = [] 

        available_areas.forEach((area) => {
            const chosen_cogs = Array.from(Array(cogs_per_area).keys()).map(() => Math.floor(Math.random() * cogs_list.length))
            spawned_cogs = spawned_cogs.concat(chosen_cogs.map((cog_id, cog_index) => <Cog src={cogs_list[cog_id]} area={area} key={`cog_${cog_index}`}/>))
            console.log(area)
        })
        loadCogs(spawned_cogs)
    }, [])

    return(
        <CogsWrapper>
            {cogs} 
        </CogsWrapper>
    )
}

export default MovingCogs;
