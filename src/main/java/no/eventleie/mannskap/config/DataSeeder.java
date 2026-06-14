package no.eventleie.mannskap.config;

import no.eventleie.mannskap.model.*;
import no.eventleie.mannskap.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AnsattRepository ansattRepo;
    private final KjoretoyRepository kjoretoyRepo;
    private final LogistikkmalRepository malRepo;
    private final OppdragRepository oppdragRepo;
    private final PasswordEncoder koder;

    public DataSeeder(AnsattRepository ansattRepo, KjoretoyRepository kjoretoyRepo,
                      LogistikkmalRepository malRepo, OppdragRepository oppdragRepo,
                      PasswordEncoder koder) {
        this.ansattRepo = ansattRepo;
        this.kjoretoyRepo = kjoretoyRepo;
        this.malRepo = malRepo;
        this.oppdragRepo = oppdragRepo;
        this.koder = koder;
    }

    @Override
    public void run(String... args) {
        if (ansattRepo.count() > 0) {
            return;
        }

        Map<String, Ansatt> folk = new HashMap<>();
        folk.put("samuel", lagre(new Ansatt("Samuel Løvland", "96925815", "samuel",
                koder.encode("passord"), Rolle.ADMIN)));
        folk.put("magne", lagre(new Ansatt("Magne Wallin", null, "magne",
                koder.encode("passord"), Rolle.ANSATT)));
        folk.put("adrianf", lagre(new Ansatt("Adrian Fearnley", null, "adrianf",
                koder.encode("passord"), Rolle.ANSATT)));
        folk.put("nathaniel", lagre(new Ansatt("Nathaniel Singstad", null, "nathaniel",
                koder.encode("passord"), Rolle.ANSATT)));
        folk.put("johannes", lagre(new Ansatt("Johannes Kjønndal", null, "johannes",
                koder.encode("passord"), Rolle.ANSATT)));
        folk.put("adriang", lagre(new Ansatt("Adrian Gallis", null, "adriang",
                koder.encode("passord"), Rolle.ANSATT)));
        folk.put("fabian", lagre(new Ansatt("Fabian Andersen", null, "fabian",
                koder.encode("passord"), Rolle.ANSATT)));

        Kjoretoy vito = kjoretoyRepo.save(new Kjoretoy("Vitoen", true));
        Kjoretoy adrianBil = kjoretoyRepo.save(new Kjoretoy("Adrians bil", true));

        Logistikkmal toBiler = malRepo.save(new Logistikkmal(
                "To biler, tregulv-rute",
                "Vitoen med henger + Adrians bil med henger. Frakter seildukstelt i Vito "
                        + "med fem karer. En tar turen hjem og henter tregulv og subfloor mens "
                        + "gutta monterer. Drar 07:00, framme 10:00. Tregulv ankommer ca 15-16. "
                        + "Ferdig ca 22:00, hjemme ca 01:00."));

        nyttOppdrag(LocalDate.of(2026, 7, 1), LocalTime.of(7, 0), "Hanna Håberg",
                OppdragType.MONTERING, vito, toBiler,
                List.of(folk.get("samuel"), folk.get("magne"), folk.get("adrianf"),
                        folk.get("adriang"), folk.get("johannes")));

        nyttOppdrag(LocalDate.of(2026, 7, 2), LocalTime.of(7, 0), "Otto Garli",
                OppdragType.MONTERING, vito, toBiler,
                List.of(folk.get("samuel"), folk.get("magne"), folk.get("fabian"),
                        folk.get("adriang"), folk.get("johannes")));

        nyttOppdrag(LocalDate.of(2026, 7, 3), LocalTime.of(9, 0), "Krister Svensli",
                OppdragType.LEVERING, adrianBil, null,
                List.of(folk.get("adrianf")));

        nyttOppdrag(LocalDate.of(2026, 7, 5), LocalTime.of(10, 0), "Hanna Håberg",
                OppdragType.DEMONTERING, vito, null,
                List.of(folk.get("samuel"), folk.get("magne"), folk.get("adrianf")));

        System.out.println(">>> Testdata lastet inn. Logg inn som samuel (ADMIN) eller magne (ANSATT), passord: passord");
    }

    private Ansatt lagre(Ansatt a) {
        return ansattRepo.save(a);
    }

    private void nyttOppdrag(LocalDate dato, LocalTime kl, String kunde, OppdragType type,
                             Kjoretoy bil, Logistikkmal mal, List<Ansatt> mannskap) {
        Oppdrag o = new Oppdrag(dato, kl, kunde, null, type);
        o.setKjoretoy(bil);
        o.setMal(mal);
        for (Ansatt a : mannskap) {
            o.getTildelinger().add(new Tildeling(a, o));
        }
        oppdragRepo.save(o);
    }
}
