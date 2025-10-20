import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, title: 'Connect Accounts' },
  { number: 2, title: 'Script & Voice' },
  { number: 3, title: 'Metadata' },
  { number: 4, title: 'Preview' },
  { number: 5, title: 'Upload' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.title} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
            {currentStep > step.number ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-brand-primary" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center bg-brand-primary rounded-full"
                >
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 w-max">
                    <span className="text-sm font-medium text-gray-300">{step.title}</span>
                </div>
              </>
            ) : currentStep === step.number ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-600" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center bg-gray-700 rounded-full border-2 border-brand-primary"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 bg-brand-primary rounded-full" aria-hidden="true" />
                </div>
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 w-max">
                    <span className="text-sm font-medium text-brand-primary">{step.title}</span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-600" />
                </div>
                <div
                  className="group relative flex h-8 w-8 items-center justify-center bg-gray-700 rounded-full border-2 border-gray-600"
                >
                  <span className="h-2.5 w-2.5 bg-transparent rounded-full" aria-hidden="true" />
                </div>
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 w-max">
                    <span className="text-sm font-medium text-gray-500">{step.title}</span>
                </div>
              </>
            )}
             {stepIdx < steps.length - 1 && (
              <div className="absolute left-full top-1/2 w-full -translate-y-1/2 -z-10 h-0.5"
                   aria-hidden="true"
                   style={{ background: currentStep > step.number ? 'var(--brand-primary)' : '#4B5563' /* bg-gray-600 */, width: 'calc(100% - 2rem)', marginLeft: '1rem', marginRight: '1rem' }} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
