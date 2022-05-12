import React from "react"
import { Link } from "gatsby"

type MenuLinkProps = {
    to: string,
    size: string,
    bold: boolean,
    pop: boolean,
    children: JSX.Element | JSX.Element[]
}

const MenuLink: React.FunctionComponent<MenuLinkProps> = ({to, size, bold = true, pop = false, children}) => {
    const tailwind_hover_styling =`
        hover:border-[1px] hover:border-primary
        hover:shadow-[-0.25rem_-0.25rem_0_rgb(0,0,0)]
        hover:translate-x-1 hover:translate-y-1 
    `

    const tailwind_styling = `
                block w-fit mx-auto my-2 h-fit text-${size}xl font-subheading p-3
                ${pop ? "text-accent-500 underline decoration-primary-300 decoration-2 underline-offset-[0.2rem] decoration-dotted": "text-primary-500"} 
                ${bold ? "font-bold" : ""}
                transition-all ease-in-out duration-500
                md:mx-2 md:my-auto
    `
    return(
        <Link 
            to={to}
            className={`${tailwind_styling} ${tailwind_hover_styling}`}
        >
            {children}
        </Link>
    )
}

export default MenuLink 
