import React from 'react';

import { Panel } from '~/shared/panel/panel';
import { useCleanupSelected, useCleanupSource } from '~/state/cleanup';

export const Selection: React.FunctionComponent = () => {
  const source = useCleanupSource();
  const selected = useCleanupSelected();

  return (
    <Panel title="Selected">
      <div className="space-y-3">
        <div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Source</div>
          <div className="break-all text-slate-800 dark:text-slate-200">
            {source || '-'}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Items
          </div>
          <div className="text-slate-800 dark:text-slate-200">
            {selected.length}
          </div>
        </div>
        <div className="space-y-2">
          {selected.map((item) => (
            <div
              key={item}
              className="break-all rounded bg-neutral-200 p-2 text-sm text-slate-700 dark:bg-gray-900 dark:text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};
