import React from 'react';

import styled from 'styled-components';
import {css, keyframes} from 'styled-components';

type CogProps = {
    src: string
}

const Cog: React.FunctionComponent<CogProps> = ({src}) => {
  const [cogElement, loadCogElement] = React.useState(<></>);

  React.useEffect(() => {
    const cogX = 0.1*window.innerWidth+Math.random()*(0.7*window.innerWidth);
    const cogY = 0.1*window.innerHeight+Math.random()*(0.7*window.innerHeight);
    const cogOpacity = 0.025 + (Math.random() * 0.05);

    const rotationPeriod = 25 + Math.floor(Math.random() * 100);

    const rotationFrames = keyframes`
            from {transform: rotate(0deg);}
            to {transform: rotate(360deg);}
        `;
    const cogRotationAnimation = css`
            ${rotationFrames} ${rotationPeriod}s linear infinite
        `;

    const StyledCog = styled.img`
            animation: ${cogRotationAnimation}
        `;

    loadCogElement(
        <StyledCog
          src={src}
          style={{
            position: 'fixed',
            left: `${cogX}px`,
            bottom: `${cogY}px`,
            zIndex: -99,
            opacity: `${cogOpacity}`,
          }}
        />,
    );
  }, []);

  return (
    <>
      {cogElement}
    </>
  );
};

export default Cog;
