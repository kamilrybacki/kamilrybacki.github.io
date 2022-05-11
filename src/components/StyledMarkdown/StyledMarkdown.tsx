import React from "react"

import emoji from 'emoji-dictionary'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from "rehype-raw";

import {Dictionary} from "types"

type StyledMarkdownProps = {
	children: string 
	rest: Array<Dictionary>
}

const StyledMarkdownRenderer = styled(ReactMarkdown)`
	padding-left: 2rem;
	padding-right: 2rem;

	& > h1,h2,h3,h4,h5,h6 {
		margin-bottom: 0.5rem;
	}
	& > h1 {
		font-weight: bold;
		font-size: 1.5rem;
		letter-spacing: 2px;
	}
	& > h2 {
		font-size: 1.25rem;
		font-weight: bold;
	}
	& > h3 {
		font-size: 1rem;
		font-weight: normal;
	}
	& > ol {
		list-style-type: number;
		& > li {
			margin-left: 1.5rem;
			margin-bottom: 1rem;
			& > *:is(:first-child) {
				margin-left: 0.5rem;
				margin-bottom: 0.5rem;
			}
			& > *:not(:first-child) {
				margin-left: 1rem;
			}
		}
	}
	& > code {
	}
`

const MarkdownTitle = styled.span`
	position: relative;
	font-size: 2rem;
	text-decoration: underline;
	font-weight: bold;
	width: 100%;
	margin-top: 2rem;
`

const StyledMarkdown: React.FunctionComponent<StyledMarkdownProps> = ({children, ...rest}) => {
	const emojiSupport = (text) => text.value.replace(/:\w+:/gi, (name: string) => emoji.getUnicode(name))

	return(
		<>
			<MarkdownTitle>Project Readme.md</MarkdownTitle>
			<StyledMarkdownRenderer {...rest} components={{ text: emojiSupport }} rehypePlugins={[rehypeRaw]}>
				{children}
			</StyledMarkdownRenderer>
		</>
	)
}

export default StyledMarkdown