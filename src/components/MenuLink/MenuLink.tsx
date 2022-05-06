import React from 'react'
import { Link } from 'gatsby'

type MenuLinkProps = {
    to: string,
    size: string,
    bold: boolean,
    pop: boolean,
    children: JSX.Element | JSX.Element[]
}

const MenuLink: React.FunctionComponent<MenuLinkProps> = ({to, size = 'md', bold = true, pop = false, children}) => {
    const tailwind_styling = `
                flex items-center justify-center w-max my-4 mx-6 h-12 align-middle 
                ${pop ? 'text-accent-500 underline decoration-primary-300 decoration-2 underline-offset-[0.2rem] decoration-dotted': 'text-primary-500'} 
                text-${size} ${bold ? 'font-bold' : ''}
                hover:translate-x-1 hover:translate-y-1 hover:rotate-[1deg]
                transition-all ease-in-out duration-500
    `
    return(
        <Link 
            to={to}
            className={tailwind_styling}
        >
            {children}
        </Link>
    )
}

export default MenuLink 
