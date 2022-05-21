import tw from 'tailwind-styled-components';
import styled from 'styled-components';

import {Link} from 'gatsby';

const ThumbnailWrapper = styled.div`
    position: relative;
    display: flex;
    padding: 2rem;
    justify-content: space-between;
    height: 15rem;
    &::before {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        content: "";
        width: 100%;
        height: 100%;  
        z-index: -1;
        background-image: url(${(props) => props.thumbnail});
    }
`;

const InformationWrapper = tw.div`
    flex
    align-middle
    justify-between
    w-full
`;

const PostTitle = tw.h1`
    relative
    font-heading
    font-bold
    text-secondary-100
    text-3xl
    mb-4
    bg-primary-900
    p-3
    h-fit
    -top-12
    -left-12

    md:left-0
    md:top-0
    md:text-5xl
`;

const PostDate = tw.time`
    mt-5
    mr-5
    w-max
    h-max
    font-sans
    text-sm
`;

const TagsWrapper = tw.menu`
    flex
    mt-5
    ml-5
    mb-8
    h-2
`;

const TagsLabel = tw.span`
    font-sans
    text-sm
    text-primary-300
    mr-2
`;

const TagLink = tw(Link)`
    h-max
    w-max
    mr-2
    px-2
    py-0.25
    rounded-sm
    font-bold
    bg-secondary-200
    font-mono
    tracking-tighter
    text-sm
    text-primary-600

    hover:-translate-x-0.5
    hover:-translate-y-0.5
`;

const FrontmatterSeparator = tw.hr`
    relative
    h-[0.1rem]
    left-[1%]
    w-[98%]
    border-0
    bg-primary-300
    mb-4
`;

const ContentWrapper = tw.main`
    flex
    flex-col
    align-middle
    justify-center
    px-5
    pt-3
    pb-10
    bg-secondary-50
`;

export {ThumbnailWrapper, InformationWrapper, PostTitle,
  PostDate, TagsWrapper, TagsLabel, TagLink,
  FrontmatterSeparator, ContentWrapper};
