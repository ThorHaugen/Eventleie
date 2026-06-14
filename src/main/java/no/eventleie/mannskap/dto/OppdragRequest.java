package no.eventleie.mannskap.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class OppdragRequest {
    public LocalDate dato;
    public LocalTime klokkeslett;
    public String kunde;
    public String sted;
    public String type;
    public String notat;
    public UUID kjoretoyId;
    public UUID malId;
    public List<UUID> ansattIder;
}
