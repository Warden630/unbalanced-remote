import React from 'react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Disks } from './disks';
import { FileSystem } from './filesystem';
import { Selection } from './selection';
import { useCleanupError } from '~/state/cleanup';

export const Select: React.FunctionComponent = () => {
  const error = useCleanupError();

  return (
    <div className="flex flex-1 flex-col">
      {error !== '' && (
        <div className="mb-3 rounded border border-red-700 bg-red-100 p-3 text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
      <ResizablePanelGroup direction="horizontal" className="flex flex-1">
        <ResizablePanel defaultSize={30}>
          <Disks />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45}>
          <FileSystem />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25}>
          <Selection />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
