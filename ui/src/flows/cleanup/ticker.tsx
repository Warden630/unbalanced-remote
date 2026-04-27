import React from 'react';

import { useUnraidRoute } from '~/state/unraid';

export const Ticker: React.FunctionComponent = () => {
  const route = useUnraidRoute();

  if (route === '/cleanup/confirm') {
    return (
      <span>
        Review the selected files and folders. Deletion is permanent after confirmation.
      </span>
    );
  }

  return <span>Select a disk or remote mount, then choose files or folders to delete.</span>;
};
