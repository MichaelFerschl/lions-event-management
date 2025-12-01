'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type {
  WizardData,
  WizardInitialData,
  PlannedEventDraft,
  MandatoryEventPlacement,
} from './types';
import { WIZARD_STEPS } from './types';
import {
  getDefaultStartDate,
  getDefaultEndDate,
  getDefaultYearName,
  getSuggestedDateForTemplate,
} from './utils';
import { WizardStep1 } from './components/wizard-step-1';
import { WizardStep2 } from './components/wizard-step-2';
import { WizardStep3 } from './components/wizard-step-3';
import { WizardStep4 } from './components/wizard-step-4';
import { WizardStep5 } from './components/wizard-step-5';
import { saveLionsYear } from './actions';

interface WizardContainerProps {
  initialData: WizardInitialData;
}

export function WizardContainer({ initialData }: WizardContainerProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize wizard data
  const defaultStartDate = getDefaultStartDate();
  const [wizardData, setWizardData] = useState<WizardData>(() => {
    // Initialize mandatory placements
    const mandatoryTemplates = initialData.templates.filter((t) => t.isMandatory);
    const mandatoryPlacements: MandatoryEventPlacement[] = mandatoryTemplates.map(
      (template) => {
        const suggestedDate = getSuggestedDateForTemplate(
          template.defaultMonth,
          defaultStartDate,
          getDefaultEndDate(defaultStartDate)
        );

        return {
          templateId: template.id,
          template,
          date: suggestedDate,
          invitationText: template.defaultInvitationText || '',
          isPlaced: suggestedDate !== null,
        };
      }
    );

    return {
      yearName: getDefaultYearName(defaultStartDate),
      startDate: defaultStartDate,
      endDate: getDefaultEndDate(defaultStartDate),
      selectedRuleIds: initialData.recurringRules.map((r) => r.id), // Select all by default
      generatedEvents: [],
      mandatoryPlacements,
      templateEvents: [],
      additionalEvents: [],
      setAsActive: true,
      allEvents: [],
    };
  });

  // Combine all events for display and saving
  const allEvents = useMemo(() => {
    const combined = [
      ...wizardData.generatedEvents,
      ...wizardData.templateEvents,
      ...wizardData.additionalEvents,
    ];

    // Sort by date
    return combined.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [
    wizardData.generatedEvents,
    wizardData.templateEvents,
    wizardData.additionalEvents,
  ]);

  // Update functions for each step
  const updateStep1Data = useCallback(
    (data: { yearName: string; startDate: Date; endDate: Date }) => {
      setWizardData((prev) => {
        // Recalculate mandatory placements when dates change
        const mandatoryTemplates = initialData.templates.filter(
          (t) => t.isMandatory
        );
        const mandatoryPlacements: MandatoryEventPlacement[] =
          mandatoryTemplates.map((template) => {
            const suggestedDate = getSuggestedDateForTemplate(
              template.defaultMonth,
              data.startDate,
              data.endDate
            );

            return {
              templateId: template.id,
              template,
              date: suggestedDate,
              invitationText: template.defaultInvitationText || '',
              isPlaced: suggestedDate !== null,
            };
          });

        return {
          ...prev,
          ...data,
          // Clear generated events when dates change
          generatedEvents: [],
          mandatoryPlacements,
          templateEvents: [],
        };
      });
    },
    [initialData.templates]
  );

  const updateStep2Data = useCallback(
    (data: { selectedRuleIds: string[]; generatedEvents: PlannedEventDraft[] }) => {
      setWizardData((prev) => ({
        ...prev,
        ...data,
      }));
    },
    []
  );

  const updateStep3Data = useCallback(
    (data: {
      mandatoryPlacements: MandatoryEventPlacement[];
      templateEvents: PlannedEventDraft[];
    }) => {
      setWizardData((prev) => ({
        ...prev,
        ...data,
      }));
    },
    []
  );

  const updateStep4Data = useCallback((additionalEvents: PlannedEventDraft[]) => {
    setWizardData((prev) => ({
      ...prev,
      additionalEvents,
    }));
  }, []);

  const updateSetAsActive = useCallback((setAsActive: boolean) => {
    setWizardData((prev) => ({
      ...prev,
      setAsActive,
    }));
  }, []);

  // Navigation
  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          wizardData.yearName.trim() !== '' &&
          wizardData.startDate < wizardData.endDate
        );
      case 2:
        return true; // Can proceed even without recurring events
      case 3:
        return true; // Can proceed even with unplaced mandatory events (warning shown)
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, wizardData]);

  const handleNext = () => {
    if (currentStep < 5 && canGoNext()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    router.push('/planning');
  };

  const handleFinish = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await saveLionsYear({
        yearName: wizardData.yearName,
        startDate: wizardData.startDate,
        endDate: wizardData.endDate,
        setAsActive: wizardData.setAsActive,
        allEvents,
        mandatoryPlacements: wizardData.mandatoryPlacements,
      });

      if (result.success) {
        router.push(`/planning?created=${result.lionsYearId}`);
      } else {
        setSaveError(result.error || 'Ein unbekannter Fehler ist aufgetreten');
      }
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Ein unbekannter Fehler ist aufgetreten'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WizardStep1
            data={{
              yearName: wizardData.yearName,
              startDate: wizardData.startDate,
              endDate: wizardData.endDate,
            }}
            onChange={updateStep1Data}
          />
        );
      case 2:
        return (
          <WizardStep2
            recurringRules={initialData.recurringRules}
            selectedRuleIds={wizardData.selectedRuleIds}
            generatedEvents={wizardData.generatedEvents}
            startDate={wizardData.startDate}
            endDate={wizardData.endDate}
            onChange={updateStep2Data}
          />
        );
      case 3:
        return (
          <WizardStep3
            templates={initialData.templates}
            mandatoryPlacements={wizardData.mandatoryPlacements}
            startDate={wizardData.startDate}
            endDate={wizardData.endDate}
            onChange={updateStep3Data}
          />
        );
      case 4:
        return (
          <WizardStep4
            categories={initialData.categories}
            templates={initialData.templates}
            startDate={wizardData.startDate}
            endDate={wizardData.endDate}
            existingEvents={[
              ...wizardData.generatedEvents,
              ...wizardData.templateEvents,
            ]}
            additionalEvents={wizardData.additionalEvents}
            onChange={updateStep4Data}
          />
        );
      case 5:
        return (
          <WizardStep5
            yearName={wizardData.yearName}
            startDate={wizardData.startDate}
            endDate={wizardData.endDate}
            categories={initialData.categories}
            mandatoryPlacements={wizardData.mandatoryPlacements}
            allEvents={allEvents}
            setAsActive={wizardData.setAsActive}
            onSetAsActiveChange={updateSetAsActive}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link href="/planning" className="hover:text-lions-blue">
            Jahresplanung
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Neues Lionsjahr planen</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">
          Neues Lionsjahr planen
        </h1>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.number}
              className={`flex items-center ${
                index < WIZARD_STEPS.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep === step.number
                      ? 'bg-lions-blue text-white'
                      : currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      currentStep === step.number
                        ? 'text-lions-blue'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow">{renderStepContent()}</div>

      {/* Save Error */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">Fehler beim Speichern</span>
          </div>
          <p className="text-sm text-red-600 mt-1 ml-7">{saveError}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Abbrechen
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                ← Zurück
              </button>
            )}

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="px-6 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Speichern...
                  </>
                ) : (
                  'Lionsjahr erstellen'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Planung abbrechen?
            </h3>
            <p className="text-gray-600 mb-6">
              Möchten Sie die Planung wirklich abbrechen? Alle eingegebenen Daten
              gehen verloren.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zurück zur Planung
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
