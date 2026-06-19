package no.eventleie.mannskap.dto;

import no.eventleie.mannskap.model.Oppdrag;
import no.eventleie.mannskap.model.Tildeling;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class OppdragDto {

    public record AnsattKort(UUID id, String navn, String status, String fravaerBegrunnelse) {
    }

    public UUID id;
    public LocalDate dato;
    public LocalTime klokkeslett;
    public String kunde;
    public String sted;
    public String adresse;
    public Integer maksAntall;
    public String type;
    public String notat;
    public String kjoretoy;
    public String mal;
    public List<AnsattKort> mannskap;
    public String minStatus;
    public boolean sett;

    public static OppdragDto fra(Oppdrag o) {
        OppdragDto d = new OppdragDto();
        d.id = o.getId();
        d.dato = o.getDato();
        d.klokkeslett = o.getKlokkeslett();
        d.kunde = o.getKunde();
        d.sted = o.getSted();
        d.adresse = o.getAdresse();
        d.maksAntall = o.getMaksAntall();
        d.type = o.getType() != null ? o.getType().name() : null;
        d.notat = o.getNotat();
        d.kjoretoy = o.getKjoretoy() != null ? o.getKjoretoy().getNavn() : null;
        d.mal = o.getMal() != null ? o.getMal().getTittel() : null;
        d.mannskap = o.getTildelinger().stream()
                .map(OppdragDto::tilKort)
                .toList();
        return d;
    }

    public static OppdragDto fraForAnsatt(Oppdrag o, UUID ansattId) {
        OppdragDto d = fra(o);
        o.getTildelinger().stream()
                .filter(t -> t.getAnsatt().getId().equals(ansattId))
                .findFirst()
                .ifPresent(t -> {
                    d.minStatus = t.getStatus().name();
                    d.sett = t.isSett();
                });
        return d;
    }

    private static AnsattKort tilKort(Tildeling t) {
        return new AnsattKort(
                t.getAnsatt().getId(),
                t.getAnsatt().getNavn(),
                t.getStatus().name(),
                t.getFravaerBegrunnelse());
    }
}
