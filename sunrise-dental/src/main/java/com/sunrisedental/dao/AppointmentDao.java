package com.sunrisedental.dao;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.sunrisedental.dto.AppointmentResponse;
import com.sunrisedental.model.Appointment;

@Repository
public class AppointmentDao {

    private final JdbcTemplate jdbcTemplate;

    public AppointmentDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean existsDentistBooking(
            int dentistId,
            LocalDate appointmentDate,
            LocalTime appointmentTime) {

        String sql = """
                SELECT COUNT(*)
                FROM appointments
                WHERE dentist_id = ?
                  AND appointment_date = ?
                  AND appointment_time = ?
                  AND status <> 'CANCELLED'
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                dentistId,
                appointmentDate,
                appointmentTime
        );

        return count != null && count > 0;
    }

    public int createPatient(
            String fullName,
            String address,
            String contactNumber) {

        String sql = """
                INSERT INTO patients (full_name, address, contact_number)
                VALUES (?, ?, ?)
                """;

        jdbcTemplate.update(
                sql,
                fullName,
                address,
                contactNumber
        );

        return jdbcTemplate.queryForObject(
                "SELECT LAST_INSERT_ID()",
                Integer.class
        );
    }

    public int createAppointment(Appointment appointment) {

        String sql = """
                INSERT INTO appointments
                (
                    appointment_number,
                    patient_id,
                    dentist_id,
                    treatment_code,
                    appointment_date,
                    appointment_time,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                appointment.getAppointmentNumber(),
                appointment.getPatientId(),
                appointment.getDentistId(),
                appointment.getTreatmentCode(),
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime(),
                appointment.getStatus()
        );
    }

    public Optional<Appointment> findByAppointmentNumber(String appointmentNumber) {

        String sql = """
                SELECT
                    appointment_id,
                    appointment_number,
                    patient_id,
                    dentist_id,
                    treatment_code,
                    appointment_date,
                    appointment_time,
                    status,
                    created_at
                FROM appointments
                WHERE appointment_number = ?
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    Appointment appointment = new Appointment();

                    appointment.setAppointmentId(
                            rs.getInt("appointment_id")
                    );

                    appointment.setAppointmentNumber(
                            rs.getString("appointment_number")
                    );

                    appointment.setPatientId(
                            rs.getInt("patient_id")
                    );

                    appointment.setDentistId(
                            rs.getInt("dentist_id")
                    );

                    appointment.setTreatmentCode(
                            rs.getString("treatment_code")
                    );

                    appointment.setAppointmentDate(
                            rs.getDate("appointment_date").toLocalDate()
                    );

                    appointment.setAppointmentTime(
                            rs.getTime("appointment_time").toLocalTime()
                    );

                    appointment.setStatus(
                            rs.getString("status")
                    );

                    Timestamp createdAt =
                            rs.getTimestamp("created_at");

                    if (createdAt != null) {
                        appointment.setCreatedAt(
                                createdAt.toLocalDateTime()
                        );
                    }

                    return appointment;
                },
                appointmentNumber
        ).stream().findFirst();
    }

    public Optional<AppointmentResponse> findDetailedByAppointmentNumber(
            String appointmentNumber) {

        String sql = """
                SELECT
                    a.appointment_number,
                    p.full_name AS patient_name,
                    p.address,
                    p.contact_number,
                    a.dentist_id,
                    d.name AS dentist_name,
                    a.treatment_code,
                    t.name AS treatment_type,
                    a.appointment_date,
                    a.appointment_time,
                    a.status
                FROM appointments a
                JOIN patients p
                    ON a.patient_id = p.patient_id
                JOIN dentists d
                    ON a.dentist_id = d.dentist_id
                JOIN treatments t
                    ON a.treatment_code = t.treatment_code
                WHERE a.appointment_number = ?
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    AppointmentResponse response =
                            new AppointmentResponse();

                    response.setAppointmentNumber(
                            rs.getString("appointment_number")
                    );

                    response.setPatientName(
                            rs.getString("patient_name")
                    );

                    response.setAddress(
                            rs.getString("address")
                    );

                    response.setContactNumber(
                            rs.getString("contact_number")
                    );

                    response.setDentistId(
                            rs.getInt("dentist_id")
                    );

                    response.setDentistName(
                            rs.getString("dentist_name")
                    );

                    response.setTreatmentCode(
                            rs.getString("treatment_code")
                    );

                    response.setTreatmentType(
                            rs.getString("treatment_type")
                    );

                    response.setAppointmentDate(
                            rs.getDate("appointment_date").toLocalDate()
                    );

                    response.setAppointmentTime(
                            rs.getTime("appointment_time").toLocalTime()
                    );

                    response.setStatus(
                            rs.getString("status")
                    );

                    return response;
                },
                appointmentNumber
        ).stream().findFirst();
    }

    public int updateAppointment(
            String appointmentNumber,
            int dentistId,
            String treatmentCode,
            LocalDate appointmentDate,
            LocalTime appointmentTime) {

        String sql = """
                UPDATE appointments
                SET dentist_id = ?,
                    treatment_code = ?,
                    appointment_date = ?,
                    appointment_time = ?
                WHERE appointment_number = ?
                  AND status <> 'CANCELLED'
                """;

        return jdbcTemplate.update(
                sql,
                dentistId,
                treatmentCode,
                appointmentDate,
                appointmentTime,
                appointmentNumber
        );
    }

    public int cancelAppointment(String appointmentNumber) {

        String sql = """
                UPDATE appointments
                SET status = 'CANCELLED'
                WHERE appointment_number = ?
                  AND status <> 'CANCELLED'
                """;

        return jdbcTemplate.update(
                sql,
                appointmentNumber
        );
    }
}