import React from 'react';

import {SmallerGalleryWrapper, SmallPicture} from './style';

type SmallerGalleryProps = {
    pictures: string[]
}

const SmallerGallery: React.FunctionComponent<SmallerGalleryProps> = ({pictures}) => {
  return (
    <SmallerGalleryWrapper>
      {pictures.map((picture: string, index: number) => {
        return (<SmallPicture src={picture} key={`smpic_${index}`}/>)
      })}
    </SmallerGalleryWrapper>
  );
};


export default SmallerGallery;
