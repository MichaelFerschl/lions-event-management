'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteTemplate } from './actions';

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  isMandatory: boolean;
  defaultMonth: number | null;
  defaultDurationMinutes: number;
  isActive: boolean;
  category: Category;
  _count: {
    plannedEvents: number;
  };
}

interface TemplateListProps {
  templates: Template[];
  categories: Category[];
  monthNames: string[];
}

export function TemplateList({ templates, categories, monthNames }: TemplateListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category.id === selectedCategory);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Möchten Sie die Vorlage "${name}" wirklich löschen?`)) {
      return;
    }

    setDeletingId(id);
    setError(null);

    const result = await deleteTemplate(id);

    if (!result.success) {
      setError(result.error || 'Fehler beim Löschen');
    }

    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          Filter nach Terminart:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent"
        >
          <option value="all">Alle Terminarten</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {filteredTemplates.length} von {templates.length} Vorlagen
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5 ${
              !template.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: template.category.color || '#00338D' }}
                />
                <span className="text-sm text-gray-500">{template.category.name}</span>
              </div>
              <div className="flex gap-1">
                {template.isMandatory && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Pflicht
                  </span>
                )}
                {!template.isActive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    Inaktiv
                  </span>
                )}
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>

            {template.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              {template.defaultMonth && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{monthNames[template.defaultMonth - 1]}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{template.defaultDurationMinutes} Min.</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-gray-500">
                {template._count.plannedEvents} Termin(e)
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/planning/templates/${template.id}`}
                  className="text-sm text-lions-blue hover:text-blue-700"
                >
                  Bearbeiten
                </Link>
                <button
                  onClick={() => handleDelete(template.id, template.name)}
                  disabled={deletingId === template.id}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {deletingId === template.id ? '...' : 'Löschen'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Keine Vorlagen in dieser Kategorie gefunden.
          </p>
        </div>
      )}
    </div>
  );
}
