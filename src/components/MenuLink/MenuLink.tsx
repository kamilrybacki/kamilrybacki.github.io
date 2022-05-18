import React from "react"
import { Link } from "gatsby"

type MenuLinkProps = {
    to: string,
    size: string,
    bold: boolean,
    pop: boolean,
    children: JSX.Element | JSX.Element[]
}

const tailwindHoverStyling =`
    hover:shadow-[0.25rem_0.25rem_0_rgb(0,0,0)]
    hover:-translate-x-[0.25rem]
    hover:-translate-y-[0.25rem]
    hover:border-2
    hover:border-[rgb(0,0,0)]
`

const MenuLink: React.FunctionComponent<MenuLinkProps> = ({to, size, bold = true, pop = false, children}) => {
    const talwindRegularStyling = `
                relative block w-fit mx-auto my-2 h-full text-${size}xl font-subheading px-4 py-3
                ${pop ? "text-accent-500 underline decoration-primary-300 decoration-2 underline-offset-[0.2rem] decoration-dotted": "text-primary-900"} 
                ${bold ? "font-bold" : ""}
                transition-all linear duration-300
                md:mx-3 md:my-auto
    `
    return(
        <Link 
            to={to}
            className={`${talwindRegularStyling} ${tailwindHoverStyling}`}
        >
            {children}
        </Link>
    )
}

export default MenuLink 
