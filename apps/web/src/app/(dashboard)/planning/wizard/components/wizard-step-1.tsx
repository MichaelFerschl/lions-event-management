'use client';

import {
  formatDateForInput,
  parseDateFromInput,
  getDefaultYearName,
  getDefaultEndDate,
} from '../utils';

interface WizardStep1Props {
  data: {
    yearName: string;
    startDate: Date;
    endDate: Date;
  };
  onChange: (data: { yearName: string; startDate: Date; endDate: Date }) => void;
}

export function WizardStep1({ data, onChange }: WizardStep1Props) {
  const handleStartDateChange = (dateString: string) => {
    const newStartDate = parseDateFromInput(dateString);
    const newEndDate = getDefaultEndDate(newStartDate);
    const newYearName = getDefaultYearName(newStartDate);

    onChange({
      yearName: newYearName,
      startDate: newStartDate,
      endDate: newEndDate,
    });
  };

  const handleEndDateChange = (dateString: string) => {
    const newEndDate = parseDateFromInput(dateString);
    onChange({
      ...data,
      endDate: newEndDate,
    });
  };

  const handleYearNameChange = (name: string) => {
    onChange({
      ...data,
      yearName: name,
    });
  };

  // Calculate duration in months
  const durationMonths = Math.round(
    (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const isValidDateRange = data.endDate > data.startDate;

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-2xl">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-blue-800">Was ist ein Lionsjahr?</h3>
              <p className="text-sm text-blue-700 mt-1">
                Das Lionsjahr beginnt traditionell am 1. Juli und endet am 30. Juni
                des Folgejahres. In diesem Zeitraum werden alle Clubaktivitäten,
                Meetings und Events geplant. Die Amtszeit des Präsidenten richtet
                sich ebenfalls nach dem Lionsjahr.
              </p>
            </div>
          </div>
        </div>

        {/* Year Name */}
        <div className="mb-6">
          <label
            htmlFor="yearName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name des Lionsjahres *
          </label>
          <input
            type="text"
            id="yearName"
            value={data.yearName}
            onChange={(e) => handleYearNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
            placeholder="z.B. Lionsjahr 2024/2025"
          />
          <p className="mt-1 text-sm text-gray-500">
            Der Name wird automatisch basierend auf dem Startdatum vorgeschlagen
          </p>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Startdatum *
            </label>
            <input
              type="date"
              id="startDate"
              value={formatDateForInput(data.startDate)}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
            />
            <p className="mt-1 text-sm text-gray-500">Standard: 1. Juli</p>
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enddatum *
            </label>
            <input
              type="date"
              id="endDate"
              value={formatDateForInput(data.endDate)}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900 ${
                !isValidDateRange ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-sm text-gray-500">Standard: 30. Juni</p>
          </div>
        </div>

        {/* Validation Error */}
        {!isValidDateRange && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">
                Das Enddatum muss nach dem Startdatum liegen.
              </span>
            </div>
          </div>
        )}

        {/* Duration Info */}
        {isValidDateRange && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Zusammenfassung</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Zeitraum:</span>
                <div className="font-medium text-gray-900">
                  {data.startDate.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  bis{' '}
                  {data.endDate.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Dauer:</span>
                <div className="font-medium text-gray-900">
                  ca. {durationMonths} Monate
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
