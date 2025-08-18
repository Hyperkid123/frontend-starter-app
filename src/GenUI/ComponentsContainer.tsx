import React from 'react';
import { RegistryProps } from './api';
import { ScalprumComponent } from '@scalprum/react-core';

import './ComponentsContainer.scss';
import { Bullseye, Icon, Spinner } from '@patternfly/react-core';

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <Bullseye>
        <Icon size="3xl" />
        <Spinner />
      </Bullseye>
    </div>
  );
};

const ComponentsContainer = ({
  components,
  loading,
}: {
  components: RegistryProps[];
  loading: boolean;
}) => {
  return (
    <div className="components-container">
      {loading && <LoadingOverlay />}
      {components.map((component, index) => {
        const { props, ...rest } = component;
        return <ScalprumComponent key={index} {...props} {...rest} />;
      })}
    </div>
  );
};

export default ComponentsContainer;
