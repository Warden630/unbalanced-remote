import React from 'react';

import { Disk as IDisk } from '~/types';
import { humanBytes } from '~/helpers/units';

type DiskProps = {
  disk: IDisk;
};

export const Disk: React.FunctionComponent<DiskProps> = ({ disk }) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center dark:text-slate-700 text-slate-500">
          <span className="text-blue-800 dark:text-blue-800 font-bold">
            {disk.name}
          </span>
          {disk.remote && (
            <span className="ml-2 text-xs uppercase text-emerald-700 dark:text-emerald-600">
              remote
            </span>
          )}
          <span className="text-sm">&nbsp;({disk.fsType})</span>
          <span className="px-1">-</span>
          <span>{humanBytes(disk.size)}</span>
        </div>
        <span className="dark:text-slate-500 text-slate-700">
          {humanBytes(disk.free)}
        </span>
      </div>
      <p className="dark:text-indigo-500 text-indigo-500 text-sm">
        {disk.serial}
      </p>
    </div>
  );
};
