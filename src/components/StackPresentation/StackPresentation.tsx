import React from "react"
import {useState, useEffect} from "react"
import tw from 'tailwind-styled-components'

import Skeleton from 'react-loading-skeleton'

import { Dictionary } from 'types'

type StackPresentationProps = {
	techs: Array<string>
}

const StackPresentationWrapper = tw.div`
	flex
	flex-wrap
	flex-auto
	justify-between
	bg-secondary-500
	p-3
	my-5
	border-2
	rounded-lg
	border-primary-100
	overflow-x-hidden
	overflow-y-scroll
	overscroll-contain
	scrollbar-thin
	w-[90%]
	mx-auto

	lg:mt-3
	lg:mr-10
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

const StackPresentation: React.FunctionComponent<StackPresentationProps> = ({techs}) => {
	const [icons, setIcons] = useState([])

	useEffect(()=>{
		fetch('https://api.github.com/repos/get-icon/geticon/branches/master').then((response) => response.json())
		.then((master_data: Dictionary) => master_data.commit.sha).then((latest_sha: string) => {
			return fetch(`https://api.github.com/repos/get-icon/geticon/git/trees/${latest_sha}`).then(response => response.json())
			.then((contents: Dictionary) => {
				const master_tree = contents.tree
				const icons_tree_url = master_tree.filter((tree_node: Dictionary) => tree_node.path == 'icons')[0].url
				return fetch(icons_tree_url).then(response => response.json()).then((contents: Dictionary) => contents.tree)
				.then((icons_tree_data: Array<Dictionary>) => {
					let found_icons: Array<string> = []
					icons_tree_data.forEach((icon_entry: Dictionary) => {
						const icon_name = icon_entry.path.replace('.svg','').replace('-icon','')
						if (techs.includes(icon_name)) {
							if (found_icons.includes(`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}.svg`)) {
								const index = found_icons.indexOf(`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}.svg`)
								found_icons[index] =`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}-icon.svg` 
							}
							else {
								found_icons.push(`https://raw.githubusercontent.com/get-icon/geticon/master/icons/${icon_name}.svg`)
							}
						}
					})
					setIcons(found_icons)
				})
			})
		})
	}, [])

	return(
		<StackPresentationWrapper>
			{icons.map((icon_url, index) => {
				return(<StackIcon key={`stack_${index}`} src={icon_url} alt={icon_url.split('/').at(-1).replace('.svg','')}/>)
			}) || <Skeleton count={2}/>}
		</StackPresentationWrapper>
	)
}

export default StackPresentation
