// Shared types for the application

export type EventWithCount = {
  id: string;
  title: string;
  titleEn: string | null;
  description: string;
  descriptionEn: string | null;
  type: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  locationUrl: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  registrationRequired: boolean;
  registrationDeadline: Date | null;
  maxParticipants: number | null;
  allowGuests: boolean;
  maxGuestsPerMember: number;
  costMember: any; // Prisma Decimal type
  costGuest: any; // Prisma Decimal type
  visibility: string;
  isPublished: boolean;
  isCancelled: boolean;
  tenantId: string;
  categoryId: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  reminderDays: number[];
  _count?: {
    registrations: number;
  };
  category?: {
    id: string;
    name: string;
    nameEn: string | null;
    color: string;
    icon: string | null;
  } | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  registrations?: Array<{
    id: string;
    status: string;
    guestCount: number;
    guestNames: string[];
    isPaid: boolean;
    totalCost: any; // Prisma Decimal type
    member: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string | null;
    };
  }>;
};

export type MemberBasic = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: string;
};

export type ActivityTypeBasic = {
  id: string;
  name: string;
  nameEn: string | null;
  color: string;
  icon: string | null;
};
