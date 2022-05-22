import React from 'react';
import tw from 'tailwind-styled-components';

// @ts-ignore
import {TailwindThemeContext, TailwindThemeType} from '@components/PageWrapper';
import {SpinnerCircularFixed} from 'spinners-react';

const StyledCircularSpinner = tw(SpinnerCircularFixed)`
    m-auto
`;

type StyledSpinnerProps = {
    size: string
}

const StyledSpinner: React.FunctionComponent<StyledSpinnerProps> = ({size}) => {
  const tailwindTheme: TailwindThemeType = React.useContext(TailwindThemeContext);
  return (
    <StyledCircularSpinner
      color={tailwindTheme.colors.accent['500']}
      secondaryColor={tailwindTheme.colors.primary['900']}
      size={size}
    />
  );
};

export default StyledSpinner;
