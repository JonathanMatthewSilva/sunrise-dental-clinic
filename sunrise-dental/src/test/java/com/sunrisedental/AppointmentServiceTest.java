package com.sunrisedental;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sunrisedental.dao.AppointmentDao;
import com.sunrisedental.dto.AppointmentRequest;
import com.sunrisedental.dto.AppointmentResponse;
import com.sunrisedental.model.Appointment;
import com.sunrisedental.service.AppointmentService;

class AppointmentServiceTest {

    private AppointmentDao appointmentDao;
    private AppointmentService appointmentService;

    @BeforeEach
    void setUp() {
        appointmentDao = mock(AppointmentDao.class);
        appointmentService = new AppointmentService(appointmentDao);
    }

    @Test
    void createAppointmentSucceedsWhenSlotIsAvailable() {
        AppointmentRequest request = validRequest();

        when(
                appointmentDao.existsDentistBooking(
                        request.getDentistId(),
                        request.getAppointmentDate(),
                        request.getAppointmentTime()
                )
        ).thenReturn(false);

        when(
                appointmentDao.createPatient(
                        request.getPatientName(),
                        request.getAddress(),
                        request.getContactNumber()
                )
        ).thenReturn(1);

        AppointmentResponse response = new AppointmentResponse();
        response.setAppointmentNumber("APT-2026-ABC123");
        response.setPatientName("Test Patient");
        response.setStatus("BOOKED");

        when(
                appointmentDao.findDetailedByAppointmentNumber(any(String.class))
        ).thenReturn(Optional.of(response));

        AppointmentResponse result =
                appointmentService.createAppointment(request);

        assertEquals("Test Patient", result.getPatientName());
        assertEquals("BOOKED", result.getStatus());

        verify(appointmentDao).createAppointment(any(Appointment.class));
    }

    @Test
    void createAppointmentRejectsDoubleBooking() {
        AppointmentRequest request = validRequest();

        when(
                appointmentDao.existsDentistBooking(
                        request.getDentistId(),
                        request.getAppointmentDate(),
                        request.getAppointmentTime()
                )
        ).thenReturn(true);

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                appointmentService.createAppointment(request)
                );

        assertTrue(
                exception.getMessage().contains("already booked")
        );
    }

    @Test
    void createAppointmentRejectsTimeBeforeClinicOpening() {
        AppointmentRequest request = validRequest();

        request.setAppointmentTime(
                LocalTime.of(7, 30)
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                appointmentService.createAppointment(request)
                );

        assertTrue(
                exception.getMessage().contains("08:00")
        );
    }

    @Test
    void createAppointmentRejectsTimeAfterClinicClosing() {
        AppointmentRequest request = validRequest();

        request.setAppointmentTime(
                LocalTime.of(20, 0)
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                appointmentService.createAppointment(request)
                );

        assertTrue(
                exception.getMessage().contains("19:30")
        );
    }

    @Test
    void updateAppointmentRejectsCancelledAppointment() {
        AppointmentRequest request = validRequest();

        Appointment existing = new Appointment();
        existing.setAppointmentNumber("APT-2026-TEST01");
        existing.setDentistId(1);
        existing.setAppointmentDate(
                LocalDate.of(2026, 9, 2)
        );
        existing.setAppointmentTime(
                LocalTime.of(10, 0)
        );
        existing.setStatus("CANCELLED");

        when(
                appointmentDao.findByAppointmentNumber(
                        "APT-2026-TEST01"
                )
        ).thenReturn(Optional.of(existing));

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                appointmentService.updateAppointment(
                                        "APT-2026-TEST01",
                                        request
                                )
                );

        assertTrue(
                exception.getMessage().contains("Cancelled")
        );
    }

    @Test
    void cancelAppointmentReturnsTrueWhenRecordIsUpdated() {
        when(
                appointmentDao.cancelAppointment(
                        "APT-2026-TEST01"
                )
        ).thenReturn(1);

        boolean result =
                appointmentService.cancelAppointment(
                        "APT-2026-TEST01"
                );

        assertTrue(result);
    }

    private AppointmentRequest validRequest() {
        AppointmentRequest request = new AppointmentRequest();

        request.setPatientName("Test Patient");
        request.setAddress("10 Test Road, Colombo");
        request.setContactNumber("0771234567");
        request.setDentistId(1);
        request.setTreatmentCode("CLEAN");
        request.setAppointmentDate(
                LocalDate.of(2026, 9, 2)
        );
        request.setAppointmentTime(
                LocalTime.of(10, 0)
        );

        return request;
    }
}