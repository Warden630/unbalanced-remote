import React from 'react';

import { Panel } from '~/shared/panel/panel';
import { useUnraidDisks } from '~/state/unraid';
import { Disk as IDisk } from '~/types';
import { useCleanupActions, useCleanupSource } from '~/state/cleanup';
import { Selectable } from '~/shared/selectable/selectable';
import { Disk } from '~/shared/disk/disk';

export const Disks: React.FunctionComponent = () => {
  const disks = useUnraidDisks();
  const selected = useCleanupSource();
  const { setSource } = useCleanupActions();

  const onDiskClick = (disk: IDisk) => () => setSource(disk.path);

  return (
    <Panel title="Source Disk">
      {disks.map((disk) => (
        <Selectable
          key={disk.id}
          onClick={onDiskClick(disk)}
          selected={disk.path === selected}
        >
          <Disk disk={disk} />
        </Selectable>
      ))}
    </Panel>
  );
};
