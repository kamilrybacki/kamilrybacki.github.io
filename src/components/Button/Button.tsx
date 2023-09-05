import * as React from 'react';
import { ButtonWrapper } from './style';

const Button = () => {
  const [count, setCount] = React.useState(0);

  return (
    <ButtonWrapper
      onClick={() => setCount(count + 1)}
    >
      {count}
    </ButtonWrapper>
  );
};

export default Button;
