package no.eventleie.mannskap.controller;

import no.eventleie.mannskap.model.Ansatt;
import no.eventleie.mannskap.model.Rolle;
import no.eventleie.mannskap.repository.AnsattRepository;
import no.eventleie.mannskap.repository.TildelingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ansatte")
public class AnsattController {

    private final AnsattRepository ansattRepo;
    private final TildelingRepository tildelingRepo;
    private final PasswordEncoder passordKoder;

    public AnsattController(AnsattRepository ansattRepo, TildelingRepository tildelingRepo, PasswordEncoder passordKoder) {
        this.ansattRepo = ansattRepo;
        this.tildelingRepo = tildelingRepo;
        this.passordKoder = passordKoder;
    }

    private int niva(UserDetails bruker) {
        return ansattRepo.findByBrukernavn(bruker.getUsername())
                .map(a -> a.getRolle().niva())
                .orElse(0);
    }

    @GetMapping
    public List<Map<String, Object>> alle() {
        return ansattRepo.findAll().stream()
                .map(a -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", a.getId());
                    m.put("navn", a.getNavn());
                    m.put("brukernavn", a.getBrukernavn());
                    m.put("rolle", a.getRolle().name());
                    return m;
                })
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> opprett(
            @AuthenticationPrincipal UserDetails innlogget,
            @RequestBody Map<String, String> body) {
        int kallerNiva = niva(innlogget);
        Rolle nyRolle = Rolle.valueOf(body.getOrDefault("rolle", "ANSATT"));
        if (nyRolle.niva() >= kallerNiva) {
            return ResponseEntity.status(403).body("Du kan ikke opprette en bruker med denne rollen.");
        }
        String brukernavn = body.get("brukernavn");
        if (ansattRepo.findByBrukernavn(brukernavn).isPresent()) {
            return ResponseEntity.badRequest().body("Brukernavn er allerede i bruk.");
        }
        Ansatt a = new Ansatt(
                body.get("navn"),
                body.getOrDefault("telefon", null),
                brukernavn,
                passordKoder.encode(body.get("passord")),
                nyRolle
        );
        ansattRepo.save(a);
        return ResponseEntity.ok(Map.of("id", a.getId(), "navn", a.getNavn()));
    }

    @PutMapping("/{id}/passord")
    public ResponseEntity<Void> settPassord(
            @AuthenticationPrincipal UserDetails innlogget,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        int kallerNiva = niva(innlogget);
        var ansattOpt = ansattRepo.findById(id);
        if (ansattOpt.isEmpty()) return ResponseEntity.<Void>status(404).build();
        var a = ansattOpt.get();
        if (a.getRolle().niva() >= kallerNiva) return ResponseEntity.<Void>status(403).build();
        a.setPassordHash(passordKoder.encode(body.get("passord")));
        ansattRepo.save(a);
        return ResponseEntity.<Void>ok().build();
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> slett(
            @AuthenticationPrincipal UserDetails innlogget,
            @PathVariable UUID id) {
        int kallerNiva = niva(innlogget);
        var ansattOpt = ansattRepo.findById(id);
        if (ansattOpt.isEmpty()) return ResponseEntity.<Void>status(404).build();
        var a = ansattOpt.get();
        if (a.getRolle().niva() >= kallerNiva) return ResponseEntity.<Void>status(403).build();
        tildelingRepo.deleteAllByAnsattId(id);
        ansattRepo.deleteById(id);
        return ResponseEntity.<Void>noContent().build();
    }
}
