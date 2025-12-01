'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTemplate, updateTemplate } from './actions';

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface TemplateFormProps {
  template?: {
    id: string;
    name: string;
    categoryId: string;
    description: string | null;
    defaultInvitationText: string | null;
    isMandatory: boolean;
    defaultMonth: number | null;
    defaultDurationMinutes: number;
    isActive: boolean;
  };
  categories: Category[];
}

const monthOptions = [
  { value: 1, label: 'Januar' },
  { value: 2, label: 'Februar' },
  { value: 3, label: 'März' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Dezember' },
];

export function TemplateForm({ template, categories }: TemplateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(template?.name || '');
  const [categoryId, setCategoryId] = useState(template?.categoryId || '');
  const [description, setDescription] = useState(template?.description || '');
  const [defaultInvitationText, setDefaultInvitationText] = useState(
    template?.defaultInvitationText || ''
  );
  const [isMandatory, setIsMandatory] = useState(template?.isMandatory || false);
  const [defaultMonth, setDefaultMonth] = useState<number | undefined>(
    template?.defaultMonth || undefined
  );
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(
    template?.defaultDurationMinutes || 120
  );
  const [isActive, setIsActive] = useState(template?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = {
      name,
      categoryId,
      description: description || undefined,
      defaultInvitationText: defaultInvitationText || undefined,
      isMandatory,
      defaultMonth,
      defaultDurationMinutes,
      isActive,
    };

    const result = template
      ? await updateTemplate(template.id, data)
      : await createTemplate(data);

    if (result.success) {
      router.push('/planning/templates');
    } else {
      setError(result.error || 'Ein Fehler ist aufgetreten');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
              placeholder="z.B. Mitgliederversammlung"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Terminart *
            </label>
            <select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
            >
              <option value="">Bitte wählen...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Beschreibung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
              placeholder="Kurze Beschreibung der Vorlage..."
            />
          </div>

          {/* Default Month */}
          <div>
            <label
              htmlFor="defaultMonth"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Standard-Monat
            </label>
            <select
              id="defaultMonth"
              value={defaultMonth || ''}
              onChange={(e) =>
                setDefaultMonth(e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
            >
              <option value="">Kein Standard-Monat</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Monat, in dem dieser Termin typischerweise stattfindet
            </p>
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dauer (Minuten) *
            </label>
            <input
              type="number"
              id="duration"
              value={defaultDurationMinutes}
              onChange={(e) => setDefaultDurationMinutes(parseInt(e.target.value) || 60)}
              min={15}
              step={15}
              required
              className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="w-4 h-4 text-lions-blue border-gray-300 rounded focus:ring-lions-blue"
              />
              <span className="text-sm font-medium text-gray-700">
                Pflichttermin
              </span>
            </label>
            <p className="text-sm text-gray-500 ml-7">
              Pflichttermine werden bei der Jahresplanung hervorgehoben
            </p>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-lions-blue border-gray-300 rounded focus:ring-lions-blue"
              />
              <span className="text-sm font-medium text-gray-700">Aktiv</span>
            </label>
            <p className="text-sm text-gray-500 ml-7">
              Inaktive Vorlagen werden bei der Planung nicht angezeigt
            </p>
          </div>
        </div>

        {/* Right Column - Invitation Text */}
        <div>
          <label
            htmlFor="invitationText"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Standard-Einladungstext
          </label>
          <textarea
            id="invitationText"
            value={defaultInvitationText}
            onChange={(e) => setDefaultInvitationText(e.target.value)}
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent font-mono text-sm text-gray-900"
            placeholder="Einladungstext, der bei der Terminplanung vorausgefüllt wird..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Dieser Text wird bei der Terminplanung als Vorlage verwendet
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name || !categoryId}
          className="px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Speichern...'
            : template
              ? 'Änderungen speichern'
              : 'Vorlage erstellen'}
        </button>
      </div>
    </form>
  );
}
