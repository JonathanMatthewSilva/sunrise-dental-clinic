package com.sunrisedental.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sunrisedental.dao.TreatmentDao;
import com.sunrisedental.model.Treatment;

@Service
public class TreatmentService {

    private final TreatmentDao treatmentDao;

    public TreatmentService(TreatmentDao treatmentDao) {
        this.treatmentDao = treatmentDao;
    }

    public List<Treatment> getActiveTreatments() {
        return treatmentDao.findAllActive();
    }
}