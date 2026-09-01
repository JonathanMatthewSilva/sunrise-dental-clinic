package com.sunrisedental.dao;

import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.sunrisedental.dto.BillResponse;
import com.sunrisedental.model.Bill;

@Repository
public class BillDao {

    private final JdbcTemplate jdbcTemplate;

    public BillDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Bill> findByAppointmentId(int appointmentId) {

        String sql = """
                SELECT
                    bill_id,
                    bill_number,
                    appointment_id,
                    consultation_fee,
                    treatment_fee,
                    total_amount,
                    payment_status,
                    generated_at,
                    generated_by
                FROM bills
                WHERE appointment_id = ?
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new Bill(
                        rs.getInt("bill_id"),
                        rs.getString("bill_number"),
                        rs.getInt("appointment_id"),
                        rs.getBigDecimal("consultation_fee"),
                        rs.getBigDecimal("treatment_fee"),
                        rs.getBigDecimal("total_amount"),
                        rs.getString("payment_status"),
                        rs.getTimestamp("generated_at").toLocalDateTime(),
                        rs.getInt("generated_by")
                ),
                appointmentId
        ).stream().findFirst();
    }

    public Optional<BillResponse> findDetailedByAppointmentNumber(
            String appointmentNumber) {

        String sql = """
                SELECT
                    b.bill_number,
                    a.appointment_number,
                    p.full_name AS patient_name,
                    p.contact_number,
                    p.address,
                    d.name AS dentist_name,
                    t.name AS treatment_type,
                    b.consultation_fee,
                    b.treatment_fee,
                    b.total_amount,
                    b.payment_status,
                    b.generated_at,
                    u.full_name AS issued_by
                FROM bills b
                JOIN appointments a
                    ON b.appointment_id = a.appointment_id
                JOIN patients p
                    ON a.patient_id = p.patient_id
                JOIN dentists d
                    ON a.dentist_id = d.dentist_id
                JOIN treatments t
                    ON a.treatment_code = t.treatment_code
                JOIN users u
                    ON b.generated_by = u.user_id
                WHERE a.appointment_number = ?
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    BillResponse response = new BillResponse();

                    response.setBillNumber(
                            rs.getString("bill_number")
                    );

                    response.setAppointmentNumber(
                            rs.getString("appointment_number")
                    );

                    response.setPatientName(
                            rs.getString("patient_name")
                    );

                    response.setContactNumber(
                            rs.getString("contact_number")
                    );

                    response.setAddress(
                            rs.getString("address")
                    );

                    response.setDentistName(
                            rs.getString("dentist_name")
                    );

                    response.setTreatmentType(
                            rs.getString("treatment_type")
                    );

                    response.setConsultationFee(
                            rs.getBigDecimal("consultation_fee")
                    );

                    response.setTreatmentFee(
                            rs.getBigDecimal("treatment_fee")
                    );

                    response.setTotalAmount(
                            rs.getBigDecimal("total_amount")
                    );

                    response.setPaymentStatus(
                            rs.getString("payment_status")
                    );

                    response.setGeneratedAt(
                            rs.getTimestamp("generated_at").toLocalDateTime()
                    );

                    response.setIssuedBy(
                            rs.getString("issued_by")
                    );

                    return response;
                },
                appointmentNumber
        ).stream().findFirst();
    }

    public int createBill(Bill bill) {

        String sql = """
                INSERT INTO bills
                (
                    bill_number,
                    appointment_id,
                    consultation_fee,
                    treatment_fee,
                    total_amount,
                    payment_status,
                    generated_by
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                bill.getBillNumber(),
                bill.getAppointmentId(),
                bill.getConsultationFee(),
                bill.getTreatmentFee(),
                bill.getTotalAmount(),
                bill.getPaymentStatus(),
                bill.getGeneratedBy()
        );
    }
}