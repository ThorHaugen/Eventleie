package no.eventleie.mannskap.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "kjoretoy")
public class Kjoretoy {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String navn;

    @Column(nullable = false)
    private boolean harHenger = false;

    public Kjoretoy() {
    }

    public Kjoretoy(String navn, boolean harHenger) {
        this.navn = navn;
        this.harHenger = harHenger;
    }

    public UUID getId() {
        return id;
    }

    public String getNavn() {
        return navn;
    }

    public void setNavn(String navn) {
        this.navn = navn;
    }

    public boolean isHarHenger() {
        return harHenger;
    }

    public void setHarHenger(boolean harHenger) {
        this.harHenger = harHenger;
    }
}
