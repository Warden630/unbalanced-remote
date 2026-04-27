import React from 'react';

import { Disk as IDisk } from '~/types';
import { humanBytes } from '~/helpers/units';

type DiskProps = {
  disk: IDisk;
};

export const Disk: React.FunctionComponent<DiskProps> = ({ disk }) => {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-baseline dark:text-slate-700 text-slate-500">
          <span className="break-all text-blue-800 dark:text-blue-800 font-bold">
            {disk.name}
          </span>
          {disk.remote && (
            <span className="ml-2 shrink-0 text-xs uppercase text-emerald-700 dark:text-emerald-600">
              remote
            </span>
          )}
          <span className="shrink-0 text-sm">&nbsp;({disk.fsType})</span>
          <span className="shrink-0 px-1">-</span>
          <span className="shrink-0">{humanBytes(disk.size)}</span>
        </div>
        <span className="shrink-0 text-right dark:text-slate-500 text-slate-700">
          {humanBytes(disk.free)}
        </span>
      </div>
      <p className="break-all dark:text-indigo-500 text-indigo-500 text-sm">
        {disk.serial}
      </p>
    </div>
  );
};
