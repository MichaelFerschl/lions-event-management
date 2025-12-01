import Link from 'next/link';
import { CategoryForm } from '../category-form';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link href="/planning" className="hover:text-lions-blue">
            Jahresplanung
          </Link>
          <span className="mx-2">/</span>
          <Link href="/planning/categories" className="hover:text-lions-blue">
            Terminarten
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Neue Terminart</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Neue Terminart</h1>
        <p className="text-gray-600 mt-1">
          Erstellen Sie eine neue Kategorie für Ihre Termine
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <CategoryForm />
      </div>
    </div>
  );
}
