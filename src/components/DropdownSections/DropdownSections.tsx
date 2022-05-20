import React from 'react';

import {DropdownSectionsWrapper} from './style';

type DropdownSectionsProps = {
    children: JSX.Element | JSX.Element[]
    extraClass: string
}

// eslint-disable-next-line max-len
const DropdownSections: React.FunctionComponent<DropdownSectionsProps> = ({children, extraClass}) => {
  return (
    <DropdownSectionsWrapper className={extraClass}>
      {children}
    </DropdownSectionsWrapper>
  );
};

export default DropdownSections;
