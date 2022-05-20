import React from 'react';
import tw from 'tailwind-styled-components';

import {TailwindThemeContext} from '@components/PageWrapper';
import {SpinnerCircularFixed} from 'spinners-react';

const StyledCircularSpinner = tw(SpinnerCircularFixed)`
    m-auto
`;

type StyledSpinnerProps = {
    size: string
}

const StyledSpinner: React.FunctionComponent<StyledSpinnerProps> = ({size}) => {
  const tailwindTheme: any = React.useContext(TailwindThemeContext);
  return (
    <StyledCircularSpinner
      color={tailwindTheme.colors.accent['500']}
      secondaryColor={tailwindTheme.colors.secondary['500']}
      size={size}
    />
  );
};

export default StyledSpinner;
