package no.eventleie.mannskap.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "oppdrag")
public class Oppdrag {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private LocalDate dato;

    private LocalTime klokkeslett;

    @Column(nullable = false)
    private String kunde;

    private String sted;

    private String adresse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OppdragType type;

    @Column(length = 4000)
    private String notat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "kjoretoy_id")
    private Kjoretoy kjoretoy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mal_id")
    private Logistikkmal mal;

    @OneToMany(mappedBy = "oppdrag", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Tildeling> tildelinger = new ArrayList<>();

    public Oppdrag() {
    }

    public Oppdrag(LocalDate dato, LocalTime klokkeslett, String kunde, String sted, OppdragType type) {
        this.dato = dato;
        this.klokkeslett = klokkeslett;
        this.kunde = kunde;
        this.sted = sted;
        this.type = type;
    }

    public UUID getId() {
        return id;
    }

    public LocalDate getDato() {
        return dato;
    }

    public void setDato(LocalDate dato) {
        this.dato = dato;
    }

    public LocalTime getKlokkeslett() {
        return klokkeslett;
    }

    public void setKlokkeslett(LocalTime klokkeslett) {
        this.klokkeslett = klokkeslett;
    }

    public String getKunde() {
        return kunde;
    }

    public void setKunde(String kunde) {
        this.kunde = kunde;
    }

    public String getSted() {
        return sted;
    }

    public void setSted(String sted) {
        this.sted = sted;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public OppdragType getType() {
        return type;
    }

    public void setType(OppdragType type) {
        this.type = type;
    }

    public String getNotat() {
        return notat;
    }

    public void setNotat(String notat) {
        this.notat = notat;
    }

    public Kjoretoy getKjoretoy() {
        return kjoretoy;
    }

    public void setKjoretoy(Kjoretoy kjoretoy) {
        this.kjoretoy = kjoretoy;
    }

    public Logistikkmal getMal() {
        return mal;
    }

    public void setMal(Logistikkmal mal) {
        this.mal = mal;
    }

    public List<Tildeling> getTildelinger() {
        return tildelinger;
    }

    public void setTildelinger(List<Tildeling> tildelinger) {
        this.tildelinger = tildelinger;
    }
}
