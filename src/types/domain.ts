export interface WorkingHours {
  day: number;
  openTime: string;
  closeTime: string;
  isClosed?: boolean;
}

export interface Clinic {
  _id: string;
  name: string;
  nameAr: string;
  slug: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhones: string[];
  address?: string;
  city?: string;
  workingHours: WorkingHours[];
  appointmentSettings: {
    defaultDurationMinutes: number;
    bookingLeadTimeMinutes: number;
    maxAdvanceBookingDays: number;
    allowOnlineBooking: boolean;
    allowWalkIns: boolean;
    requireConfirmation: boolean;
  };
  services: string[];
}

export interface Branch {
  _id: string;
  clinicId: string;
  name: string;
  nameAr: string;
  address: string;
  city?: string;
  phones: string[];
  workingHours: WorkingHours[];
  isActive: boolean;
}

export interface Doctor {
  _id: string;
  clinicId: string;
  userId?: string;
  fullName: string;
  photoUrl?: string;
  specialty: string;
  specialtyAr: string;
  phone: string;
  email: string;
  bio?: string;
  consultationPrice: number;
  followUpPrice: number;
  defaultAppointmentDurationMinutes: number;
  branchIds: string[];
  isActive: boolean;
}

export type StaffRole = 'RECEPTIONIST' | 'NURSE' | 'ACCOUNTANT';

export interface Patient {
  _id: string;
  clinicId: string;
  fullName: string;
  phone: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  address?: string;
  nationalId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DayBreak {
  startTime: string;
  endTime: string;
}

export interface DoctorScheduleEntry {
  _id: string;
  doctorId: string;
  branchId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breaks: DayBreak[];
  isClosed: boolean;
}

export type ScheduleExceptionType =
  | 'FULL_DAY_LEAVE'
  | 'PARTIAL_DAY_LEAVE'
  | 'CUSTOM_HOURS'
  | 'EXTRA_HOURS'
  | 'HOLIDAY'
  | 'EMERGENCY_CLOSURE'
  | 'BLOCKED_TIME';

export interface ScheduleException {
  _id: string;
  doctorId: string;
  branchId: string;
  date: string;
  type: ScheduleExceptionType;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface AvailabilityResult {
  date: string;
  durationMinutes: number;
  isFullyClosed: boolean;
  closureReason?: string;
  slots: { start: string; end: string }[];
}

export type VisitType = 'CONSULTATION' | 'FOLLOW_UP';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  _id: string;
  clinicId: string;
  doctorId: string;
  branchId: string;
  patientId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  visitType: VisitType;
  status: AppointmentStatus;
  price?: number;
  reason?: string;
  notes?: string;
  cancelReason?: string;
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  createdAt: string;
}

export interface Vitals {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperatureCelsius?: number;
  weightKg?: number;
  heightCm?: number;
}

export type VisitStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface Visit {
  _id: string;
  clinicId: string;
  doctorId: string;
  branchId: string;
  patientId: string;
  appointmentId?: string;
  date: string;
  chiefComplaint?: string;
  vitals?: Vitals;
  diagnosis?: string;
  examinationNotes?: string;
  treatmentPlan?: string;
  status: VisitStatus;
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  createdAt: string;
}

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  instructions?: string;
}

export interface Prescription {
  _id: string;
  clinicId: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  notes?: string;
  patientName?: string;
  doctorName?: string;
  createdAt: string;
}

export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  _id: string;
  clinicId: string;
  branchId: string;
  patientId: string;
  visitId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  status: InvoiceStatus;
  notes?: string;
  patientName?: string;
  patientPhone?: string;
  createdAt: string;
}

export type PaymentType = 'PAYMENT' | 'REFUND';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'INSURANCE';

export interface Payment {
  _id: string;
  clinicId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  paidAt: string;
  createdAt: string;
}

export type DocumentCategory = 'LAB_RESULT' | 'SCAN' | 'REPORT' | 'PRESCRIPTION' | 'OTHER';

export interface ClinicDocument {
  _id: string;
  clinicId: string;
  patientId: string;
  visitId?: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  category: DocumentCategory;
  notes?: string;
  createdAt: string;
}

export type QueueStatus = 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface QueueEntry {
  _id: string;
  clinicId: string;
  branchId: string;
  doctorId?: string;
  patientId: string;
  appointmentId?: string;
  date: string;
  queueNumber?: number;
  status: QueueStatus;
  checkedInAt: string;
  calledAt?: string;
  completedAt?: string;
  notes?: string;
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  appointmentStartTime?: string;
  branchName?: string;
}

export type ExpenseCategory = 'RENT' | 'SALARIES' | 'SUPPLIES' | 'UTILITIES' | 'MAINTENANCE' | 'OTHER';

export interface Expense {
  _id: string;
  clinicId: string;
  branchId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface ReportSummary {
  from: string;
  to: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  appointmentsCount: number;
  visitsCount: number;
  newPatientsCount: number;
  revenueByDay: { date: string; revenue: number }[];
}

export interface AuditLog {
  _id: string;
  clinicId: string;
  userId: string;
  userName: string;
  role: string;
  method: string;
  path: string;
  resource: string;
  resourceId?: string;
  description: string;
  statusCode: number;
  ipAddress?: string;
  createdAt: string;
}

export type NotificationType = 'APPOINTMENT_BOOKED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_REMINDER' | 'QUEUE_CHECK_IN';

export interface AppNotification {
  _id: string;
  clinicId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DoctorRatingSummary {
  average: number;
  count: number;
}

export interface PublicClinic {
  name: string;
  nameAr: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  services: string[];
}

export interface PublicDoctor {
  id: string;
  fullName: string;
  photoUrl?: string;
  specialty: string;
  specialtyAr: string;
  bio?: string;
  consultationPrice: number;
  branchIds: string[];
  rating: DoctorRatingSummary;
}

export interface Review {
  _id: string;
  clinicId: string;
  doctorId: string;
  patientId: string;
  visitId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface StaffMember {
  _id: string;
  clinicId: string;
  userId?: string;
  fullName: string;
  role: StaffRole;
  email: string;
  phone: string;
  branchIds: string[];
  grantedPermissions: string[];
  revokedPermissions: string[];
  isActive: boolean;
}
