package no.eventleie.mannskap.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "ansatt")
public class Ansatt {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String navn;

    private String telefon;

    @Column(nullable = false, unique = true)
    private String brukernavn;

    @Column(nullable = false)
    private String passordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rolle rolle = Rolle.ANSATT;

    public Ansatt() {
    }

    public Ansatt(String navn, String telefon, String brukernavn, String passordHash, Rolle rolle) {
        this.navn = navn;
        this.telefon = telefon;
        this.brukernavn = brukernavn;
        this.passordHash = passordHash;
        this.rolle = rolle;
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

    public String getTelefon() {
        return telefon;
    }

    public void setTelefon(String telefon) {
        this.telefon = telefon;
    }

    public String getBrukernavn() {
        return brukernavn;
    }

    public void setBrukernavn(String brukernavn) {
        this.brukernavn = brukernavn;
    }

    public String getPassordHash() {
        return passordHash;
    }

    public void setPassordHash(String passordHash) {
        this.passordHash = passordHash;
    }

    public Rolle getRolle() {
        return rolle;
    }

    public void setRolle(Rolle rolle) {
        this.rolle = rolle;
    }
}
