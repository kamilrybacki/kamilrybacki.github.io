import tw from "tailwind-styled-components"

const PageHeaderWrapper = tw.header`
    flex
    flex-row
    w-full
`;

const MenuWrapper = tw.div`
    flex
    gap-0
    w-max
    max-w-5xl
    p-5
    h-fit

    md:px-10
    lg:py-10
`;

const ScaledNavbar = tw.div`
    w-fit
    invisible
    duration-0
    mx-3
    h-0

    md:relative
    md:-ml-8
    md:origin-top-left
    md:scale-[0.6]
    md:visible

    lg:-top-2
    lg:scale-[0.75]
`;

export {PageHeaderWrapper, MenuWrapper, ScaledNavbar};
