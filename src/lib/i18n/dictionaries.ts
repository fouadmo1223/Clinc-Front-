export type Locale = 'en' | 'ar';

export interface Dictionary {
  app: { name: string; tagline: string };
  dashboard: {
    greeting: (name: string) => string;
    subtitle: string;
    todayAppointments: string;
    patientsWaiting: string;
    todayRevenue: string;
    completedVisitsToday: string;
    last30Days: string;
    viewFullReport: string;
    todaysSchedule: string;
    noAppointmentsToday: string;
    viewQueue: string;
    viewAllAppointments: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      forgot: string;
      submit: string;
      noAccount: string;
      registerLink: string;
      invalid: string;
    };
    register: {
      title: string;
      subtitle: string;
      clinicName: string;
      clinicNameAr: string;
      clinicPhone: string;
      ownerFullName: string;
      email: string;
      password: string;
      submit: string;
      hasAccount: string;
      loginLink: string;
    };
    forgot: {
      title: string;
      subtitle: string;
      email: string;
      submit: string;
      backToLogin: string;
      sent: string;
    };
    reset: {
      title: string;
      newPassword: string;
      submit: string;
      success: string;
      invalidLink: string;
    };
  };
  common: { loading: string; language: string; save: string; cancel: string; create: string; edit: string; deactivate: string; activate: string; active: string; inactive: string; noResults: string; error: string; formInvalid: string; required: string; invalidEmail: string; minLength: (n: number) => string; selectAtLeastOne: string; logout: string; export: string };
  nav: {
    overview: string;
    clinic: string;
    branches: string;
    doctors: string;
    staff: string;
    patients: string;
    appointments: string;
    visits: string;
    invoices: string;
    queue: string;
    expenses: string;
    reports: string;
    auditLogs: string;
  };
  clinicSettings: {
    title: string;
    subtitle: string;
    nameEn: string;
    nameAr: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    city: string;
    saved: string;
    logo: string;
    logoHint: string;
    changeLogo: string;
    logoUploaded: string;
    workingHoursTitle: string;
    workingHoursSaved: string;
    appointmentDefaultsTitle: string;
    defaultDurationMinutes: string;
    bookingLeadTimeMinutes: string;
    maxAdvanceBookingDays: string;
    allowOnlineBooking: string;
    allowWalkIns: string;
    requireConfirmation: string;
    minutes: string;
    days: string;
  };
  branches: {
    title: string;
    subtitle: string;
    add: string;
    editTitle: string;
    addTitle: string;
    name: string;
    nameAr: string;
    address: string;
    city: string;
    phone: string;
    status: string;
    empty: string;
  };
  doctors: {
    title: string;
    subtitle: string;
    add: string;
    addTitle: string;
    editTitle: string;
    fullName: string;
    specialty: string;
    specialtyAr: string;
    phone: string;
    email: string;
    bio: string;
    consultationPrice: string;
    followUpPrice: string;
    duration: string;
    branchesLabel: string;
    inviteNote: string;
    empty: string;
  };
  staff: {
    title: string;
    subtitle: string;
    add: string;
    addTitle: string;
    editTitle: string;
    fullName: string;
    role: string;
    phone: string;
    email: string;
    branchesLabel: string;
    empty: string;
    roles: { RECEPTIONIST: string; NURSE: string; ACCOUNTANT: string };
  };
  patients: {
    title: string;
    subtitle: string;
    add: string;
    addTitle: string;
    editTitle: string;
    searchPlaceholder: string;
    fullName: string;
    phone: string;
    gender: string;
    genderMale: string;
    genderFemale: string;
    dateOfBirth: string;
    address: string;
    nationalId: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    notes: string;
    allergies: string;
    chronicConditions: string;
    currentMedications: string;
    listArrayHint: string;
    empty: string;
    noSearchResults: string;
    age: string;
    backToList: string;
    basicInfo: string;
    medicalInfo: string;
    medicalHidden: string;
    createdOn: string;
  };
  schedule: {
    title: string;
    subtitle: string;
    branch: string;
    weeklyHours: string;
    closed: string;
    startTime: string;
    endTime: string;
    breakLabel: string;
    addBreak: string;
    removeBreak: string;
    save: string;
    saved: string;
    days: [string, string, string, string, string, string, string];
    exceptions: string;
    addException: string;
    exceptionDate: string;
    exceptionType: string;
    exceptionReason: string;
    exceptionEmpty: string;
    types: Record<string, string>;
    delete: string;
    availabilityPreview: string;
    checkDate: string;
    duration: string;
    check: string;
    fullyClosed: string;
    noSlots: string;
    backToDoctors: string;
  };
  appointments: {
    title: string;
    subtitle: string;
    book: string;
    bookTitle: string;
    editTitle: string;
    patient: string;
    patientPlaceholder: string;
    noPatientResults: string;
    doctor: string;
    branch: string;
    date: string;
    time: string;
    duration: string;
    visitType: string;
    visitTypes: { CONSULTATION: string; FOLLOW_UP: string };
    reason: string;
    notes: string;
    status: string;
    statuses: { SCHEDULED: string; CONFIRMED: string; COMPLETED: string; CANCELLED: string; NO_SHOW: string };
    empty: string;
    noSlots: string;
    selectDoctorFirst: string;
    today: string;
    allDoctors: string;
    allBranches: string;
    allStatuses: string;
    cancelAction: string;
    cancelTitle: string;
    cancelReason: string;
    confirmCancel: string;
    keepAppointment: string;
    markConfirmed: string;
    markCompleted: string;
    markNoShow: string;
    reschedule: string;
  };
  visits: {
    title: string;
    subtitle: string;
    newVisit: string;
    newVisitTitle: string;
    editTitle: string;
    patient: string;
    doctor: string;
    branch: string;
    date: string;
    linkedAppointment: string;
    chiefComplaint: string;
    vitals: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
    diagnosis: string;
    examinationNotes: string;
    treatmentPlan: string;
    status: string;
    statuses: { IN_PROGRESS: string; COMPLETED: string };
    empty: string;
    backToVisits: string;
    prescriptions: string;
    addPrescription: string;
    addPrescriptionTitle: string;
    medication: string;
    dosage: string;
    frequency: string;
    durationDays: string;
    instructions: string;
    addMedication: string;
    removeMedication: string;
    daysUnit: string;
    notes: string;
    noPrescriptions: string;
    save: string;
  };
  invoices: {
    title: string;
    subtitle: string;
    newInvoice: string;
    newInvoiceTitle: string;
    backToInvoices: string;
    patient: string;
    branch: string;
    linkedVisit: string;
    item: string;
    description: string;
    quantity: string;
    unitPrice: string;
    addItem: string;
    removeItem: string;
    discount: string;
    notes: string;
    subtotal: string;
    total: string;
    amountPaid: string;
    balanceDue: string;
    status: string;
    statuses: { UNPAID: string; PARTIALLY_PAID: string; PAID: string; CANCELLED: string };
    empty: string;
    allStatuses: string;
    create: string;
    payments: string;
    recordPayment: string;
    recordPaymentTitle: string;
    refund: string;
    refundTitle: string;
    amount: string;
    method: string;
    methods: { CASH: string; CARD: string; TRANSFER: string; INSURANCE: string };
    reference: string;
    noPayments: string;
  };
  documents: {
    title: string;
    upload: string;
    uploadTitle: string;
    file: string;
    category: string;
    categories: { LAB_RESULT: string; SCAN: string; REPORT: string; PRESCRIPTION: string; OTHER: string };
    notes: string;
    empty: string;
    delete: string;
    download: string;
    uploadedOn: string;
  };
  queue: {
    title: string;
    subtitle: string;
    checkIn: string;
    checkInTitle: string;
    branch: string;
    doctor: string;
    doctorOptional: string;
    notes: string;
    waiting: string;
    inProgress: string;
    done: string;
    cancelled: string;
    empty: string;
    callNext: string;
    markDone: string;
    cancel: string;
    checkedInAt: string;
    queueNumber: string;
    linkAppointment: string;
    noAppointment: string;
    walkIn: string;
    booked: string;
  };
  expenses: {
    title: string;
    subtitle: string;
    add: string;
    addTitle: string;
    branch: string;
    category: string;
    categories: { RENT: string; SALARIES: string; SUPPLIES: string; UTILITIES: string; MAINTENANCE: string; OTHER: string };
    amount: string;
    description: string;
    date: string;
    empty: string;
    delete: string;
    total: string;
  };
  reports: {
    title: string;
    subtitle: string;
    from: string;
    to: string;
    apply: string;
    totalRevenue: string;
    totalExpenses: string;
    netIncome: string;
    appointmentsCount: string;
    visitsCount: string;
    newPatientsCount: string;
    revenueByDay: string;
    noData: string;
  };
  auditLogs: {
    title: string;
    subtitle: string;
    time: string;
    user: string;
    action: string;
    resource: string;
    allResources: string;
    status: string;
    from: string;
    to: string;
    apply: string;
    empty: string;
  };
  notifications: {
    title: string;
    empty: string;
    markAllRead: string;
    viewAll: string;
  };
  toasts: {
    welcomeBack: (name: string) => string;
    clinicCreated: string;
    clinicCreatedDesc: (name: string) => string;
    branchAdded: string;
    branchUpdated: string;
    branchDeactivated: string;
    doctorAdded: string;
    doctorInviteSent: (email: string) => string;
    doctorUpdated: string;
    doctorDeactivated: string;
    staffAdded: string;
    staffInviteSent: (email: string) => string;
    staffUpdated: string;
    staffDeactivated: string;
    patientAdded: string;
    patientUpdated: string;
    patientDeactivated: string;
    scheduleSaved: string;
    exceptionAdded: string;
    exceptionDeleted: string;
    appointmentBooked: string;
    appointmentUpdated: string;
    appointmentCancelled: string;
    visitSaved: string;
    prescriptionAdded: string;
    invoiceCreated: string;
    paymentRecorded: string;
    refundRecorded: string;
    documentUploaded: string;
    documentDeleted: string;
    checkedIn: string;
    queueUpdated: string;
    expenseAdded: string;
    expenseDeleted: string;
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    app: { name: 'Clinic OS', tagline: 'Clinic operations, handled.' },
    dashboard: {
      greeting: (name) => `Good to see you, ${name}`,
      subtitle: "Here's what's happening at your clinic today.",
      todayAppointments: "Today's appointments",
      patientsWaiting: 'Patients waiting',
      todayRevenue: "Today's revenue",
      completedVisitsToday: 'Completed visits today',
      last30Days: 'Last 30 days',
      viewFullReport: 'View full report',
      todaysSchedule: "Today's schedule",
      noAppointmentsToday: 'No appointments scheduled for today.',
      viewQueue: 'View queue',
      viewAllAppointments: 'View all',
    },
    auth: {
      login: {
        title: 'Sign in',
        subtitle: 'Enter your credentials to access your clinic workspace.',
        email: 'Email',
        password: 'Password',
        forgot: 'Forgot password?',
        submit: 'Sign in',
        noAccount: "Don't have a clinic yet?",
        registerLink: 'Register your clinic',
        invalid: 'Invalid email or password.',
      },
      register: {
        title: 'Register your clinic',
        subtitle: 'Set up your clinic workspace in a couple of minutes.',
        clinicName: 'Clinic name (English)',
        clinicNameAr: 'Clinic name (Arabic)',
        clinicPhone: 'Clinic phone',
        ownerFullName: 'Your full name',
        email: 'Email',
        password: 'Password',
        submit: 'Create clinic',
        hasAccount: 'Already have an account?',
        loginLink: 'Sign in',
      },
      forgot: {
        title: 'Reset your password',
        subtitle: "Enter your email and we'll send you a reset link.",
        email: 'Email',
        submit: 'Send reset link',
        backToLogin: 'Back to sign in',
        sent: 'If that email exists, a reset link has been sent.',
      },
      reset: {
        title: 'Set a new password',
        newPassword: 'New password',
        submit: 'Update password',
        success: 'Password updated. You can now sign in.',
        invalidLink: 'This reset link is invalid or has expired.',
      },
    },
    common: {
      loading: 'Loading…',
      language: 'العربية',
      save: 'Save',
      cancel: 'Cancel',
      create: 'Create',
      edit: 'Edit',
      deactivate: 'Deactivate',
      activate: 'Activate',
      active: 'Active',
      inactive: 'Inactive',
      noResults: 'Nothing here yet.',
      error: 'Something went wrong. Please try again.',
      formInvalid: 'Please fix the highlighted fields.',
      required: 'This field is required.',
      invalidEmail: 'Enter a valid email address.',
      minLength: (n) => `Must be at least ${n} characters.`,
      selectAtLeastOne: 'Select at least one branch.',
      logout: 'Log out',
      export: 'Export',
    },
    nav: {
      overview: 'Overview',
      clinic: 'Clinic',
      branches: 'Branches',
      doctors: 'Doctors',
      staff: 'Staff',
      patients: 'Patients',
      appointments: 'Appointments',
      visits: 'Visits',
      invoices: 'Invoices',
      queue: 'Queue',
      expenses: 'Expenses',
      reports: 'Reports',
      auditLogs: 'Audit log',
    },
    clinicSettings: {
      title: 'Clinic settings',
      subtitle: 'Your clinic profile and contact information.',
      nameEn: 'Clinic name (English)',
      nameAr: 'Clinic name (Arabic)',
      contactEmail: 'Contact email',
      contactPhone: 'Contact phone',
      address: 'Address',
      city: 'City',
      saved: 'Saved.',
      logo: 'Clinic logo',
      logoHint: 'JPEG, PNG, WEBP, or SVG, up to 5MB.',
      changeLogo: 'Change logo',
      logoUploaded: 'Logo updated.',
      workingHoursTitle: 'Working hours',
      workingHoursSaved: 'Working hours saved.',
      appointmentDefaultsTitle: 'Appointment defaults',
      defaultDurationMinutes: 'Default appointment duration',
      bookingLeadTimeMinutes: 'Minimum booking lead time',
      maxAdvanceBookingDays: 'Maximum days in advance',
      allowOnlineBooking: 'Allow online booking',
      allowWalkIns: 'Allow walk-ins',
      requireConfirmation: 'Require confirmation before appointments are booked',
      minutes: 'minutes',
      days: 'days',
    },
    branches: {
      title: 'Branches',
      subtitle: 'Locations your clinic operates from.',
      add: 'Add branch',
      editTitle: 'Edit branch',
      addTitle: 'Add branch',
      name: 'Name (English)',
      nameAr: 'Name (Arabic)',
      address: 'Address',
      city: 'City',
      phone: 'Phone',
      status: 'Status',
      empty: 'No branches yet. Add your first one to start scheduling appointments.',
    },
    doctors: {
      title: 'Doctors',
      subtitle: 'Manage doctor profiles, pricing, and branch assignments.',
      add: 'Add doctor',
      addTitle: 'Add doctor',
      editTitle: 'Edit doctor',
      fullName: 'Full name',
      specialty: 'Specialty (English)',
      specialtyAr: 'Specialty (Arabic)',
      phone: 'Phone',
      email: 'Email',
      bio: 'Bio',
      consultationPrice: 'Consultation price (EGP)',
      followUpPrice: 'Follow-up price (EGP)',
      duration: 'Default appointment duration (minutes)',
      branchesLabel: 'Branches',
      inviteNote: 'An account setup email will be sent to this address.',
      empty: 'No doctors yet. Add your first doctor to start scheduling.',
    },
    staff: {
      title: 'Staff',
      subtitle: 'Receptionists, nurses, and accountants across your clinic.',
      add: 'Add staff member',
      addTitle: 'Add staff member',
      editTitle: 'Edit staff member',
      fullName: 'Full name',
      role: 'Role',
      phone: 'Phone',
      email: 'Email',
      branchesLabel: 'Branches',
      empty: 'No staff members yet.',
      roles: { RECEPTIONIST: 'Receptionist', NURSE: 'Nurse', ACCOUNTANT: 'Accountant' },
    },
    patients: {
      title: 'Patients',
      subtitle: 'Search and manage your patient records.',
      add: 'Add patient',
      addTitle: 'Add patient',
      editTitle: 'Edit patient',
      searchPlaceholder: 'Search by name, phone, or patient ID…',
      fullName: 'Full name',
      phone: 'Phone',
      gender: 'Gender',
      genderMale: 'Male',
      genderFemale: 'Female',
      dateOfBirth: 'Date of birth',
      address: 'Address',
      nationalId: 'National ID',
      emergencyContactName: 'Emergency contact name',
      emergencyContactPhone: 'Emergency contact phone',
      notes: 'Notes',
      allergies: 'Allergies',
      chronicConditions: 'Chronic conditions',
      currentMedications: 'Current medications',
      listArrayHint: 'Separate multiple entries with commas',
      empty: 'No patients yet. Add your first patient to get started.',
      noSearchResults: 'No patients match your search.',
      age: 'Age',
      backToList: 'Back to patients',
      basicInfo: 'Basic information',
      medicalInfo: 'Medical information',
      medicalHidden: "You don't have permission to view medical information.",
      createdOn: 'Added on',
    },
    schedule: {
      title: 'Schedule',
      subtitle: 'Weekly working hours, breaks, and exceptions.',
      branch: 'Branch',
      weeklyHours: 'Weekly hours',
      closed: 'Closed',
      startTime: 'Start',
      endTime: 'End',
      breakLabel: 'Break',
      addBreak: 'Add break',
      removeBreak: 'Remove',
      save: 'Save schedule',
      saved: 'Schedule saved',
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      exceptions: 'Exceptions',
      addException: 'Add exception',
      exceptionDate: 'Date',
      exceptionType: 'Type',
      exceptionReason: 'Reason (optional)',
      exceptionEmpty: 'No exceptions scheduled.',
      types: {
        FULL_DAY_LEAVE: 'Full-day leave',
        PARTIAL_DAY_LEAVE: 'Partial-day leave',
        CUSTOM_HOURS: 'Custom hours',
        EXTRA_HOURS: 'Extra hours',
        HOLIDAY: 'Holiday',
        EMERGENCY_CLOSURE: 'Emergency closure',
        BLOCKED_TIME: 'Blocked time',
      },
      delete: 'Delete',
      availabilityPreview: 'Availability preview',
      checkDate: 'Date',
      duration: 'Slot duration (minutes)',
      check: 'Check',
      fullyClosed: 'Closed this day',
      noSlots: 'No available slots.',
      backToDoctors: 'Back to doctors',
    },
    appointments: {
      title: 'Appointments',
      subtitle: 'Book and manage patient appointments across your clinic.',
      book: 'Book appointment',
      bookTitle: 'Book appointment',
      editTitle: 'Edit appointment',
      patient: 'Patient',
      patientPlaceholder: 'Search patient by name or phone…',
      noPatientResults: 'No patients match your search.',
      doctor: 'Doctor',
      branch: 'Branch',
      date: 'Date',
      time: 'Time',
      duration: 'Duration (minutes)',
      visitType: 'Visit type',
      visitTypes: { CONSULTATION: 'Consultation', FOLLOW_UP: 'Follow-up' },
      reason: 'Reason',
      notes: 'Notes',
      status: 'Status',
      statuses: {
        SCHEDULED: 'Scheduled',
        CONFIRMED: 'Confirmed',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
        NO_SHOW: 'No-show',
      },
      empty: 'No appointments on this day.',
      noSlots: 'No available slots for this date.',
      selectDoctorFirst: 'Select a doctor and branch to see available times.',
      today: 'Today',
      allDoctors: 'All doctors',
      allBranches: 'All branches',
      allStatuses: 'All statuses',
      cancelAction: 'Cancel appointment',
      cancelTitle: 'Cancel this appointment?',
      cancelReason: 'Cancellation reason (optional)',
      confirmCancel: 'Yes, cancel',
      keepAppointment: 'Keep appointment',
      markConfirmed: 'Mark confirmed',
      markCompleted: 'Mark completed',
      markNoShow: 'Mark no-show',
      reschedule: 'Reschedule',
    },
    visits: {
      title: 'Visits',
      subtitle: 'Clinical visit records, vitals, and diagnoses.',
      newVisit: 'New visit',
      newVisitTitle: 'Record visit',
      editTitle: 'Edit visit',
      patient: 'Patient',
      doctor: 'Doctor',
      branch: 'Branch',
      date: 'Date',
      linkedAppointment: 'Linked appointment',
      chiefComplaint: 'Chief complaint',
      vitals: 'Vitals',
      bloodPressure: 'Blood pressure (systolic/diastolic)',
      heartRate: 'Heart rate (bpm)',
      temperature: 'Temperature (°C)',
      weight: 'Weight (kg)',
      height: 'Height (cm)',
      diagnosis: 'Diagnosis',
      examinationNotes: 'Examination notes',
      treatmentPlan: 'Treatment plan',
      status: 'Status',
      statuses: { IN_PROGRESS: 'In progress', COMPLETED: 'Completed' },
      empty: 'No visits recorded yet.',
      backToVisits: 'Back to visits',
      prescriptions: 'Prescriptions',
      addPrescription: 'Add prescription',
      addPrescriptionTitle: 'Add prescription',
      medication: 'Medication',
      dosage: 'Dosage',
      frequency: 'Frequency',
      durationDays: 'Duration (days)',
      instructions: 'Instructions',
      addMedication: 'Add medication',
      removeMedication: 'Remove',
      daysUnit: 'days',
      notes: 'Notes',
      noPrescriptions: 'No prescriptions for this visit.',
      save: 'Save visit',
    },
    invoices: {
      title: 'Invoices',
      subtitle: 'Bill patients and track payments.',
      newInvoice: 'New invoice',
      newInvoiceTitle: 'New invoice',
      backToInvoices: 'Back to invoices',
      patient: 'Patient',
      branch: 'Branch',
      linkedVisit: 'Linked visit',
      item: 'Item',
      description: 'Description',
      quantity: 'Qty',
      unitPrice: 'Unit price',
      addItem: 'Add item',
      removeItem: 'Remove',
      discount: 'Discount',
      notes: 'Notes',
      subtotal: 'Subtotal',
      total: 'Total',
      amountPaid: 'Amount paid',
      balanceDue: 'Balance due',
      status: 'Status',
      statuses: { UNPAID: 'Unpaid', PARTIALLY_PAID: 'Partially paid', PAID: 'Paid', CANCELLED: 'Cancelled' },
      empty: 'No invoices yet.',
      allStatuses: 'All statuses',
      create: 'Create invoice',
      payments: 'Payments',
      recordPayment: 'Record payment',
      recordPaymentTitle: 'Record payment',
      refund: 'Refund',
      refundTitle: 'Issue refund',
      amount: 'Amount',
      method: 'Method',
      methods: { CASH: 'Cash', CARD: 'Card', TRANSFER: 'Bank transfer', INSURANCE: 'Insurance' },
      reference: 'Reference (optional)',
      noPayments: 'No payments recorded yet.',
    },
    documents: {
      title: 'Documents',
      upload: 'Upload document',
      uploadTitle: 'Upload document',
      file: 'File',
      category: 'Category',
      categories: {
        LAB_RESULT: 'Lab result',
        SCAN: 'Scan',
        REPORT: 'Report',
        PRESCRIPTION: 'Prescription',
        OTHER: 'Other',
      },
      notes: 'Notes',
      empty: 'No documents uploaded yet.',
      delete: 'Delete',
      download: 'Download',
      uploadedOn: 'Uploaded on',
    },
    queue: {
      title: 'Queue',
      subtitle: "Today's walk-in and check-in queue.",
      checkIn: 'Check in',
      checkInTitle: 'Check in patient',
      branch: 'Branch',
      doctor: 'Doctor',
      doctorOptional: 'Doctor (optional)',
      notes: 'Notes',
      waiting: 'Waiting',
      inProgress: 'In progress',
      done: 'Done',
      cancelled: 'Cancelled',
      empty: 'No one in the queue yet.',
      callNext: 'Call in',
      markDone: 'Mark done',
      cancel: 'Cancel',
      checkedInAt: 'Checked in at',
      queueNumber: 'No.',
      linkAppointment: 'Link to appointment (optional)',
      noAppointment: 'No appointment — walk-in',
      walkIn: 'Walk-in',
      booked: 'Booked',
    },
    expenses: {
      title: 'Expenses',
      subtitle: 'Track clinic operating expenses.',
      add: 'Add expense',
      addTitle: 'Add expense',
      branch: 'Branch',
      category: 'Category',
      categories: {
        RENT: 'Rent',
        SALARIES: 'Salaries',
        SUPPLIES: 'Supplies',
        UTILITIES: 'Utilities',
        MAINTENANCE: 'Maintenance',
        OTHER: 'Other',
      },
      amount: 'Amount',
      description: 'Description',
      date: 'Date',
      empty: 'No expenses recorded yet.',
      delete: 'Delete',
      total: 'Total',
    },
    reports: {
      title: 'Reports',
      subtitle: 'Revenue, expenses, and activity overview.',
      from: 'From',
      to: 'To',
      apply: 'Apply',
      totalRevenue: 'Total revenue',
      totalExpenses: 'Total expenses',
      netIncome: 'Net income',
      appointmentsCount: 'Appointments',
      visitsCount: 'Visits',
      newPatientsCount: 'New patients',
      revenueByDay: 'Revenue by day',
      noData: 'No data for this period.',
    },
    auditLogs: {
      title: 'Audit log',
      subtitle: 'A record of who did what, and when.',
      time: 'Time',
      user: 'User',
      action: 'Action',
      resource: 'Resource',
      allResources: 'All resources',
      status: 'Status',
      from: 'From',
      to: 'To',
      apply: 'Apply',
      empty: 'No activity recorded for this period.',
    },
    notifications: {
      title: 'Notifications',
      empty: 'No notifications yet.',
      markAllRead: 'Mark all as read',
      viewAll: 'View all',
    },
    toasts: {
      welcomeBack: (name) => `Welcome back, ${name}`,
      clinicCreated: 'Clinic created',
      clinicCreatedDesc: (name) => `Welcome to ${name}'s workspace.`,
      branchAdded: 'Branch added',
      branchUpdated: 'Branch updated',
      branchDeactivated: 'Branch deactivated',
      doctorAdded: 'Doctor added',
      doctorInviteSent: (email) => `An invite email was sent to ${email}.`,
      doctorUpdated: 'Doctor updated',
      doctorDeactivated: 'Doctor deactivated',
      staffAdded: 'Staff member added',
      staffInviteSent: (email) => `An invite email was sent to ${email}.`,
      staffUpdated: 'Staff member updated',
      staffDeactivated: 'Staff member deactivated',
      patientAdded: 'Patient added',
      patientUpdated: 'Patient updated',
      patientDeactivated: 'Patient deactivated',
      scheduleSaved: 'Schedule saved',
      exceptionAdded: 'Exception added',
      exceptionDeleted: 'Exception deleted',
      appointmentBooked: 'Appointment booked',
      appointmentUpdated: 'Appointment updated',
      appointmentCancelled: 'Appointment cancelled',
      visitSaved: 'Visit saved',
      prescriptionAdded: 'Prescription added',
      invoiceCreated: 'Invoice created',
      paymentRecorded: 'Payment recorded',
      refundRecorded: 'Refund recorded',
      documentUploaded: 'Document uploaded',
      documentDeleted: 'Document deleted',
      checkedIn: 'Checked in',
      queueUpdated: 'Queue updated',
      expenseAdded: 'Expense added',
      expenseDeleted: 'Expense deleted',
    },
  },
  ar: {
    app: { name: 'نظام العيادة', tagline: 'تشغيل عيادتك، بكل ثقة.' },
    dashboard: {
      greeting: (name) => `أهلاً بعودتك، ${name}`,
      subtitle: 'إليك ما يحدث في عيادتك اليوم.',
      todayAppointments: 'مواعيد اليوم',
      patientsWaiting: 'المرضى في الانتظار',
      todayRevenue: 'إيرادات اليوم',
      completedVisitsToday: 'الزيارات المكتملة اليوم',
      last30Days: 'آخر 30 يومًا',
      viewFullReport: 'عرض التقرير الكامل',
      todaysSchedule: 'جدول اليوم',
      noAppointmentsToday: 'لا توجد مواعيد مجدولة اليوم.',
      viewQueue: 'عرض الطابور',
      viewAllAppointments: 'عرض الكل',
    },
    auth: {
      login: {
        title: 'تسجيل الدخول',
        subtitle: 'أدخل بياناتك للوصول إلى مساحة عمل العيادة.',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        forgot: 'نسيت كلمة المرور؟',
        submit: 'تسجيل الدخول',
        noAccount: 'ليس لديك عيادة بعد؟',
        registerLink: 'سجّل عيادتك',
        invalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      },
      register: {
        title: 'سجّل عيادتك',
        subtitle: 'أنشئ مساحة عمل عيادتك في دقيقتين.',
        clinicName: 'اسم العيادة (إنجليزي)',
        clinicNameAr: 'اسم العيادة (عربي)',
        clinicPhone: 'هاتف العيادة',
        ownerFullName: 'اسمك الكامل',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        submit: 'إنشاء العيادة',
        hasAccount: 'لديك حساب بالفعل؟',
        loginLink: 'تسجيل الدخول',
      },
      forgot: {
        title: 'إعادة تعيين كلمة المرور',
        subtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.',
        email: 'البريد الإلكتروني',
        submit: 'إرسال رابط إعادة التعيين',
        backToLogin: 'العودة لتسجيل الدخول',
        sent: 'إذا كان هذا البريد الإلكتروني مسجلاً، فسيتم إرسال رابط إعادة التعيين إليه.',
      },
      reset: {
        title: 'تعيين كلمة مرور جديدة',
        newPassword: 'كلمة المرور الجديدة',
        submit: 'تحديث كلمة المرور',
        success: 'تم تحديث كلمة المرور. يمكنك الآن تسجيل الدخول.',
        invalidLink: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية.',
      },
    },
    common: {
      loading: 'جارٍ التحميل…',
      language: 'English',
      save: 'حفظ',
      cancel: 'إلغاء',
      create: 'إنشاء',
      edit: 'تعديل',
      deactivate: 'إلغاء التفعيل',
      activate: 'تفعيل',
      active: 'نشط',
      inactive: 'غير نشط',
      noResults: 'لا يوجد شيء هنا بعد.',
      error: 'حدث خطأ ما. حاول مرة أخرى.',
      formInvalid: 'يرجى تصحيح الحقول المميزة.',
      required: 'هذا الحقل مطلوب.',
      invalidEmail: 'أدخل بريدًا إلكترونيًا صحيحًا.',
      minLength: (n) => `يجب ألا يقل عن ${n} حرفًا.`,
      selectAtLeastOne: 'اختر فرعًا واحدًا على الأقل.',
      logout: 'تسجيل الخروج',
      export: 'تصدير',
    },
    nav: {
      overview: 'نظرة عامة',
      clinic: 'العيادة',
      branches: 'الفروع',
      doctors: 'الأطباء',
      staff: 'الموظفون',
      patients: 'المرضى',
      appointments: 'المواعيد',
      visits: 'الزيارات',
      invoices: 'الفواتير',
      queue: 'الطابور',
      expenses: 'المصروفات',
      reports: 'التقارير',
      auditLogs: 'سجل النشاط',
    },
    clinicSettings: {
      title: 'إعدادات العيادة',
      subtitle: 'الملف الشخصي لعيادتك وبيانات التواصل.',
      nameEn: 'اسم العيادة (إنجليزي)',
      nameAr: 'اسم العيادة (عربي)',
      contactEmail: 'البريد الإلكتروني للتواصل',
      contactPhone: 'هاتف التواصل',
      address: 'العنوان',
      city: 'المدينة',
      saved: 'تم الحفظ.',
      logo: 'شعار العيادة',
      logoHint: 'JPEG أو PNG أو WEBP أو SVG، حتى 5 ميجابايت.',
      changeLogo: 'تغيير الشعار',
      logoUploaded: 'تم تحديث الشعار.',
      workingHoursTitle: 'ساعات العمل',
      workingHoursSaved: 'تم حفظ ساعات العمل.',
      appointmentDefaultsTitle: 'إعدادات المواعيد الافتراضية',
      defaultDurationMinutes: 'مدة الموعد الافتراضية',
      bookingLeadTimeMinutes: 'الحد الأدنى لمهلة الحجز',
      maxAdvanceBookingDays: 'أقصى عدد أيام للحجز المسبق',
      allowOnlineBooking: 'السماح بالحجز عبر الإنترنت',
      allowWalkIns: 'السماح بالحضور بدون حجز',
      requireConfirmation: 'يتطلب تأكيد الموعد قبل حجزه',
      minutes: 'دقيقة',
      days: 'يوم',
    },
    branches: {
      title: 'الفروع',
      subtitle: 'المواقع التي تعمل منها عيادتك.',
      add: 'إضافة فرع',
      editTitle: 'تعديل الفرع',
      addTitle: 'إضافة فرع',
      name: 'الاسم (إنجليزي)',
      nameAr: 'الاسم (عربي)',
      address: 'العنوان',
      city: 'المدينة',
      phone: 'الهاتف',
      status: 'الحالة',
      empty: 'لا توجد فروع بعد. أضف أول فرع لبدء جدولة المواعيد.',
    },
    doctors: {
      title: 'الأطباء',
      subtitle: 'إدارة ملفات الأطباء والأسعار وتوزيع الفروع.',
      add: 'إضافة طبيب',
      addTitle: 'إضافة طبيب',
      editTitle: 'تعديل الطبيب',
      fullName: 'الاسم الكامل',
      specialty: 'التخصص (إنجليزي)',
      specialtyAr: 'التخصص (عربي)',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      bio: 'نبذة',
      consultationPrice: 'سعر الكشف (جنيه)',
      followUpPrice: 'سعر المتابعة (جنيه)',
      duration: 'مدة الموعد الافتراضية (دقائق)',
      branchesLabel: 'الفروع',
      inviteNote: 'سيتم إرسال بريد إلكتروني لإعداد الحساب إلى هذا العنوان.',
      empty: 'لا يوجد أطباء بعد. أضف أول طبيب لبدء الجدولة.',
    },
    staff: {
      title: 'الموظفون',
      subtitle: 'موظفو الاستقبال والتمريض والمحاسبة في عيادتك.',
      add: 'إضافة موظف',
      addTitle: 'إضافة موظف',
      editTitle: 'تعديل الموظف',
      fullName: 'الاسم الكامل',
      role: 'الوظيفة',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      branchesLabel: 'الفروع',
      empty: 'لا يوجد موظفون بعد.',
      roles: { RECEPTIONIST: 'موظف استقبال', NURSE: 'تمريض', ACCOUNTANT: 'محاسب' },
    },
    patients: {
      title: 'المرضى',
      subtitle: 'ابحث في سجلات المرضى وأدرها.',
      add: 'إضافة مريض',
      addTitle: 'إضافة مريض',
      editTitle: 'تعديل بيانات المريض',
      searchPlaceholder: 'ابحث بالاسم أو الهاتف أو رقم الملف…',
      fullName: 'الاسم الكامل',
      phone: 'الهاتف',
      gender: 'النوع',
      genderMale: 'ذكر',
      genderFemale: 'أنثى',
      dateOfBirth: 'تاريخ الميلاد',
      address: 'العنوان',
      nationalId: 'الرقم القومي',
      emergencyContactName: 'اسم جهة الاتصال في الطوارئ',
      emergencyContactPhone: 'هاتف جهة الاتصال في الطوارئ',
      notes: 'ملاحظات',
      allergies: 'الحساسية',
      chronicConditions: 'الأمراض المزمنة',
      currentMedications: 'الأدوية الحالية',
      listArrayHint: 'افصل بين العناصر المتعددة بفاصلة',
      empty: 'لا يوجد مرضى بعد. أضف أول مريض للبدء.',
      noSearchResults: 'لا يوجد مرضى مطابقون لبحثك.',
      age: 'العمر',
      backToList: 'العودة إلى المرضى',
      basicInfo: 'البيانات الأساسية',
      medicalInfo: 'البيانات الطبية',
      medicalHidden: 'ليس لديك صلاحية لعرض البيانات الطبية.',
      createdOn: 'تمت الإضافة في',
    },
    schedule: {
      title: 'الجدول',
      subtitle: 'ساعات العمل الأسبوعية والاستراحات والاستثناءات.',
      branch: 'الفرع',
      weeklyHours: 'الساعات الأسبوعية',
      closed: 'مغلق',
      startTime: 'البداية',
      endTime: 'النهاية',
      breakLabel: 'استراحة',
      addBreak: 'إضافة استراحة',
      removeBreak: 'إزالة',
      save: 'حفظ الجدول',
      saved: 'تم حفظ الجدول',
      days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      exceptions: 'الاستثناءات',
      addException: 'إضافة استثناء',
      exceptionDate: 'التاريخ',
      exceptionType: 'النوع',
      exceptionReason: 'السبب (اختياري)',
      exceptionEmpty: 'لا توجد استثناءات مجدولة.',
      types: {
        FULL_DAY_LEAVE: 'إجازة يوم كامل',
        PARTIAL_DAY_LEAVE: 'إجازة جزئية',
        CUSTOM_HOURS: 'ساعات مخصصة',
        EXTRA_HOURS: 'ساعات إضافية',
        HOLIDAY: 'عطلة رسمية',
        EMERGENCY_CLOSURE: 'إغلاق طارئ',
        BLOCKED_TIME: 'وقت محجوز',
      },
      delete: 'حذف',
      availabilityPreview: 'معاينة الأوقات المتاحة',
      checkDate: 'التاريخ',
      duration: 'مدة الموعد (دقائق)',
      check: 'تحقق',
      fullyClosed: 'مغلق في هذا اليوم',
      noSlots: 'لا توجد أوقات متاحة.',
      backToDoctors: 'العودة إلى الأطباء',
    },
    appointments: {
      title: 'المواعيد',
      subtitle: 'احجز مواعيد المرضى وأدرها عبر عيادتك.',
      book: 'حجز موعد',
      bookTitle: 'حجز موعد',
      editTitle: 'تعديل الموعد',
      patient: 'المريض',
      patientPlaceholder: 'ابحث عن مريض بالاسم أو الهاتف…',
      noPatientResults: 'لا يوجد مرضى مطابقون لبحثك.',
      doctor: 'الطبيب',
      branch: 'الفرع',
      date: 'التاريخ',
      time: 'الوقت',
      duration: 'المدة (دقائق)',
      visitType: 'نوع الزيارة',
      visitTypes: { CONSULTATION: 'كشف', FOLLOW_UP: 'متابعة' },
      reason: 'السبب',
      notes: 'ملاحظات',
      status: 'الحالة',
      statuses: {
        SCHEDULED: 'مجدول',
        CONFIRMED: 'مؤكد',
        COMPLETED: 'مكتمل',
        CANCELLED: 'ملغى',
        NO_SHOW: 'لم يحضر',
      },
      empty: 'لا توجد مواعيد في هذا اليوم.',
      noSlots: 'لا توجد أوقات متاحة لهذا التاريخ.',
      selectDoctorFirst: 'اختر طبيبًا وفرعًا لعرض الأوقات المتاحة.',
      today: 'اليوم',
      allDoctors: 'كل الأطباء',
      allBranches: 'كل الفروع',
      allStatuses: 'كل الحالات',
      cancelAction: 'إلغاء الموعد',
      cancelTitle: 'هل تريد إلغاء هذا الموعد؟',
      cancelReason: 'سبب الإلغاء (اختياري)',
      confirmCancel: 'نعم، إلغاء',
      keepAppointment: 'الاحتفاظ بالموعد',
      markConfirmed: 'تأكيد الموعد',
      markCompleted: 'وضع علامة مكتمل',
      markNoShow: 'وضع علامة لم يحضر',
      reschedule: 'إعادة الجدولة',
    },
    visits: {
      title: 'الزيارات',
      subtitle: 'سجلات الزيارات الطبية والعلامات الحيوية والتشخيص.',
      newVisit: 'زيارة جديدة',
      newVisitTitle: 'تسجيل زيارة',
      editTitle: 'تعديل الزيارة',
      patient: 'المريض',
      doctor: 'الطبيب',
      branch: 'الفرع',
      date: 'التاريخ',
      linkedAppointment: 'الموعد المرتبط',
      chiefComplaint: 'الشكوى الرئيسية',
      vitals: 'العلامات الحيوية',
      bloodPressure: 'ضغط الدم (انقباضي/انبساطي)',
      heartRate: 'معدل ضربات القلب',
      temperature: 'درجة الحرارة (°م)',
      weight: 'الوزن (كجم)',
      height: 'الطول (سم)',
      diagnosis: 'التشخيص',
      examinationNotes: 'ملاحظات الفحص',
      treatmentPlan: 'خطة العلاج',
      status: 'الحالة',
      statuses: { IN_PROGRESS: 'قيد التنفيذ', COMPLETED: 'مكتملة' },
      empty: 'لا توجد زيارات مسجلة بعد.',
      backToVisits: 'العودة إلى الزيارات',
      prescriptions: 'الروشتات',
      addPrescription: 'إضافة روشتة',
      addPrescriptionTitle: 'إضافة روشتة',
      medication: 'الدواء',
      dosage: 'الجرعة',
      frequency: 'التكرار',
      durationDays: 'المدة (أيام)',
      instructions: 'التعليمات',
      addMedication: 'إضافة دواء',
      removeMedication: 'إزالة',
      daysUnit: 'يوم',
      notes: 'ملاحظات',
      noPrescriptions: 'لا توجد روشتات لهذه الزيارة.',
      save: 'حفظ الزيارة',
    },
    invoices: {
      title: 'الفواتير',
      subtitle: 'فوترة المرضى ومتابعة المدفوعات.',
      newInvoice: 'فاتورة جديدة',
      newInvoiceTitle: 'فاتورة جديدة',
      backToInvoices: 'العودة إلى الفواتير',
      patient: 'المريض',
      branch: 'الفرع',
      linkedVisit: 'الزيارة المرتبطة',
      item: 'البند',
      description: 'الوصف',
      quantity: 'الكمية',
      unitPrice: 'سعر الوحدة',
      addItem: 'إضافة بند',
      removeItem: 'إزالة',
      discount: 'الخصم',
      notes: 'ملاحظات',
      subtotal: 'الإجمالي الفرعي',
      total: 'الإجمالي',
      amountPaid: 'المبلغ المدفوع',
      balanceDue: 'المبلغ المستحق',
      status: 'الحالة',
      statuses: { UNPAID: 'غير مدفوعة', PARTIALLY_PAID: 'مدفوعة جزئيًا', PAID: 'مدفوعة', CANCELLED: 'ملغاة' },
      empty: 'لا توجد فواتير بعد.',
      allStatuses: 'كل الحالات',
      create: 'إنشاء فاتورة',
      payments: 'المدفوعات',
      recordPayment: 'تسجيل دفعة',
      recordPaymentTitle: 'تسجيل دفعة',
      refund: 'استرداد',
      refundTitle: 'إصدار استرداد',
      amount: 'المبلغ',
      method: 'طريقة الدفع',
      methods: { CASH: 'نقدًا', CARD: 'بطاقة', TRANSFER: 'تحويل بنكي', INSURANCE: 'تأمين' },
      reference: 'المرجع (اختياري)',
      noPayments: 'لا توجد مدفوعات مسجلة بعد.',
    },
    documents: {
      title: 'المستندات',
      upload: 'رفع مستند',
      uploadTitle: 'رفع مستند',
      file: 'الملف',
      category: 'الفئة',
      categories: {
        LAB_RESULT: 'نتيجة تحليل',
        SCAN: 'أشعة',
        REPORT: 'تقرير',
        PRESCRIPTION: 'روشتة',
        OTHER: 'أخرى',
      },
      notes: 'ملاحظات',
      empty: 'لا توجد مستندات مرفوعة بعد.',
      delete: 'حذف',
      download: 'تنزيل',
      uploadedOn: 'تم الرفع في',
    },
    queue: {
      title: 'الطابور',
      subtitle: 'طابور الحضور والانتظار لليوم.',
      checkIn: 'تسجيل حضور',
      checkInTitle: 'تسجيل حضور مريض',
      branch: 'الفرع',
      doctor: 'الطبيب',
      doctorOptional: 'الطبيب (اختياري)',
      notes: 'ملاحظات',
      waiting: 'في الانتظار',
      inProgress: 'قيد الكشف',
      done: 'مكتمل',
      cancelled: 'ملغى',
      empty: 'لا يوجد أحد في الطابور بعد.',
      callNext: 'استدعاء',
      markDone: 'إنهاء',
      cancel: 'إلغاء',
      checkedInAt: 'وقت الحضور',
      queueNumber: 'الرقم',
      linkAppointment: 'ربط بموعد (اختياري)',
      noAppointment: 'بدون موعد — حضور مباشر',
      walkIn: 'بدون حجز',
      booked: 'محجوز',
    },
    expenses: {
      title: 'المصروفات',
      subtitle: 'متابعة مصروفات تشغيل العيادة.',
      add: 'إضافة مصروف',
      addTitle: 'إضافة مصروف',
      branch: 'الفرع',
      category: 'الفئة',
      categories: {
        RENT: 'إيجار',
        SALARIES: 'رواتب',
        SUPPLIES: 'مستلزمات',
        UTILITIES: 'مرافق',
        MAINTENANCE: 'صيانة',
        OTHER: 'أخرى',
      },
      amount: 'المبلغ',
      description: 'الوصف',
      date: 'التاريخ',
      empty: 'لا توجد مصروفات مسجلة بعد.',
      delete: 'حذف',
      total: 'الإجمالي',
    },
    reports: {
      title: 'التقارير',
      subtitle: 'نظرة عامة على الإيرادات والمصروفات والنشاط.',
      from: 'من',
      to: 'إلى',
      apply: 'تطبيق',
      totalRevenue: 'إجمالي الإيرادات',
      totalExpenses: 'إجمالي المصروفات',
      netIncome: 'صافي الدخل',
      appointmentsCount: 'المواعيد',
      visitsCount: 'الزيارات',
      newPatientsCount: 'مرضى جدد',
      revenueByDay: 'الإيرادات اليومية',
      noData: 'لا توجد بيانات لهذه الفترة.',
    },
    auditLogs: {
      title: 'سجل النشاط',
      subtitle: 'سجل بمن قام بماذا، ومتى.',
      time: 'الوقت',
      user: 'المستخدم',
      action: 'الإجراء',
      resource: 'المورد',
      allResources: 'كل الموارد',
      status: 'الحالة',
      from: 'من',
      to: 'إلى',
      apply: 'تطبيق',
      empty: 'لا يوجد نشاط مسجل لهذه الفترة.',
    },
    notifications: {
      title: 'الإشعارات',
      empty: 'لا توجد إشعارات بعد.',
      markAllRead: 'تعليم الكل كمقروء',
      viewAll: 'عرض الكل',
    },
    toasts: {
      welcomeBack: (name) => `مرحباً بعودتك، ${name}`,
      clinicCreated: 'تم إنشاء العيادة',
      clinicCreatedDesc: (name) => `مرحباً بك في مساحة عمل ${name}.`,
      branchAdded: 'تمت إضافة الفرع',
      branchUpdated: 'تم تحديث الفرع',
      branchDeactivated: 'تم إلغاء تفعيل الفرع',
      doctorAdded: 'تمت إضافة الطبيب',
      doctorInviteSent: (email) => `تم إرسال بريد الدعوة إلى ${email}.`,
      doctorUpdated: 'تم تحديث بيانات الطبيب',
      doctorDeactivated: 'تم إلغاء تفعيل الطبيب',
      staffAdded: 'تمت إضافة الموظف',
      staffInviteSent: (email) => `تم إرسال بريد الدعوة إلى ${email}.`,
      staffUpdated: 'تم تحديث بيانات الموظف',
      staffDeactivated: 'تم إلغاء تفعيل الموظف',
      patientAdded: 'تمت إضافة المريض',
      patientUpdated: 'تم تحديث بيانات المريض',
      patientDeactivated: 'تم إلغاء تفعيل المريض',
      scheduleSaved: 'تم حفظ الجدول',
      exceptionAdded: 'تمت إضافة الاستثناء',
      exceptionDeleted: 'تم حذف الاستثناء',
      appointmentBooked: 'تم حجز الموعد',
      appointmentUpdated: 'تم تحديث الموعد',
      appointmentCancelled: 'تم إلغاء الموعد',
      visitSaved: 'تم حفظ الزيارة',
      prescriptionAdded: 'تمت إضافة الروشتة',
      invoiceCreated: 'تم إنشاء الفاتورة',
      paymentRecorded: 'تم تسجيل الدفعة',
      refundRecorded: 'تم تسجيل الاسترداد',
      documentUploaded: 'تم رفع المستند',
      documentDeleted: 'تم حذف المستند',
      checkedIn: 'تم تسجيل الحضور',
      queueUpdated: 'تم تحديث الطابور',
      expenseAdded: 'تمت إضافة المصروف',
      expenseDeleted: 'تم حذف المصروف',
    },
  },
};
