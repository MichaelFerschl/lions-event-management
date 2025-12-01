'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteCategory } from './actions';

interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  sortOrder: number;
  _count: {
    templates: number;
    plannedEvents: number;
  };
}

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Möchten Sie die Terminart "${name}" wirklich löschen?`)) {
      return;
    }

    setDeletingId(id);
    setError(null);

    const result = await deleteCategory(id);

    if (!result.success) {
      setError(result.error || 'Fehler beim Löschen');
    }

    setDeletingId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Terminart
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Farbe
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vorlagen
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Termine
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Typ
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: category.color || '#00338D' }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-200"
                    style={{ backgroundColor: category.color || '#00338D' }}
                  />
                  <span className="text-sm text-gray-500 font-mono">
                    {category.color || '#00338D'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {category._count.templates}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {category._count.plannedEvents}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {category.isDefault ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    System
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Benutzerdefiniert
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/planning/categories/${category.id}`}
                    className="text-lions-blue hover:text-blue-700"
                  >
                    Bearbeiten
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deletingId === category.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === category.id ? 'Löschen...' : 'Löschen'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
