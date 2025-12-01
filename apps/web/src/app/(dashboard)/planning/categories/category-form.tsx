'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, updateCategory } from './actions';

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
    sortOrder: number;
  };
}

const iconOptions = [
  { value: 'users', label: 'Personen' },
  { value: 'star', label: 'Stern' },
  { value: 'clipboard', label: 'Klemmbrett' },
  { value: 'briefcase', label: 'Koffer' },
  { value: 'calendar', label: 'Kalender' },
  { value: 'heart', label: 'Herz' },
  { value: 'flag', label: 'Flagge' },
  { value: 'trophy', label: 'Pokal' },
  { value: 'dots', label: 'Punkte' },
];

const colorPresets = [
  '#00338D', // Lions Blue
  '#EBB700', // Lions Gold
  '#FF5B35', // Orange
  '#7A2582', // Purple
  '#407CCA', // Light Blue
  '#00AB68', // Green
  '#DC2626', // Red
  '#6B7280', // Gray
];

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#00338D');
  const [icon, setIcon] = useState(category?.icon || '');
  const [sortOrder, setSortOrder] = useState(category?.sortOrder || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = { name, color, icon: icon || undefined, sortOrder };

    const result = category
      ? await updateCategory(category.id, data)
      : await createCategory(data);

    if (result.success) {
      router.push('/planning/categories');
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
          placeholder="z.B. Clubabend"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Farbe *</label>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === preset ? 'border-gray-900 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              pattern="^#[0-9A-Fa-f]{6}$"
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Icon */}
      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
          Icon
        </label>
        <select
          id="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
        >
          <option value="">Kein Icon</option>
          {iconOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
          Sortierung
        </label>
        <input
          type="number"
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
          min={0}
          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
        />
        <p className="mt-1 text-sm text-gray-500">
          Niedrigere Zahlen werden zuerst angezeigt
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Vorschau</label>
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium">{name || 'Terminart'}</span>
          {icon && (
            <span className="text-sm text-gray-500">({iconOptions.find(o => o.value === icon)?.label})</span>
          )}
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
          disabled={isSubmitting || !name}
          className="px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Speichern...'
            : category
              ? 'Änderungen speichern'
              : 'Terminart erstellen'}
        </button>
      </div>
    </form>
  );
}
