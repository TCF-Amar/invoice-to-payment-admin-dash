import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => onStepClick?.(index)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-all',
              index < currentStep
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : index === currentStep
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                  : 'border-white/10 bg-white/5 text-slate-400'
            )}
          >
            {index < currentStep ? (
              <Check className="h-5 w-5" />
            ) : (
              <span>{index + 1}</span>
            )}
          </button>

          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-1 flex-1 mx-2 rounded-full transition-colors',
                index < currentStep ? 'bg-emerald-500' : 'bg-white/10'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const StepperLabel: React.FC<{ steps: Step[]; currentStep: number }> = ({ steps, currentStep }) => {
  return (
    <div className="text-center">
      <p className="text-sm text-slate-400">
        Step {currentStep + 1} of {steps.length}
      </p>
      <p className="text-lg font-semibold text-slate-100">{steps[currentStep]?.label}</p>
    </div>
  );
};
