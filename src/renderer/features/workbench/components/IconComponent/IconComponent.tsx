import React from 'react';
import componentDefault from '../../../../../../assets/imgs/component-default.svg';
import AppConfig from '../../../../../config/AppConfigModule';

const IconComponent = ({ name, size }) => {
  return (
    <div id="IconComponent">
      <figure style={{ width: size, height: size }}>
        {AppConfig.FF_ENABLE_COMPONENT_LOGO ? (
          <img
            alt="component logo"
            height={size}
            loading="lazy"
            style={{ backgroundImage: componentDefault }}
            src={`https://avatars.githubusercontent.com/${name}?s=${size}}`}
            onLoad={(event: any) => {
              event.target.style.backgroundImage = 'none';
            }}
            onError={(event: any) => {
              event.target.src = componentDefault;
              event.onerror = null;
            }}
          />
        ) : (
          <img alt="logo" src={componentDefault} />
        )}
      </figure>
    </div>
  );
};

export default IconComponent;
