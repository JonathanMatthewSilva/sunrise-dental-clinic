package com.sunrisedental.service;

import java.math.BigDecimal;
import java.time.Year;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sunrisedental.dao.AppointmentDao;
import com.sunrisedental.dao.BillDao;
import com.sunrisedental.dto.BillResponse;
import com.sunrisedental.model.Appointment;
import com.sunrisedental.model.Bill;

@Service
public class BillService {

    private final BillDao billDao;
    private final AppointmentDao appointmentDao;
    private final JdbcTemplate jdbcTemplate;

    public BillService(
            BillDao billDao,
            AppointmentDao appointmentDao,
            JdbcTemplate jdbcTemplate) {

        this.billDao = billDao;
        this.appointmentDao = appointmentDao;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public BillResponse generateBill(
            String appointmentNumber,
            int userId) {

        Appointment appointment = appointmentDao
                .findByAppointmentNumber(appointmentNumber)
                .orElseThrow(() ->
                        new IllegalArgumentException("Appointment not found.")
                );

        if ("CANCELLED".equalsIgnoreCase(appointment.getStatus())) {
            throw new IllegalStateException(
                    "A bill cannot be generated for a cancelled appointment."
            );
        }

        if (billDao.findByAppointmentId(appointment.getAppointmentId()).isEmpty()) {
            createNewBill(appointment, userId);
        }

        return billDao
                .findDetailedByAppointmentNumber(appointmentNumber)
                .orElseThrow(() ->
                        new IllegalStateException("Bill could not be loaded.")
                );
    }

    public BillResponse getBill(String appointmentNumber) {

        return billDao
                .findDetailedByAppointmentNumber(appointmentNumber)
                .orElseThrow(() ->
                        new IllegalArgumentException("Bill not found.")
                );
    }

    private void createNewBill(
            Appointment appointment,
            int userId) {

        BigDecimal consultationFee = new BigDecimal("2500.00");

        BigDecimal treatmentFee = jdbcTemplate.queryForObject(
                """
                SELECT treatment_fee
                FROM treatments
                WHERE treatment_code = ?
                """,
                BigDecimal.class,
                appointment.getTreatmentCode()
        );

        if (treatmentFee == null) {
            throw new IllegalStateException(
                    "Treatment fee could not be found."
            );
        }

        BigDecimal totalAmount =
                consultationFee.add(treatmentFee);

        Bill bill = new Bill();

        bill.setBillNumber(generateBillNumber());
        bill.setAppointmentId(appointment.getAppointmentId());
        bill.setConsultationFee(consultationFee);
        bill.setTreatmentFee(treatmentFee);
        bill.setTotalAmount(totalAmount);
        bill.setPaymentStatus("UNPAID");
        bill.setGeneratedBy(userId);

        billDao.createBill(bill);
    }

    private String generateBillNumber() {
        return "BILL-" +
                Year.now().getValue() +
                "-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 6)
                        .toUpperCase();
    }
}