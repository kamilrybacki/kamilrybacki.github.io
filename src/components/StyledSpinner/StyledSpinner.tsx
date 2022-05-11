import React from "react"
import tw from "tailwind-styled-components"

import { TailwindThemeContext } from "@components/PageWrapper"
import { SpinnerCircularFixed } from 'spinners-react';

type StyledSpinnerProps = {
	size: string
}

const StyledCircularSpinner = tw(SpinnerCircularFixed)`
	m-auto
`

const StyledSpinner: React.FunctionComponent<StyledSpinnerProps> = ({size}) => {
	const tailwindTheme = React.useContext(TailwindThemeContext)
	return(
		<StyledCircularSpinner 
			color={tailwindTheme.colors.accent["500"]} 
			secondaryColor={tailwindTheme.colors.secondary["500"]} 
			size={size}
		/>
	)
}

export default StyledSpinner
