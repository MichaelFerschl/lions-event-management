import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime } from '@/lib/format';
import { EventWithCount } from '@/types';

interface EventCardProps {
  event: EventWithCount;
  locale?: string;
}

export function EventCard({ event, locale = 'de' }: EventCardProps) {
  const isOnline = event.isOnline;
  const isCancelled = event.isCancelled;

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex flex-col space-y-3">
          {/* Header: Date and Type */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-lions-blue">
                {formatDate(event.startDate, locale)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                {locale === 'en' && event.titleEn ? event.titleEn : event.title}
              </h3>
            </div>
            {isCancelled && (
              <Badge variant="error">
                {locale === 'en' ? 'Cancelled' : 'Abgesagt'}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-gray-600">
            {/* Time */}
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
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
              {formatTime(event.startDate, locale)}
            </div>

            {/* Location */}
            <div className="flex items-center">
              {isOnline ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <span>{locale === 'en' ? 'Online' : 'Online'}</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{event.location || '-'}</span>
                </>
              )}
            </div>

            {/* Participants (if registration required) */}
            {event.registrationRequired && event._count && (
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>
                  {event._count.registrations}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                  {locale === 'en' ? ' participants' : ' Teilnehmer'}
                </span>
              </div>
            )}
          </div>

          {/* Footer: Category */}
          {event.category && (
            <div className="pt-2 border-t">
              <Badge
                variant="info"
                className="text-xs"
                style={{
                  backgroundColor: event.category.color + '20',
                  borderColor: event.category.color,
                  color: event.category.color,
                }}
              >
                {locale === 'en' && event.category.nameEn
                  ? event.category.nameEn
                  : event.category.name}
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
