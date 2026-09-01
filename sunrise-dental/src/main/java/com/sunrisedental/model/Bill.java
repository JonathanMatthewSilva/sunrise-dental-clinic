package com.sunrisedental.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Bill {

    private int billId;
    private String billNumber;
    private int appointmentId;
    private BigDecimal consultationFee;
    private BigDecimal treatmentFee;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private LocalDateTime generatedAt;
    private int generatedBy;

    public Bill() {
    }

    public Bill(
            int billId,
            String billNumber,
            int appointmentId,
            BigDecimal consultationFee,
            BigDecimal treatmentFee,
            BigDecimal totalAmount,
            String paymentStatus,
            LocalDateTime generatedAt,
            int generatedBy) {

        this.billId = billId;
        this.billNumber = billNumber;
        this.appointmentId = appointmentId;
        this.consultationFee = consultationFee;
        this.treatmentFee = treatmentFee;
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
        this.generatedAt = generatedAt;
        this.generatedBy = generatedBy;
    }

    public int getBillId() {
        return billId;
    }

    public void setBillId(int billId) {
        this.billId = billId;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public int getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(int appointmentId) {
        this.appointmentId = appointmentId;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public BigDecimal getTreatmentFee() {
        return treatmentFee;
    }

    public void setTreatmentFee(BigDecimal treatmentFee) {
        this.treatmentFee = treatmentFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public int getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(int generatedBy) {
        this.generatedBy = generatedBy;
    }
}