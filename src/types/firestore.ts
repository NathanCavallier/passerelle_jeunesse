/**
 * Types TypeScript pour la base de données Firestore
 * Passerelle Jeunesse
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USERS
// ============================================================================

export type UserRole = 'parent' | 'accompanist' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type Language = 'fr' | 'en' | 'de';

export interface Address {
    street: string;
    postalCode: string;
    city: string;
    country: string;
}

export interface UserPreferences {
    language: Language;
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    newsletter: boolean;
}

export interface EmergencyContact {
    name: string;
    phoneNumber: string;
    relationship: string;
}

export interface ParentProfile {
    emergencyContact: EmergencyContact;
    numberOfYoungsters: number;
    totalBookings: number;
    totalSpent: number;
    loyaltyPoints: number;
    referralCode: string;
}

export interface DayAvailability {
    start: string;
    end: string;
}

export interface WeeklyAvailability {
    monday: DayAvailability[];
    tuesday: DayAvailability[];
    wednesday: DayAvailability[];
    thursday: DayAvailability[];
    friday: DayAvailability[];
    saturday: DayAvailability[];
    sunday: DayAvailability[];
}

export interface DocumentVerification {
    verified: boolean;
    verifiedAt?: Timestamp;
    expiresAt?: Timestamp;
    policyNumber?: string;
}

export interface AccompanistProfile {
    biography: string;
    experience: string;
    certifications: string[];
    availability: WeeklyAvailability;
    zones: string[];
    longDistanceAvailable: boolean;
    maxYoungsters: number;
    rating: number;
    totalMissions: number;
    totalEarnings: number;
    documents: {
        criminalRecord: DocumentVerification;
        insurance: DocumentVerification;
        idCard: DocumentVerification;
    };
}

export interface User {
    uid: string;
    email: string;
    emailVerified: boolean;
    role: UserRole;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: Address;
    photoURL?: string;
    preferences: UserPreferences;
    parentProfile?: ParentProfile;
    accompanistProfile?: AccompanistProfile;
    status: UserStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastLoginAt?: Timestamp;
}

// ============================================================================
// YOUNGSTERS
// ============================================================================

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type IdCardType = 'passport' | 'id_card' | 'residence_permit';
export type YoungsterStatus = 'active' | 'inactive';

export interface HealthInfo {
    bloodType?: string;
    allergies: string[];
    chronicConditions: string[];
    medications: string[];
    doctorName?: string;
    doctorPhone?: string;
    healthInsuranceNumber: string;
}

export interface YoungsterEmergencyContact {
    name: string;
    relationship: string;
    phoneNumber: string;
    isPrimary: boolean;
}

export interface Authorizations {
    photo: boolean;
    medicalCare: boolean;
    publicTransport: boolean;
    activitiesParticipation: boolean;
}

export type DocumentType =
    | 'id_card'
    | 'birth_certificate'
    | 'health_certificate'
    | 'vaccination_record'
    | 'parental_authorization'
    | 'insurance'
    | 'other';

export interface YoungsterDocument {
    id: string;
    type: DocumentType;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    uploadedAt: Timestamp;
    expiresAt?: Timestamp;
    notes?: string;
}

export interface Youngster {
    id: string;
    parentId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Timestamp;
    age: number;
    gender: Gender;
    photoURL?: string;
    idCardURL?: string;
    idCardType: IdCardType;
    idCardNumber: string;
    healthInfo: HealthInfo;
    emergencyContacts: YoungsterEmergencyContact[];
    authorizations: Authorizations;
    documents: YoungsterDocument[];
    behaviouralNotes?: string;
    specialNeeds?: string[];
    totalTrips: number;
    status: YoungsterStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ============================================================================
// BOOKINGS
// ============================================================================

export type ServiceType = 'local' | 'long_distance';
export type TransportType = 'train' | 'bus' | 'car' | 'metro' | 'tram';
export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'paid'
    | 'assigned'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'refunded';

export type DiscountType = 'fratrie' | 'loyalty' | 'promo_code' | 'first_booking';
export type CancelledBy = 'parent' | 'accompanist' | 'admin';

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface LocationDetails {
    address: string;
    city: string;
    postalCode: string;
    coordinates?: Coordinates;
    date: Timestamp;
    time: string;
    contactPerson: string;
    contactPhone: string;
}

export interface Connection {
    station: string;
    arrivalTime: string;
    departureTime: string;
    waitingTime: number;
}

export interface Trip {
    departure: Omit<LocationDetails, 'date' | 'time'> & { date: Timestamp; time: string };
    arrival: Omit<LocationDetails, 'date' | 'time'> & {
        estimatedDate: Timestamp;
        estimatedTime: string;
    };
    connections?: Connection[];
    transportType: TransportType;
    ticketsProvided: boolean;
    ticketsURLs?: string[];
}

export interface BookingYoungster {
    youngsterId: string;
    firstName: string;
    age: number;
    specialNotes?: string;
}

export interface Discount {
    type: DiscountType;
    amount: number;
    code?: string;
}

export interface Pricing {
    basePrice: number;
    youngstersSuplement: number;
    distanceSupplement?: number;
    urgencySupplement?: number;
    discounts: Discount[];
    subtotal: number;
    taxes: number;
    total: number;
    deposit: number;
    depositPaid: boolean;
    balance: number;
    balancePaid: boolean;
    currency: 'EUR';
}

export interface BookingDocuments {
    quoteURL?: string;
    contractURL?: string;
    invoiceURL?: string;
    parentalAuthorizationURL?: string;
    informationSheetURL?: string;
}

export interface Cancellation {
    cancelledBy: CancelledBy;
    cancelledAt: Timestamp;
    reason: string;
    refundAmount: number;
    refundStatus: 'pending' | 'processed';
}

export interface Booking {
    id: string;
    parentId: string;
    accompanistId?: string;
    youngstersIds: string[];
    serviceType: ServiceType;
    trip: Trip;
    youngsters: BookingYoungster[];
    pricing: Pricing;
    additionalInfo?: string;
    internalNotes?: string;
    documents: BookingDocuments;
    status: BookingStatus;
    cancellation?: Cancellation;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    confirmedAt?: Timestamp;
    scheduledFor: Timestamp;
}

// ============================================================================
// MISSIONS
// ============================================================================

export type MissionStatus =
    | 'scheduled'
    | 'en_route_to_pickup'
    | 'waiting_at_pickup'
    | 'picked_up'
    | 'in_transit'
    | 'arriving_soon'
    | 'delivered'
    | 'completed'
    | 'incident'
    | 'cancelled';

export type IncidentType = 'delay' | 'health' | 'behaviour' | 'transport' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high';
export type BehaviourRating = 'excellent' | 'good' | 'average' | 'difficult';

export interface LocationPoint {
    lat: number;
    lng: number;
    timestamp: Timestamp;
}

export interface Tracking {
    enabled: boolean;
    parentConsent: boolean;
    currentLocation?: LocationPoint;
    locationHistory: LocationPoint[];
}

export interface CheckpointDetails {
    arrivedAt?: Timestamp;
    pickedUpAt?: Timestamp;
    departedAt?: Timestamp;
    photoURL?: string;
    notes?: string;
}

export interface ArrivalCheckpoint extends CheckpointDetails {
    deliveredAt?: Timestamp;
    recipientName: string;
    recipientSignature?: string;
}

export interface ConnectionCheckpoint {
    station: string;
    arrivedAt?: Timestamp;
    departedAt?: Timestamp;
    notes?: string;
}

export interface Checkpoints {
    departure: CheckpointDetails;
    connections?: ConnectionCheckpoint[];
    arrival: ArrivalCheckpoint;
}

export interface Incident {
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
    reportedAt: Timestamp;
    resolvedAt?: Timestamp;
    resolution?: string;
}

export interface MissionReport {
    behaviour: BehaviourRating;
    cooperation: BehaviourRating;
    generalNotes: string;
    recommendations?: string;
    submittedAt: Timestamp;
}

export interface Mission {
    id: string;
    bookingId: string;
    accompanistId: string;
    youngstersIds: string[];
    parentId: string;
    status: MissionStatus;
    tracking?: Tracking;
    checkpoints: Checkpoints;
    messagesCount: number;
    lastMessageAt?: Timestamp;
    incidents?: Incident[];
    report?: MissionReport;
    scheduledStartAt: Timestamp;
    actualStartAt?: Timestamp;
    scheduledEndAt: Timestamp;
    actualEndAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ============================================================================
// PAYMENTS
// ============================================================================

export type PaymentType = 'deposit' | 'balance' | 'full' | 'refund';
export type PaymentProvider = 'stripe';
export type PaymentMethodType = 'card' | 'bank_transfer' | 'check' | 'cash';
export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'succeeded'
    | 'failed'
    | 'cancelled'
    | 'refunded';

export interface PaymentMethod {
    type: PaymentMethodType;
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
}

export interface Invoice {
    number: string;
    pdfURL: string;
    sentAt?: Timestamp;
}

export interface PaymentMetadata {
    failureReason?: string;
    receiptURL?: string;
    description?: string;
}

export interface Payment {
    id: string;
    bookingId: string;
    userId: string;
    type: PaymentType;
    amount: number;
    currency: 'EUR';
    provider: PaymentProvider;
    paymentIntentId?: string;
    chargeId?: string;
    refundId?: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    invoice?: Invoice;
    metadata?: PaymentMetadata;
    createdAt: Timestamp;
    processedAt?: Timestamp;
    refundedAt?: Timestamp;
}

// ============================================================================
// REVIEWS
// ============================================================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface ReviewCategories {
    punctuality: number;
    communication: number;
    professionalism: number;
    youngsterSafety: number;
    youngsterComfort: number;
}

export interface ReviewResponse {
    text: string;
    respondedAt: Timestamp;
    respondedBy: string;
}

export interface Review {
    id: string;
    bookingId: string;
    missionId: string;
    authorId: string;
    authorName: string;
    rating: number;
    categories: ReviewCategories;
    overallRating: number;
    comment?: string;
    wouldRecommend: boolean;
    status: ReviewStatus;
    moderatedBy?: string;
    moderatedAt?: Timestamp;
    moderationNotes?: string;
    isPublic: boolean;
    isAnonymous: boolean;
    response?: ReviewResponse;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type NotificationType =
    | 'booking_confirmed'
    | 'booking_cancelled'
    | 'payment_received'
    | 'mission_started'
    | 'mission_completed'
    | 'message_received'
    | 'review_request'
    | 'document_required'
    | 'reminder'
    | 'system';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationAction {
    type: 'navigate' | 'open_url';
    target: string;
}

export interface NotificationData {
    bookingId?: string;
    missionId?: string;
    messageId?: string;
}

export interface NotificationChannels {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
}

export interface Notification {
    id: string;
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    imageURL?: string;
    action?: NotificationAction;
    data?: NotificationData;
    channels: NotificationChannels;
    read: boolean;
    readAt?: Timestamp;
    dismissed: boolean;
    priority: NotificationPriority;
    createdAt: Timestamp;
    expiresAt?: Timestamp;
}

// ============================================================================
// MESSAGES
// ============================================================================

export type AttachmentType = 'image' | 'document' | 'location';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageAttachment {
    type: AttachmentType;
    url: string;
    fileName?: string;
    size?: number;
    thumbnailURL?: string;
}

export interface MessageLocation {
    lat: number;
    lng: number;
    address?: string;
}

export interface Message {
    id: string;
    missionId: string;
    bookingId: string;
    senderId: string;
    receiverId: string;
    text: string;
    attachments?: MessageAttachment[];
    location?: MessageLocation;
    status: MessageStatus;
    readAt?: Timestamp;
    flagged: boolean;
    flagReason?: string;
    createdAt: Timestamp;
}

// ============================================================================
// STATS
// ============================================================================

export type StatsPeriod = 'daily' | 'monthly' | 'yearly';

export interface BookingStats {
    total: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    conversionRate: number;
}

export interface RevenueStats {
    gross: number;
    net: number;
    refunds: number;
    averageBookingValue: number;
}

export interface UserStats {
    newParents: number;
    activeParents: number;
    newAccompanists: number;
    activeAccompanists: number;
}

export interface MissionStats {
    total: number;
    completed: number;
    withIncidents: number;
    averageDuration: number;
}

export interface SatisfactionStats {
    averageRating: number;
    totalReviews: number;
    recommendationRate: number;
}

export interface TopAccompanist {
    accompanistId: string;
    missionsCount: number;
    averageRating: number;
}

export interface Stats {
    id: string;
    period: StatsPeriod;
    bookings: BookingStats;
    revenue: RevenueStats;
    users: UserStats;
    missions: MissionStats;
    satisfaction: SatisfactionStats;
    topAccompanists: TopAccompanist[];
    calculatedAt: Timestamp;
}

// ============================================================================
// SETTINGS
// ============================================================================

export interface PricingSettings {
    local: {
        hourly: number;
        halfDay: number;
        fullDay: number;
    };
    longDistance: {
        basePrice: number;
        perKm?: number;
        perHour?: number;
    };
    supplements: {
        additionalYoungster: number;
        urgentBooking: number;
        weekend: number;
        holiday: number;
    };
    discounts: {
        fratrie: {
            secondYoungster: number;
            thirdAndMore: number;
        };
        loyalty: {
            threshold: number;
            discount: number;
        };
    };
}

export interface Zone {
    name: string;
    postalCodes: string[];
    active: boolean;
}

export interface BusinessHours {
    start: string;
    end: string;
}

export interface SystemSettings {
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    minBookingAdvance: number;
    maxBookingAdvance: number;
    cancellationDeadline: number;
}

export interface ContactInfo {
    email: string;
    phone: string;
    address: string;
}

export interface IntegrationConfig {
    enabled: boolean;
    publicKey?: string;
}

export interface Integrations {
    stripe: IntegrationConfig;
    sendgrid: IntegrationConfig;
    twilio: IntegrationConfig;
}

export interface Settings {
    pricing: PricingSettings;
    zones: Zone[];
    businessHours: Record<string, BusinessHours>;
    system: SystemSettings;
    contact: ContactInfo;
    integrations: Integrations;
    updatedAt: Timestamp;
    updatedBy: string;
}

// ============================================================================
// AUDIT
// ============================================================================

export type AuditAction =
    | 'user_created'
    | 'user_updated'
    | 'user_deleted'
    | 'booking_created'
    | 'booking_cancelled'
    | 'payment_processed'
    | 'refund_issued'
    | 'document_accessed'
    | 'settings_changed'
    | 'accompanist_approved'
    | 'review_moderated';

export type AuditTargetType = 'user' | 'booking' | 'mission' | 'payment' | 'settings';

export interface AuditLog {
    id: string;
    action: AuditAction;
    actorId: string;
    actorRole: UserRole | 'system';
    actorEmail: string;
    targetType: AuditTargetType;
    targetId?: string;
    details: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Timestamp;
}
