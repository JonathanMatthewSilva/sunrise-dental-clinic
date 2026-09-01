package com.sunrisedental.service;

import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sunrisedental.dao.AppointmentDao;
import com.sunrisedental.dto.AppointmentRequest;
import com.sunrisedental.dto.AppointmentResponse;
import com.sunrisedental.model.Appointment;

@Service
public class AppointmentService {

    private final AppointmentDao appointmentDao;

    public AppointmentService(AppointmentDao appointmentDao) {
        this.appointmentDao = appointmentDao;
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {

        validateTime(request.getAppointmentTime());

        boolean alreadyBooked = appointmentDao.existsDentistBooking(
                request.getDentistId(),
                request.getAppointmentDate(),
                request.getAppointmentTime()
        );

        if (alreadyBooked) {
            throw new IllegalStateException(
                    "The selected dentist is already booked at that date and time."
            );
        }

        int patientId = appointmentDao.createPatient(
                request.getPatientName(),
                request.getAddress(),
                request.getContactNumber()
        );

        Appointment appointment = new Appointment();

        appointment.setAppointmentNumber(generateAppointmentNumber());
        appointment.setPatientId(patientId);
        appointment.setDentistId(request.getDentistId());
        appointment.setTreatmentCode(request.getTreatmentCode());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setStatus("BOOKED");

        appointmentDao.createAppointment(appointment);

        return appointmentDao
                .findDetailedByAppointmentNumber(appointment.getAppointmentNumber())
                .orElseThrow();
    }

    public Optional<AppointmentResponse> findAppointment(
            String appointmentNumber) {

        return appointmentDao.findDetailedByAppointmentNumber(
                appointmentNumber
        );
    }

    @Transactional
    public AppointmentResponse updateAppointment(
            String appointmentNumber,
            AppointmentRequest request) {

        Appointment existing = appointmentDao
                .findByAppointmentNumber(appointmentNumber)
                .orElseThrow(() ->
                        new IllegalArgumentException("Appointment not found.")
                );

        if ("CANCELLED".equalsIgnoreCase(existing.getStatus())) {
            throw new IllegalStateException(
                    "Cancelled appointments cannot be updated."
            );
        }

        validateTime(request.getAppointmentTime());

        boolean slotChanged =
                existing.getDentistId() != request.getDentistId()
                        || !existing.getAppointmentDate().equals(request.getAppointmentDate())
                        || !existing.getAppointmentTime().equals(request.getAppointmentTime());

        if (slotChanged) {
            boolean alreadyBooked = appointmentDao.existsDentistBooking(
                    request.getDentistId(),
                    request.getAppointmentDate(),
                    request.getAppointmentTime()
            );

            if (alreadyBooked) {
                throw new IllegalStateException(
                        "The selected dentist is already booked at that date and time."
                );
            }
        }

        int updated = appointmentDao.updateAppointment(
                appointmentNumber,
                request.getDentistId(),
                request.getTreatmentCode(),
                request.getAppointmentDate(),
                request.getAppointmentTime()
        );

        if (updated == 0) {
            throw new IllegalStateException(
                    "Appointment could not be updated."
            );
        }

        return appointmentDao
                .findDetailedByAppointmentNumber(appointmentNumber)
                .orElseThrow();
    }

    public boolean cancelAppointment(String appointmentNumber) {
        return appointmentDao.cancelAppointment(appointmentNumber) > 0;
    }

    private void validateTime(LocalTime time) {

        if (time.isBefore(LocalTime.of(8, 0)) ||
                time.isAfter(LocalTime.of(19, 30))) {

            throw new IllegalArgumentException(
                    "Appointment time must be between 08:00 and 19:30."
            );
        }
    }

    private String generateAppointmentNumber() {

        return "APT-" +
                java.time.Year.now().getValue() +
                "-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 6)
                        .toUpperCase();
    }
}