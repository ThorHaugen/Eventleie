package no.eventleie.mannskap.controller;

import no.eventleie.mannskap.repository.AnsattRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reset")
public class ResetController {

    private final AnsattRepository ansattRepo;
    private final PasswordEncoder passordKoder;

    public ResetController(AnsattRepository ansattRepo, PasswordEncoder passordKoder) {
        this.ansattRepo = ansattRepo;
        this.passordKoder = passordKoder;
    }

    @PostMapping("/{brukernavn}")
    public ResponseEntity<?> reset(@PathVariable String brukernavn, @RequestParam String passord) {
        return ansattRepo.findByBrukernavn(brukernavn).map(a -> {
            a.setPassordHash(passordKoder.encode(passord));
            ansattRepo.save(a);
            return ResponseEntity.ok("Passord oppdatert for " + brukernavn);
        }).orElse(ResponseEntity.notFound().build());
    }
}
