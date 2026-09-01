package com.sunrisedental;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.jdbc.core.JdbcTemplate;

import com.sunrisedental.dao.AppointmentDao;
import com.sunrisedental.dao.BillDao;
import com.sunrisedental.dto.BillResponse;
import com.sunrisedental.model.Appointment;
import com.sunrisedental.model.Bill;
import com.sunrisedental.service.BillService;

class BillServiceTest {

    private BillDao billDao;
    private AppointmentDao appointmentDao;
    private JdbcTemplate jdbcTemplate;
    private BillService billService;

    @BeforeEach
    void setUp() {
        billDao = mock(BillDao.class);
        appointmentDao = mock(AppointmentDao.class);
        jdbcTemplate = mock(JdbcTemplate.class);

        billService = new BillService(
                billDao,
                appointmentDao,
                jdbcTemplate
        );
    }

    @Test
    void generateBillCreatesBillWhenNoneExists() {
        Appointment appointment = validAppointment();

        when(
                appointmentDao.findByAppointmentNumber(
                        "APT-2026-TEST01"
                )
        ).thenReturn(Optional.of(appointment));

        when(
                billDao.findByAppointmentId(1)
        ).thenReturn(Optional.empty());

        when(
                jdbcTemplate.queryForObject(
                        org.mockito.ArgumentMatchers.anyString(),
                        org.mockito.ArgumentMatchers.eq(BigDecimal.class),
                        org.mockito.ArgumentMatchers.eq("CLEAN")
                )
        ).thenReturn(
                new BigDecimal("4500.00")
        );

        BillResponse response = new BillResponse();
        response.setBillNumber("BILL-2026-ABC123");
        response.setAppointmentNumber("APT-2026-TEST01");
        response.setConsultationFee(
                new BigDecimal("2500.00")
        );
        response.setTreatmentFee(
                new BigDecimal("4500.00")
        );
        response.setTotalAmount(
                new BigDecimal("7000.00")
        );
        response.setPaymentStatus("UNPAID");

        when(
                billDao.findDetailedByAppointmentNumber(
                        "APT-2026-TEST01"
                )
        ).thenReturn(Optional.of(response));

        BillResponse result =
                billService.generateBill(
                        "APT-2026-TEST01",
                        1
                );

        assertEquals(
                new BigDecimal("7000.00"),
                result.getTotalAmount()
        );

        assertEquals(
                "UNPAID",
                result.getPaymentStatus()
        );

        verify(billDao).createBill(
                org.mockito.ArgumentMatchers.any(Bill.class)
        );
    }

    @Test
    void generateBillRejectsCancelledAppointment() {
        Appointment appointment = validAppointment();
        appointment.setStatus("CANCELLED");

        when(
                appointmentDao.findByAppointmentNumber(
                        "APT-2026-TEST01"
                )
        ).thenReturn(Optional.of(appointment));

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                billService.generateBill(
                                        "APT-2026-TEST01",
                                        1
                                )
                );

        assertEquals(
                "A bill cannot be generated for a cancelled appointment.",
                exception.getMessage()
        );
    }

    @Test
    void generateBillRejectsUnknownAppointment() {
        when(
                appointmentDao.findByAppointmentNumber(
                        "APT-UNKNOWN"
                )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                billService.generateBill(
                                        "APT-UNKNOWN",
                                        1
                                )
                );

        assertEquals(
                "Appointment not found.",
                exception.getMessage()
        );
    }

    @Test
    void getBillReturnsExistingBill() {
        BillResponse response = new BillResponse();
        response.setBillNumber("BILL-2026-ABC123");
        response.setAppointmentNumber("APT-2026-TEST01");

        when(
                billDao.findDetailedByAppointmentNumber(
                        "APT-2026-TEST01"
                )
        ).thenReturn(Optional.of(response));

        BillResponse result =
                billService.getBill(
                        "APT-2026-TEST01"
                );

        assertEquals(
                "BILL-2026-ABC123",
                result.getBillNumber()
        );
    }

    @Test
    void getBillRejectsMissingBill() {
        when(
                billDao.findDetailedByAppointmentNumber(
                        "APT-2026-NOBILL"
                )
        ).thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                billService.getBill(
                                        "APT-2026-NOBILL"
                                )
                );

        assertEquals(
                "Bill not found.",
                exception.getMessage()
        );
    }

    private Appointment validAppointment() {
        Appointment appointment =
                new Appointment();

        appointment.setAppointmentId(1);
        appointment.setAppointmentNumber(
                "APT-2026-TEST01"
        );
        appointment.setTreatmentCode(
                "CLEAN"
        );
        appointment.setStatus(
                "BOOKED"
        );

        return appointment;
    }
}