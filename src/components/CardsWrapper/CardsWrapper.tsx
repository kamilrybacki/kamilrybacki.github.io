import React from "react";
import tw from "tailwind-styled-components";

const CardsWrapperLayout = tw.main`
	w-full
	flex
	gap-6

	flex-col
	md:flex-row
`

const CardsWrapper = ({children}) => {
	return(
		<CardsWrapperLayout>
			{children}
		</CardsWrapperLayout>
	)
}

export default CardsWrapper