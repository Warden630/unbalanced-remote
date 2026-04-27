import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '~/shared/buttons/button';
import { Icon } from '~/shared/icons/icon';
import { Stepper } from '~/shared/stepper/stepper';
import { useUnraidRoute } from '~/state/unraid';
import { getFill, getVariant } from '~/helpers/styling';
import {
  useCleanupActions,
  useCleanupSelected,
  useCleanupSource,
} from '~/state/cleanup';

const config = [
  { navTo: 'select', title: 'Select', subtitle: 'Choose items' },
  { navTo: 'confirm', title: 'Confirm', subtitle: 'Review & delete' },
];

export const Navbar: React.FunctionComponent = () => {
  const route = useUnraidRoute();
  const navigate = useNavigate();
  const source = useCleanupSource();
  const selected = useCleanupSelected();
  const { buildPlan, resetResult } = useCleanupActions();

  const currentStep = route === '/cleanup/confirm' ? 2 : 1;
  const nextDisabled =
    route !== '/cleanup/select' || source === '' || selected.length === 0;

  const onPrev = () => {
    resetResult();
    navigate('/cleanup/select');
  };

  const onNext = async () => {
    try {
      await buildPlan();
      navigate('/cleanup/confirm');
    } catch (e) {
      // The select panel renders the error stored by buildPlan.
    }
  };

  return (
    <div className="flex flex-row items-center justify-between mb-4">
      <div className="flex justify-start">
        <Button
          label="Prev"
          variant={getVariant(route === '/cleanup/confirm')}
          leftIcon={
            <Icon
              name="prev"
              size={20}
              style={getFill(route === '/cleanup/confirm')}
            />
          }
          disabled={route !== '/cleanup/confirm'}
          onClick={onPrev}
        />
      </div>

      <div className="flex flex-row flex-1 items-center justify-start">
        <span className="mx-2" />
        <Stepper steps={2} currentStep={currentStep} config={config} />
      </div>

      <div className="flex items-center justify-end">
        <Button
          label="Next"
          variant={getVariant(route === '/cleanup/select')}
          rightIcon={
            <Icon
              name="next"
              size={20}
              style={getFill(route === '/cleanup/select')}
            />
          }
          disabled={nextDisabled}
          onClick={onNext}
        />
      </div>
    </div>
  );
};
