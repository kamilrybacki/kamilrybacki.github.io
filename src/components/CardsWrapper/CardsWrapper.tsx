import React from "react";
import tw from 'tailwind-styled-components';

const CardsWrapperLayout = tw.main`
	grid
`

const CardsWrapper = ({children}) => {
	return(
		<>
			{children}
		</>
	)
}

export default CardsWrapper