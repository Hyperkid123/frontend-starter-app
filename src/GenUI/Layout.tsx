import React, { useState } from 'react';

import { StreamResponse, streamedData } from './api';
import { Grid, GridItem } from '@patternfly/react-core';
import ComponentsContainer from './ComponentsContainer';

const Layout: React.FC = () => {
  const [data, setData] = useState<StreamResponse>({
    components: [],
    content: '',
    loading: false,
  });
  function handlePostData() {
    streamedData(setData);
  }
  return (
    <>
      <div>
        <button onClick={handlePostData}>Send Request</button>
      </div>
      <Grid hasGutter>
        <GridItem span={6}>
          <pre>
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </GridItem>
        <GridItem span={6}>
          <ComponentsContainer
            components={data.components}
            loading={data.loading}
          />
        </GridItem>
      </Grid>
    </>
  );
};

export default Layout;
