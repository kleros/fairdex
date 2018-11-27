import React from 'react';

import Separator from '../../components/Separator';

const NetworkNotAvailable = () => (
  <>
    <h2>This ÐApp is not available on your network</h2>
    <Separator />
    <p>Make sure you're connected to the Rinkeby Test Network</p>
  </>
);

export default NetworkNotAvailable;
