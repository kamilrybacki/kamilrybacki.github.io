import tw from 'tailwind-styled-components';
import {Link} from 'gatsby';

const CardWrapper = tw(Link)`
    p-5
    border-2
    duration-300
    bg-secondary-50

    hover:-translate-x-[0.5rem]
    hover:-translate-y-[0.5rem]
    hover:shadow-[0.25rem_0.25rem_0_rgb(0,0,0)]

    md:w-1/2
    lg:w-1/4
`;

const FrontmatterWrapper = tw.div`
    flex
    justify-between
    align-middle
    mb-4
`;

const PostTitle = tw.h1`
    font-heading
    font-bold
    text-2xl
    underline
    mr-5
`;

const PostDate = tw.span`
    py-2
    font-sans
    text-sm
    text-primary-200
`;

const ThumbnailMiniature = tw.img`
    mt-1
    mb-5
`;

const PostExcerpt = tw.p`
    text-justify
    font-sans
    text-sm
    text-primary-400
    p-1
    overflow-x-hidden
    h-full
`;

export {CardWrapper, FrontmatterWrapper,
  PostTitle, PostDate, PostExcerpt, ThumbnailMiniature};
