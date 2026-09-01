/* ==========================================================================
   mock-data.js  -  PLACEHOLDER PREVIEW DATA ONLY
   --------------------------------------------------------------------------
   !!  THIS FILE IS NOT PART OF THE APPLICATION LOGIC  !!

   It exists solely so the user interface can be demonstrated/marked before
   the Java REST API is deployed. api.js only uses it when the real backend
   is unreachable AND Api.config.USE_MOCK_FALLBACK === true.

   It is NOT a database, it performs NO business rules, NO availability
   checking and NO authoritative billing calculation - the sample fee values
   below simply imitate what the Java service layer will return.

   Remove this file (and set USE_MOCK_FALLBACK = false) for the final
   integrated build.
   ========================================================================== */

window.MockData = (function () {
  "use strict";

  const dentists = [
    { id: "D01", name: "Dr. Nimal Perera",     specialization: "General Dentistry" },
    { id: "D02", name: "Dr. Anushka Fernando", specialization: "Orthodontics" },
    { id: "D03", name: "Dr. Rizwan Haleem",    specialization: "Oral Surgery" },
    { id: "D04", name: "Dr. Sanduni Silva",    specialization: "Paediatric Dentistry" }
  ];

  const treatments = [
    { code: "CONS", name: "Consultation" },
    { code: "SCAL", name: "Scaling & Polishing" },
    { code: "FILL", name: "Composite Filling" },
    { code: "EXTR", name: "Tooth Extraction" },
    { code: "RCT",  name: "Root Canal Treatment" },
    { code: "ORTH", name: "Orthodontic Review" },
    { code: "WHIT", name: "Teeth Whitening" }
  ];

  const appointments = [
    { appointmentNumber: "APT-2026-0143", patientName: "Kavindu Jayasinghe", address: "42/1 Galle Road, Colombo 03", contactNumber: "0771234567", dentistId: "D01", dentistName: "Dr. Nimal Perera",     treatmentCode: "SCAL", treatmentType: "Scaling & Polishing", appointmentDate: "2026-02-18", appointmentTime: "09:00", status: "CONFIRMED" },
    { appointmentNumber: "APT-2026-0144", patientName: "Hasini Wickrama",    address: "17 Temple Lane, Nugegoda",     contactNumber: "0712876540", dentistId: "D02", dentistName: "Dr. Anushka Fernando", treatmentCode: "ORTH", treatmentType: "Orthodontic Review",  appointmentDate: "2026-02-18", appointmentTime: "10:30", status: "PENDING"   },
    { appointmentNumber: "APT-2026-0145", patientName: "Mohamed Ashraff",    address: "88 Havelock Road, Colombo 05", contactNumber: "0763345512", dentistId: "D03", dentistName: "Dr. Rizwan Haleem",    treatmentCode: "EXTR", treatmentType: "Tooth Extraction",    appointmentDate: "2026-02-18", appointmentTime: "11:15", status: "COMPLETED" },
    { appointmentNumber: "APT-2026-0146", patientName: "Dilani Rathnayake",  address: "5 Lake View, Battaramulla",    contactNumber: "0755567123", dentistId: "D01", dentistName: "Dr. Nimal Perera",     treatmentCode: "FILL", treatmentType: "Composite Filling",   appointmentDate: "2026-02-19", appointmentTime: "14:00", status: "CONFIRMED" },
    { appointmentNumber: "APT-2026-0147", patientName: "Tharindu Bandara",   address: "23 Flower Road, Colombo 07",   contactNumber: "0701122334", dentistId: "D04", dentistName: "Dr. Sanduni Silva",    treatmentCode: "CONS", treatmentType: "Consultation",        appointmentDate: "2026-02-19", appointmentTime: "15:45", status: "CANCELLED" },
    { appointmentNumber: "APT-2026-0148", patientName: "Ruwani Peiris",      address: "9A Station Road, Dehiwala",    contactNumber: "0779988776", dentistId: "D02", dentistName: "Dr. Anushka Fernando", treatmentCode: "RCT",  treatmentType: "Root Canal Treatment", appointmentDate: "2026-02-20", appointmentTime: "08:45", status: "CONFIRMED" }
  ];

  /* Sample fee values - in the real system these are produced by the Java
     service layer from the treatment price list stored in MySQL. */
  const feeTable = {
    CONS: { consultationFee: 1500, treatmentFee: 0 },
    SCAL: { consultationFee: 1500, treatmentFee: 4500 },
    FILL: { consultationFee: 1500, treatmentFee: 6500 },
    EXTR: { consultationFee: 1500, treatmentFee: 5500 },
    RCT:  { consultationFee: 1500, treatmentFee: 22000 },
    ORTH: { consultationFee: 1500, treatmentFee: 3500 },
    WHIT: { consultationFee: 1500, treatmentFee: 18000 }
  };

  let counter = 149;

  function find(no) {
    return appointments.find(function (a) {
      return a.appointmentNumber.toUpperCase() === String(no).toUpperCase();
    });
  }

  function delay(value, ms) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (value instanceof Error) { reject(value); } else { resolve(value); }
      }, ms || 320);
    });
  }

  function notFound(no) {
    return delay(new window.Api.ApiError("Appointment " + no + " was not found.", 404, null));
  }

  /* Router imitating the Java REST controller responses ------------------ */
  function resolve(path, init) {
    const method = (init && init.method) || "GET";
    const body = init && init.body ? JSON.parse(init.body) : {};
    const clean = path.split("?")[0];
    const query = path.indexOf("?") > -1 ? path.split("?")[1] : "";

    if (clean === "/auth/login" && method === "POST") {
      if (!body.username || !body.password) {
        return delay(new window.Api.ApiError("Username and password are required.", 400));
      }
      return delay({ username: body.username, fullName: "Ishara Gunawardena", role: "Front Desk Officer" });
    }
    if (clean === "/auth/logout") return delay({ message: "Session ended." }, 150);
    if (clean === "/dentists")    return delay(dentists, 180);
    if (clean === "/treatments")  return delay(treatments, 180);

    if (clean === "/dashboard/summary") {
      return delay({
        todaysAppointments: 12,
        totalPatients: 486,
        availableDentists: 4,
        totalDentists: 5,
        dailyRevenue: 78500,
        currency: "LKR",
        pendingBills: 3,
        recentAppointments: appointments.slice(0, 5)
      });
    }

    if (clean.indexOf("/appointments") === 0) {
      const no = decodeURIComponent(clean.replace("/appointments", "").replace("/", ""));
      if (method === "POST") {
        const t = treatments.find(function (x) { return x.code === body.treatmentCode; });
        const d = dentists.find(function (x) { return x.id === body.dentistId; });
        const created = Object.assign({}, body, {
          appointmentNumber: "APT-2026-0" + (counter++),
          treatmentType: t ? t.name : body.treatmentCode,
          dentistName: d ? d.name : body.dentistId,
          status: "CONFIRMED"
        });
        appointments.unshift(created);
        return delay(created, 500);
      }
      if (!no) return delay(appointments);
      const found = find(no);
      if (!found) return notFound(no);
      if (method === "GET") return delay(found);
      if (method === "PUT") {
        const t = treatments.find(function (x) { return x.code === body.treatmentCode; });
        const d = dentists.find(function (x) { return x.id === body.dentistId; });
        Object.assign(found, body, {
          treatmentType: t ? t.name : found.treatmentType,
          dentistName: d ? d.name : found.dentistName
        });
        return delay(found, 450);
      }
      if (method === "DELETE") {
        found.status = "CANCELLED";
        return delay({ appointmentNumber: found.appointmentNumber, status: "CANCELLED", message: "Appointment cancelled." }, 400);
      }
    }

    if (clean.indexOf("/bills") === 0) {
      const no = decodeURIComponent(clean.replace("/bills", "").replace("/", ""));
      const appt = find(no);
      if (!appt) return notFound(no);
      const fees = feeTable[appt.treatmentCode] || { consultationFee: 1500, treatmentFee: 0 };
      return delay({
        billNumber: "BIL-2026-0" + (310 + (no.charCodeAt(no.length - 1) % 40)),
        appointmentNumber: appt.appointmentNumber,
        patientName: appt.patientName,
        address: appt.address,
        contactNumber: appt.contactNumber,
        dentistName: appt.dentistName,
        treatmentType: appt.treatmentType,
        appointmentDate: appt.appointmentDate,
        appointmentTime: appt.appointmentTime,
        consultationFee: fees.consultationFee,
        treatmentFee: fees.treatmentFee,
        /* Total is produced by the Java service layer, never in JavaScript */
        totalAmount: fees.consultationFee + fees.treatmentFee,
        currency: "LKR",
        paymentStatus: "PAID",
        generatedAt: "2026-02-18 12:40",
        issuedBy: "Ishara Gunawardena"
      }, 520);
    }

    if (clean === "/reports/appointments") {
      return delay({
        range: query || "from=2026-02-14&to=2026-02-20",
        byDate: [
          { date: "2026-02-14", total: 14, completed: 12, cancelled: 1 },
          { date: "2026-02-15", total: 9,  completed: 8,  cancelled: 0 },
          { date: "2026-02-16", total: 16, completed: 15, cancelled: 1 },
          { date: "2026-02-17", total: 11, completed: 10, cancelled: 0 },
          { date: "2026-02-18", total: 12, completed: 7,  cancelled: 2 },
          { date: "2026-02-19", total: 10, completed: 0,  cancelled: 1 },
          { date: "2026-02-20", total: 8,  completed: 0,  cancelled: 0 }
        ],
        byDentist: [
          { dentistName: "Dr. Nimal Perera",     specialization: "General Dentistry",    appointments: 24, completed: 21, cancelled: 1 },
          { dentistName: "Dr. Anushka Fernando", specialization: "Orthodontics",         appointments: 19, completed: 16, cancelled: 2 },
          { dentistName: "Dr. Rizwan Haleem",    specialization: "Oral Surgery",         appointments: 21, completed: 18, cancelled: 1 },
          { dentistName: "Dr. Sanduni Silva",    specialization: "Paediatric Dentistry", appointments: 16, completed: 13, cancelled: 1 }
        ],
        treatmentFrequency: [
          { treatmentType: "Scaling & Polishing",   count: 23 },
          { treatmentType: "Composite Filling",     count: 17 },
          { treatmentType: "Consultation",          count: 14 },
          { treatmentType: "Tooth Extraction",      count: 11 },
          { treatmentType: "Root Canal Treatment",  count: 8  },
          { treatmentType: "Orthodontic Review",    count: 5  }
        ]
      }, 420);
    }

    if (clean === "/reports/revenue") {
      return delay({
        currency: "LKR",
        totalRevenue: 486500,
        billsIssued: 78,
        averageBillValue: 6237,
        outstanding: 12500,
        byDay: [
          { date: "2026-02-14", bills: 13, revenue: 82500 },
          { date: "2026-02-15", bills: 9,  revenue: 54000 },
          { date: "2026-02-16", bills: 15, revenue: 96500 },
          { date: "2026-02-17", bills: 11, revenue: 71000 },
          { date: "2026-02-18", bills: 12, revenue: 78500 },
          { date: "2026-02-19", bills: 10, revenue: 62000 },
          { date: "2026-02-20", bills: 8,  revenue: 42000 }
        ],
        byTreatment: [
          { treatmentType: "Root Canal Treatment", bills: 8,  revenue: 188000 },
          { treatmentType: "Teeth Whitening",      bills: 4,  revenue: 78000  },
          { treatmentType: "Composite Filling",    bills: 17, revenue: 136000 },
          { treatmentType: "Scaling & Polishing",  bills: 23, revenue: 138000 }
        ]
      }, 420);
    }

    return delay(new window.Api.ApiError("Preview data not available for " + path, 501));
  }

  return { resolve: resolve };
})();
