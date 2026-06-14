package no.eventleie.mannskap.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "tildeling", uniqueConstraints =
        @UniqueConstraint(columnNames = {"ansatt_id", "oppdrag_id"}))
public class Tildeling {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ansatt_id")
    private Ansatt ansatt;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "oppdrag_id")
    private Oppdrag oppdrag;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TildelingStatus status = TildelingStatus.SATT_OPP;

    public Tildeling() {
    }

    public Tildeling(Ansatt ansatt, Oppdrag oppdrag) {
        this.ansatt = ansatt;
        this.oppdrag = oppdrag;
    }

    public UUID getId() {
        return id;
    }

    public Ansatt getAnsatt() {
        return ansatt;
    }

    public void setAnsatt(Ansatt ansatt) {
        this.ansatt = ansatt;
    }

    public Oppdrag getOppdrag() {
        return oppdrag;
    }

    public void setOppdrag(Oppdrag oppdrag) {
        this.oppdrag = oppdrag;
    }

    public TildelingStatus getStatus() {
        return status;
    }

    public void setStatus(TildelingStatus status) {
        this.status = status;
    }
}
