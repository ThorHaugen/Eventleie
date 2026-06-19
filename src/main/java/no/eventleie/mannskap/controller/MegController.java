package no.eventleie.mannskap.controller;

import no.eventleie.mannskap.repository.AnsattRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/meg")
public class MegController {

    private final AnsattRepository ansattRepo;
    private final PasswordEncoder passordKoder;

    public MegController(AnsattRepository ansattRepo, PasswordEncoder passordKoder) {
        this.ansattRepo = ansattRepo;
        this.passordKoder = passordKoder;
    }

    @PutMapping("/passord")
    public ResponseEntity<?> endrePassord(
            @AuthenticationPrincipal UserDetails bruker,
            @RequestBody Map<String, String> body) {

        String gammelt = body.get("gammelt");
        String nytt = body.get("nytt");

        return ansattRepo.findByBrukernavn(bruker.getUsername()).map(a -> {
            if (!passordKoder.matches(gammelt, a.getPassordHash())) {
                return ResponseEntity.status(403).body("Feil gammelt passord.");
            }
            a.setPassordHash(passordKoder.encode(nytt));
            ansattRepo.save(a);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
