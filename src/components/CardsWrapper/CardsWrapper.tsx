import React from "react";
import tw from "tailwind-styled-components";

const CardsWrapperLayout = tw.main`
	w-full
	flex
	gap-6
`

const CardsWrapper = ({children}) => {
	return(
		<CardsWrapperLayout>
			{children}
		</CardsWrapperLayout>
	)
}

export default CardsWrapper