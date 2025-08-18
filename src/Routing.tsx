import React, { Suspense } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import Layout from './GenUI/Layout';

const Routing = () => {
  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <Layout />
    </Suspense>
  );
};

export default Routing;
