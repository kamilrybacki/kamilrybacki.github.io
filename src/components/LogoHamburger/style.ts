import tw from 'tailwind-styled-components';

const LogoHamburgerWrapper = tw.button`
    flex
    justify-center
    align-middle
    text-primary-900
    font-heading
    font-bold
    w-[25vw]
    h-[25vw]
    m-0
    p-3
    z-50

    rounded-full
    border-4
    border-primary-100
    bg-secondary-100
    duration-300

    focus:border-primary-500
    focus:text-primary-600
    focus:-rotate-90
    focus:scale-105

    md:border-0
    md:w-0
    md:h-0
    md:p-0
    md:m-0
    md:invisible
    md:py-4
    md:px-3
    md:child:scale-0
`;

const LogoWrapper = tw.div`
    relative
    h-full
    flex
    m-0
    p-0
    gap-0
    justify-center
`;

const LogoSource = tw.img`
    relative
    m-0
    p-0
`;

const DropdownMenu = tw.div`
    fixed
    left-[10vw]
    top-[25vw]
    px-3
    border-primary-500
    bg-secondary-100
    origin-top-left
    scale-75
    z-40
    h-auto
    w-auto
    border-4
    drop-shadow-xl
`;

export {LogoHamburgerWrapper, LogoSource, LogoWrapper, DropdownMenu};
