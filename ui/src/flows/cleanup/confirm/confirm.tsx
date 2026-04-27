import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '~/shared/buttons/button';
import { Panel } from '~/shared/panel/panel';
import {
  useCleanupActions,
  useCleanupDeleted,
  useCleanupDeleting,
  useCleanupError,
  useCleanupPlan,
} from '~/state/cleanup';
import { humanBytes } from '~/helpers/units';

export const Confirm: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const plan = useCleanupPlan();
  const deleting = useCleanupDeleting();
  const deleted = useCleanupDeleted();
  const error = useCleanupError();
  const { deleteSelected, resetResult } = useCleanupActions();

  React.useEffect(() => {
    if (!plan) {
      navigate('/cleanup/select');
    }
  }, [navigate, plan]);

  if (!plan) {
    return null;
  }

  const foldersSelected = plan.items.filter((item) => item.dir).length;
  const filesSelected = plan.items.filter((item) => !item.dir).length;

  const onDelete = async () => {
    const ok = window.confirm(
      [
        'Permanent delete warning',
        '',
        `Selected folders: ${foldersSelected}`,
        `Selected files: ${filesSelected}`,
        `Contained folders: ${plan.totalFolders}`,
        `Contained files: ${plan.totalFiles}`,
        `Total size: ${humanBytes(plan.totalSize)}`,
        '',
        'This cannot be undone. Delete these items?',
      ].join('\n'),
    );

    if (!ok) {
      return;
    }

    await deleteSelected();
  };

  const onBack = () => {
    resetResult();
    navigate('/cleanup/select');
  };

  return (
    <div className="flex flex-1">
      <Panel title="Delete Confirmation">
        <div className="space-y-4">
          {error !== '' && (
            <div className="rounded border border-red-700 bg-red-100 p-3 text-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          {deleted && (
            <div className="rounded border border-green-700 bg-green-100 p-3 text-green-800 dark:bg-green-950 dark:text-green-200">
              Delete completed.
            </div>
          )}

          <div className="grid grid-cols-5 gap-3 text-slate-700 dark:text-slate-300">
            <div className="rounded bg-neutral-200 p-3 dark:bg-gray-900">
              <div className="text-sm text-slate-500">Selected folders</div>
              <div className="text-xl font-semibold">{foldersSelected}</div>
            </div>
            <div className="rounded bg-neutral-200 p-3 dark:bg-gray-900">
              <div className="text-sm text-slate-500">Selected files</div>
              <div className="text-xl font-semibold">{filesSelected}</div>
            </div>
            <div className="rounded bg-neutral-200 p-3 dark:bg-gray-900">
              <div className="text-sm text-slate-500">Total folders</div>
              <div className="text-xl font-semibold">{plan.totalFolders}</div>
            </div>
            <div className="rounded bg-neutral-200 p-3 dark:bg-gray-900">
              <div className="text-sm text-slate-500">Total files</div>
              <div className="text-xl font-semibold">{plan.totalFiles}</div>
            </div>
            <div className="rounded bg-neutral-200 p-3 dark:bg-gray-900">
              <div className="text-sm text-slate-500">Total size</div>
              <div className="text-xl font-semibold">
                {humanBytes(plan.totalSize)}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-300 text-slate-500 dark:border-gray-700">
                <tr>
                  <th className="py-2 pr-4">Path</th>
                  <th className="py-2 pr-4">Disk</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4 text-right">Folders</th>
                  <th className="py-2 pr-4 text-right">Files</th>
                  <th className="py-2 text-right">Size</th>
                </tr>
              </thead>
              <tbody>
                {plan.items.map((item) => (
                  <tr
                    key={item.full}
                    className="border-b border-slate-200 dark:border-gray-800"
                  >
                    <td className="break-all py-2 pr-4">{item.path}</td>
                    <td className="break-all py-2 pr-4">{item.disk}</td>
                    <td className="py-2 pr-4">{item.dir ? 'Folder' : 'File'}</td>
                    <td className="py-2 pr-4 text-right">{item.folders}</td>
                    <td className="py-2 pr-4 text-right">{item.files}</td>
                    <td className="py-2 text-right">{humanBytes(item.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <Button label="Back" variant="secondary" onClick={onBack} />
            <Button
              label={deleting ? 'Deleting ...' : 'Delete Permanently'}
              variant="primary"
              disabled={deleting || deleted}
              onClick={onDelete}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
};
