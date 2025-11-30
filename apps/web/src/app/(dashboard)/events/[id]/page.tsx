import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime, formatCurrency } from '@/lib/format';

type Registration = {
  id: string;
  status: string;
  guestCount: number;
  guestNames: string[];
  isPaid: boolean;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
};

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await getCurrentTenant();
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'de';

  // Fetch event with relations
  const event = await db.event.findUnique({
    where: {
      id: params.id,
      tenantId: tenant.id,
    },
    include: {
      category: true,
      createdBy: true,
      registrations: {
        include: {
          member: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const isPast = new Date(event.startDate) < new Date();
  const registeredCount = event.registrations.filter(
    (r: Registration) => r.status === 'REGISTERED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/events">
        <Button variant="ghost" size="sm">
          ← {locale === 'en' ? 'Back to Events' : 'Zurück zu Veranstaltungen'}
        </Button>
      </Link>

      {/* Event Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'en' && event.titleEn ? event.titleEn : event.title}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-lg text-gray-600">
                {formatDate(event.startDate, locale)}
              </span>
              {event.category && (
                <Badge
                  variant="info"
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
              )}
              {event.isCancelled && (
                <Badge variant="error">
                  {locale === 'en' ? 'Cancelled' : 'Abgesagt'}
                </Badge>
              )}
            </div>
          </div>
          {!isPast && !event.isCancelled && (
            <Button variant="primary">
              {locale === 'en' ? 'Register' : 'Anmelden'}
            </Button>
          )}
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'en' ? 'Description' : 'Beschreibung'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {locale === 'en' && event.descriptionEn
                  ? event.descriptionEn
                  : event.description}
              </p>
            </CardContent>
          </Card>

          {/* Participants */}
          {event.registrationRequired && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {locale === 'en' ? 'Participants' : 'Teilnehmer'} (
                  {registeredCount}
                  {event.maxParticipants && ` / ${event.maxParticipants}`})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {event.registrations.length > 0 ? (
                  <div className="space-y-3">
                    {event.registrations
                      .filter((r: Registration) => r.status === 'REGISTERED')
                      .map((registration: Registration) => (
                        <div
                          key={registration.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-lions-blue text-white flex items-center justify-center text-sm font-medium">
                              {registration.member.firstName[0]}
                              {registration.member.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {registration.member.firstName}{' '}
                                {registration.member.lastName}
                              </div>
                              {registration.guestCount > 0 && (
                                <div className="text-sm text-gray-500">
                                  + {registration.guestCount}{' '}
                                  {locale === 'en'
                                    ? 'guest(s)'
                                    : 'Gast/Gäste'}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              registration.isPaid ? 'success' : 'warning'
                            }
                          >
                            {registration.isPaid
                              ? locale === 'en'
                                ? 'Paid'
                                : 'Bezahlt'
                              : locale === 'en'
                                ? 'Unpaid'
                                : 'Unbezahlt'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {locale === 'en'
                      ? 'No registrations yet'
                      : 'Noch keine Anmeldungen'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'en' ? 'Event Details' : 'Veranstaltungsdetails'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Time */}
              <div>
                <div className="text-sm font-medium text-gray-500">
                  {locale === 'en' ? 'Time' : 'Uhrzeit'}
                </div>
                <div className="text-gray-900 mt-1">
                  {formatTime(event.startDate, locale)}
                  {event.endDate && ` - ${formatTime(event.endDate, locale)}`}
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="text-sm font-medium text-gray-500">
                  {locale === 'en' ? 'Location' : 'Ort'}
                </div>
                <div className="text-gray-900 mt-1">
                  {event.isOnline ? (
                    <div className="flex items-center space-x-2">
                      <span>{locale === 'en' ? 'Online' : 'Online'}</span>
                      {event.onlineUrl && (
                        <a
                          href={event.onlineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lions-blue hover:underline text-sm"
                        >
                          {locale === 'en' ? 'Join' : 'Beitreten'}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div>
                      {event.location || '-'}
                      {event.locationUrl && (
                        <a
                          href={event.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lions-blue hover:underline text-sm block"
                        >
                          {locale === 'en' ? 'View Map' : 'Karte anzeigen'}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cost */}
              {(Number(event.costMember) > 0 ||
                Number(event.costGuest) > 0) && (
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    {locale === 'en' ? 'Cost' : 'Kosten'}
                  </div>
                  <div className="text-gray-900 mt-1 space-y-1">
                    <div className="text-sm">
                      {locale === 'en' ? 'Members' : 'Mitglieder'}:{' '}
                      {formatCurrency(Number(event.costMember), locale)}
                    </div>
                    {event.allowGuests && Number(event.costGuest) > 0 && (
                      <div className="text-sm">
                        {locale === 'en' ? 'Guests' : 'Gäste'}:{' '}
                        {formatCurrency(Number(event.costGuest), locale)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Registration Deadline */}
              {event.registrationDeadline && (
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    {locale === 'en'
                      ? 'Registration Deadline'
                      : 'Anmeldefrist'}
                  </div>
                  <div className="text-gray-900 mt-1">
                    {formatDate(event.registrationDeadline, locale)}
                  </div>
                </div>
              )}

              {/* Type */}
              <div>
                <div className="text-sm font-medium text-gray-500">
                  {locale === 'en' ? 'Type' : 'Typ'}
                </div>
                <div className="text-gray-900 mt-1">
                  {event.type.replace(/_/g, ' ')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
