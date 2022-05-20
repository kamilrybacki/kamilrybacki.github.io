import React from 'react';

import {CardsWrapperLayout} from './style';

type CardsWrapperProps = {
  children: JSX.Element | JSX.Element[]
}

// eslint-disable-next-line max-len
const CardsWrapper: React.FunctionComponent<CardsWrapperProps> = ({children}) => {
  return (
    <CardsWrapperLayout>
      {children}
    </CardsWrapperLayout>
  );
};

export default CardsWrapper;
