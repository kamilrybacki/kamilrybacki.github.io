import React from "react";
import tw from "tailwind-styled-components";

type DefaultLayoutProps = {

}

const DefaultLayoutWrapper = tw.article`
`

const DefaultLayout: React.FunctionComponent<DefaultLayoutProps> = ({children}) => {
	return(
		<>
			{children}
		</>
	)
}

export default DefaultLayout