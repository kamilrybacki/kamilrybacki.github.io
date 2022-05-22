// @ts-nocheck
import React, {ReactNode} from 'react';

import {MDXRenderer} from 'gatsby-plugin-mdx';

import PageWrapper from '@components/PageWrapper';

import {ThumbnailWrapper, InformationWrapper, PostTitle,
  PostDate, TagsWrapper, TagsLabel, TagLink,
  FrontmatterSeparator, ContentWrapper} from './style';

type BlogBodyPost = {
    thumbnailUrl: string
    title: string,
    tags: string[],
    date: string,
    content: string & ReactNode
}

const BlogBody: React.FunctionComponent<BlogBodyPost> = ({thumbnailUrl, title, tags, date, content}) => {
  return (
    <PageWrapper>
      <article>
        <ThumbnailWrapper thumbnail={thumbnailUrl}>
          <PostTitle>{title}</PostTitle>
        </ThumbnailWrapper>
        <InformationWrapper>
          <TagsWrapper>
            <TagsLabel>Tags:</TagsLabel>
            {tags.map((tag) => {
              return (<TagLink key={tag}>{tag}</TagLink>);
            })}
          </TagsWrapper>
          <PostDate>Date published: {date}</PostDate>
        </InformationWrapper>
        <FrontmatterSeparator/>
        <ContentWrapper>
          <MDXRenderer>{content}</MDXRenderer>
        </ContentWrapper>
      </article>
    </PageWrapper>
  );
};

export default BlogBody;
