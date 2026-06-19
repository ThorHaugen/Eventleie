package no.eventleie.mannskap.controller;

import no.eventleie.mannskap.model.Ansatt;
import no.eventleie.mannskap.model.Rolle;
import no.eventleie.mannskap.repository.AnsattRepository;
import no.eventleie.mannskap.repository.TildelingRepository;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> opprett(@RequestBody Map<String, String> body) {
        String brukernavn = body.get("brukernavn");
        if (ansattRepo.findByBrukernavn(brukernavn).isPresent()) {
            return ResponseEntity.badRequest().body("Brukernavn er allerede i bruk.");
        }
        Ansatt a = new Ansatt(
                body.get("navn"),
                body.getOrDefault("telefon", null),
                brukernavn,
                passordKoder.encode(body.get("passord")),
                Rolle.valueOf(body.getOrDefault("rolle", "ANSATT"))
        );
        ansattRepo.save(a);
        return ResponseEntity.ok(Map.of("id", a.getId(), "navn", a.getNavn()));
    }

    @PutMapping("/{id}/passord")
    public ResponseEntity<?> settPassord(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ansattRepo.findById(id).map(a -> {
            a.setPassordHash(passordKoder.encode(body.get("passord")));
            ansattRepo.save(a);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> slett(@PathVariable UUID id) {
        if (!ansattRepo.existsById(id)) return ResponseEntity.notFound().build();
        tildelingRepo.deleteAllByAnsattId(id);
        ansattRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
