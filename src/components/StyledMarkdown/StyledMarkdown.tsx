import React from "react"

import styled from 'styled-components'
import tw from "tailwind-styled-components/dist/tailwind";
import ReactMarkdown from 'react-markdown'
import rehypeRaw from "rehype-raw";
import { MDXRenderer } from "gatsby-plugin-mdx"

import rangeParser from 'parse-numeric-range'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript'
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss'
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash'
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown'
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json'
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python'
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript'
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx'
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css'

SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('scss', scss)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('markdown', markdown)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('css', css)

type StyledMarkdownProps = {
    mdx: boolean,
    children: string 
    rest: Array<object>
}

const PreStyledMarkdownWrapper = styled.div`
    & > div {
        margin-top: 0;
        text-align: justify;
    }
    & > h1,h2,h3,h4,h5,h6 {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
    }
    & > img, div > img {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    & > h1, div > h1 {
        font-weight: bold;
        font-size: 1.5rem;
        letter-spacing: 1px;
        text-decoration: underline;
        margin-bottom: 1rem;
    }
    & > h2, div > h2 {
        font-size: 1.25rem;
        font-weight: bold;
        text-decoration: underline;
        margin-bottom: 1rem;
    }
    & > h3, div > h3 {
        font-size: 1rem;
        text-decoration: underline;
        margin-bottom: 1rem;
    }
    & > p, div > p {
        text-align: justify;
        margin-top: 0.5rem;
        & > a {
            text-decoration: underline;
        }
        & > strong {
            margin: none;
        }
        & > img, div > img {
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
    }
    & > ol, div > ol {
        list-style-type: number;
        & > img, div > img {
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        & > li {
            margin-left: 1.5rem;
            margin-bottom: 0.5rem;
            margin-top: 1rem;
            & > p, div > p {
                margin-top: 0.5rem;
                & > a {
                    text-decoration: underline;
                }
                & > strong {
                    margin: none;
                }
            & > img, div > img {
                margin-top: 1rem;
                margin-bottom: 1rem;
            }
            }
            & > pre {
                & > div {
                    & > code {
                        & > span {
                            font-size: 1rem;
                        }
                    }
                }
            }
        }
    }
    & > ul, div > ul {
        list-style-type: disc;
        & > li {
            margin-left: 1.5rem;
            margin-bottom: 0.5rem;
            margin-top: 1rem;
            & > p, div > p {
                margin-top: 1rem;
                & > a {
                    text-decoration: underline;
                }
                & > strong {
                    margin: none;
                }
            }
            & > pre {
                & > div {
                    & > code {
                        & > span {
                            font-size: 1rem;
                        }
                    }
                }
            }
        }
    }
    a {
        &:hover {
            font-weight: bold;
        }
    }
`

const StyledMarkdownWrapper = tw(PreStyledMarkdownWrapper)`
    p-0
    m-0
    font-body

    md:p-2
`

const StyledMarkdown: React.FunctionComponent<StyledMarkdownProps> = ({mdx = false, children, ...rest}) => {
    const StyledMarkdownComponents: object = {
        code({ node, inline, className, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const hasMeta = node?.data?.meta
            const applyHighlights: object = (applyHighlights: number) => {
                if (hasMeta) {
                    const RE = /{([\d,-]+)}/
                    const metadata = node.data.meta?.replace(/\s/g, '')
                    const strlineNumbers = RE?.test(metadata)
                        ? RE?.exec(metadata)[1]
                        : '0'
                    const highlightLines = rangeParser(strlineNumbers)
                    const highlight = highlightLines
                    const data: string = highlight.includes(applyHighlights)
                        ? 'highlight'
                        : null
                    return { data }
                } else {
                    return {}
                }
            }
            return match ? (
                <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                className="codeStyle"
                showLineNumbers={true}
                wrapLines={hasMeta ? true : false}
                useInlineStyles={true}
                lineProps={applyHighlights}
                {...props}
                />
            ) : (<code className={className} {...props} />)
        }
    }

    return(
        <>
            <StyledMarkdownWrapper>
                {mdx ? <MDXRenderer>
                    {children}
                </MDXRenderer> :
                <ReactMarkdown 
                    {...rest} 
                    components={StyledMarkdownComponents} 
                    rehypePlugins={[rehypeRaw]}
                >
                    {children}
                </ReactMarkdown>
                }
            </StyledMarkdownWrapper>
        </>
    )
}

export default StyledMarkdown