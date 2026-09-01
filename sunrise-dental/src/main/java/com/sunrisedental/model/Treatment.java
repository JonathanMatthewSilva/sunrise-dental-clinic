package com.sunrisedental.model;

import java.math.BigDecimal;

public class Treatment {

    private String treatmentCode;
    private String name;
    private BigDecimal treatmentFee;
    private boolean active;

    public Treatment() {
    }

    public Treatment(String treatmentCode, String name, BigDecimal treatmentFee, boolean active) {
        this.treatmentCode = treatmentCode;
        this.name = name;
        this.treatmentFee = treatmentFee;
        this.active = active;
    }

    public String getTreatmentCode() {
        return treatmentCode;
    }

    public void setTreatmentCode(String treatmentCode) {
        this.treatmentCode = treatmentCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getTreatmentFee() {
        return treatmentFee;
    }

    public void setTreatmentFee(BigDecimal treatmentFee) {
        this.treatmentFee = treatmentFee;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}