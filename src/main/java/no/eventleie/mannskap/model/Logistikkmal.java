package no.eventleie.mannskap.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "logistikkmal")
public class Logistikkmal {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String tittel;

    @Column(length = 4000)
    private String beskrivelse;

    public Logistikkmal() {
    }

    public Logistikkmal(String tittel, String beskrivelse) {
        this.tittel = tittel;
        this.beskrivelse = beskrivelse;
    }

    public UUID getId() {
        return id;
    }

    public String getTittel() {
        return tittel;
    }

    public void setTittel(String tittel) {
        this.tittel = tittel;
    }

    public String getBeskrivelse() {
        return beskrivelse;
    }

    public void setBeskrivelse(String beskrivelse) {
        this.beskrivelse = beskrivelse;
    }
}
