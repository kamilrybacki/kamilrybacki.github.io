import React from 'react';

import styled from 'styled-components';
import tw from 'tailwind-styled-components/dist/tailwind';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {MDXRenderer} from 'gatsby-plugin-mdx';

import StyledMarkdownComponents from './StyledMarkdownComponents';

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
`;

const StyledMarkdownWrapper = tw(PreStyledMarkdownWrapper)`
    p-0
    m-0
    font-body

    md:p-2
`;

type StyledMarkdownProps = {
    mdx: boolean,
    children: string
    rest: Array<object>
}

// eslint-disable-next-line max-len
const StyledMarkdown: React.FunctionComponent<StyledMarkdownProps> = ({mdx = false, children, ...rest}) => {
  return (
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
  );
};

export default StyledMarkdown;
