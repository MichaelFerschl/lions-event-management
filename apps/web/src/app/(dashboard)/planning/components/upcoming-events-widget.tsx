import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { getUpcomingPlannedEvents } from '../years/actions';

export async function UpcomingEventsWidget() {
  const tTime = await getTranslations('time');
  const tDashboard = await getTranslations('dashboard');
  const tEvents = await getTranslations('events');

  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'de';

  const events = await getUpcomingPlannedEvents(3);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate days until event
  const getDaysUntil = (date: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return tTime('today');
    if (diff === 1) return tTime('tomorrow');
    return tTime('inDays', { count: diff });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">{tDashboard('upcomingEvents')}</h3>
        <Link
          href="/planning/years"
          className="text-sm text-lions-blue hover:underline"
        >
          {tDashboard('viewAll')} →
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="p-6 text-center">
          <svg
            className="w-10 h-10 text-gray-300 mx-auto mb-2"
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
          <p className="text-sm text-gray-500">{tDashboard('noUpcomingEvents')}</p>
          <Link
            href="/planning/wizard"
            className="inline-block mt-2 text-sm text-lions-blue hover:underline"
          >
            {tDashboard('planLionsYear')}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {events.map((event) => (
            <div key={event.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                {/* Date indicator */}
                <div className="flex-shrink-0 w-12 text-center">
                  <div
                    className="w-12 h-12 rounded-lg flex flex-col items-center justify-center"
                    style={{
                      backgroundColor: event.category?.color
                        ? `${event.category.color}20`
                        : '#00338D20',
                    }}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{
                        color: event.category?.color || '#00338D',
                      }}
                    >
                      {new Date(event.date).getDate()}
                    </span>
                    <span
                      className="text-xs uppercase"
                      style={{
                        color: event.category?.color || '#00338D',
                      }}
                    >
                      {new Date(event.date).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-US', {
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {event.title}
                    </h4>
                    {event.isMandatory && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                        {tEvents('types.GENERAL_ASSEMBLY')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {formatDate(event.date)} • {formatTime(event.date)}
                  </div>
                  {event.category && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: event.category.color || '#00338D',
                        }}
                      />
                      <span className="text-xs text-gray-500">
                        {event.category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Days until badge */}
                <div className="flex-shrink-0">
                  <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                    {getDaysUntil(event.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
