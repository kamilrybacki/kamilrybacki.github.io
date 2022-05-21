import React from 'react';
import {Link} from 'gatsby';

const tailwindHoverStyling =`
    hover:translate-y-1
`;

type MenuLinkProps = {
    to: string,
    size: string,
    bold: boolean,
    pop: boolean,
    children: JSX.Element | JSX.Element[]
}

// eslint-disable-next-line max-len
const MenuLink: React.FunctionComponent<MenuLinkProps> = ({to, size, bold = true, pop = false, children}) => {
  // eslint-disable-next-line max-len
  const popTextStyle = 'text-accent-500 underline decoration-primary-300 decoration-2 underline-offset-[0.2rem] decoration-dotted';
  const talwindRegularStyling = `
                relative block w-fit h-full mx-auto my-1 
                text-${size}xl font-heading px-4 py-3
                ${pop ? popTextStyle : 'text-primary-900'} 
                ${bold ? 'font-bold' : ''}
                transition-all linear duration-300
                md:mx-3 md:my-auto
    `;
  return (
    <>
      <Link
        to={to}
        className={`${talwindRegularStyling} ${tailwindHoverStyling}`}
      >
        {children}
      </Link>
    </>
  );
};

export default MenuLink;
